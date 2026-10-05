import { prisma } from "../src/lib/prisma";
import { hashPassword } from "../src/lib/auth";
import { MatchingEngine, DEFAULT_WEIGHTS } from "../src/lib/matching-engine";

async function enrichData() {
  console.log("Enriching ReverseMarket data with multi-vendor offers...");
  const engine = new MatchingEngine(DEFAULT_WEIGHTS);
  const defaultPassword = await hashPassword("Password123!");

  // Find existing categories
  const catHardware = await prisma.category.findUnique({
    where: { slug: "enterprise-hardware" },
    include: { subcategories: true },
  });
  const catSoftware = await prisma.category.findUnique({
    where: { slug: "software-development" },
    include: { subcategories: true },
  });
  const catDesign = await prisma.category.findUnique({
    where: { slug: "ui-ux-design" },
    include: { subcategories: true },
  });

  if (!catHardware || !catSoftware || !catDesign) {
    console.error("Categories not found. Please run seed first.");
    return;
  }

  // 1. Add HyperCore Compute Systems (Vendor 4)
  const vendorUser4 = await prisma.user.upsert({
    where: { email: "sales@hypercore.in" },
    update: {},
    create: {
      email: "sales@hypercore.in",
      name: "HyperCore Compute Systems",
      passwordHash: defaultPassword,
      role: "VENDOR",
      phone: "+91 88001 99221",
    },
  });

  const vendorProfile4 = await prisma.vendorProfile.upsert({
    where: { userId: vendorUser4.id },
    update: {},
    create: {
      userId: vendorUser4.id,
      businessName: "HyperCore Technologies",
      tagline: "Custom High-Density AI Rigs & Enterprise Workstations",
      description: "Direct enterprise partners for HP & Lenovo. Specializing in liquid-cooled AI/ML engineering stations with turnkey deployment and SLA-backed support.",
      city: "Bengaluru",
      state: "Karnataka",
      country: "India",
      isRemoteAvailable: true,
      serviceRadiusKm: 600,
      experienceYears: 7,
      rating: 4.85,
      reviewCount: 41,
      completedOrders: 94,
      responseRate: 98.5,
      verified: true,
      categoriesProvided: "Enterprise Hardware & Electronics, Laptops & Workstations, Servers",
    },
  });

  // 2. Add SysTech Hardware (Vendor 5 - Budget Option)
  const vendorUser5 = await prisma.user.upsert({
    where: { email: "contact@systechdevices.in" },
    update: {},
    create: {
      email: "contact@systechdevices.in",
      name: "SysTech Enterprise Solutions",
      passwordHash: defaultPassword,
      role: "VENDOR",
      phone: "+91 97112 33445",
    },
  });

  const vendorProfile5 = await prisma.vendorProfile.upsert({
    where: { userId: vendorUser5.id },
    update: {},
    create: {
      userId: vendorUser5.id,
      businessName: "SysTech Enterprise Solutions",
      tagline: "Cost-Effective OEM Workstations & IT Infrastructure",
      description: "Pan-India IT distributor offering aggressive bulk pricing on custom assembled AMD Threadripper and Intel workstations with standard warranty.",
      city: "Hyderabad",
      state: "Telangana",
      country: "India",
      isRemoteAvailable: true,
      serviceRadiusKm: 1200,
      experienceYears: 4,
      rating: 4.6,
      reviewCount: 22,
      completedOrders: 58,
      responseRate: 94.0,
      verified: true,
      categoriesProvided: "Enterprise Hardware & Electronics, Laptops & Workstations",
    },
  });

  // 3. Add second offer for req-workstations-demo (from HyperCore)
  const reqWorkstations = await prisma.requirement.findUnique({
    where: { id: "req-workstations-demo" },
    include: { specifications: true },
  });

  if (reqWorkstations) {
    const offerHyperCore = await prisma.offer.upsert({
      where: {
        requirementId_vendorId: {
          requirementId: reqWorkstations.id,
          vendorId: vendorUser4.id,
        },
      },
      update: {},
      create: {
        requirementId: reqWorkstations.id,
        vendorId: vendorUser4.id,
        vendorProfileId: vendorProfile4.id,
        offeredPrice: 2050000,
        currency: "INR",
        quantity: 10,
        deliveryDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days
        shippingCost: 0,
        additionalCharges: 0,
        warranty: "3-Year HP Care Pack Next Business Day Onsite Warranty",
        returnPolicy: "30-day DOA replacement with immediate replacement unit",
        description: "HP Z6 G5 AI Developer Edition Workstations. Configured with Intel Core i9-14900K, 64GB DDR5 5600MHz RAM, ASUS ProArt RTX 4080 Super 16GB, and Corsair 2TB Gen4 NVMe. Comes with pre-tested Ubuntu 24.04 and NVIDIA CUDA 12 environment.",
        vendorNotes: "Can expedite delivery to 7 days if purchase order is signed before 5 PM tomorrow.",
        status: "SUBMITTED",
        specifications: {
          create: [
            { specKey: "Processor", specValue: "Intel Core i9-14900K 24-Core" },
            { specKey: "RAM", specValue: "64GB DDR5 5600MHz (Upgradable to 192GB)" },
            { specKey: "GPU", specValue: "ASUS ProArt RTX 4080 Super 16GB" },
            { specKey: "Storage", specValue: "2TB Kingston KC3000 PCIe 4.0 NVMe" },
            { specKey: "Warranty", specValue: "3 Years HP Care Pack Onsite" },
          ],
        },
      },
      include: { specifications: true },
    });

    const compHyperCore = engine.computeCompatibility(
      {
        type: "PRODUCT",
        minBudget: reqWorkstations.minBudget,
        maxBudget: reqWorkstations.maxBudget,
        preferredBudget: reqWorkstations.preferredBudget,
        categoryId: reqWorkstations.categoryId,
        categoryName: "Enterprise Hardware & Electronics",
        city: reqWorkstations.city,
        state: reqWorkstations.state,
        isRemote: reqWorkstations.isRemote,
        requiredDeliveryDate: reqWorkstations.requiredDeliveryDate,
        specifications: reqWorkstations.specifications,
      },
      {
        id: vendorProfile4.id,
        city: vendorProfile4.city,
        state: vendorProfile4.state,
        isRemoteAvailable: vendorProfile4.isRemoteAvailable,
        experienceYears: vendorProfile4.experienceYears,
        rating: vendorProfile4.rating,
        completedOrders: vendorProfile4.completedOrders,
        responseRate: vendorProfile4.responseRate,
        verified: vendorProfile4.verified,
        categoriesProvided: vendorProfile4.categoriesProvided,
      },
      {
        offeredPrice: offerHyperCore.offeredPrice,
        deliveryDate: offerHyperCore.deliveryDate,
        specifications: offerHyperCore.specifications,
      }
    );

    await prisma.compatibilityScore.upsert({
      where: { offerId: offerHyperCore.id },
      update: {},
      create: {
        requirementId: reqWorkstations.id,
        offerId: offerHyperCore.id,
        vendorProfileId: vendorProfile4.id,
        overallScore: compHyperCore.overallScore,
        budgetScore: compHyperCore.budgetScore,
        relevanceScore: compHyperCore.relevanceScore,
        deliveryScore: compHyperCore.deliveryScore,
        locationScore: compHyperCore.locationScore,
        vendorQualityScore: compHyperCore.vendorQualityScore,
        breakdownJson: JSON.stringify(compHyperCore.breakdown),
      },
    });

    // Offer 3 for req-workstations-demo (from SysTech - aggressive price)
    const offerSysTech = await prisma.offer.upsert({
      where: {
        requirementId_vendorId: {
          requirementId: reqWorkstations.id,
          vendorId: vendorUser5.id,
        },
      },
      update: {},
      create: {
        requirementId: reqWorkstations.id,
        vendorId: vendorUser5.id,
        vendorProfileId: vendorProfile5.id,
        offeredPrice: 1840000,
        currency: "INR",
        quantity: 10,
        deliveryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days (a bit slower)
        shippingCost: 15000,
        additionalCharges: 0,
        warranty: "3-Year Limited Component Warranty (OEM)",
        returnPolicy: "7-day replacement for manufacturing defects",
        description: "Custom-crafted High Compute Towers. AMD Ryzen 9 7950X, 64GB DDR5, Gigabyte RTX 4080 16GB, 2TB Crucial P5 Plus Gen4 NVMe. Shipped safely from our Hyderabad assembly center with transit insurance included.",
        vendorNotes: "Lowest total cost of ownership. Over ₹1,60,000 below your preferred budget.",
        status: "SUBMITTED",
        specifications: {
          create: [
            { specKey: "Processor", specValue: "AMD Ryzen 9 7950X 16-Core 32-Thread" },
            { specKey: "RAM", specValue: "64GB DDR5 5200MHz" },
            { specKey: "GPU", specValue: "Gigabyte Gaming OC RTX 4080 16GB" },
            { specKey: "Storage", specValue: "2TB Crucial P5 Plus NVMe" },
            { specKey: "Warranty", specValue: "3 Years Component Warranty" },
          ],
        },
      },
      include: { specifications: true },
    });

    const compSysTech = engine.computeCompatibility(
      {
        type: "PRODUCT",
        minBudget: reqWorkstations.minBudget,
        maxBudget: reqWorkstations.maxBudget,
        preferredBudget: reqWorkstations.preferredBudget,
        categoryId: reqWorkstations.categoryId,
        categoryName: "Enterprise Hardware & Electronics",
        city: reqWorkstations.city,
        state: reqWorkstations.state,
        isRemote: reqWorkstations.isRemote,
        requiredDeliveryDate: reqWorkstations.requiredDeliveryDate,
        specifications: reqWorkstations.specifications,
      },
      {
        id: vendorProfile5.id,
        city: vendorProfile5.city,
        state: vendorProfile5.state,
        isRemoteAvailable: vendorProfile5.isRemoteAvailable,
        experienceYears: vendorProfile5.experienceYears,
        rating: vendorProfile5.rating,
        completedOrders: vendorProfile5.completedOrders,
        responseRate: vendorProfile5.responseRate,
        verified: vendorProfile5.verified,
        categoriesProvided: vendorProfile5.categoriesProvided,
      },
      {
        offeredPrice: offerSysTech.offeredPrice,
        deliveryDate: offerSysTech.deliveryDate,
        specifications: offerSysTech.specifications,
      }
    );

    await prisma.compatibilityScore.upsert({
      where: { offerId: offerSysTech.id },
      update: {},
      create: {
        requirementId: reqWorkstations.id,
        offerId: offerSysTech.id,
        vendorProfileId: vendorProfile5.id,
        overallScore: compSysTech.overallScore,
        budgetScore: compSysTech.budgetScore,
        relevanceScore: compSysTech.relevanceScore,
        deliveryScore: compSysTech.deliveryScore,
        locationScore: compSysTech.locationScore,
        vendorQualityScore: compSysTech.vendorQualityScore,
        breakdownJson: JSON.stringify(compSysTech.breakdown),
      },
    });

    console.log("Added 2 additional competing offers for req-workstations-demo!");
  }

  // 4. Add a 3rd requirement: UI/UX & Brand Design for Fintech Web Platform
  const owner2 = await prisma.user.findUnique({
    where: { email: "priya@innovatestudio.in" },
  });
  const vendorUser3 = await prisma.user.findUnique({
    where: { email: "ananya@lumindesign.com" },
    include: { vendorProfile: true },
  });

  if (owner2 && vendorUser3?.vendorProfile) {
    const subcatDesign = catDesign.subcategories[0];
    const reqFintechDesign = await prisma.requirement.upsert({
      where: { id: "req-fintech-design" },
      update: {},
      create: {
        id: "req-fintech-design",
        ownerId: owner2.id,
        type: "SERVICE",
        title: "Next-Gen Fintech App UI/UX System & 3D Interactive Web Experience",
        description: "We are developing an institutional crypto-fiat settlement dashboard and need an award-grade futuristic design system. Requirements: Figma component library with dark/light mode tokens, interactive 3D assets via Spline/Three.js, full WCAG 2.2 AA accessibility, and mobile responsive flows.",
        categoryId: catDesign.id,
        subcategoryId: subcatDesign?.id,
        quantity: 1,
        minBudget: 200000,
        maxBudget: 320000,
        preferredBudget: 275000,
        currency: "INR",
        projectStartDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        projectDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        expectedDurationDays: 25,
        country: "India",
        state: "Maharashtra",
        city: "Mumbai",
        isRemote: true,
        status: "PUBLISHED",
        specifications: {
          create: [
            { specKey: "Deliverable Format", specValue: "Figma Tokens Studio + Auto-layout Components", isRequired: true },
            { specKey: "3D Visuals", specValue: "Interactive Spline 3D Embeds & WebGL Shaders", isRequired: true },
            { specKey: "Accessibility", specValue: "WCAG 2.2 AA Contrast & Focus States", isRequired: true },
            { specKey: "Prototypes", specValue: "High-Fidelity Clickable Micro-interactions", isRequired: true },
          ],
        },
      },
      include: { specifications: true },
    });

    // Lumin submits an offer
    const offerLumin = await prisma.offer.upsert({
      where: {
        requirementId_vendorId: {
          requirementId: reqFintechDesign.id,
          vendorId: vendorUser3.id,
        },
      },
      update: {},
      create: {
        requirementId: reqFintechDesign.id,
        vendorId: vendorUser3.id,
        vendorProfileId: vendorUser3.vendorProfile.id,
        offeredPrice: 265000,
        currency: "INR",
        quantity: 1,
        startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        completionDate: new Date(Date.now() + 26 * 24 * 60 * 60 * 1000),
        estimatedDuration: "21 Days",
        deliverables: "Comprehensive Figma Design System (40+ tokens, 120+ atomic components), 5 interactive Spline 3D scenes, design token exports in JSON/CSS, and fully animated high-fidelity prototypes.",
        milestonesJson: JSON.stringify([
          { milestone: "Research, Wireframes & Moodboard", days: 5, percentage: 25 },
          { milestone: "Design System Architecture & Color/Typography Tokens", days: 7, percentage: 35 },
          { milestone: "3D Spline Interactive Scenes & Desktop Flows", days: 5, percentage: 25 },
          { milestone: "Mobile Breakpoints, Micro-animations & Token Export", days: 4, percentage: 15 },
        ]),
        description: "Lumin Design Labs has designed 12+ fintech and Web3 products featured on Awwwards and Siteinspire. Our designs combine dark cyber aesthetics with strict financial data clarity.",
        vendorNotes: "Includes 2 rounds of design revisions and 14 days of frontend engineering handoff pairing.",
        status: "SHORTLISTED",
        specifications: {
          create: [
            { specKey: "Deliverable Format", specValue: "Figma Tokens Studio + Auto-layout Components" },
            { specKey: "3D Visuals", specValue: "Interactive Spline 3D Embeds & WebGL Shaders" },
            { specKey: "Accessibility", specValue: "WCAG 2.2 AA Contrast & Focus States" },
            { specKey: "Prototypes", specValue: "High-Fidelity Clickable Micro-interactions" },
          ],
        },
      },
      include: { specifications: true },
    });

    const compLumin = engine.computeCompatibility(
      {
        type: "SERVICE",
        minBudget: reqFintechDesign.minBudget,
        maxBudget: reqFintechDesign.maxBudget,
        preferredBudget: reqFintechDesign.preferredBudget,
        categoryId: reqFintechDesign.categoryId,
        categoryName: "UI/UX & Brand Design",
        city: reqFintechDesign.city,
        state: reqFintechDesign.state,
        isRemote: reqFintechDesign.isRemote,
        projectDeadline: reqFintechDesign.projectDeadline,
        specifications: reqFintechDesign.specifications,
      },
      {
        id: vendorUser3.vendorProfile.id,
        city: vendorUser3.vendorProfile.city,
        state: vendorUser3.vendorProfile.state,
        isRemoteAvailable: vendorUser3.vendorProfile.isRemoteAvailable,
        experienceYears: vendorUser3.vendorProfile.experienceYears,
        rating: vendorUser3.vendorProfile.rating,
        completedOrders: vendorUser3.vendorProfile.completedOrders,
        responseRate: vendorUser3.vendorProfile.responseRate,
        verified: vendorUser3.vendorProfile.verified,
        categoriesProvided: vendorUser3.vendorProfile.categoriesProvided,
      },
      {
        offeredPrice: offerLumin.offeredPrice,
        completionDate: offerLumin.completionDate,
        specifications: offerLumin.specifications,
      }
    );

    await prisma.compatibilityScore.upsert({
      where: { offerId: offerLumin.id },
      update: {},
      create: {
        requirementId: reqFintechDesign.id,
        offerId: offerLumin.id,
        vendorProfileId: vendorUser3.vendorProfile.id,
        overallScore: compLumin.overallScore,
        budgetScore: compLumin.budgetScore,
        relevanceScore: compLumin.relevanceScore,
        deliveryScore: compLumin.deliveryScore,
        locationScore: compLumin.locationScore,
        vendorQualityScore: compLumin.vendorQualityScore,
        breakdownJson: JSON.stringify(compLumin.breakdown),
      },
    });

    // Also add shortlist entry
    await prisma.shortlist.upsert({
      where: {
        requirementId_offerId: {
          requirementId: reqFintechDesign.id,
          offerId: offerLumin.id,
        },
      },
      update: {},
      create: {
        requirementId: reqFintechDesign.id,
        offerId: offerLumin.id,
        vendorId: vendorUser3.vendorProfile.id,
        ownerId: owner2.id,
        notes: "Exceptional portfolio in futuristic fintech interfaces. Shortlisted.",
      },
    });

    console.log("Added 3rd requirement with shortlisted offer from Lumin!");
  }

  console.log("Data enrichment complete! All match scores calculated successfully.");
}

enrichData()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
