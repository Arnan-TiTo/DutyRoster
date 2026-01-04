import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { requireApiSession } from '@/lib/auth'
import { ok, bad } from '@/lib/api'

export async function GET(req: NextRequest) {
    try {
        const sess = await requireApiSession(req)

        // Get Staff User
        const staff = await prisma.employee.findFirst({
            where: {
                users: {
                    some: { username: 'staff' }
                }
            }
        })

        if (!staff) {
            return ok({ message: 'Staff not found' })
        }

        // Get all ledger entries for Staff
        const ledger = await prisma.holidayCreditLedger.findMany({
            where: { employeeId: staff.employeeId },
            include: {
                entry: {
                    include: {
                        eventType: true
                    }
                },
                leaveRequest: {
                    include: {
                        leaveType: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        // Get December 2025 range
        const start = new Date(Date.UTC(2025, 11, 1)) // Dec 1, 2025
        const end = new Date(Date.UTC(2026, 0, 1))    // Jan 1, 2026

        // Filter for December 2025
        const decemberLedger = ledger.filter((l: typeof ledger[0]) => {
            if (l.entry) {
                return l.entry.entryDate >= start && l.entry.entryDate < end
            }
            if (l.leaveRequest) {
                return l.leaveRequest.dateFrom >= start && l.leaveRequest.dateFrom < end
            }
            // Manual adjustments
            return l.createdAt >= start && l.createdAt < end
        })

        const formatted = (decemberLedger as any[]).map((l: any) => ({
            id: l.ledgerId,
            employeeId: l.employeeId,
            minutesDelta: l.minutesDelta,
            reason: l.reason,
            createdAt: l.createdAt.toISOString(),
            entryDate: l.entry?.entryDate?.toISOString(),
            entryTime: l.entry ? `${l.entry.startAt.toISOString()} - ${l.entry.endAt.toISOString()}` : null,
            eventType: l.entry?.eventType?.eventName,
            leaveType: l.leaveRequest?.leaveType?.leaveName
        }))

        const totalMinutes = decemberLedger.reduce((sum: number, l: typeof decemberLedger[0]) => sum + l.minutesDelta, 0)

        return ok({
            staffId: staff.employeeId,
            staffName: `${staff.firstName} ${staff.lastName}`,
            totalLedgerEntries: ledger.length,
            decemberEntries: formatted,
            decemberTotalMinutes: totalMinutes,
            decemberTotalHours: totalMinutes / 60,
            decemberTotalDays: totalMinutes / 480
        })
    } catch (e: any) {
        console.error('Debug error:', e)
        return bad(500, 'SERVER_ERROR', String(e?.message || e))
    }
}
