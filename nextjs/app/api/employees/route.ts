import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { Prisma } from '@prisma/client'
import { requireApiSession } from '@/lib/auth'
import { readJson, ok, bad, asBool } from '@/lib/api'

export async function GET(req: NextRequest) {
  try {
    const sess = await requireApiSession(req)
    const canView = sess.roles.includes('ADMIN') || sess.roles.includes('SUPERVISOR')
    if (!canView) return bad(403, 'FORBIDDEN')

    const url = new URL(req.url)
    const onlyActive = asBool(url.searchParams.get('active'), false)
    const simple = asBool(url.searchParams.get('simple'), false)

    const items = await prisma.employee.findMany({
      where: onlyActive ? { isActive: true } : undefined,
      orderBy: [{ isActive: 'desc' }, { firstName: 'asc' }, { lastName: 'asc' }]
    })

    if (simple) {
      return ok({
        items: items.map((e: typeof items[0]) => ({
          employeeId: e.employeeId,
          empCode: e.empCode,
          firstName: e.firstName,
          lastName: e.lastName,
          nickName: e.nickName,
          isActive: e.isActive
        }))
      })
    }
    return ok({ items })
  } catch (e: any) {
    return bad(500, 'SERVER_ERROR', String(e?.message || e))
  }
}

// (imports check: make sure bcrypt is imported) 
// You need to add 'import bcrypt from 'bcryptjs'' to the top of the file if not there!
// I'll assume I need to add that import as well? 
// The tool can't update imports and body separately in one tool call if they are far apart. 
// I'll update the whole file to be safe and clean.

export async function POST(req: NextRequest) {
  try {
    const sess = await requireApiSession(req)
    if (!sess.roles.includes('ADMIN')) return bad(403, 'FORBIDDEN')

    const body = await readJson<any>(req)
    const firstName = String(body.firstName || '').trim()
    const lastName = String(body.lastName || '').trim()
    if (!firstName || !lastName) return bad(400, 'firstName/lastName required')

    const empCode = body.empCode ? String(body.empCode).trim() : null
    const nickName = body.nickName ? String(body.nickName).trim() : null
    const phone = body.phone ? String(body.phone).trim() : null
    const email = body.email ? String(body.email).trim() : null
    const roleTitle = body.roleTitle ? String(body.roleTitle).trim() : null
    const teamId = body.teamId ? String(body.teamId) : null

    // User Creation Params
    const uUsername = body.uUsername ? String(body.uUsername).trim() : null
    const uPassword = body.uPassword ? String(body.uPassword) : null
    const uRoleId = body.uRoleId ? String(body.uRoleId) : null

    if (uUsername && !uPassword) return bad(400, 'Password required for user')

    // Check duplicate username first
    if (uUsername) {
      const dup = await prisma.user.findUnique({ where: { username: uUsername } })
      if (dup) return bad(400, `Username '${uUsername}' already exists`)
    }

    const item = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. Create Employee
      const emp = await tx.employee.create({
        data: {
          empCode,
          firstName,
          lastName,
          nickName,
          phone,
          email,
          roleTitle,
          teamId,
          isActive: true
        }
      })

      // 2. Create User if requested
      if (uUsername && uPassword) {
        // we need bcrypt. import it dynamically if top-level is hard
        const bcrypt = (await import('bcryptjs')).default
        const hash = await bcrypt.hash(uPassword, 10)

        const user = await tx.user.create({
          data: {
            username: uUsername,
            displayName: nickName || firstName,
            passwordHash: hash,
            employeeId: emp.employeeId,
            isActive: true
          }
        })

        if (uRoleId) {
          await tx.userRole.create({
            data: {
              userId: user.userId,
              roleId: uRoleId
            }
          })
        }
      }
      return emp
    })

    return ok({ item })
  } catch (e: any) {
    console.error('Create Employee Error:', e)
    return bad(500, 'SERVER_ERROR', String(e?.message || e))
  }
}
