import { PrismaClient } from "@prisma/client";

async function main() {
  const prisma = new PrismaClient();
  try {
    const requirements = await prisma.requirement.findMany({
      include: {
        owner: { select: { name: true, email: true } },
        category: true,
        offers: {
          include: {
            compatibilityScore: true,
            vendorProfile: true,
          },
        },
      },
    });

    console.log("\n=== REQUIREMENTS ===");
    for (const req of requirements) {
      console.log(`\n[${req.id.slice(0,8)}] "${req.title}"`);
      console.log(`  Status: ${req.status} | Type: ${req.type}`);
      console.log(`  Owner: ${req.owner.name} (${req.owner.email})`);
      console.log(`  Budget: ₹${req.minBudget} - ₹${req.maxBudget}`);
      console.log(`  Offers: ${req.offers.length}`);
      for (const offer of req.offers) {
        console.log(`    - Vendor: ${offer.vendorProfile?.businessName || "Unknown"}`);
        console.log(`      Price: ₹${offer.offeredPrice} | Status: ${offer.status}`);
        console.log(`      Match Score: ${offer.compatibilityScore?.overallScore?.toFixed(1) || "N/A"}%`);
      }
    }

    const users = await prisma.user.findMany({ select: { email: true, name: true, role: true } });
    console.log("\n=== USERS ===");
    for (const u of users) {
      console.log(`  [${u.role}] ${u.name} <${u.email}>`);
    }

    console.log("\nAll passwords: Password123!");
  } finally {
    await prisma.$disconnect();
  }
}

main();
