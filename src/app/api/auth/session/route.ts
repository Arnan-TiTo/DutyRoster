import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

export async function GET() {
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json({ ok: true, session: null }, { status: 200 })
        }
        return NextResponse.json({ ok: true, session })
    } catch (error) {
        return NextResponse.json({ ok: false, error: 'Internal error' }, { status: 500 })
    }
}
