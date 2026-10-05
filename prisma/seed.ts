import { seedMarketplaceData } from "../src/lib/seed-data";
import { prisma } from "../src/lib/prisma";

async function main() {
  await seedMarketplaceData();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
