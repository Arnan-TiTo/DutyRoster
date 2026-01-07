import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { requireApiSession } from '@/lib/auth'
import { ok, bad } from '@/lib/api'

// GET /api/teams - List all teams
export async function GET(req: NextRequest) {
    try {
        await requireApiSession(req)
        const items = await prisma.team.findMany({
            orderBy: { teamName: 'asc' }
        })
        return ok({ items })
    } catch (e: any) {
        return bad(500, 'SERVER_ERROR', e.message)
    }
}

// POST /api/teams - Create new team
export async function POST(req: NextRequest) {
    try {
        await requireApiSession(req)
        const body = await req.json()
        const { teamCode, teamName } = body

        if (!teamCode || !teamName) return bad(400, 'Missing required fields')

        // Check duplicate
        const existing = await prisma.team.findUnique({ where: { teamCode } })
        if (existing) return bad(400, 'Team code already exists')

        const item = await prisma.team.create({
            data: {
                teamCode,
                teamName
            }
        })
        return ok({ item, message: 'Created successfully' })
    } catch (e: any) {
        return bad(500, 'SERVER_ERROR', e.message)
    }
}
