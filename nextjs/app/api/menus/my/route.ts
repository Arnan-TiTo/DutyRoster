import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { requireApiSession } from '@/lib/auth'
import { ok, bad } from '@/lib/api'

export async function GET(req: NextRequest) {
    try {
        const session = await requireApiSession(req)
        const userId = session.userId

        // 1. Get User's Roles
        const userRoles = await prisma.userRole.findMany({
            where: { userId },
            select: { roleId: true }
        })
        const roleIds = (userRoles as Array<{ roleId: string }>).map(r => r.roleId)

        // 2. Get Permission from Roles (canView = true)
        const rolePermissions = await prisma.roleMenu.findMany({
            where: {
                roleId: { in: roleIds },
                canView: true
            },
            select: { menuId: true }
        })

        // 3. Get User Overrides
        const overrides = await prisma.userMenuOverride.findMany({
            where: { userId }
        })

        // 4. Calculate Allowed Menu IDs
        const allowed = new Set<string>()

        // Add role-based
        rolePermissions.forEach((p: typeof rolePermissions[0]) => allowed.add(p.menuId))

        // Apply Overrides
        overrides.forEach((o: typeof overrides[0]) => {
            if (o.allowView === true) allowed.add(o.menuId)
            else if (o.allowView === false) allowed.delete(o.menuId)
        })

        if (allowed.size === 0) return ok({ items: [] })

        // 5. Fetch Menu Details
        const menus = await prisma.menu.findMany({
            where: {
                menuId: { in: Array.from(allowed) },
                isActive: true
            },
            orderBy: { sortOrder: 'asc' }
        })

        return ok({ items: menus })
    } catch (e: any) {
        return bad(500, 'SERVER_ERROR', e.message)
    }
}
