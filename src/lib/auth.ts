import { cookies, headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify, SignJWT } from 'jose'

export type SessionUser = {
  userId: string
  username: string
  displayName: string
  employeeId: string | null
  roles: string[]
}

const COOKIE_NAME = 'dr_session'

function secretKey() {
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || 'dev-secret-change-me'
  return new TextEncoder().encode(secret)
}

export async function signSession(user: SessionUser): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  const ttlMinutes = Number(process.env.AUTH_TTL_MINUTES || 120)
  const exp = now + ttlMinutes * 60

  return await new SignJWT({
    username: user.username,
    displayName: user.displayName,
    employeeId: user.employeeId,
    roles: user.roles
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(user.userId)
    .setIssuedAt(now)
    .setExpirationTime(exp)
    .sign(secretKey())
}

export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey())
    const userId = payload.sub
    if (!userId) return null

    return {
      userId,
      username: String(payload.username || ''),
      displayName: String(payload.displayName || ''),
      employeeId: payload.employeeId ? String(payload.employeeId) : null,
      roles: Array.isArray(payload.roles) ? payload.roles.map(String) : []
    }
  } catch {
    return null
  }
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null
  return await verifySessionToken(token)
}

export function clearSession(res: NextResponse) {
  const isSecure = process.env.SECURE_COOKIES === 'true' || (process.env.NODE_ENV === 'production' && process.env.SECURE_COOKIES !== 'false')
  res.cookies.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: isSecure,
    sameSite: 'lax',
    path: '/',
    maxAge: 0
  })
}

export function setSession(res: NextResponse, token: string) {
  const isSecure = process.env.SECURE_COOKIES === 'true' || (process.env.NODE_ENV === 'production' && process.env.SECURE_COOKIES !== 'false')
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isSecure,
    sameSite: 'lax',
    path: '/',
    maxAge: Number(process.env.AUTH_TTL_MINUTES || 120) * 60
  })
}

export function isAdmin(user: SessionUser | null) {
  return !!user?.roles?.includes('ADMIN')
}

export function isSupervisor(user: SessionUser | null) {
  return !!user?.roles?.includes('SUPERVISOR')
}

export function isStaff(user: SessionUser | null) {
  return !!user?.roles?.includes('STAFF')
}

export function assertRole(user: SessionUser | null, allowed: string[]) {
  if (!user) throw new Error('UNAUTHORIZED')
  const ok = user.roles.some((r: string) => allowed.includes(r))
  if (!ok) throw new Error('FORBIDDEN')
}

export async function requireApiSession(req: NextRequest): Promise<SessionUser> {
  const token = req.cookies.get(COOKIE_NAME)?.value
  const sess = token ? await verifySessionToken(token) : null
  if (!sess) throw new Error('UNAUTHORIZED')
  return sess
}

export function jsonError(status: number, message: string, details?: unknown) {
  return NextResponse.json(
    { ok: false, message, details },
    { status }
  )
}

export async function requestIp() {
  const h = await headers()
  return h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip') || null
}
