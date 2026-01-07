import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { requireApiSession } from '@/lib/auth'
import { ok, bad } from '@/lib/api'

// PUT /api/leave-types/:id
export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        await requireApiSession(req)
        const { id } = params
        const body = await req.json()
        const { leaveCode, leaveName, isActive } = body

        if (!leaveCode || !leaveName) return bad(400, 'Missing required fields')

        const existing = await prisma.leaveType.findUnique({ where: { leaveTypeId: id } })
        if (!existing) return bad(404, 'Not found')

        if (existing.leaveCode !== leaveCode) {
            const dup = await prisma.leaveType.findUnique({ where: { leaveCode } })
            if (dup) return bad(400, 'Code exists')
        }

        const item = await prisma.leaveType.update({
            where: { leaveTypeId: id },
            data: { leaveCode, leaveName, isActive }
        })
        return ok({ item })
    } catch (e: any) {
        return bad(500, 'SERVER_ERROR', e.message)
    }
}

// DELETE /api/leave-types/:id
export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        await requireApiSession(req)
        const { id } = params

        try {
            await prisma.leaveType.delete({ where: { leaveTypeId: id } })
        } catch (err: any) {
            if (err.code === 'P2003') return bad(400, 'In Use')
            throw err
        }

        return ok({ message: 'Deleted' })
    } catch (e: any) {
        return bad(500, 'SERVER_ERROR', e.message)
    }
}
