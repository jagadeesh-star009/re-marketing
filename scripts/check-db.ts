import { PrismaClient } from "@prisma/client";

async function main() {
  const prisma = new PrismaClient();
  try {
    const [users, requirements, offers, vendors, categories] = await Promise.all([
      prisma.user.count(),
      prisma.requirement.count(),
      prisma.offer.count(),
      prisma.vendorProfile.count(),
      prisma.category.count(),
    ]);
    console.log("DB Record Counts:");
    console.log("  Users:", users);
    console.log("  Requirements:", requirements);
    console.log("  Offers:", offers);
    console.log("  VendorProfiles:", vendors);
    console.log("  Categories:", categories);
  } finally {
    await prisma.$disconnect();
  }
}

main();
