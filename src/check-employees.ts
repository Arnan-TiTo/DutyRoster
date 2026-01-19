import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const employees = await prisma.employee.findMany();
    console.log(JSON.stringify(employees.map(e => ({
        name: e.firstName + ' ' + e.lastName,
        isActive: e.isActive
    })), null, 2));
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
