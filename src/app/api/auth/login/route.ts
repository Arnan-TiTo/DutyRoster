import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { readJson, bad, ok } from '@/lib/api'
import { signSession, setSession } from '@/lib/auth'
import { getUserRoleCodes } from '@/lib/rbac'

export async function POST(req: NextRequest) {
  const body = await readJson<{ username?: string; password?: string }>(req)
  const username = String(body.username || '').trim()
  const password = String(body.password || '')
  if (!username || !password) return bad(400, 'username/password required')

  const user = await prisma.user.findFirst({
    where: { username, isActive: true }
  })
  if (!user) {
    console.log('Login failed: user not found', username)
    return bad(401, 'Invalid credentials')
  }

  const okPwd = await bcrypt.compare(password, user.passwordHash)
  if (!okPwd) {
    console.log('Login failed: password mismatch for', username)
    return bad(401, 'Invalid credentials')
  }

  const roles = await getUserRoleCodes(user.userId)
  const token = await signSession({
    userId: user.userId,
    username: user.username,
    displayName: user.displayName,
    employeeId: user.employeeId,
    roles
  })

  const res = NextResponse.json({ ok: true, user: { username: user.username, displayName: user.displayName, roles } })
  setSession(res, token)
  return res
}
