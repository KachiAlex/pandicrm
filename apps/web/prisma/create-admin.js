const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const adminHashed = await bcrypt.hash(process.env.ADMIN_PASSWORD || "PandiCRM2026!Admin", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@pandacrm.com.ng" },
    update: {},
    create: {
      email: "admin@pandacrm.com.ng",
      name: "PandiCRM Admin",
      firstName: "PandiCRM",
      lastName: "Admin",
      role: "admin",
      password: adminHashed,
    },
  });

  console.log("Admin account created/updated:", admin.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
