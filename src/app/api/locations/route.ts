import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { requireApiSession } from '@/lib/auth'
import { readJson, ok, bad, asBool } from '@/lib/api'

export async function GET(req: NextRequest) {
  try {
    const sess = await requireApiSession(req)
    const canView = sess.roles.includes('ADMIN') || sess.roles.includes('SUPERVISOR')
    if (!canView) return bad(403, 'FORBIDDEN')

    const url = new URL(req.url)
    const onlyActive = asBool(url.searchParams.get('active'), false)

    const items = await prisma.location.findMany({
      where: onlyActive ? { isActive: true } : undefined,
      orderBy: [{ sortOrder: 'asc' }, { locationName: 'asc' }]
    })

    return ok({ items })
  } catch (e: any) {
    return bad(500, 'SERVER_ERROR', String(e?.message || e))
  }
}

export async function POST(req: NextRequest) {
  try {
    const sess = await requireApiSession(req)
    if (!sess.roles.includes('ADMIN') && !sess.roles.includes('SUPERVISOR')) return bad(403, 'FORBIDDEN')

    const body = await readJson<any>(req)
    const locationName = String(body.locationName || '').trim()
    if (!locationName) return bad(400, 'locationName required')

    const locationCode = body.locationCode ? String(body.locationCode).trim() : null
    const shiftsPerDay = body.shiftsPerDay !== undefined ? Math.min(2, Math.max(1, parseInt(body.shiftsPerDay))) : 1
    const isActive = body.isActive !== undefined ? Boolean(body.isActive) : true
    const sortOrder = body.sortOrder !== undefined ? parseInt(body.sortOrder) : 0

    const item = await prisma.location.create({
      data: {
        locationName,
        locationCode,
        shiftsPerDay,
        isActive,
        sortOrder
      }
    })

    return ok({ item })
  } catch (e: any) {
    console.error('Create Location Error:', e)
    return bad(500, 'SERVER_ERROR', String(e?.message || e))
  }
}
