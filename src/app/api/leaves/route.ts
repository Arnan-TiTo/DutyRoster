import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { requireApiSession } from '@/lib/auth'
import { readJson, ok, bad, asBool, dateOnlyFromIsoLike } from '@/lib/api'

function toDate(d: string) {
  return new Date(`${d}T00:00:00.000Z`)
}

export async function GET(req: NextRequest) {
  try {
    const sess = await requireApiSession(req)
    const url = new URL(req.url)
    const mine = asBool(url.searchParams.get('mine'), true)
    const status = url.searchParams.get('status')

    const where: any = {}
    if (mine) {
      if (!sess.employeeId) return bad(400, 'NO_EMPLOYEE_LINKED')
      where.employeeId = sess.employeeId
    } else {
      const canView = sess.roles.includes('ADMIN') || sess.roles.includes('SUPERVISOR')
      if (!canView) return bad(403, 'FORBIDDEN')
    }
    if (status) where.status = String(status)

    const items = await prisma.leaveRequest.findMany({
      where,
      orderBy: [{ requestedAt: 'desc' }],
      include: {
        leaveType: true,
        employee: mine ? false : { select: { firstName: true, lastName: true, nickName: true } }
      }
    })

    return ok({
      items: items.map((x: any) => ({
        ...x,
        dateFrom: x.dateFrom.toISOString().slice(0, 10),
        dateTo: x.dateTo.toISOString().slice(0, 10),
        requestedAt: x.requestedAt?.toISOString?.() || x.requestedAt
      }))
    })
  } catch (e: any) {
    return bad(500, 'SERVER_ERROR', String(e?.message || e))
  }
}

export async function POST(req: NextRequest) {
  try {
    const sess = await requireApiSession(req)
    if (!sess.employeeId) return bad(400, 'NO_EMPLOYEE_LINKED')

    const body = await readJson<any>(req)
    const leaveTypeId = String(body.leaveTypeId || '')
    const d1 = dateOnlyFromIsoLike(String(body.dateFrom || ''))
    const d2 = dateOnlyFromIsoLike(String(body.dateTo || ''))
    if (!leaveTypeId || !d1 || !d2) return bad(400, 'leaveTypeId/dateFrom/dateTo required')
    if (d2 < d1) return bad(400, 'dateTo must be >= dateFrom')

    const lt = await prisma.leaveType.findUnique({ where: { leaveTypeId } })
    if (!lt || !lt.isActive) return bad(400, 'Invalid leave type')

    // Check holiday credit if this is a HOLIDAY_CREDIT leave type
    if (lt.leaveCode === 'HOLIDAY_CREDIT') {
      const dateFrom = toDate(d1)
      const dateTo = toDate(d2)
      const days = Math.floor((dateTo.getTime() - dateFrom.getTime()) / (24 * 60 * 60 * 1000)) + 1

      // Get minutes per day setting
      const setting = await prisma.setting.findUnique({
        where: { settingKey: 'HOLIDAY_CREDIT_MINUTES_PER_DAY' }
      })
      const minutesPerDay = Number(setting?.settingValue || 480)
      const requiredMinutes = days * minutesPerDay

      // Check current balance
      const balance = await prisma.holidayCreditLedger.aggregate({
        where: { employeeId: sess.employeeId },
        _sum: { minutesDelta: true }
      })
      const availableMinutes = Number(balance._sum.minutesDelta || 0)

      if (availableMinutes < requiredMinutes) {
        return bad(400, 'INSUFFICIENT_HOLIDAY_CREDIT')
      }
    }

    const item = await prisma.leaveRequest.create({
      data: {
        employeeId: sess.employeeId,
        leaveTypeId,
        dateFrom: toDate(d1),
        dateTo: toDate(d2),
        reason: body.reason ? String(body.reason).trim() : null,
        status: 'PENDING'
      },
      include: { leaveType: true }
    })

    return ok({
      item: {
        ...item,
        dateFrom: d1,
        dateTo: d2,
        requestedAt: item.requestedAt.toISOString()
      }
    })
  } catch (e: any) {
    return bad(500, 'SERVER_ERROR', String(e?.message || e))
  }
}
