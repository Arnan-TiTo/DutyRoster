import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { requireApiSession } from '@/lib/auth'
import { readJson, ok, bad, asBool, parseTimeToUtcDate, timeToHHMM } from '@/lib/api'

export async function GET(req: NextRequest) {
  try {
    await requireApiSession(req)
    const url = new URL(req.url)
    const onlyActive = asBool(url.searchParams.get('active'), false)

    const items = await prisma.shiftSlot.findMany({
      where: onlyActive ? { isActive: true } : undefined,
      orderBy: [{ sortOrder: 'asc' }, { slotName: 'asc' }]
    })

    return ok({
      items: (items as Array<{ startTime: Date, endTime: Date, [key: string]: any }>).map((s) => ({
        ...s,
        startTime: timeToHHMM(s.startTime),
        endTime: timeToHHMM(s.endTime)
      }))
    })
  } catch (e: any) {
    return bad(500, 'SERVER_ERROR', String(e?.message || e))
  }
}

export async function POST(req: NextRequest) {
  try {
    const sess = await requireApiSession(req)
    if (!sess.roles.includes('ADMIN')) return bad(403, 'FORBIDDEN')

    const body = await readJson<any>(req)
    const slotName = String(body.slotName || '').trim()
    if (!slotName) return bad(400, 'slotName required')

    const start = parseTimeToUtcDate(String(body.startTime || '09:00'))
    const end = parseTimeToUtcDate(String(body.endTime || '18:00'))
    if (!start || !end) return bad(400, 'startTime/endTime must be HH:MM')

    const item = await prisma.shiftSlot.create({
      data: {
        slotCode: body.slotCode ? String(body.slotCode).trim() : null,
        slotName,
        locationCode: body.locationCode ? String(body.locationCode).trim() : null,
        startTime: start,
        endTime: end,
        minStaff: Number(body.minStaff || 0),
        maxStaff: Number(body.maxStaff || 0),
        sortOrder: Number(body.sortOrder || 0),
        isActive: body.isActive === undefined ? true : !!body.isActive
      }
    })

    return ok({
      item: { ...item, startTime: timeToHHMM(item.startTime), endTime: timeToHHMM(item.endTime) }
    })
  } catch (e: any) {
    return bad(500, 'SERVER_ERROR', String(e?.message || e))
  }
}
