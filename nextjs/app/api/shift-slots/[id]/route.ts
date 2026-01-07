import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { requireApiSession } from '@/lib/auth'
import { readJson, ok, bad, parseTimeToUtcDate, timeToHHMM } from '@/lib/api'

export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const sess = await requireApiSession(req)
    if (!sess.roles.includes('ADMIN')) return bad(403, 'FORBIDDEN')

    const body = await readJson<any>(req)
    const slotName = String(body.slotName || '').trim()
    if (!slotName) return bad(400, 'slotName required')

    const start = parseTimeToUtcDate(String(body.startTime || '09:00'))
    const end = parseTimeToUtcDate(String(body.endTime || '18:00'))
    if (!start || !end) return bad(400, 'startTime/endTime must be HH:MM')

    const item = await prisma.shiftSlot.update({
      where: { shiftSlotId: params.id },
      data: {
        slotCode: body.slotCode ? String(body.slotCode).trim() : null,
        slotName,
        startTime: start,
        endTime: end,
        minStaff: Number(body.minStaff || 0),
        maxStaff: Number(body.maxStaff || 0),
        sortOrder: Number(body.sortOrder || 0),
        isActive: body.isActive === undefined ? undefined : !!body.isActive
      }
    })

    return ok({ item: { ...item, startTime: timeToHHMM(item.startTime), endTime: timeToHHMM(item.endTime) } })
  } catch (e: any) {
    return bad(500, 'SERVER_ERROR', String(e?.message || e))
  }
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const sess = await requireApiSession(req)
    if (!sess.roles.includes('ADMIN')) return bad(403, 'FORBIDDEN')
    await prisma.shiftSlot.delete({ where: { shiftSlotId: params.id } })
    return ok({})
  } catch (e: any) {
    return bad(500, 'SERVER_ERROR', String(e?.message || e))
  }
}
