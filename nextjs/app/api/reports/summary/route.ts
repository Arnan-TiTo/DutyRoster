import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { requireApiSession } from '@/lib/auth'
import { ok, bad } from '@/lib/api'

function getMonthRange(monthStr: string) {
    const [y, m] = monthStr.split('-').map(Number)
    const start = new Date(Date.UTC(y, m - 1, 1))
    const end = new Date(Date.UTC(y, m, 1))
    return { start, end }
}

export async function GET(req: NextRequest) {
    try {
        const sess = await requireApiSession(req)
        const url = new URL(req.url)
        const month = url.searchParams.get('month') || new Date().toISOString().slice(0, 7)
        const { start, end } = getMonthRange(month)

        // Auth check: Admin/Sup sees all, Staff sees self
        const isAdmin = sess.roles.includes('ADMIN') || sess.roles.includes('SUPERVISOR')
        const employeeFilter = isAdmin ? {} : { A: { employeeId: sess.employeeId }, B: { employeeId: sess.employeeId }, C: { employeeId: sess.employeeId } }

        // 1. Fetch Employees
        const employees = await prisma.employee.findMany({
            where: {
                isActive: true,
                ...(isAdmin ? {} : { employeeId: sess.employeeId! })
            },
            orderBy: { firstName: 'asc' }
        })

        // 2. Fetch Roster Assignments (Work Hours & Shifts)
        const assignments = await prisma.rosterAssignment.findMany({
            where: {
                entry: {
                    entryDate: { gte: start, lt: end }
                },
                employeeId: isAdmin ? undefined : sess.employeeId!
            },
            include: {
                entry: {
                    include: { eventType: true, shiftSlot: true }
                }
            }
        })

        // 3. Fetch Leaves
        const leaves = await prisma.leaveRequest.findMany({
            where: {
                status: 'APPROVED',
                employeeId: isAdmin ? undefined : sess.employeeId!,
                OR: [
                    { dateFrom: { gte: start, lt: end } },
                    { dateTo: { gte: start, lt: end } },
                    { dateFrom: { lte: start }, dateTo: { gte: end } } // Span across
                ]
            },
            include: { leaveType: true }
        })

        // 4. Fetch Holiday Credits (Ledger items for entries/leaves in this month)
        // We link credit to the *activity date* (roster entry date or leave date), not when the record was created.
        const credits = await prisma.holidayCreditLedger.findMany({
            where: {
                employeeId: isAdmin ? undefined : sess.employeeId!,
                OR: [
                    { entry: { entryDate: { gte: start, lt: end } } },
                    { leaveRequest: { dateFrom: { gte: start, lt: end } } },
                    // Backup for manual adjustments without View links (if we supported them, but we don't yet explicitly)
                    { entryId: null, leaveRequestId: null, createdAt: { gte: start, lt: end } }
                ]
            },
            include: { entry: true, leaveRequest: true }
        })

        // Aggregate
        const stats: Record<string, any> = {}

        // Init stats
        for (const e of employees) {
            stats[e.employeeId] = {
                employee: e,
                totalMinutes: 0,
                shiftCounts: {},
                leaveDays: 0,
                creditMinutes: 0
            }
        }

        // Process Assignments
        for (const a of assignments) {
            const s = stats[a.employeeId]
            if (!s) continue

            // Count shift type
            const typeName = a.entry.eventType.eventName
            s.shiftCounts[typeName] = (s.shiftCounts[typeName] || 0) + 1

            // Calc duration if work
            if (a.entry.eventType.isWork) {
                const ms = a.entry.endAt.getTime() - a.entry.startAt.getTime()
                const mins = Math.max(0, Math.floor(ms / 60000))
                s.totalMinutes += mins
            }
        }

        // Process Leaves (Approximate intersection days)
        for (const l of leaves) {
            const s = stats[l.employeeId]
            if (!s) continue

            // Simple overlap calc
            const lStart = l.dateFrom < start ? start : l.dateFrom
            const lEnd = l.dateTo >= end ? new Date(end.getTime() - 1) : l.dateTo // end is exclusive in logic, inclusive in filtering? dateTo is usually inclusive date
            // Actually dateTo is Date type, let's assume it represents the day. 
            // If dateTo is 2025-01-05, it means inclusive.
            // Let's rely on day difference

            // Normalize to UTC midnight for day diff
            const d1 = new Date(lStart)
            d1.setUTCHours(0, 0, 0, 0)
            const d2 = new Date(lEnd)
            d2.setUTCHours(0, 0, 0, 0) // if lEnd is same day, diff is 0

            // Add 1 for inclusive
            const days = (d2.getTime() - d1.getTime()) / 86400000 + 1
            s.leaveDays += days
        }

        // Process Credits
        for (const c of credits) {
            const s = stats[c.employeeId]
            if (!s) continue
            s.creditMinutes += c.minutesDelta
        }

        // Format for response
        const items = Object.values(stats).map((s: any) => ({
            employeeId: s.employee.employeeId,
            name: `${s.employee.firstName} ${s.employee.lastName} (${s.employee.nickName || '-'})`,
            totalHours: parseFloat((s.totalMinutes / 60).toFixed(2)),
            shiftCounts: s.shiftCounts,
            leaveDays: s.leaveDays,
            holidayCreditHours: parseFloat((s.creditMinutes / 60).toFixed(2))
        }))

        return ok({ items })
    } catch (e: any) {
        return bad(500, 'SERVER_ERROR', String(e?.message || e))
    }
}
