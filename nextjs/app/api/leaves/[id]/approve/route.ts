import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { Prisma } from '@prisma/client'
import { requireApiSession } from '@/lib/auth'
import { ok, bad } from '@/lib/api'

function daysInclusive(d1: Date, d2: Date) {
  const ms = 24 * 60 * 60 * 1000
  const a = Date.UTC(d1.getUTCFullYear(), d1.getUTCMonth(), d1.getUTCDate())
  const b = Date.UTC(d2.getUTCFullYear(), d2.getUTCMonth(), d2.getUTCDate())
  return Math.floor((b - a) / ms) + 1
}

async function holidayCreditMinutesPerDay() {
  const s = await prisma.setting.findUnique({ where: { settingKey: 'HOLIDAY_CREDIT_MINUTES_PER_DAY' } })
  const n = Number(s?.settingValue || 480)
  return Number.isFinite(n) ? n : 480
}

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const sess = await requireApiSession(req)
    const canDecide = sess.roles.includes('ADMIN') || sess.roles.includes('SUPERVISOR')
    if (!canDecide) return bad(403, 'FORBIDDEN')

    const leave = await prisma.leaveRequest.findUnique({
      where: { leaveRequestId: params.id },
      include: { leaveType: true, employee: true }
    })
    if (!leave) return bad(404, 'NOT_FOUND')
    if (leave.status !== 'PENDING') return bad(400, 'Only PENDING can be approved')

    // block if there are shifts already assigned in this leave range
    const hasShift = await prisma.rosterAssignment.findFirst({
      where: {
        employeeId: leave.employeeId,
        entry: { entryDate: { gte: leave.dateFrom, lte: leave.dateTo } }
      },
      select: { entryId: true }
    })
    if (hasShift) return bad(400, 'Employee already has roster entries in this date range')

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.leaveRequest.update({
        where: { leaveRequestId: leave.leaveRequestId },
        data: {
          status: 'APPROVED',
          decidedAt: new Date(),
          decidedByUser: sess.userId,
          decisionNote: null
        }
      })

      // If this leave consumes holiday credits, deduct minutes from the ledger.
      if (leave.leaveType.leaveCode === 'HOLIDAY_CREDIT') {
        const perDay = await holidayCreditMinutesPerDay()
        const need = daysInclusive(leave.dateFrom, leave.dateTo) * perDay

        const bal = await tx.holidayCreditLedger.aggregate({
          where: { employeeId: leave.employeeId },
          _sum: { minutesDelta: true }
        })
        const have = Number(bal._sum.minutesDelta || 0)
        if (have < need) {
          throw new Error('INSUFFICIENT_HOLIDAY_CREDIT')
        }

        await tx.holidayCreditLedger.create({
          data: {
            employeeId: leave.employeeId,
            leaveRequestId: leave.leaveRequestId,
            minutesDelta: -need,
            reason: `Consume holiday credit (${need} min)`
          }
        })
      }
    })

    return ok({})
  } catch (e: any) {
    if (String(e?.message || '').includes('INSUFFICIENT_HOLIDAY_CREDIT')) {
      return bad(400, 'INSUFFICIENT_HOLIDAY_CREDIT')
    }
    return bad(500, 'SERVER_ERROR', String(e?.message || e))
  }
}
