
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const types = await prisma.eventType.findMany({ orderBy: { sortOrder: 'asc' } })
    console.log('Event Types:', types.map(t => `${t.eventCode} (${t.eventName}) - isWork: ${t.isWork}`))
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
