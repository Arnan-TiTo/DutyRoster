import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { requireApiSession } from '@/lib/auth'
import { ok, bad } from '@/lib/api'
import bcrypt from 'bcryptjs'

// GET /api/users
export async function GET(req: NextRequest) {
    try {
        await requireApiSession(req)
        // Include roles and employee info
        const items = await prisma.user.findMany({
            include: {
                roles: { include: { role: true } },
                employee: true
            },
            orderBy: { username: 'asc' }
        })
        // Flatten roles for UI convenience if needed, but keeping relational is fine
        return ok({ items })
    } catch (e: any) {
        return bad(500, 'SERVER_ERROR', e.message)
    }
}

// POST /api/users
export async function POST(req: NextRequest) {
    try {
        await requireApiSession(req)
        const body = await req.json()
        const { username, password, displayName, employeeId, roleIds } = body

        if (!username || !password || !displayName) return bad(400, 'Missing required fields')

        const existing = await prisma.user.findUnique({ where: { username } })
        if (existing) return bad(400, 'Username exists')

        const passwordHash = await bcrypt.hash(password, 10)

        const user = await prisma.user.create({
            data: {
                username,
                passwordHash,
                displayName,
                employeeId: employeeId || null,
                roles: {
                    create: (roleIds || []).map((rid: string) => ({ roleId: rid }))
                }
            }
        })

        return ok({ user, message: 'Created' })
    } catch (e: any) {
        return bad(500, 'SERVER_ERROR', e.message)
    }
}
