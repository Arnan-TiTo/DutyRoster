import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      secureCookies: String(process.env.SECURE_COOKIES ?? 'true'),
      tz: process.env.TZ ?? 'UTC',
    },
    { status: 200, headers: { 'Cache-Control': 'no-store' } }
  )
}
