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

        // 1. Fetch Event Types and Locations
        const [eventTypes, locations] = await Promise.all([
            prisma.eventType.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }),
            prisma.location.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } })
        ])

        // 2. Define Columns
        // Requirement: Split EVENT by location, others remain as-is.
        const reportColumns: any[] = []
        eventTypes.forEach(et => {
            if (et.eventCode === 'EVENT') {
                // Split by location
                locations.forEach(loc => {
                    reportColumns.push({
                        id: `${et.eventTypeId}_${loc.locationId}`,
                        name: `${loc.locationNameEn} (${et.eventName})`,
                        eventTypeId: et.eventTypeId,
                        locationId: loc.locationId,
                        eventCode: et.eventCode
                    })
                })
            } else {
                // Keep as single column
                reportColumns.push({
                    id: et.eventTypeId,
                    name: `${et.eventName} (${et.eventCode})`,
                    eventTypeId: et.eventTypeId,
                    locationId: null,
                    eventCode: et.eventCode
                })
            }
        })

        // 3. Fetch Entries with Assignments
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

        // 4. Fetch Holidays for "Remarks"
        const holidays = await prisma.companyHoliday.findMany({
            where: { holidayDate: { gte: start, lt: end } }
        })

        // 5. Build Days Array
        const days = []
        const current = new Date(start)
        while (current < end) {
            const dateStr = current.toISOString().slice(0, 10)
            const dayEntries = entries.filter((e: any) => e.entryDate.toISOString().slice(0, 10) === dateStr)
            const holiday = holidays.find((h: any) => h.holidayDate.toISOString().slice(0, 10) === dateStr)

            const rowData: any = {
                date: dateStr,
                dayOfWeek: current.toLocaleDateString('th-TH', { weekday: 'short' }),
                isHoliday: !!holiday,
                holidayName: holiday?.holidayName || '',
                assignments: {}
            }

            // Init buckets for each column
            reportColumns.forEach(col => {
                rowData.assignments[col.id] = []
            })

            // Fill buckets
            dayEntries.forEach((entry: any) => {
                const names = entry.assignments.map((a: any) => a.employee.nickName || a.employee.firstName)
                if (names.length === 0) return

                // Determine which column(s) this entry belongs to
                if (entry.eventType.eventCode === 'EVENT' && entry.locationId) {
                    const colId = `${entry.eventTypeId}_${entry.locationId}`
                    if (rowData.assignments[colId]) {
                        rowData.assignments[colId].push(...names)
                    }
                } else {
                    // Fallback to eventTypeId (for SHIFT, HOLIDAY, etc.)
                    const colId = entry.eventTypeId
                    if (rowData.assignments[colId]) {
                        rowData.assignments[colId].push(...names)
                    }
                }
            })

            days.push(rowData)
            current.setDate(current.getDate() + 1)
        }

        return ok({
            month,
            columns: reportColumns,
            days
        })

    } catch (e: any) {
        return bad(500, 'SERVER_ERROR', String(e?.message || e))
    }
}
