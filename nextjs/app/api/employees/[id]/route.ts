import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { requireApiSession } from '@/lib/auth'
import { readJson, ok, bad } from '@/lib/api'

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const sess = await requireApiSession(req)
    const canView = sess.roles.includes('ADMIN') || sess.roles.includes('SUPERVISOR')
    if (!canView) return bad(403, 'FORBIDDEN')

    const item = await prisma.employee.findUnique({ where: { employeeId: params.id } })
    if (!item) return bad(404, 'NOT_FOUND')
    return ok({ item })
  } catch (e: any) {
    return bad(500, 'SERVER_ERROR', String(e?.message || e))
  }
}

export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const sess = await requireApiSession(req)
    if (!sess.roles.includes('ADMIN')) return bad(403, 'FORBIDDEN')

    const body = await readJson<any>(req)
    const firstName = String(body.firstName || '').trim()
    const lastName = String(body.lastName || '').trim()
    if (!firstName || !lastName) return bad(400, 'firstName/lastName required')

    const empCode = body.empCode ? String(body.empCode).trim() : null
    const nickName = body.nickName ? String(body.nickName).trim() : null
    const phone = body.phone ? String(body.phone).trim() : null
    const email = body.email ? String(body.email).trim() : null
    const roleTitle = body.roleTitle ? String(body.roleTitle).trim() : null
    const teamId = body.teamId ? String(body.teamId) : null

    const item = await prisma.employee.update({
      where: { employeeId: params.id },
      data: { empCode, firstName, lastName, nickName, phone, email, roleTitle, teamId }
    })

    return ok({ item })
  } catch (e: any) {
    return bad(500, 'SERVER_ERROR', String(e?.message || e))
  }
}
