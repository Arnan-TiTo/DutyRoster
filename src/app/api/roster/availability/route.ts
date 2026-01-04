import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { requireApiSession } from '@/lib/auth'
import { ok, bad, dateOnlyFromIsoLike } from '@/lib/api'

export async function GET(req: NextRequest) {
    try {
        const sess = await requireApiSession(req) // Ensure auth

        const url = new URL(req.url)
        const startIso = url.searchParams.get('start') || ''
        const endIso = url.searchParams.get('end') || ''
        const excludeEntryId = url.searchParams.get('excludeEntryId') || null

        if (!startIso || !endIso) return ok({ unavailableEmployeeIds: [] })

        const startAt = new Date(startIso)
        const endAt = new Date(endIso)

        if (isNaN(startAt.getTime()) || isNaN(endAt.getTime())) {
            return bad(400, 'Invalid dates')
        }

        // Find assignments that overlap with [startAt, endAt]
        // RosterEntry overlaps if: (entry.start < requestedEnd) && (entry.end > requestedStart)
        const assignments = await prisma.rosterAssignment.findMany({
            where: {
                entry: {
                    startAt: { lt: endAt },
                    endAt: { gt: startAt },
                    entryId: excludeEntryId ? { not: excludeEntryId } : undefined
                }
            },
            select: {
                employeeId: true,
                entry: {
                    select: {
                        startAt: true,
                        endAt: true
                    }
                }
            }
        })

        // Also check for APPROVED leave requests
        // LeaveRequest overlaps if: (leave.dateFrom <= requestedEnd) && (leave.dateTo >= requestedStart)
        // Actually Leave is Date only (00:00 to 00:00 next day usually or just date)
        // The schema says `dateFrom` and `dateTo` are @db.Date. 
        // Prisma treats @db.Date as Date object at 00:00 UTC usually.
        // Let's approximate: If leave includes the day of startAt...
        // But `roster_entries` has full datetime.
        // Let's strictly check overlap with the entry's date range.
        // Since leave is day-granularity, if the event falls on any day covered by leave, it's a conflict.

        const startDay = new Date(startAt)
        startDay.setUTCHours(0, 0, 0, 0)
        const endDay = new Date(endAt)
        endDay.setUTCHours(0, 0, 0, 0)

        const leaves = await prisma.leaveRequest.findMany({
            where: {
                status: 'APPROVED',
                // Overlap logic for ranges [dateFrom, dateTo] vs [startDay, endDay]
                // dateFrom <= endDay && dateTo >= startDay
                dateFrom: { lte: endDay },
                dateTo: { gte: startDay }
            },
            select: { employeeId: true }
        })

        const unavailableEmployeeIds = Array.from(new Set([
            ...assignments.map(a => a.employeeId),
            ...leaves.map(l => l.employeeId)
        ]))

        return ok({ unavailableEmployeeIds })
    } catch (e: any) {
        return bad(500, 'SERVER_ERROR', e.message)
    }
}
