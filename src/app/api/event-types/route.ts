import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { requireApiSession } from '@/lib/auth'
import { readJson, ok, bad, asBool } from '@/lib/api'

export async function GET(req: NextRequest) {
  try {
    await requireApiSession(req)
    const url = new URL(req.url)
    const onlyActive = asBool(url.searchParams.get('active'), false)

    const items = await prisma.eventType.findMany({
      where: onlyActive ? { isActive: true } : undefined,
      orderBy: [{ sortOrder: 'asc' }, { eventName: 'asc' }]
    })
    return ok({ items })
  } catch (e: any) {
    return bad(500, 'SERVER_ERROR', String(e?.message || e))
  }
}

export async function POST(req: NextRequest) {
  try {
    const sess = await requireApiSession(req)
    if (!sess.roles.includes('ADMIN')) return bad(403, 'FORBIDDEN')
    const body = await readJson<any>(req)

    const eventCode = String(body.eventCode || '').trim()
    const eventName = String(body.eventName || '').trim()
    if (!eventCode || !eventName) return bad(400, 'eventCode/eventName required')

    const item = await prisma.eventType.create({
      data: {
        eventCode,
        eventName,
        colorHex: String(body.colorHex || '#146C9C'),
        isWork: !!body.isWork,
        isHoliday: !!body.isHoliday,
        defaultDurationMinutes: Number(body.defaultDurationMinutes || 0),
        isActive: true,
        sortOrder: Number(body.sortOrder || 0)
      }
    })
    return ok({ item })
  } catch (e: any) {
    return bad(500, 'SERVER_ERROR', String(e?.message || e))
  }
}
