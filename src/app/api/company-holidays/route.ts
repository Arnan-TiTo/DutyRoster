import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { requireApiSession } from '@/lib/auth'
import { readJson, ok, bad, asBool, dateOnlyFromIsoLike } from '@/lib/api'

export async function GET(req: NextRequest) {
  try {
    await requireApiSession(req)
    const url = new URL(req.url)
    const onlyActive = asBool(url.searchParams.get('active'), false)
    const year = url.searchParams.get('year')

    let where: any = onlyActive ? { isActive: true } : {}
    if (year && /^\d{4}$/.test(year)) {
      const y = Number(year)
      const start = new Date(Date.UTC(y, 0, 1))
      const end = new Date(Date.UTC(y + 1, 0, 1))
      where.holidayDate = { gte: start, lt: end }
    }

    const items = await prisma.companyHoliday.findMany({
      where: Object.keys(where).length ? where : undefined,
      orderBy: [{ holidayDate: 'asc' }]
    })
    return ok({ items: items.map((h) => ({ ...h, holidayDate: h.holidayDate.toISOString().slice(0,10) })) })
  } catch (e: any) {
    return bad(500, 'SERVER_ERROR', String(e?.message || e))
  }
}

export async function POST(req: NextRequest) {
  try {
    const sess = await requireApiSession(req)
    if (!sess.roles.includes('ADMIN')) return bad(403, 'FORBIDDEN')

    const body = await readJson<any>(req)
    const d = dateOnlyFromIsoLike(String(body.holidayDate || ''))
    const holidayName = String(body.holidayName || '').trim()
    if (!d || !holidayName) return bad(400, 'holidayDate/holidayName required')

    const item = await prisma.companyHoliday.create({
      data: {
        holidayDate: new Date(`${d}T00:00:00.000Z`),
        holidayName,
        holidayType: String(body.holidayType || 'ORG'),
        isActive: body.isActive === undefined ? true : !!body.isActive
      }
    })

    return ok({ item: { ...item, holidayDate: d } })
  } catch (e: any) {
    return bad(500, 'SERVER_ERROR', String(e?.message || e))
  }
}
