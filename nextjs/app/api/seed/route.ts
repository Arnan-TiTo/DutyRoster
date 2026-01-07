import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'

function timeToUtcDate(hhmm: string) {
    const m = String(hhmm || '').match(/^(\d{2}):(\d{2})$/)
    if (!m) throw new Error(`Invalid time: ${hhmm}`)
    return new Date(`1970-01-01T${m[1]}:${m[2]}:00.000Z`)
}

async function upsertRole(roleCode: string, roleName: string) {
    return prisma.role.upsert({
        where: { roleCode },
        update: { roleName },
        create: { roleCode, roleName }
    })
}

async function upsertUser({ username, displayName, password, employeeId }: any) {
    const passwordHash = await bcrypt.hash(password, 10)
    return prisma.user.upsert({
        where: { username },
        update: { displayName, passwordHash, employeeId, isActive: true },
        create: { username, displayName, passwordHash, employeeId, isActive: true }
    })
}

async function ensureUserRole(userId: string, roleId: string) {
    await prisma.userRole.upsert({
        where: { userId_roleId: { userId, roleId } },
        update: {},
        create: { userId, roleId }
    })
}

export async function GET() {
    try {
        console.log('Starting seed...')
        // Roles
        const adminRole = await upsertRole('ADMIN', 'Administrator')
        const supRole = await upsertRole('SUPERVISOR', 'Supervisor / Planner')
        const staffRole = await upsertRole('STAFF', 'Staff')

        // Team
        const team = await prisma.team.upsert({
            where: { teamCode: 'OPS' },
            update: { teamName: 'Operations' },
            create: { teamCode: 'OPS', teamName: 'Operations' }
        })

        // Employees
        const empAdmin = await prisma.employee.upsert({
            where: { empCode: 'E001' },
            update: { firstName: 'Admin', lastName: 'User', nickName: 'Admin', teamId: team.teamId, isActive: true },
            create: { empCode: 'E001', firstName: 'Admin', lastName: 'User', nickName: 'Admin', teamId: team.teamId, isActive: true }
        })

        const empSup = await prisma.employee.upsert({
            where: { empCode: 'E002' },
            update: { firstName: 'Supervisor', lastName: 'User', nickName: 'Sup', teamId: team.teamId, isActive: true },
            create: { empCode: 'E002', firstName: 'Supervisor', lastName: 'User', nickName: 'Sup', teamId: team.teamId, isActive: true }
        })

        const empStaff = await prisma.employee.upsert({
            where: { empCode: 'E003' },
            update: { firstName: 'Staff', lastName: 'User', nickName: 'Staff', teamId: team.teamId, isActive: true },
            create: { empCode: 'E003', firstName: 'Staff', lastName: 'User', nickName: 'Staff', teamId: team.teamId, isActive: true }
        })

        // Users (login)
        const defaultPwd = process.env.SEED_DEFAULT_PASSWORD || 'Admin@9999'

        const admin = await upsertUser({
            username: 'admin',
            displayName: 'Admin',
            password: defaultPwd,
            employeeId: empAdmin.employeeId
        })

        const supervisor = await upsertUser({
            username: 'supervisor',
            displayName: 'Supervisor',
            password: defaultPwd,
            employeeId: empSup.employeeId
        })

        const staff = await upsertUser({
            username: 'staff',
            displayName: 'Staff',
            password: defaultPwd,
            employeeId: empStaff.employeeId
        })

        await ensureUserRole(admin.userId, adminRole.roleId)
        await ensureUserRole(supervisor.userId, supRole.roleId)
        await ensureUserRole(staff.userId, staffRole.roleId)

        // Leave Types
        await prisma.leaveType.upsert({
            where: { leaveCode: 'VAC' },
            update: { leaveName: 'Vacation', isActive: true },
            create: { leaveCode: 'VAC', leaveName: 'Vacation', isActive: true }
        })
        await prisma.leaveType.upsert({
            where: { leaveCode: 'SICK' },
            update: { leaveName: 'Sick Leave', isActive: true },
            create: { leaveCode: 'SICK', leaveName: 'Sick Leave', isActive: true }
        })
        await prisma.leaveType.upsert({
            where: { leaveCode: 'HOLIDAY_CREDIT' },
            update: { leaveName: 'Holiday Credit', isActive: true },
            create: { leaveCode: 'HOLIDAY_CREDIT', leaveName: 'Holiday Credit', isActive: true }
        })

        // Event Types
        await prisma.eventType.upsert({
            where: { eventCode: 'SHIFT' },
            update: { eventName: 'Work Shift', colorHex: '#146C9C', isWork: true, isHoliday: false, isActive: true, sortOrder: 1 },
            create: { eventCode: 'SHIFT', eventName: 'Work Shift', colorHex: '#146C9C', isWork: true, isHoliday: false, defaultDurationMinutes: 0, isActive: true, sortOrder: 1 }
        })
        await prisma.eventType.upsert({
            where: { eventCode: 'EVENT' },
            update: { eventName: 'Event', colorHex: '#0E5A8B', isWork: true, isHoliday: false, isActive: true, sortOrder: 2 },
            create: { eventCode: 'EVENT', eventName: 'Event', colorHex: '#0E5A8B', isWork: true, isHoliday: false, defaultDurationMinutes: 0, isActive: true, sortOrder: 2 }
        })
        await prisma.eventType.upsert({
            where: { eventCode: 'HOLIDAY' },
            update: { eventName: 'Holiday / Off', colorHex: '#CBA85E', isWork: false, isHoliday: true, isActive: true, sortOrder: 99 },
            create: { eventCode: 'HOLIDAY', eventName: 'Holiday / Off', colorHex: '#CBA85E', isWork: false, isHoliday: true, defaultDurationMinutes: 0, isActive: true, sortOrder: 99 }
        })

        // Shift Slots
        const slots = [
            { code: 'MORN', name: 'Morning', start: '09:00', end: '17:00', min: 0, max: 0, sort: 1 },
            { code: 'EVE', name: 'Evening', start: '17:00', end: '23:00', min: 0, max: 0, sort: 2 },
            { code: 'NIGHT', name: 'Night', start: '23:00', end: '09:00', min: 0, max: 0, sort: 3 }
        ]
        for (const s of slots) {
            await prisma.shiftSlot.upsert({
                where: { slotCode: s.code },
                update: {
                    slotName: s.name,
                    startTime: timeToUtcDate(s.start),
                    endTime: timeToUtcDate(s.end),
                    minStaff: s.min,
                    maxStaff: s.max,
                    sortOrder: s.sort,
                    isActive: true
                },
                create: {
                    slotCode: s.code,
                    slotName: s.name,
                    startTime: timeToUtcDate(s.start),
                    endTime: timeToUtcDate(s.end),
                    minStaff: s.min,
                    maxStaff: s.max,
                    sortOrder: s.sort,
                    isActive: true
                }
            })
        }

        // Company Holiday sample (Jan 1st of current year)
        const y = new Date().getFullYear()
        await prisma.companyHoliday.upsert({
            where: { holidayDate_holidayName: { holidayDate: new Date(`${y}-01-01T00:00:00.000Z`), holidayName: 'New Year Day' } },
            update: { holidayType: 'ORG', isActive: true },
            create: { holidayDate: new Date(`${y}-01-01T00:00:00.000Z`), holidayName: 'New Year Day', holidayType: 'ORG', isActive: true }
        })

        // Settings
        await prisma.setting.upsert({
            where: { settingKey: 'policy.blockLeaveConflict' },
            update: { settingValue: 'true' },
            create: { settingKey: 'policy.blockLeaveConflict', settingValue: 'true' }
        })

        return NextResponse.json({ success: true, message: 'Seeded successfully' })
    } catch (error: any) {
        console.error('Seed error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
