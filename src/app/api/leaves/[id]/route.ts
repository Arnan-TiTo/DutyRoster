
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { requireApiSession } from '@/lib/auth'
import { ok, bad } from '@/lib/api'

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const sess = await requireApiSession(req)
        if (!sess.employeeId) return bad(400, 'NO_EMPLOYEE_LINKED')

        const x = await prisma.leaveRequest.findUnique({
            where: { leaveRequestId: params.id }
        })

        if (!x) return bad(404, 'NOT_FOUND')
        if (x.employeeId !== sess.employeeId) return bad(403, 'FORBIDDEN')

        // Only allow deleting CANCELED or REJECTED requests
        if (x.status !== 'CANCELED' && x.status !== 'REJECTED') {
            return bad(400, 'ONLY_CANCELED_OR_REJECTED_CAN_BE_DELETED')
        }

        await prisma.$transaction(async (tx) => {
            // Delete any associated holiday credit ledger entries (just in case they weren't deleted during cancel)
            await tx.holidayCreditLedger.deleteMany({ where: { leaveRequestId: params.id } })
            // Delete the leave request
            await tx.leaveRequest.delete({ where: { leaveRequestId: params.id } })
        })

        return ok({})
    } catch (e: any) {
        return bad(500, 'SERVER_ERROR', String(e?.message || e))
    }
}
