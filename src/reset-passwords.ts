import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const password = 'admin9999';
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log(`Resetting all user passwords to '${password}'...`);

    // Update all users
    const result = await prisma.user.updateMany({
        data: {
            passwordHash: hashedPassword,
        },
    });

    console.log(`Success! Updated ${result.count} users.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
