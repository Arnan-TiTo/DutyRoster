import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { Prisma } from '@prisma/client'
import { requireApiSession } from '@/lib/auth'
import { ok, bad } from '@/lib/api'

export async function POST(req: NextRequest) {
    try {
        const sess = await requireApiSession(req)
        const canEdit = sess.roles.includes('ADMIN') || sess.roles.includes('SUPERVISOR')
        if (!canEdit) return bad(403, 'FORBIDDEN')

        const { month } = await req.json()
        if (!month) return bad(400, 'month is required')

        const [year, monthNum] = month.split('-').map(Number)
        const startDate = new Date(Date.UTC(year, monthNum - 1, 1, 0, 0, 0, 0))
        const endDate = new Date(Date.UTC(year, monthNum, 0, 23, 59, 59, 999))

        // 1. Target Staff (only roleTitle 'Sale') with assignment statistics
        const employees = await prisma.employee.findMany({
            where: { roleTitle: 'Sale', isActive: true },
            include: { assignmentStats: true }
        })

        if (employees.length === 0) return bad(400, 'No employees with role "Sale" found')

        // Initialize assignment stats for employees who don't have them
        for (const emp of employees) {
            if (!emp.assignmentStats) {
                await prisma.employeeAssignmentStat.create({
                    data: {
                        employeeId: emp.employeeId,
                        totalAssignments: 0
                    }
                })
            }
        }

        // Reload with stats
        const employeesWithStats = await prisma.employee.findMany({
            where: { roleTitle: 'Sale', isActive: true },
            include: { assignmentStats: true }
        })

        // 2. Event Types
        const eventEvent = await prisma.eventType.findUnique({ where: { eventCode: 'EVENT' } })
        const workShiftEvent = await prisma.eventType.findUnique({ where: { eventCode: 'SHIFT' } })

        if (!eventEvent || !workShiftEvent) {
            return bad(400, 'Required EventTypes (EVENT or SHIFT) not found')
        }

        // 3. Load all active shift slots
        const allShiftSlots = await prisma.shiftSlot.findMany({
            where: { isActive: true }
        })

        if (allShiftSlots.length === 0) {
            return bad(400, 'No active shift slots found')
        }

        console.log('Available shift slots:', allShiftSlots.map(s => s.slotCode))

        // 4. Clear existing entries for this month (Clean Re-run)
        await prisma.$transaction(async (tx) => {
            const existingEntries = await tx.rosterEntry.findMany({
                where: {
                    eventTypeId: { in: [eventEvent.eventTypeId, workShiftEvent.eventTypeId] },
                    entryDate: { gte: startDate, lte: endDate }
                },
                select: { entryId: true }
            })
            const entryIds = existingEntries.map(e => e.entryId)

            if (entryIds.length > 0) {
                await tx.rosterAssignment.deleteMany({ where: { entryId: { in: entryIds } } })
                await tx.rosterEntry.deleteMany({ where: { entryId: { in: entryIds } } })
            }
        })

        // 5. Fetch active locations
        const locations = await prisma.location.findMany({
            where: { isActive: true },
            orderBy: [{ sortOrder: 'asc' }, { locationNameEn: 'asc' }]
        })

        if (locations.length === 0) {
            return bad(400, 'No active locations found. Please add locations first.')
        }

        // Helper to combine Date (UTC-based for DB Date column) and ShiftSlot time
        const combineDateTime = (date: Date, slotTime: Date) => {
            const h = new Date(slotTime).getUTCHours()
            const m = new Date(slotTime).getUTCMinutes()
            return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), h, m, 0)
        }

        // Helper to find shift slot by location and day
        const getShiftsForLocation = (location: any, date: Date) => {
            const dayOfWeek = date.getUTCDay() // 0 = Sunday, 1 = Monday, etc.
            const isSunday = dayOfWeek === 0
            const locationCode = location.locationCode?.toUpperCase() || ''

            const shifts: Array<{ name: string, slot: any }> = []

            if (isSunday) {
                // Sunday: Find shift slot with pattern
                const patterns = [
                    `${locationCode}-SundayShift`,
                    `${locationCode}_SundayShift`
                ]

                // For OS locations, also try parent prefix (e.g., OS-SundayShift for OS-Icon)
                if (locationCode.startsWith('OS-') || locationCode.startsWith('OS_')) {
                    patterns.push('OS-SundayShift', 'OS_SundayShift')
                }

                const sundaySlot = allShiftSlots.find(s =>
                    patterns.some(p => s.slotCode === p)
                )

                if (sundaySlot) {
                    shifts.push({ name: 'Sunday Shift', slot: sundaySlot })
                }
            } else {
                // Weekday: Find shift slots with multiple pattern matching
                let locationShifts = allShiftSlots.filter(s => {
                    const code = s.slotCode || ''
                    // Exact match: LocationCode-XXX or LocationCode_XXX
                    if (code.startsWith(`${locationCode}-`) || code.startsWith(`${locationCode}_`)) {
                        return !code.includes('Sunday')
                    }
                    return false
                })

                // If no exact match and this is an OS location, try parent prefix (e.g., OS-WorkDayOut1 for OS-Icon)
                if (locationShifts.length === 0 && (locationCode.startsWith('OS-') || locationCode.startsWith('OS_'))) {
                    locationShifts = allShiftSlots.filter(s => {
                        const code = s.slotCode || ''
                        return (code.startsWith('OS-') || code.startsWith('OS_')) && !code.includes('Sunday')
                    })
                }

                // Sort by slot code to maintain order
                locationShifts.sort((a, b) => (a.slotCode || '').localeCompare(b.slotCode || ''))

                for (const slot of locationShifts) {
                    const slotName = slot.slotName || slot.slotCode || 'Shift'
                    shifts.push({ name: slotName, slot })
                }
            }

            return shifts
        }

        // 6. Generation Logic - Use permanent stats with separate OS tracking
        const assignmentCounts: Record<string, number> = {}
        const osAssignmentCounts: Record<string, number> = {}
        employeesWithStats.forEach(e => {
            assignmentCounts[e.employeeId] = e.assignmentStats?.totalAssignments || 0
            osAssignmentCounts[e.employeeId] = e.assignmentStats?.osAssignments || 0
        })

        const daysInMonth = new Date(year, monthNum, 0).getDate()
        const results: any[] = []

        await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            let currentWeekNumber = -1
            let assignedThisWeek: string[] = [] // Track OS assignments per week

            for (let day = 1; day <= daysInMonth; day++) {
                const entryDate = new Date(Date.UTC(year, monthNum - 1, day))
                const assignedToday: string[] = []

                // Calculate week number (ISO week number)
                const weekNumber = getISOWeekNumber(entryDate)

                // Reset weekly tracking when new week starts
                if (weekNumber !== currentWeekNumber) {
                    currentWeekNumber = weekNumber
                    assignedThisWeek = []
                }

                // Helper function to get ISO week number
                function getISOWeekNumber(date: Date): number {
                    const d = new Date(date.getTime())
                    d.setUTCHours(0, 0, 0, 0)
                    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7))
                    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
                    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
                }

                // Separate locations into OS and LP groups
                const osLocations = locations.filter(loc => {
                    const code = loc.locationCode?.toUpperCase() || ''
                    // Match OS1, OS2, OS-Icon, OS_SP, etc.
                    return code.startsWith('OS')
                })

                const lpLocations = locations.filter(loc => {
                    const code = loc.locationCode?.toUpperCase() || ''
                    return code.startsWith('LP')
                })

                // 1. Process OS locations first (Icon, SP)
                for (const location of osLocations) {
                    const shifts = getShiftsForLocation(location, entryDate)

                    for (const sh of shifts) {
                        const startAt = combineDateTime(entryDate, sh.slot.startTime)
                        const endAt = combineDateTime(entryDate, sh.slot.endTime)

                        const entry = await tx.rosterEntry.create({
                            data: {
                                eventTypeId: workShiftEvent.eventTypeId,
                                locationId: location.locationId,
                                shiftSlotId: sh.slot.shiftSlotId,
                                entryDate,
                                startAt,
                                endAt,
                                note: `${location.locationNameEn} (${sh.name})`
                            }
                        })

                        // Assign staff based on location.staffPerShift
                        const numStaffToAssign = location.staffPerShift || 1

                        for (let s = 0; s < numStaffToAssign; s++) {
                            // For OS locations: prefer staff who haven't been assigned this week
                            // Sort by OS assignment count (not total) for fairness
                            let availableStaff = employeesWithStats
                                .filter(e => !assignedToday.includes(e.employeeId) && !assignedThisWeek.includes(e.employeeId))
                                .sort((a, b) => (osAssignmentCounts[a.employeeId] - osAssignmentCounts[b.employeeId]) || a.employeeId.localeCompare(b.employeeId))

                            // Fallback: if no one available, just avoid same-day duplicates
                            if (availableStaff.length === 0) {
                                availableStaff = employeesWithStats
                                    .filter(e => !assignedToday.includes(e.employeeId))
                                    .sort((a, b) => (osAssignmentCounts[a.employeeId] - osAssignmentCounts[b.employeeId]) || a.employeeId.localeCompare(b.employeeId))
                            }

                            if (availableStaff.length > 0) {
                                const selected = availableStaff[0]
                                await tx.rosterAssignment.create({
                                    data: {
                                        entryId: entry.entryId,
                                        employeeId: selected.employeeId
                                    }
                                })
                                assignmentCounts[selected.employeeId]++
                                osAssignmentCounts[selected.employeeId]++ // Track OS separately
                                assignedToday.push(selected.employeeId)
                                assignedThisWeek.push(selected.employeeId) // Track for the week
                                results.push({ entryId: entry.entryId, employeeId: selected.employeeId })
                            }
                        }
                    }
                }

                // 2. Process LP locations with remaining staff
                for (const location of lpLocations) {
                    const shifts = getShiftsForLocation(location, entryDate)

                    for (const sh of shifts) {
                        const startAt = combineDateTime(entryDate, sh.slot.startTime)
                        const endAt = combineDateTime(entryDate, sh.slot.endTime)

                        const entry = await tx.rosterEntry.create({
                            data: {
                                eventTypeId: workShiftEvent.eventTypeId,
                                locationId: location.locationId,
                                shiftSlotId: sh.slot.shiftSlotId,
                                entryDate,
                                startAt,
                                endAt,
                                note: `${location.locationNameEn} (${sh.name})`
                            }
                        })

                        // Assign staff based on location.staffPerShift
                        const numStaffToAssign = location.staffPerShift || 1

                        for (let s = 0; s < numStaffToAssign; s++) {
                            const availableStaff = employeesWithStats
                                .filter(e => !assignedToday.includes(e.employeeId))
                                .sort((a, b) => (assignmentCounts[a.employeeId] - assignmentCounts[b.employeeId]) || a.employeeId.localeCompare(b.employeeId))

                            if (availableStaff.length > 0) {
                                const selected = availableStaff[0]
                                await tx.rosterAssignment.create({
                                    data: {
                                        entryId: entry.entryId,
                                        employeeId: selected.employeeId
                                    }
                                })
                                assignmentCounts[selected.employeeId]++
                                assignedToday.push(selected.employeeId)
                                results.push({ entryId: entry.entryId, employeeId: selected.employeeId })
                            }
                        }
                    }
                }
            }
        })

        // Update permanent assignment statistics
        for (const empId in assignmentCounts) {
            const totalCount = assignmentCounts[empId]
            const osCount = osAssignmentCounts[empId] || 0
            await prisma.employeeAssignmentStat.upsert({
                where: { employeeId: empId },
                create: {
                    employeeId: empId,
                    totalAssignments: totalCount,
                    osAssignments: osCount
                },
                update: {
                    totalAssignments: totalCount,
                    osAssignments: osCount
                }
            })
        }

        console.log('Assignment counts updated:', { total: assignmentCounts, os: osAssignmentCounts })

        return ok({ message: 'Round Robin generation completed', assignmentsCreated: results.length })
    } catch (e: any) {
        console.error('Round Robin Error:', e)
        console.error('Error stack:', e.stack)
        return bad(500, 'SERVER_ERROR', e.message || String(e))
    }
}
