import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { requireApiSession } from '@/lib/auth'
import { ok, bad } from '@/lib/api'

// PUT /api/teams/:id - Update team
export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        await requireApiSession(req)
        const { id } = params
        const body = await req.json()
        const { teamCode, teamName } = body

        if (!teamCode || !teamName) return bad(400, 'Missing required fields')

        // Check existence
        const existing = await prisma.team.findUnique({ where: { teamId: id } })
        if (!existing) return bad(404, 'Not found')

        // Check duplicate code (if changed)
        if (existing.teamCode !== teamCode) {
            const dup = await prisma.team.findUnique({ where: { teamCode } })
            if (dup) return bad(400, 'Team code already exists')
        }

        const item = await prisma.team.update({
            where: { teamId: id },
            data: { teamCode, teamName }
        })
        return ok({ item, message: 'Updated successfully' })
    } catch (e: any) {
        return bad(500, 'SERVER_ERROR', e.message)
    }
}

// DELETE /api/teams/:id - Delete team
export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        await requireApiSession(req)
        const { id } = params

        // Check reserved or usage?
        // Foreign keys will block if used in valid relationships usually, 
        // unless cascading. users.team_id is SET NULL check schema?
        // schema says: team_id uuid NULL REFERENCES duty.teams(team_id) (Default delete restrict? No, unspecified usually RESTRICT in postgres unless CASCADE)

        try {
            await prisma.team.delete({ where: { teamId: id } })
        } catch (err: any) {
            if (err.code === 'P2003') { // Foreign key constraint
                return bad(400, 'Cannot delete: Team is in use by employees or users')
            }
            throw err
        }

        return ok({ message: 'Deleted successfully' })
    } catch (e: any) {
        return bad(500, 'SERVER_ERROR', e.message)
    }
}
