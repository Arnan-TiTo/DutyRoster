import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { requireApiSession } from '@/lib/auth'
import { ok, bad } from '@/lib/api'

export async function GET(req: NextRequest) {
    try {
        const sess = await requireApiSession(req)

        // Get employee for current user
        const employee = await prisma.employee.findFirst({
            where: {
                users: {
                    some: { userId: sess.userId }
                }
            },
            select: { employeeId: true }
        })

        if (!employee) {
            return ok({ minutes: 0, hours: 0, days: 0 })
        }

        // Calculate total holiday credit balance
        const result = await prisma.holidayCreditLedger.aggregate({
            where: { employeeId: employee.employeeId },
            _sum: { minutesDelta: true }
        })

        const totalMinutes = Number(result._sum.minutesDelta || 0)
        const hours = Math.floor(totalMinutes / 60)
        const minutes = totalMinutes % 60
        const days = Math.floor(totalMinutes / 480) // Assuming 8 hours per day

        return ok({
            minutes: totalMinutes,
            hours,
            remainingMinutes: minutes,
            days
        })
    } catch (e: any) {
        console.error('GET /api/employees/me/holiday-balance error:', e)
        return bad(500, 'SERVER_ERROR')
    }
}
