import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { requireApiSession } from '@/lib/auth'
import { readJson, ok, bad } from '@/lib/api'

export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
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

    const item = await prisma.location.update({
      where: { locationId: params.id },
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
    console.error('Update Location Error:', e)
    return bad(500, 'SERVER_ERROR', String(e?.message || e))
  }
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const sess = await requireApiSession(req)
    if (!sess.roles.includes('ADMIN')) return bad(403, 'FORBIDDEN')

    // Check if location is in use
    const inUse = await prisma.rosterEntry.findFirst({
      where: { locationId: params.id }
    })
    if (inUse) return bad(400, 'LOCATION_IN_USE')

    await prisma.location.delete({
      where: { locationId: params.id }
    })

    return ok({})
  } catch (e: any) {
    return bad(500, 'SERVER_ERROR', String(e?.message || e))
  }
}
