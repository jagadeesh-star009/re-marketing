import { MatchingEngine, DEFAULT_WEIGHTS } from "../src/lib/matching-engine";
import { RequirementSchema, OfferSchema, RegisterSchema } from "../src/lib/validations";
import { prisma } from "../src/lib/prisma";

async function runTestSuite() {
  console.log("==================================================================");
  console.log("REVERSEMARKET COMPREHENSIVE AUTOMATED TEST SUITE");
  console.log("==================================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✓ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${testName}`);
      failed++;
    }
  }

  // -------------------------------------------------------------------------
  // TEST GROUP 1: Independent Matching Engine Calculations
  // -------------------------------------------------------------------------
  console.log("[Group 1: Matching Engine Unit Calculations]");
  const engine = new MatchingEngine(DEFAULT_WEIGHTS);

  // Test 1.1: Budget within range
  const b1 = engine.calculateBudgetScore(80000, 50000, 100000, 80000);
  assert(b1.score >= 90, "Budget within range with exact preferred price scores >= 90%");

  // Test 1.2: Budget over maximum
  const b2 = engine.calculateBudgetScore(150000, 50000, 100000, 80000);
  assert(b2.score < 60, "Budget exceeding max by 50% is appropriately penalized (< 60%)");

  // Test 1.3: Delivery on time
  const targetDate = new Date(Date.now() + 10 * 86400000);
  const deliveryDateAhead = new Date(Date.now() + 7 * 86400000);
  const d1 = engine.calculateDeliveryScore(
    { type: "PRODUCT", minBudget: 50000, maxBudget: 100000, categoryId: "c1", requiredDeliveryDate: targetDate },
    { offeredPrice: 80000, deliveryDate: deliveryDateAhead }
  );
  assert(d1.score >= 90, "Fulfillment delivered 3 days ahead of schedule scores >= 90%");

  // Test 1.4: Location matching
  const l1 = engine.calculateLocationScore(
    { type: "PRODUCT", minBudget: 50000, maxBudget: 100000, categoryId: "c1", city: "Bengaluru", state: "Karnataka" },
    { id: "v1", city: "Bengaluru", state: "Karnataka", isRemoteAvailable: true, experienceYears: 5, rating: 5, completedOrders: 10, responseRate: 98, verified: true }
  );
  assert(l1.score === 100, "Same city vendor location scores 100%");

  // Test 1.5: Master Compatibility Calculation
  const comp = engine.computeCompatibility(
    {
      type: "PRODUCT",
      minBudget: 1800000,
      maxBudget: 2200000,
      preferredBudget: 2000000,
      categoryId: "hardware",
      categoryName: "Enterprise Hardware & Electronics",
      city: "Bengaluru",
      state: "Karnataka",
      requiredDeliveryDate: targetDate,
    },
    {
      id: "v-nexus",
      city: "Bengaluru",
      state: "Karnataka",
      isRemoteAvailable: true,
      experienceYears: 8,
      rating: 4.9,
      completedOrders: 120,
      responseRate: 99,
      verified: true,
      categoriesProvided: "Enterprise Hardware & Electronics",
    },
    {
      offeredPrice: 1950000,
      deliveryDate: deliveryDateAhead,
    }
  );
  assert(comp.overallScore >= 90, `Overall compatibility calculated accurately: ${comp.overallScore}%`);
  assert(Boolean(comp.breakdown.budget && comp.breakdown.delivery), "Multi-factor score breakdown explanations generated properly");

  // -------------------------------------------------------------------------
  // TEST GROUP 2: Input Validation Schemas
  // -------------------------------------------------------------------------
  console.log("\n[Group 2: Zod Schema Validations]");

  // Test 2.1: Valid requirement schema
  const reqVal = RequirementSchema.safeParse({
    type: "PRODUCT",
    title: "10 Developer Laptops",
    description: "High performance laptops for engineering team with minimum 32GB RAM",
    categoryId: "cat-1",
    quantity: 10,
    minBudget: 100000,
    maxBudget: 150000,
  });
  assert(reqVal.success, "Valid requirement data passes Zod validation");

  // Test 2.2: Invalid budget requirement schema
  const reqValBad = RequirementSchema.safeParse({
    type: "PRODUCT",
    title: "Bad",
    description: "Short",
    categoryId: "",
    minBudget: -5,
    maxBudget: 0,
  });
  assert(!reqValBad.success, "Invalid requirement data properly fails Zod validation");

  // -------------------------------------------------------------------------
  // TEST GROUP 3: Database & Marketplace Flow Integration
  // -------------------------------------------------------------------------
  console.log("\n[Group 3: Database & Transaction Lifecycle Integration]");

  // Test 3.1: Check seeded users and roles
  const users = await prisma.user.findMany({ select: { email: true, role: true } });
  const hasAdmin = users.some((u) => u.role === "ADMIN");
  const hasOwner = users.some((u) => u.role === "REQUIREMENT_OWNER");
  const hasVendor = users.some((u) => u.role === "VENDOR");
  assert(hasAdmin && hasOwner && hasVendor, "Database contains verified ADMIN, REQUIREMENT_OWNER, and VENDOR records");

  // Test 3.2: Requirements and offers relational integrity
  const req = await prisma.requirement.findFirst({
    include: { offers: true, compatibilityScores: true },
  });
  assert(Boolean(req && req.offers.length > 0), "Requirements contain related vendor offers");
  assert(Boolean(req && req.compatibilityScores.length > 0), "Requirements contain calculated compatibility scores");

  // Test 3.3: Selection status verification
  const selection = await prisma.selection.findFirst({
    include: { requirement: true, offer: true },
  });
  assert(Boolean(selection && selection.offer), "Winning vendor offer successfully selected and awarded");

  console.log("\n==================================================================");
  console.log(`TEST SUITE SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
