import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { requireApiSession } from '@/lib/auth'
import { ok, bad } from '@/lib/api'

function monthRange(month: string) {
  const m = String(month || '').match(/^\d{4}-\d{2}$/)
  if (!m) return null
  const [yS, mS] = month.split('-')
  const y = Number(yS)
  const mm = Number(mS)
  if (!Number.isFinite(y) || !Number.isFinite(mm) || mm < 1 || mm > 12) return null
  const start = new Date(Date.UTC(y, mm - 1, 1))
  const end = new Date(Date.UTC(y, mm, 1))
  return { start, end }
}

export async function GET(req: NextRequest) {
  try {
    const sess = await requireApiSession(req)
    const url = new URL(req.url)
    const month = String(url.searchParams.get('month') || '')
    const r = monthRange(month)
    if (!r) return bad(400, 'month must be YYYY-MM')

    const isAdmin = sess.roles.includes('ADMIN') || sess.roles.includes('SUPERVISOR')

    let entries: any[] = []
    if (isAdmin) {
      entries = await prisma.rosterEntry.findMany({
        where: { entryDate: { gte: r.start, lt: r.end } },
        include: {
          eventType: true,
          shiftSlot: true,
          assignments: { include: { employee: true } }
        },
        orderBy: [{ startAt: 'asc' }]
      })
    } else {
      if (!sess.employeeId) return bad(400, 'NO_EMPLOYEE_LINKED')
      const assigns = await prisma.rosterAssignment.findMany({
        where: {
          employeeId: sess.employeeId,
          entry: { entryDate: { gte: r.start, lt: r.end } }
        },
        include: {
          entry: {
            include: {
              eventType: true,
              shiftSlot: true,
              assignments: { include: { employee: true } }
            }
          }
        }
      })
      entries = assigns.map((a) => a.entry)
    }

    const items = entries.map((e) => {
      const staffNames = (e.assignments || []).map((a: any) => {
        const emp = a.employee
        return emp.nickName ? emp.nickName : `${emp.firstName}`
      })

      const slot = e.shiftSlot ? ` • ${e.shiftSlot.slotName}` : ''
      const staff = staffNames.length ? ` (${staffNames.length})` : ''
      const title = `${e.eventType.eventName}${slot}${staff}`

      return {
        id: e.entryId,
        title,
        start: e.startAt.toISOString(),
        end: e.endAt.toISOString(),
        color: e.eventType.colorHex || '#146C9C',
        extendedProps: {
          eventTypeId: e.eventTypeId,
          shiftSlotId: e.shiftSlotId,
          note: e.note,
          staff: staffNames
        }
      }
    })

    return ok({ items })
  } catch (e: any) {
    return bad(500, 'SERVER_ERROR', String(e?.message || e))
  }
}
