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

  const existing = await tx.rosterAssignment.findMany({
    where: {
      employeeId: { in: employeeIds },
      entryId: entryIdToIgnore ? { not: entryIdToIgnore } : undefined
    },
    include: { entry: true }
  })

  for (const a of existing) {
    if (overlaps(a.entry.startAt, a.entry.endAt, startAt, endAt)) throw new Error('CONFLICT_SHIFT')
  }

  if (shiftSlotId) {
    const slot = await tx.shiftSlot.findUnique({ where: { shiftSlotId } })
    if (slot && slot.maxStaff > 0 && employeeIds.length > slot.maxStaff) throw new Error('MAX_STAFF_EXCEEDED')
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
  if (!hol) {
    await tx.holidayCreditLedger.deleteMany({ where: { entryId } })
    return
  }

  // Holiday credit is 1 day (480 minutes = 8 hours) per work day on company holiday
  const minutesPerDay = 480
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

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const sess = await requireApiSession(req)
    const isAdmin = sess.roles.includes('ADMIN') || sess.roles.includes('SUPERVISOR')

    const item = await prisma.rosterEntry.findUnique({
      where: { entryId: params.id },
      include: {
        eventType: true,
        shiftSlot: true,
        assignments: { include: { employee: true } }
      }
    })
    if (!item) return bad(404, 'NOT_FOUND')

    if (!isAdmin) {
      if (!sess.employeeId) return bad(400, 'NO_EMPLOYEE_LINKED')
      const okView = item.assignments.some((a) => a.employeeId === sess.employeeId)
      if (!okView) return bad(403, 'FORBIDDEN')
    }

    return ok({
      item: {
        ...item,
        entryDate: item.entryDate.toISOString().slice(0, 10),
        startAt: item.startAt.toISOString(),
        endAt: item.endAt.toISOString(),
        shiftSlot: item.shiftSlot
          ? { ...item.shiftSlot, startTime: item.shiftSlot.startTime.toISOString().slice(11, 16), endTime: item.shiftSlot.endTime.toISOString().slice(11, 16) }
          : null
      }
    })
  } catch (e: any) {
    return bad(500, 'SERVER_ERROR', String(e?.message || e))
  }
}

export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
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
    const employeeIds: string[] = Array.isArray(body.employeeIds) ? body.employeeIds.map(String) : []

    const d = dateOnlyFromIsoLike(startIso)
    if (!eventTypeId || !d || !startIso || !endIso) return bad(400, 'eventTypeId/startAt/endAt required')
    const startAt = new Date(startIso)
    const endAt = new Date(endIso)
    if (!(startAt < endAt)) return bad(400, 'startAt must be < endAt')
    const entryDate = new Date(`${d}T00:00:00.000Z`)

    const et = await prisma.eventType.findUnique({ where: { eventTypeId } })
    if (!et || !et.isActive) return bad(400, 'Invalid eventType')

    const item = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await validateAssignments(tx, employeeIds, startAt, endAt, entryDate, params.id, shiftSlotId)

      const updated = await tx.rosterEntry.update({
        where: { entryId: params.id },
        data: { eventTypeId, shiftSlotId, entryDate, startAt, endAt, note }
      })

      await tx.rosterAssignment.deleteMany({ where: { entryId: params.id } })
      if (employeeIds.length) {
        await tx.rosterAssignment.createMany({
          data: employeeIds.map((employeeId) => ({ entryId: params.id, employeeId }))
        })
      }

      await applyHolidayCredit(tx, params.id, employeeIds, entryDate, startAt, endAt)
      return updated
    })

    return ok({ item })
  } catch (e: any) {
    const msg = String(e?.message || e)
    if (msg.includes('INVALID_EMPLOYEE')) return bad(400, 'INVALID_EMPLOYEE')
    if (msg.includes('CONFLICT_LEAVE')) return bad(400, 'CONFLICT_LEAVE')
    if (msg.includes('CONFLICT_SHIFT')) return bad(400, 'CONFLICT_SHIFT')
    if (msg.includes('MAX_STAFF_EXCEEDED')) return bad(400, 'MAX_STAFF_EXCEEDED')
    return bad(500, 'SERVER_ERROR', msg)
  }
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const sess = await requireApiSession(req)
    const canEdit = sess.roles.includes('ADMIN') || sess.roles.includes('SUPERVISOR')
    if (!canEdit) return bad(403, 'FORBIDDEN')

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.holidayCreditLedger.deleteMany({ where: { entryId: params.id } })
      await tx.rosterAssignment.deleteMany({ where: { entryId: params.id } })
      await tx.rosterEntry.delete({ where: { entryId: params.id } })
    })

    return ok({})
  } catch (e: any) {
    return bad(500, 'SERVER_ERROR', String(e?.message || e))
  }
}
