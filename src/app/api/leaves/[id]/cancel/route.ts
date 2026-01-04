import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { requireApiSession } from '@/lib/auth'
import { ok, bad } from '@/lib/api'

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const sess = await requireApiSession(req)
    if (!sess.employeeId) return bad(400, 'NO_EMPLOYEE_LINKED')

    const x = await prisma.leaveRequest.findUnique({ where: { leaveRequestId: params.id }, include: { leaveType: true } })
    if (!x) return bad(404, 'NOT_FOUND')
    if (x.employeeId !== sess.employeeId) return bad(403, 'FORBIDDEN')
    if (x.status !== 'PENDING') return bad(400, 'Only PENDING can be canceled')

    await prisma.$transaction(async (tx) => {
      await tx.leaveRequest.update({ where: { leaveRequestId: params.id }, data: { status: 'CANCELED', decidedAt: new Date(), decidedByUser: sess.userId } })
      await tx.holidayCreditLedger.deleteMany({ where: { leaveRequestId: params.id } })
    })

    return ok({})
  } catch (e: any) {
    return bad(500, 'SERVER_ERROR', String(e?.message || e))
  }
}
