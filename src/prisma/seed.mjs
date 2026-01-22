import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function timeToUtcDate(hhmm) {
  const m = String(hhmm || '').match(/^(\d{2}):(\d{2})$/)
  if (!m) throw new Error(`Invalid time: ${hhmm}`)
  return new Date(`1970-01-01T${m[1]}:${m[2]}:00.000Z`)
}

async function upsertRole(roleCode, roleName) {
  return prisma.role.upsert({
    where: { roleCode },
    update: { roleName },
    create: { roleCode, roleName }
  })
}

async function upsertUser({ username, displayName, password, employeeId }) {
  const passwordHash = await bcrypt.hash(password, 10)
  return prisma.user.upsert({
    where: { username },
    update: { displayName, passwordHash, employeeId, isActive: true },
    create: { username, displayName, passwordHash, employeeId, isActive: true }
  })
}

async function ensureUserRole(userId, roleId) {
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId, roleId } },
    update: {},
    create: { userId, roleId }
  })
}

async function main() {
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
    update: { firstName: 'Staff', lastName: 'User', nickName: 'Staff', roleTitle: 'Staff', teamId: team.teamId, isActive: true },
    create: { empCode: 'E003', firstName: 'Staff', lastName: 'User', nickName: 'Staff', roleTitle: 'Staff', teamId: team.teamId, isActive: true }
  })

  // Additional Staff members (E004-E010 for total 8 Staff)
  const staffMembers = [
    { code: 'E004', firstName: 'Staff 1', lastName: 'Demo', nickName: 'S1' },
    { code: 'E005', firstName: 'Staff 2', lastName: 'Demo', nickName: 'S2' },
    { code: 'E006', firstName: 'Staff 3', lastName: 'Demo', nickName: 'S3' },
    { code: 'E007', firstName: 'Staff 4', lastName: 'Demo', nickName: 'S4' },
    { code: 'E008', firstName: 'Staff 5', lastName: 'Demo', nickName: 'S5' },
    { code: 'E009', firstName: 'Staff 6', lastName: 'Demo', nickName: 'S6' },
    { code: 'E010', firstName: 'Staff 7', lastName: 'Demo', nickName: 'S7' },
    { code: 'E011', firstName: 'Staff 8', lastName: 'Demo', nickName: 'S8' }
  ]

  for (const s of staffMembers) {
    await prisma.employee.upsert({
      where: { empCode: s.code },
      update: { firstName: s.firstName, lastName: s.lastName, nickName: s.nickName, roleTitle: 'Staff', isActive: true },
      create: { empCode: s.code, firstName: s.firstName, lastName: s.lastName, nickName: s.nickName, roleTitle: 'Staff', isActive: true }
    })
  }

  // Users (login)
  const defaultPwd = process.env.SEED_DEFAULT_PASSWORD || 'Admin9999'

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
    { code: 'MORN', name: 'Morning', start: '09:00', end: '18:00', min: 0, max: 0, sort: 1 },
    { code: 'EVENT1', name: 'Event1', start: '10:00', end: '19:00', min: 0, max: 0, sort: 2 },
    { code: 'EVENT2', name: 'Event2', start: '13:00', end: '22:00', min: 0, max: 0, sort: 3 },
    { code: 'NIGHT', name: 'Night', start: '23:00', end: '09:00', min: 0, max: 0, sort: 4 }
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

  // Locations
  const locations = [
    { code: 'Loc001', th: 'สยาม', en: 'Siam', sort: 1, shifts: 1, staff: 1 },
    { code: 'Loc002', th: 'บางนา', en: 'Bangna', sort: 2, shifts: 1, staff: 1 },
    { code: 'Loc003', th: 'เมืองทอง', en: 'Muang Thong', sort: 3, shifts: 1, staff: 1 },
    { code: 'SHOWROOM', th: 'โชว์รูม/ออฟฟิศ', en: 'Showroom/Office', sort: 99, shifts: 1, staff: 5 }
  ]
  for (const loc of locations) {
    await prisma.location.upsert({
      where: { locationCode: loc.code },
      update: {
        locationNameTh: loc.th,
        locationNameEn: loc.en,
        sortOrder: loc.sort,
        shiftsPerDay: loc.shifts,
        staffPerShift: loc.staff,
        isActive: true
      },
      create: {
        locationCode: loc.code,
        locationNameTh: loc.th,
        locationNameEn: loc.en,
        sortOrder: loc.sort,
        shiftsPerDay: loc.shifts,
        staffPerShift: loc.staff,
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

  console.log('Seed completed.')
  console.log('Login users:')
  console.log(`- admin / ${defaultPwd}`)
  console.log(`- supervisor / ${defaultPwd}`)
  console.log(`- staff / ${defaultPwd}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
