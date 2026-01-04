import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { requireApiSession } from '@/lib/auth'
import { ok, bad } from '@/lib/api'
import bcrypt from 'bcryptjs'

// PUT /api/users/:id
export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        await requireApiSession(req)
        const { id } = params
        const body = await req.json()
        const { password, displayName, employeeId, roleIds, isActive } = body

        // Update basic fields
        const data: any = {}
        if (displayName !== undefined) data.displayName = displayName
        if (employeeId !== undefined) data.employeeId = employeeId
        if (isActive !== undefined) data.isActive = isActive
        if (password) {
            data.passwordHash = await bcrypt.hash(password, 10)
        }

        // Transaction for roles update if provided
        await prisma.$transaction(async (tx) => {
            await tx.user.update({
                where: { userId: id },
                data
            })

            if (roleIds) {
                // Replace roles
                await tx.userRole.deleteMany({ where: { userId: id } })
                if (roleIds.length > 0) {
                    await tx.userRole.createMany({
                        data: roleIds.map((rid: string) => ({ userId: id, roleId: rid }))
                    })
                }
            }
        })

        return ok({ message: 'Updated' })
    } catch (e: any) {
        return bad(500, 'SERVER_ERROR', e.message)
    }
}

// DELETE /api/users/:id
export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        await requireApiSession(req)
        const { id } = params
        await prisma.user.delete({ where: { userId: id } })
        return ok({ message: 'Deleted' })
    } catch (e: any) {
        return bad(500, 'SERVER_ERROR', e.message)
    }
}
