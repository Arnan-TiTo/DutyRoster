import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { requireApiSession } from '@/lib/auth'
import { ok, bad } from '@/lib/api'

// GET /api/menus - List all
export async function GET(req: NextRequest) {
    try {
        await requireApiSession(req)
        const items = await prisma.menu.findMany({
            orderBy: { sortOrder: 'asc' }
        })
        return ok({ items })
    } catch (e: any) {
        return bad(500, 'SERVER_ERROR', e.message)
    }
}

// POST /api/menus - Create
export async function POST(req: NextRequest) {
    try {
        await requireApiSession(req)
        const body = await req.json()
        const { menuCode, menuName, path, sortOrder, isActive } = body

        if (!menuCode || !menuName) return bad(400, 'Missing fields')

        const existing = await prisma.menu.findUnique({ where: { menuCode } })
        if (existing) return bad(400, 'Code exists')

        const item = await prisma.menu.create({
            data: {
                menuCode,
                menuName,
                path: path || null,
                sortOrder: sortOrder || 0,
                isActive: isActive ?? true
            }
        })
        return ok({ item })
    } catch (e: any) {
        return bad(500, 'SERVER_ERROR', e.message)
    }
}
