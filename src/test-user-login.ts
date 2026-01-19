import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function check() {
    const username = 'admin';
    const password = 'admin9999';

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
        console.log('User not found');
        return;
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    console.log(`Checking user '${username}' with password '${password}':`);
    console.log(`Hash in DB: ${user.passwordHash}`);
    console.log(`Match result: ${match}`);
}

check()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
