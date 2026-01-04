import { prisma } from '@/lib/db'

export async function getUserRoleCodes(userId: string): Promise<string[]> {
  const rows = await prisma.userRole.findMany({
    where: { userId },
    include: { role: true }
  })
  return rows.map((r: typeof rows[0]) => r.role.roleCode)
}

export function hasAnyRole(roleCodes: string[], allowed: string[]) {
  return roleCodes.some((r: string) => allowed.includes(r))
}
