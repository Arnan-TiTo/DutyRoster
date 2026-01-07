import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { requireApiSession } from '@/lib/auth'
import { readJson, ok, bad } from '@/lib/api'

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const sess = await requireApiSession(req)
    const canDecide = sess.roles.includes('ADMIN') || sess.roles.includes('SUPERVISOR')
    if (!canDecide) return bad(403, 'FORBIDDEN')
    const body = await readJson<any>(req)
    const note = body.note ? String(body.note).trim() : null

    const leave = await prisma.leaveRequest.findUnique({ where: { leaveRequestId: params.id } })
    if (!leave) return bad(404, 'NOT_FOUND')
    if (leave.status !== 'PENDING') return bad(400, 'Only PENDING can be rejected')

    await prisma.leaveRequest.update({
      where: { leaveRequestId: params.id },
      data: { status: 'REJECTED', decidedAt: new Date(), decidedByUser: sess.userId, decisionNote: note }
    })

    return ok({})
  } catch (e: any) {
    return bad(500, 'SERVER_ERROR', String(e?.message || e))
  }
}
