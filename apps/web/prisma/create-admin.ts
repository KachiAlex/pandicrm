import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminHashed = await bcrypt.hash("Pandacrm2026!Admin", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@pandacrm.com.ng" },
    update: { role: "admin", isActive: true },
    create: {
      email: "admin@pandacrm.com.ng",
      name: "Pandacrm Admin",
      firstName: "Pandacrm",
      lastName: "Admin",
      role: "admin",
      isActive: true,
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
