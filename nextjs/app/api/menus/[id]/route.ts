import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { requireApiSession } from '@/lib/auth'
import { ok, bad } from '@/lib/api'

// PUT /api/menus/:id
export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        await requireApiSession(req)
        const { id } = params
        const body = await req.json()
        const { menuCode, menuName, path, sortOrder, isActive } = body

        const item = await prisma.menu.update({
            where: { menuId: id },
            data: { menuCode, menuName, path, sortOrder, isActive }
        })
        return ok({ item })
    } catch (e: any) {
        return bad(500, 'SERVER_ERROR', e.message)
    }
}

// DELETE /api/menus/:id
export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        await requireApiSession(req)
        const { id } = params
        await prisma.menu.delete({ where: { menuId: id } })
        return ok({ message: 'Deleted' })
    } catch (e: any) {
        return bad(500, 'SERVER_ERROR', e.message)
    }
}
