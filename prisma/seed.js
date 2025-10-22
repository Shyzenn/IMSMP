/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const db = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("jelmar123", 10);

  await db.user.create({
    data: {
      email: "manager@gmail.com",
      username: "manager",
      password: hashedPassword,
      role: "Manager",
      status: "ACTIVE",
      mustChangePassword: false,
    },
  });

  console.log("✅ Manager created successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
