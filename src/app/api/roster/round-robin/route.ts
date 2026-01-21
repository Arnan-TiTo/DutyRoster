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

        // 2. Event Type for "Event"
        const eventType = await prisma.eventType.findUnique({
            where: { eventCode: 'EVENT' }
        })
        if (!eventType) return bad(400, 'EventType "EVENT" not found')

        // 3. Get MORN shift slot for showroom
        const mornSlot = await prisma.shiftSlot.findUnique({ where: { slotCode: 'MORN' } })
        if (!mornSlot) return bad(400, 'MORN shift slot not found')

        // 4. Clear existing "Event" entries for this month (Clean Re-run)
        await prisma.$transaction(async (tx) => {
            const existingEntries = await tx.rosterEntry.findMany({
                where: {
                    eventTypeId: eventType.eventTypeId,
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
            orderBy: [{ sortOrder: 'asc' }, { locationName: 'asc' }]
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

        // Extract times from shift slots
        const shift1Start = new Date(event1Slot.startTime).getUTCHours()
        const shift1End = new Date(event1Slot.endTime).getUTCHours()
        const shift2Start = new Date(event2Slot.startTime).getUTCHours()
        const shift2End = new Date(event2Slot.endTime).getUTCHours()
        const mornStart = new Date(mornSlot.startTime).getUTCHours()
        const mornEnd = new Date(mornSlot.endTime).getUTCHours()

        const shifts = [
            { name: 'Shift 1', start: shift1Start, end: shift1End },
            { name: 'Shift 2', start: shift2Start, end: shift2End }
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
                    const shiftsToCreate = Math.min(loc.shiftsPerDay, 2)

                    for (let i = 0; i < shiftsToCreate; i++) {
                        const sh = shifts[i]
                        const startAt = new Date(Date.UTC(year, monthNum - 1, day, sh.start, 0, 0))
                        const endAt = new Date(Date.UTC(year, monthNum - 1, day, sh.end, 0, 0))

                        const entry = await tx.rosterEntry.create({
                            data: {
                                eventTypeId: eventType.eventTypeId,
                                locationId: loc.locationId,
                                entryDate,
                                startAt,
                                endAt,
                                note: `${loc.locationName} (${sh.name})`
                            }
                        })

                        // Assign staff to this shift (staffPerShift people)
                        for (let s = 0; s < loc.staffPerShift; s++) {
                            const availableStaff = employees
                                .filter(e => !assignedToday.includes(e.employeeId))
                                .sort((a, b) => assignmentCounts[a.employeeId] - assignmentCounts[b.employeeId])

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

                // Assign remaining staff to showroom
                if (showroomLocation) {
                    const remainingStaff = employees.filter(e => !assignedToday.includes(e.employeeId))

                    if (remainingStaff.length > 0) {
                        const startAt = new Date(Date.UTC(year, monthNum - 1, day, mornStart, 0, 0))
                        const endAt = new Date(Date.UTC(year, monthNum - 1, day, mornEnd, 0, 0))

                        const showroomEntry = await tx.rosterEntry.create({
                            data: {
                                eventTypeId: eventType.eventTypeId,
                                locationId: showroomLocation.locationId,
                                entryDate,
                                startAt,
                                endAt,
                                note: `${showroomLocation.locationName}`
                            }
                        })

                        // Assign all remaining staff to showroom
                        for (const emp of remainingStaff) {
                            await tx.rosterAssignment.create({
                                data: {
                                    entryId: showroomEntry.entryId,
                                    employeeId: emp.employeeId
                                }
                            })
                            assignmentCounts[emp.employeeId]++
                            results.push({ entryId: showroomEntry.entryId, employeeId: emp.employeeId })
                        }
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
