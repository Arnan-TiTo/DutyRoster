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

        // 1. Target Staff (only roleTitle 'Staff')
        const employees = await prisma.employee.findMany({
            where: { roleTitle: 'Staff', isActive: true },
            select: { employeeId: true, nickName: true }
        })

        if (employees.length === 0) return bad(400, 'No employees with role "Staff" found')

        // 2. Event Types
        const eventEvent = await prisma.eventType.findUnique({ where: { eventCode: 'EVENT' } })
        const workShiftEvent = await prisma.eventType.findUnique({ where: { eventCode: 'SHIFT' } })

        if (!eventEvent || !workShiftEvent) {
            return bad(400, 'Required EventTypes (EVENT or SHIFT) not found')
        }

        // 3. Get MORN shift slot
        const mornSlot = await prisma.shiftSlot.findUnique({ where: { slotCode: 'MORN' } })
        if (!mornSlot) return bad(400, 'MORN shift slot not found')

        // 4. Clear existing entries for this month (Clean Re-run)
        // We clear both "Event" and "Work Shift" entries that were generated via Round Robin
        // For simplicity, we filter by these two event types
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

        // Separate showroom location
        const showroomLocation = locations.find(loc => loc.locationCode === 'SHOWROOM')
        const eventLocations = locations.filter(loc => loc.locationCode !== 'SHOWROOM')

        // 6. Fetch EVENT1 and EVENT2 shift slots
        const event1Slot = await prisma.shiftSlot.findUnique({ where: { slotCode: 'EVENT1' } })
        const event2Slot = await prisma.shiftSlot.findUnique({ where: { slotCode: 'EVENT2' } })

        if (!event1Slot || !event2Slot) {
            return bad(400, 'EVENT1 or EVENT2 shift slots not found. Please run seed.')
        }

        // Helper to combine Date (UTC-based for DB Date column) and ShiftSlot time (stored as "wall time" in UTC)
        const combineDateTime = (date: Date, slotTime: Date) => {
            const h = new Date(slotTime).getUTCHours()
            const m = new Date(slotTime).getUTCMinutes()
            // We use new Date(...) which uses local time. 
            // This ensures that when the server/browser calls toLocaleTimeString(), 
            // it shows the exact h:m we extracted.
            return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), h, m, 0)
        }

        const shifts = [
            { name: 'Shift 1', slot: event1Slot },
            { name: 'Shift 2', slot: event2Slot }
        ]

        // 7. Generation Logic
        const assignmentCounts: Record<string, number> = {}
        employees.forEach(e => { assignmentCounts[e.employeeId] = 0 })

        const daysInMonth = new Date(year, monthNum, 0).getDate()
        const results: any[] = []

        await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            for (let day = 1; day <= daysInMonth; day++) {
                const entryDate = new Date(Date.UTC(year, monthNum - 1, day))
                const assignedToday: string[] = []

                // Create event location entries
                for (const loc of eventLocations) {
                    const numShifts = Math.min(loc.shiftsPerDay, 2)

                    if (numShifts === 2) {
                        for (let i = 0; i < 2; i++) {
                            const sh = shifts[i]
                            const startAt = combineDateTime(entryDate, sh.slot.startTime)
                            const endAt = combineDateTime(entryDate, sh.slot.endTime)

                            const entry = await tx.rosterEntry.create({
                                data: {
                                    eventTypeId: eventEvent.eventTypeId,
                                    locationId: loc.locationId,
                                    shiftSlotId: sh.slot.shiftSlotId,
                                    entryDate,
                                    startAt,
                                    endAt,
                                    note: `${loc.locationNameEn} (${sh.name})`
                                }
                            })

                            // Assign 1 staff per shift
                            const availableStaff = employees
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
                    } else if (numShifts === 1) {
                        const sh = shifts[0]
                        const startAt = combineDateTime(entryDate, sh.slot.startTime)
                        const endAt = combineDateTime(entryDate, sh.slot.endTime)

                        const entry = await tx.rosterEntry.create({
                            data: {
                                eventTypeId: eventEvent.eventTypeId,
                                locationId: loc.locationId,
                                shiftSlotId: sh.slot.shiftSlotId,
                                entryDate,
                                startAt,
                                endAt,
                                note: `${loc.locationNameEn} (${sh.name})`
                            }
                        })

                        // Assign staffPerShift to this single shift
                        for (let s = 0; s < loc.staffPerShift; s++) {
                            const availableStaff = employees
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

                // Assign remaining staff to Workshop / Morning shift
                const remainingStaff = employees.filter(e => !assignedToday.includes(e.employeeId))

                if (remainingStaff.length > 0) {
                    const startAt = combineDateTime(entryDate, mornSlot.startTime)
                    const endAt = combineDateTime(entryDate, mornSlot.endTime)

                    const workShiftEntry = await tx.rosterEntry.create({
                        data: {
                            eventTypeId: workShiftEvent.eventTypeId,
                            locationId: showroomLocation?.locationId,
                            shiftSlotId: mornSlot.shiftSlotId,
                            entryDate,
                            startAt,
                            endAt,
                            note: 'Staff Remaining (Work Shift)'
                        }
                    })

                    // Assign all remaining staff to this "Work Shift"
                    for (const emp of remainingStaff) {
                        await tx.rosterAssignment.create({
                            data: {
                                entryId: workShiftEntry.entryId,
                                employeeId: emp.employeeId
                            }
                        })
                        assignmentCounts[emp.employeeId]++
                        results.push({ entryId: workShiftEntry.entryId, employeeId: emp.employeeId })
                    }
                }
            }
        })

        return ok({ message: 'Round Robin generation completed', assignmentsCreated: results.length })
    } catch (e: any) {
        console.error('Round Robin Error:', e)
        return bad(500, 'SERVER_ERROR', e.message)
    }
}
