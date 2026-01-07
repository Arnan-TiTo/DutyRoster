import { NextRequest } from 'next/server'
import { ok, bad } from '@/lib/api'
import { requireApiSession } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const sess = await requireApiSession(req)
    return ok({ user: sess })
  } catch {
    return bad(401, 'UNAUTHORIZED')
  }
}
