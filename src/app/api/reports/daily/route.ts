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

        // 2. Define Columns in specific order as requested
        const reportColumns: any[] = []

        // Find SHIFT type first
        const shiftType = eventTypes.find(et => et.eventCode === 'SHIFT')
        if (shiftType) {
            reportColumns.push({
                id: shiftType.eventTypeId,
                name: `Work Shift (${shiftType.eventCode})`,
                eventTypeId: shiftType.eventTypeId,
                locationId: null,
                eventCode: shiftType.eventCode
            })
        }

        // Add EVENT types split by location
        const eventType = eventTypes.find(et => et.eventCode === 'EVENT')
        if (eventType) {
            locations.forEach(loc => {
                reportColumns.push({
                    id: `${eventType.eventTypeId}_${loc.locationId}`,
                    name: `${loc.locationNameEn} (${eventType.eventName})`,
                    eventTypeId: eventType.eventTypeId,
                    locationId: loc.locationId,
                    eventCode: eventType.eventCode
                })
            })
        }

        // Add HOLIDAY or other types
        eventTypes.forEach(et => {
            if (et.eventCode !== 'SHIFT' && et.eventCode !== 'EVENT') {
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

                let colId = entry.eventTypeId

                // Priority: If entry has a location, find a column that is defined for this location
                if (entry.locationId) {
                    const locCol = reportColumns.find(col => col.locationId === entry.locationId)
                    if (locCol) {
                        colId = locCol.id
                    }
                }

                if (rowData.assignments[colId]) {
                    rowData.assignments[colId].push(...names)
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
