import { NextRequest, NextResponse } from 'next/server'

export async function readJson<T = any>(req: NextRequest): Promise<T> {
  try {
    const txt = await req.text()
    if (!txt) return {} as any
    return JSON.parse(txt)
  } catch {
    return {} as any
  }
}

export function ok(data: any = {}) {
  return NextResponse.json({ ok: true, ...data })
}

export function bad(status: number, message: string, details?: any) {
  return NextResponse.json({ ok: false, message, details }, { status })
}

export function asBool(v: any, def = false) {
  if (v === undefined || v === null || v === '') return def
  if (typeof v === 'boolean') return v
  const s = String(v).toLowerCase()
  return s === '1' || s === 'true' || s === 'yes' || s === 'y'
}

export function asInt(v: any, def = 0) {
  const n = Number(v)
  return Number.isFinite(n) ? Math.trunc(n) : def
}

export function yyyyMmFromDate(d: Date) {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
}

export function dateOnlyFromIsoLike(s: string) {
  // Accepts: YYYY-MM-DD, or ISO date time.
  const m = String(s || '').match(/^(\d{4}-\d{2}-\d{2})/)
  if (!m) return null
  return m[1]
}

export function parseTimeToUtcDate(timeHHMM: string) {
  // returns Date where toISOString().slice(11,16) equals input.
  const m = String(timeHHMM || '').match(/^(\d{2}):(\d{2})$/)
  if (!m) return null
  return new Date(`1970-01-01T${m[1]}:${m[2]}:00.000Z`)
}

export function timeToHHMM(d: Date | null | undefined) {
  if (!d) return ''
  return d.toISOString().slice(11, 16)
}
