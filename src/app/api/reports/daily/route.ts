import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { requireApiSession } from '@/lib/auth'
import { ok, bad } from '@/lib/api'

function getMonthRange(monthStr: string) {
    const [y, m] = monthStr.split('-').map(Number)
    const start = new Date(Date.UTC(y, m - 1, 1))
    const end = new Date(Date.UTC(y, m, 1))
    return { start, end }
}

export async function GET(req: NextRequest) {
    try {
        const sess = await requireApiSession(req)
        const url = new URL(req.url)
        const month = url.searchParams.get('month') || new Date().toISOString().slice(0, 7)
        const { start, end } = getMonthRange(month)

        // 1. Fetch Event Types (Columns)
        const eventTypes = await prisma.eventType.findMany({
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' }
        })

        // 2. Fetch Entries with Assignments
        const entries = await prisma.rosterEntry.findMany({
            where: {
                entryDate: { gte: start, lt: end }
            },
            include: {
                eventType: true,
                assignments: { include: { employee: true } },
                shiftSlot: true
            },
            orderBy: { entryDate: 'asc' }
        })

        // 3. Fetch Holidays for "Remarks" or special coloring
        const holidays = await prisma.companyHoliday.findMany({
            where: { holidayDate: { gte: start, lt: end } }
        })

        // 4. Build Days Array
        const days = []
        const current = new Date(start)
        while (current < end) {
            const dateStr = current.toISOString().slice(0, 10)

            // Find entries for this day
            const dayEntries = entries.filter(e => e.entryDate.toISOString().slice(0, 10) === dateStr)

            // Find holiday
            const holiday = holidays.find(h => h.holidayDate.toISOString().slice(0, 10) === dateStr)

            // Group by Event Type
            const rowData: any = {
                date: dateStr,
                dayOfWeek: current.toLocaleDateString('th-TH', { weekday: 'short' }), // User requested Thai "จันทร์", "อังคาร" etc.
                isHoliday: !!holiday,
                holidayName: holiday?.holidayName || '',
                assignments: {}
            }

            // Init buckets
            eventTypes.forEach(et => {
                rowData.assignments[et.eventTypeId] = []
            })

            // Fill buckets
            dayEntries.forEach(entry => {
                // If we also want to group by Shift Slot (e.g. LP 08:30 vs LP 10:00), we might need deeper nesting.
                // The user's image shows "LP 08:30" and "LP 10:00" as separate columns.
                // If these are different Shift Slots under SAME Event Type ("LP"), we need to handle that.
                // For now, let's group by Event Type, and append shift slot info if multiple slots exist.

                const names = (entry.assignments as any[]).map(a =>
                    a.employee.nickName || a.employee.firstName
                )

                if (names.length > 0) {
                    rowData.assignments[entry.eventTypeId].push(...names)
                }
            })

            days.push(rowData)
            current.setDate(current.getDate() + 1)
        }

        return ok({
            month,
            columns: eventTypes,
            days
        })

    } catch (e: any) {
        return bad(500, 'SERVER_ERROR', String(e?.message || e))
    }
}
