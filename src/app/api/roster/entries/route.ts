import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { Prisma } from '@prisma/client'
import { requireApiSession } from '@/lib/auth'
import { readJson, ok, bad, dateOnlyFromIsoLike } from '@/lib/api'

function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
  return aStart < bEnd && aEnd > bStart
}

async function validateAssignments(
  tx: Prisma.TransactionClient,
  employeeIds: string[],
  startAt: Date,
  endAt: Date,
  entryDate: Date,
  entryIdToIgnore: string | null,
  shiftSlotId: string | null
) {
  if (employeeIds.length === 0) return

  const emps = await tx.employee.findMany({ where: { employeeId: { in: employeeIds }, isActive: true } })
  if (emps.length !== employeeIds.length) throw new Error('INVALID_EMPLOYEE')

  // Check leave conflicts (approved)
  const leave = await tx.leaveRequest.findFirst({
    where: {
      employeeId: { in: employeeIds },
      status: 'APPROVED',
      dateFrom: { lte: entryDate },
      dateTo: { gte: entryDate }
    },
    select: { leaveRequestId: true }
  })
  if (leave) throw new Error('CONFLICT_LEAVE')

  // Check roster overlap conflicts
  const existing = await tx.rosterAssignment.findMany({
    where: {
      employeeId: { in: employeeIds },
      entryId: entryIdToIgnore ? { not: entryIdToIgnore } : undefined
    },
    include: { entry: true }
  })
  for (const a of existing) {
    if (overlaps(a.entry.startAt, a.entry.endAt, startAt, endAt)) {
      throw new Error('CONFLICT_SHIFT')
    }
  }

  if (shiftSlotId) {
    const slot = await tx.shiftSlot.findUnique({ where: { shiftSlotId } })
    if (slot && slot.maxStaff > 0 && employeeIds.length > slot.maxStaff) {
      throw new Error('MAX_STAFF_EXCEEDED')
    }
  }
}

async function applyHolidayCredit(tx: Prisma.TransactionClient, entryId: string, employeeIds: string[], entryDate: Date, startAt: Date, endAt: Date) {
  // Check if this date is a company holiday
  const hol = await tx.companyHoliday.findFirst({
    where: {
      holidayDate: entryDate,
      isActive: true
    }
  })

  // Also treat eventType.isHoliday in UI, but this is company-holiday based
  if (!hol) {
    await tx.holidayCreditLedger.deleteMany({ where: { entryId } })
    return
  }

  // Holiday credit is 1 day (480 minutes = 8 hours) per work day on company holiday
  const minutesPerDay = 480

  // Remove old rows then add
  await tx.holidayCreditLedger.deleteMany({ where: { entryId } })
  if (employeeIds.length === 0) return

  await tx.holidayCreditLedger.createMany({
    data: employeeIds.map((employeeId) => ({
      employeeId,
      entryId,
      minutesDelta: minutesPerDay,
      reason: `Work on holiday (${hol.holidayName})`
    }))
  })
}

export async function GET(req: NextRequest) {
  try {
    const sess = await requireApiSession(req)

    // Get query parameters for filtering
    const url = new URL(req.url)
    const limit = parseInt(url.searchParams.get('limit') || '100')
    const offset = parseInt(url.searchParams.get('offset') || '0')
    const monthParam = url.searchParams.get('month') // YYYY-MM format

    // Build where clause for month filter
    let whereClause: any = {}
    if (monthParam) {
      const [year, month] = monthParam.split('-').map(Number)
      const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0))
      const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999))
      whereClause.entryDate = {
        gte: startDate,
        lte: endDate
      }
    }

    const entries = await prisma.rosterEntry.findMany({
      where: whereClause,
      take: limit,
      skip: offset,
      orderBy: [
        { entryDate: 'desc' },
        { startAt: 'desc' }
      ],
      include: {
        eventType: {
          select: {
            eventName: true,
            eventCode: true
          }
        },
        shiftSlot: {
          select: {
            slotName: true,
            slotCode: true
          }
        },
        assignments: {
          include: {
            employee: {
              select: {
                firstName: true,
                lastName: true,
                nickName: true
              }
            }
          }
        }
      }
    })

    const formatted = (entries as any[]).map(entry => ({
      id: entry.entryId,
      date: entry.entryDate.toISOString(),
      startTime: new Date(entry.startAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }),
      endTime: new Date(entry.endAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }),
      eventTypeName: entry.eventType.eventName,
      eventTypeCode: entry.eventType.eventCode,
      shiftSlotName: entry.shiftSlot?.slotName || '-',
      shiftSlotCode: entry.shiftSlot?.slotCode || '-',
      note: entry.note,
      staffCount: entry.assignments.length,
      staff: entry.assignments.map((a: any) => ({
        id: a.employeeId,
        name: a.employee.nickName || `${a.employee.firstName} ${a.employee.lastName}`
      }))
    }))

    return ok({ entries: formatted })
  } catch (e: any) {
    console.error('GET /api/roster/entries error:', e)
    return bad(500, 'SERVER_ERROR')
  }
}

export async function POST(req: NextRequest) {
  try {
    const sess = await requireApiSession(req)
    const canEdit = sess.roles.includes('ADMIN') || sess.roles.includes('SUPERVISOR')
    if (!canEdit) return bad(403, 'FORBIDDEN')

    const body = await readJson<any>(req)
    const eventTypeId = String(body.eventTypeId || '')
    const shiftSlotId = body.shiftSlotId ? String(body.shiftSlotId) : null
    const startIso = String(body.startAt || '')
    const endIso = String(body.endAt || '')
    const note = body.note ? String(body.note).trim() : null
    const employeeIds = Array.isArray(body.employeeIds) ? body.employeeIds.map(String) : []

    const d = dateOnlyFromIsoLike(startIso)
    if (!eventTypeId || !d || !startIso || !endIso) return bad(400, 'eventTypeId/startAt/endAt required')
    const startAt = new Date(startIso)
    const endAt = new Date(endIso)
    if (!(startAt < endAt)) return bad(400, 'startAt must be < endAt')

    const entryDate = new Date(`${d}T00:00:00.000Z`)
    const et = await prisma.eventType.findUnique({ where: { eventTypeId } })
    if (!et || !et.isActive) return bad(400, 'Invalid eventType')

    const item = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await validateAssignments(tx, employeeIds, startAt, endAt, entryDate, null, shiftSlotId)

      const created = await tx.rosterEntry.create({
        data: {
          eventTypeId,
          shiftSlotId,
          entryDate,
          startAt,
          endAt,
          note
        }
      })

      if (employeeIds.length) {
        await tx.rosterAssignment.createMany({
          data: employeeIds.map((employeeId: string) => ({
            entryId: created.entryId,
            employeeId
          }))
        })
      }

      await applyHolidayCredit(tx, created.entryId, employeeIds, entryDate, startAt, endAt)
      return created
    })

    return ok({ item })
  } catch (e: any) {
    const msg = String(e?.message || e)
    if (msg.includes('INVALID_EMPLOYEE')) return bad(400, 'INVALID_EMPLOYEE')
    if (msg.includes('CONFLICT_LEAVE')) return bad(400, 'CONFLICT_LEAVE')
    if (msg.includes('CONFLICT_SHIFT')) return bad(400, 'CONFLICT_SHIFT')
    if (msg.includes('MAX_STAFF_EXCEEDED')) return bad(400, 'MAX_STAFF_EXCEEDED')
    console.error('SERVER_ERROR detail:', e)
    return bad(500, 'SERVER_ERROR', msg + (e.stack ? '\n' + e.stack : ''))
  }
}
