import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { requireApiSession } from '@/lib/auth'
import { ok, bad } from '@/lib/api'

export async function POST(req: NextRequest) {
    try {
        const sess = await requireApiSession(req)
        if (!sess.roles.includes('ADMIN')) {
            return bad(403, 'FORBIDDEN')
        }

        // Get all roster entries
        const entries = await prisma.rosterEntry.findMany({
            include: {
                assignments: true
            }
        })

        let processed = 0
        let credited = 0

        for (const entry of entries) {
            // Check if entry date is a company holiday
            const holiday = await prisma.companyHoliday.findFirst({
                where: {
                    holidayDate: entry.entryDate,
                    isActive: true
                }
            })

            // Delete existing credits for this entry
            await prisma.holidayCreditLedger.deleteMany({
                where: { entryId: entry.entryId }
            })

            if (holiday && entry.assignments.length > 0) {
                // Holiday credit is 1 day (480 minutes = 8 hours) per work day on company holiday
                const minutesPerDay = 480

                await prisma.holidayCreditLedger.createMany({
                    data: entry.assignments.map((a: any) => ({
                        employeeId: a.employeeId,
                        entryId: entry.entryId,
                        minutesDelta: minutesPerDay,
                        reason: `Work on holiday (${holiday.holidayName})`
                    }))
                })
                credited += entry.assignments.length
            }

            processed++
        }

        return ok({
            message: 'Holiday credit recalculated successfully',
            entriesProcessed: processed,
            creditsCreated: credited
        })
    } catch (e: any) {
        console.error('Recalculate error:', e)
        return bad(500, 'SERVER_ERROR', String(e?.message || e))
    }
}
