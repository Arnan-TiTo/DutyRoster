import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { requireApiSession } from '@/lib/auth'
import { ok, bad } from '@/lib/api'

// GET /api/roles/:id
export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        await requireApiSession(req)
        const { id } = params

        const role = await prisma.role.findUnique({
            where: { roleId: id },
            include: {
                roleMenus: {
                    include: { menu: true }
                }
            }
        })
        if (!role) return bad(404, 'Role not found')

        return ok({ item: role })
    } catch (e: any) {
        return bad(500, 'SERVER_ERROR', e.message)
    }
}

// PUT /api/roles/:id - Update Role and Permissions
export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        await requireApiSession(req)
        const { id } = params
        const body = await req.json()
        const { roleCode, roleName, permissions } = body // permissions: [{ menuId, canView, canEdit }]

        // Transaction
        await prisma.$transaction(async (tx) => {
            // Update Role details
            await tx.role.update({
                where: { roleId: id },
                data: { roleCode, roleName }
            })

            if (permissions && Array.isArray(permissions)) {
                // Upsert permissions
                // Easier to delete all and recreate? Or upsert one by one.
                // Delete all for this role first seems safest to ensure clean state
                await tx.roleMenu.deleteMany({ where: { roleId: id } })

                if (permissions.length > 0) {
                    await tx.roleMenu.createMany({
                        data: permissions.map((p: any) => ({
                            roleId: id,
                            menuId: p.menuId,
                            canView: p.canView ?? false,
                            canEdit: p.canEdit ?? false
                        }))
                    })
                }
            }
        })

        return ok({ message: 'Updated' })
    } catch (e: any) {
        return bad(500, 'SERVER_ERROR', e.message)
    }
}
