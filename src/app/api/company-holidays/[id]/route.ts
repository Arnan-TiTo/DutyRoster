import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { requireApiSession } from '@/lib/auth'
import { readJson, ok, bad, dateOnlyFromIsoLike } from '@/lib/api'

export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const sess = await requireApiSession(req)
    if (!sess.roles.includes('ADMIN')) return bad(403, 'FORBIDDEN')

    const body = await readJson<any>(req)
    const d = dateOnlyFromIsoLike(String(body.holidayDate || ''))
    const holidayName = String(body.holidayName || '').trim()
    if (!d || !holidayName) return bad(400, 'holidayDate/holidayName required')

    const item = await prisma.companyHoliday.update({
      where: { holidayId: params.id },
      data: {
        holidayDate: new Date(`${d}T00:00:00.000Z`),
        holidayName,
        holidayType: String(body.holidayType || 'ORG'),
        isActive: body.isActive === undefined ? undefined : !!body.isActive
      }
    })

    return ok({ item: { ...item, holidayDate: d } })
  } catch (e: any) {
    return bad(500, 'SERVER_ERROR', String(e?.message || e))
  }
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const sess = await requireApiSession(req)
    if (!sess.roles.includes('ADMIN')) return bad(403, 'FORBIDDEN')
    await prisma.companyHoliday.delete({ where: { holidayId: params.id } })
    return ok({})
  } catch (e: any) {
    return bad(500, 'SERVER_ERROR', String(e?.message || e))
  }
}
