require("dotenv").config();

const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const requiredConfirmation = "I_UNDERSTAND_THIS_SEEDS_ONLY_LOCAL_DEV";

if (process.env.ALLOW_LOCAL_DEV_SEED !== requiredConfirmation) {
  console.error("Refusing to update test user passwords.");
  console.error("DO NOT run seed scripts against shared, staging, or production databases.");
  console.error(`Set ALLOW_LOCAL_DEV_SEED=${requiredConfirmation} only for a disposable/local development database.`);
  process.exit(1);
}

if (!process.env.DATABASE_URL || process.env.DATABASE_URL.trim() === "") {
  console.error("DATABASE_URL is required for updating passwords.");
  process.exit(1);
}

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const testPassword = process.env.TEST_PASSWORD || "LocalSupervisor!2026";
  console.log(`Hashing test password for test accounts...`);
  const passwordHash = await bcrypt.hash(testPassword, 10);

  const targetEmployeeIds = ["SUP001", "HOD001", "EL001", "EH001", "EL002"];

  for (const empId of targetEmployeeIds) {
    const user = await prisma.user.findUnique({
      where: { employeeId: empId },
    });

    if (user) {
      await prisma.user.update({
        where: { employeeId: empId },
        data: { passwordHash, isActive: true },
      });
      console.log(`Updated password for ${user.username} (${empId})`);
    } else {
      console.log(`User with employeeId ${empId} not found, skipping.`);
    }
  }

  console.log(`Successfully updated password hashes to match TEST_PASSWORD.`);
}

main()
  .catch((error) => {
    console.error("Password seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
