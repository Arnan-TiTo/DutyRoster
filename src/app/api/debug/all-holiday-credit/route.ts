import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { requireApiSession } from '@/lib/auth'
import { ok, bad } from '@/lib/api'

export async function GET(req: NextRequest) {
    try {
        const sess = await requireApiSession(req)

        const month = '2025-12'
        const [y, m] = month.split('-').map(Number)
        const start = new Date(Date.UTC(y, m - 1, 1))
        const end = new Date(Date.UTC(y, m, 1))

        // Get all employees
        const employees = await prisma.employee.findMany({
            where: { isActive: true },
            select: {
                employeeId: true,
                firstName: true,
                lastName: true,
                nickName: true
            }
        })

        // Get all ledger entries for December 2025
        const allLedger = await prisma.holidayCreditLedger.findMany({
            where: {
                OR: [
                    { entry: { entryDate: { gte: start, lt: end } } },
                    { leaveRequest: { dateFrom: { gte: start, lt: end } } },
                    { entryId: null, leaveRequestId: null, createdAt: { gte: start, lt: end } }
                ]
            },
            include: {
                entry: {
                    include: {
                        eventType: true
                    }
                },
                leaveRequest: {
                    include: {
                        leaveType: true
                    }
                }
            }
        })

        // Group by employee
        const byEmployee = (employees as Array<{ employeeId: string, firstName: string, lastName: string, nickName: string | null }>).map(emp => {
            const ledgerEntries = allLedger.filter(l => l.employeeId === emp.employeeId)
            const totalMinutes = ledgerEntries.reduce((sum, l) => sum + l.minutesDelta, 0)

            return {
                employeeId: emp.employeeId,
                name: `${emp.firstName} ${emp.lastName} (${emp.nickName})`,
                ledgerCount: ledgerEntries.length,
                totalMinutes,
                totalHours: totalMinutes / 60,
                totalDays: totalMinutes / 480,
                entries: (ledgerEntries as any[]).map(l => ({
                    ledgerId: l.ledgerId,
                    minutesDelta: l.minutesDelta,
                    reason: l.reason,
                    entryDate: l.entry?.entryDate?.toISOString().slice(0, 10),
                    entryTime: l.entry ? `${l.entry.startAt.toISOString().slice(11, 16)} - ${l.entry.endAt.toISOString().slice(11, 16)}` : null,
                    eventType: l.entry?.eventType?.eventName,
                    leaveType: l.leaveRequest?.leaveType?.leaveName
                }))
            }
        })

        return ok({
            month,
            totalLedgerEntries: allLedger.length,
            employees: byEmployee.filter(e => e.ledgerCount > 0)
        })
    } catch (e: any) {
        console.error('Debug all error:', e)
        return bad(500, 'SERVER_ERROR', String(e?.message || e))
    }
}
