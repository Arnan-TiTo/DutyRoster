import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { requireApiSession } from '@/lib/auth'
import { readJson, ok, bad } from '@/lib/api'

export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const sess = await requireApiSession(req)
    if (!sess.roles.includes('ADMIN')) return bad(403, 'FORBIDDEN')

    const body = await readJson<any>(req)
    const eventCode = String(body.eventCode || '').trim()
    const eventName = String(body.eventName || '').trim()
    if (!eventCode || !eventName) return bad(400, 'eventCode/eventName required')

    const item = await prisma.eventType.update({
      where: { eventTypeId: params.id },
      data: {
        eventCode,
        eventName,
        colorHex: String(body.colorHex || '#146C9C'),
        isWork: !!body.isWork,
        isHoliday: !!body.isHoliday,
        defaultDurationMinutes: Number(body.defaultDurationMinutes || 0),
        sortOrder: Number(body.sortOrder || 0),
        isActive: body.isActive === undefined ? undefined : !!body.isActive
      }
    })

    return ok({ item })
  } catch (e: any) {
    return bad(500, 'SERVER_ERROR', String(e?.message || e))
  }
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const sess = await requireApiSession(req)
    if (!sess.roles.includes('ADMIN')) return bad(403, 'FORBIDDEN')
    await prisma.eventType.delete({ where: { eventTypeId: params.id } })
    return ok({})
  } catch (e: any) {
    return bad(500, 'SERVER_ERROR', String(e?.message || e))
  }
}
