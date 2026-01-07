import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { requireApiSession } from '@/lib/auth'
import { ok, bad } from '@/lib/api'

// GET /api/leave-types
export async function GET(req: NextRequest) {
  try {
    await requireApiSession(req)
    const items = await prisma.leaveType.findMany({
      orderBy: { leaveName: 'asc' }
    })
    return ok({ items })
  } catch (e: any) {
    return bad(500, 'SERVER_ERROR', e.message)
  }
}

// POST /api/leave-types
export async function POST(req: NextRequest) {
  try {
    await requireApiSession(req)
    const body = await req.json()
    const { leaveCode, leaveName, isActive } = body

    if (!leaveCode || !leaveName) return bad(400, 'Missing required fields')

    const existing = await prisma.leaveType.findUnique({ where: { leaveCode } })
    if (existing) return bad(400, 'Code exists')

    const item = await prisma.leaveType.create({
      data: {
        leaveCode,
        leaveName,
        isActive: isActive ?? true
      }
    })
    return ok({ item })
  } catch (e: any) {
    return bad(500, 'SERVER_ERROR', e.message)
  }
}
