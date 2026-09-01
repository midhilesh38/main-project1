require("dotenv").config();

const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const requiredConfirmation = "I_UNDERSTAND_THIS_SEEDS_ONLY_LOCAL_DEV";

if (process.env.ALLOW_LOCAL_DEV_SEED !== requiredConfirmation) {
  console.error("Refusing to seed database.");
  console.error("DO NOT run seed scripts against shared, staging, or production databases.");
  console.error(`Set ALLOW_LOCAL_DEV_SEED=${requiredConfirmation} only for a disposable/local development database.`);
  process.exit(1);
}

if (!process.env.DATABASE_URL || process.env.DATABASE_URL.trim() === "") {
  console.error("DATABASE_URL is required for local development seeding.");
  process.exit(1);
}

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const commonTestPassword = process.env.TEST_PASSWORD || "LocalSupervisor!2026";

  const users = [
    {
      employeeId: "SUP001",
      username: "supervisor1",
      password: process.env.SEED_SUPERVISOR_PASSWORD || commonTestPassword,
      fullName: "Test Supervisor",
      email: "supervisor1@test.com",
      role: "SUPERVISOR",
    },
    {
      employeeId: "HOD001",
      username: "hod1",
      password: process.env.SEED_HOD_PASSWORD || commonTestPassword,
      fullName: "Test HOD",
      email: "hod1@test.com",
      role: "HOD",
    },
    {
      employeeId: "EH001",
      username: "electricianhead1",
      password: process.env.SEED_ELECTRICIAN_HEAD_PASSWORD || commonTestPassword,
      fullName: "Test Electrician Head",
      email: "electricianhead1@test.com",
      role: "ELECTRICIAN_HEAD",
    },
    {
      employeeId: "EL001",
      username: "electrician1",
      password: process.env.SEED_ELECTRICIAN_1_PASSWORD || commonTestPassword,
      fullName: "Test Electrician 1",
      email: "electrician1@test.com",
      role: "ELECTRICIAN",
    },
    {
      employeeId: "EL002",
      username: "electrician2",
      password: process.env.SEED_ELECTRICIAN_2_PASSWORD || commonTestPassword,
      fullName: "Test Electrician 2",
      email: "electrician2@test.com",
      role: "ELECTRICIAN",
    },
  ];

  for (const user of users) {
    const passwordHash = await bcrypt.hash(user.password, 10);

    await prisma.user.upsert({
      where: { employeeId: user.employeeId },
      update: {
        username: user.username,
        passwordHash,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        isActive: true,
      },
      create: {
        employeeId: user.employeeId,
        username: user.username,
        passwordHash,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  }

  console.log("Seed completed successfully.");
  console.log("Created/updated 5 test users.");
  console.log(`All test users set with password from TEST_PASSWORD (default: "${commonTestPassword}").`);
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
