import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const COOKIE_NAME = 'dr_session'

function secretKey() {
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || 'dev-secret-change-me'
  return new TextEncoder().encode(secret)
}

async function hasSession(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get(COOKIE_NAME)?.value
  if (!token) return false
  try {
    await jwtVerify(token, secretKey())
    return true
  } catch {
    return false
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // public
  if (
    pathname === '/login' ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/public')
  ) {
    return NextResponse.next()
  }

  // Allow all auth API endpoints (login, logout, session check, etc.)
  if (pathname.startsWith('/api/auth/')) return NextResponse.next()

  const needAuth = pathname.startsWith('/app') || pathname.startsWith('/api')
  if (!needAuth) return NextResponse.next()

  const ok = await hasSession(req)
  if (ok) return NextResponse.next()

  if (pathname.startsWith('/api')) {
    return NextResponse.json({ ok: false, message: 'UNAUTHORIZED' }, { status: 401 })
  }

  const url = req.nextUrl.clone()
  url.pathname = '/login'
  return NextResponse.redirect(url)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
}
