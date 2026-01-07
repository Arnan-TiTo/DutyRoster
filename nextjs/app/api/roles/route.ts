import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { requireApiSession } from '@/lib/auth'
import { ok, bad } from '@/lib/api'

export async function GET(req: NextRequest) {
    try {
        await requireApiSession(req)
        const items = await prisma.role.findMany({
            orderBy: { roleName: 'asc' }
        })
        return ok({ items })
    } catch (e: any) {
        return bad(500, 'SERVER_ERROR', e.message)
    }
}
