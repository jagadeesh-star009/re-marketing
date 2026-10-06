/**
 * Standalone seed runner for Prisma Postgres
 * Runs the full seed + enrich pipeline directly
 */
import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

async function main() {
  console.log("🌱 Seeding ReverseMarket on Prisma Postgres...\n");
  const defaultPassword = await hashPassword("Password123!");

  // ── 1. Matching Weights ──────────────────────────────────────────────────
  await prisma.matchingWeight.upsert({
    where: { id: "default-weights" },
    update: {},
    create: {
      id: "default-weights",
      budgetWeight: 0.30,
      relevanceWeight: 0.30,
      deliveryWeight: 0.20,
      locationWeight: 0.10,
      vendorQualityWeight: 0.10,
      isDefault: true,
    },
  });
  console.log("✅ Matching weights");

  // ── 2. Categories ────────────────────────────────────────────────────────
  const catHardware = await prisma.category.upsert({
    where: { slug: "enterprise-hardware" },
    update: {},
    create: {
      name: "Enterprise Hardware & Electronics",
      slug: "enterprise-hardware",
      description: "High-performance computing hardware, servers, and electronic equipment",
      type: "PRODUCT",
      icon: "💻",
      subcategories: {
        create: [
          { name: "Laptops & Workstations", slug: "laptops-workstations", description: "Professional-grade laptops and engineering workstations" },
          { name: "Servers & Storage", slug: "servers-storage", description: "Enterprise servers, NAS, and SAN storage solutions" },
          { name: "Networking Equipment", slug: "networking", description: "Routers, switches, firewalls, and network infrastructure" },
          { name: "GPUs & AI Accelerators", slug: "gpus-ai", description: "Graphics cards and AI/ML accelerator hardware" },
        ],
      },
    },
    include: { subcategories: true },
  });

  const catSoftware = await prisma.category.upsert({
    where: { slug: "software-development" },
    update: {},
    create: {
      name: "Software Development",
      slug: "software-development",
      description: "Custom software, web, and mobile application development services",
      type: "SERVICE",
      icon: "⚡",
      subcategories: {
        create: [
          { name: "Web Development", slug: "web-development", description: "Full-stack web applications and platforms" },
          { name: "Mobile Apps", slug: "mobile-apps", description: "iOS and Android application development" },
          { name: "API & Backend", slug: "api-backend", description: "RESTful APIs, microservices, and backend systems" },
          { name: "Cloud & DevOps", slug: "cloud-devops", description: "AWS/GCP/Azure setup, CI/CD pipelines, and infrastructure" },
        ],
      },
    },
    include: { subcategories: true },
  });

  const catDesign = await prisma.category.upsert({
    where: { slug: "ui-ux-design" },
    update: {},
    create: {
      name: "UI/UX & Product Design",
      slug: "ui-ux-design",
      description: "User interface, user experience, and product design services",
      type: "SERVICE",
      icon: "🎨",
      subcategories: {
        create: [
          { name: "UI Design", slug: "ui-design", description: "Visual interface design for web and mobile" },
          { name: "UX Research", slug: "ux-research", description: "User research, usability testing, and wireframing" },
          { name: "Brand Identity", slug: "brand-identity", description: "Logo design, brand guidelines, and visual identity" },
          { name: "3D & Motion", slug: "3d-motion", description: "3D modeling, animation, and motion graphics" },
        ],
      },
    },
    include: { subcategories: true },
  });
  console.log("✅ Categories & subcategories");

  // ── 3. Admin ─────────────────────────────────────────────────────────────
  await prisma.user.upsert({
    where: { email: "admin@reversemarket.io" },
    update: {},
    create: {
      email: "admin@reversemarket.io",
      name: "ReverseMarket Admin",
      passwordHash: defaultPassword,
      role: "ADMIN",
      userProfile: { create: { bio: "Platform Administrator", city: "Bengaluru", state: "Karnataka", country: "India" } },
    },
  });
  console.log("✅ Admin user");

  // ── 4. Requirement Owners ─────────────────────────────────────────────────
  const owner = await prisma.user.upsert({
    where: { email: "owner@apextech.com" },
    update: {},
    create: {
      email: "owner@apextech.com",
      name: "Arjun Mehta",
      passwordHash: defaultPassword,
      role: "REQUIREMENT_OWNER",
      phone: "+91 98765 43210",
      userProfile: { create: { companyName: "Apex Technologies Pvt Ltd", city: "Mumbai", state: "Maharashtra", country: "India" } },
    },
  });

  const owner2 = await prisma.user.upsert({
    where: { email: "cto@quantumleap.io" },
    update: {},
    create: {
      email: "cto@quantumleap.io",
      name: "Priya Sharma",
      passwordHash: defaultPassword,
      role: "REQUIREMENT_OWNER",
      phone: "+91 87654 32109",
      userProfile: { create: { companyName: "QuantumLeap Fintech", city: "Bengaluru", state: "Karnataka", country: "India" } },
    },
  });
  console.log("✅ Requirement owners");

  // ── 5. Vendors ────────────────────────────────────────────────────────────
  const v1User = await prisma.user.upsert({
    where: { email: "sales@nexushardware.com" },
    update: {},
    create: {
      email: "sales@nexushardware.com",
      name: "Nexus Hardware Solutions",
      passwordHash: defaultPassword,
      role: "VENDOR",
      phone: "+91 80123 45678",
    },
  });
  const v1Profile = await prisma.vendorProfile.upsert({
    where: { userId: v1User.id },
    update: {},
    create: {
      userId: v1User.id,
      businessName: "Nexus Hardware Solutions",
      tagline: "Authorised Reseller - Dell, HP, Cisco, NVIDIA",
      description: "Pan-India enterprise hardware distributor with 10+ years experience. Authorised for Dell EMC, HP Enterprise, Cisco, and NVIDIA workstations.",
      city: "Bengaluru", state: "Karnataka", country: "India",
      isRemoteAvailable: true, serviceRadiusKm: 1000,
      experienceYears: 10, rating: 4.9, reviewCount: 87, completedOrders: 213, responseRate: 99.2, verified: true,
      categoriesProvided: "Enterprise Hardware & Electronics",
    },
  });

  const v2User = await prisma.user.upsert({
    where: { email: "projects@devcraft.studio" },
    update: {},
    create: {
      email: "projects@devcraft.studio",
      name: "DevCraft Studio",
      passwordHash: defaultPassword,
      role: "VENDOR",
      phone: "+91 91234 56789",
    },
  });
  const v2Profile = await prisma.vendorProfile.upsert({
    where: { userId: v2User.id },
    update: {},
    create: {
      userId: v2User.id,
      businessName: "DevCraft Studio",
      tagline: "Next.js, React, Node.js & Cloud Native Engineering",
      description: "Boutique software studio specialising in high-performance web platforms, fintech dashboards, and SaaS products. Serving 40+ enterprise clients globally.",
      city: "Hyderabad", state: "Telangana", country: "India",
      isRemoteAvailable: true, serviceRadiusKm: 500,
      experienceYears: 7, rating: 4.8, reviewCount: 52, completedOrders: 89, responseRate: 97.5, verified: true,
      categoriesProvided: "Software Development, UI/UX & Product Design",
    },
  });

  const v3User = await prisma.user.upsert({
    where: { email: "hello@pixelforge.design" },
    update: {},
    create: {
      email: "hello@pixelforge.design",
      name: "PixelForge Design Labs",
      passwordHash: defaultPassword,
      role: "VENDOR",
      phone: "+91 76543 21098",
    },
  });
  const v3Profile = await prisma.vendorProfile.upsert({
    where: { userId: v3User.id },
    update: {},
    create: {
      userId: v3User.id,
      businessName: "PixelForge Design Labs",
      tagline: "Award-Winning UI/UX & 3D Interactive Design",
      description: "Design-first studio delivering stunning interfaces, interactive 3D experiences, and brand identity systems for tech companies and D2C brands.",
      city: "Pune", state: "Maharashtra", country: "India",
      isRemoteAvailable: true, serviceRadiusKm: 300,
      experienceYears: 6, rating: 4.95, reviewCount: 34, completedOrders: 61, responseRate: 98.8, verified: true,
      categoriesProvided: "UI/UX & Product Design, Software Development",
    },
  });

  const v4User = await prisma.user.upsert({
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
  const v4Profile = await prisma.vendorProfile.upsert({
    where: { userId: v4User.id },
    update: {},
    create: {
      userId: v4User.id,
      businessName: "HyperCore Technologies",
      tagline: "Custom High-Density AI Rigs & Enterprise Workstations",
      description: "Direct enterprise partners for HP & Lenovo. Specializing in liquid-cooled AI/ML engineering stations with turnkey deployment and SLA-backed support.",
      city: "Bengaluru", state: "Karnataka", country: "India",
      isRemoteAvailable: true, serviceRadiusKm: 600,
      experienceYears: 7, rating: 4.85, reviewCount: 41, completedOrders: 94, responseRate: 98.5, verified: true,
      categoriesProvided: "Enterprise Hardware & Electronics",
    },
  });
  console.log("✅ Vendor profiles (4 vendors)");

  // ── 6. Vendor Capabilities ────────────────────────────────────────────────
  for (const vp of [v1Profile, v4Profile]) {
    await prisma.vendorCapability.upsert({
      where: { id: `cap-hw-${vp.id}` },
      update: {},
      create: {
        id: `cap-hw-${vp.id}`,
        vendorId: vp.id,
        categoryId: catHardware.id,
        experienceYears: vp.experienceYears,
        tags: JSON.stringify(["Workstations", "GPUs", "Servers", "NVIDIA", "Dell", "HP"]),
      },
    });
  }
  for (const vp of [v2Profile, v3Profile]) {
    await prisma.vendorCapability.upsert({
      where: { id: `cap-sw-${vp.id}` },
      update: {},
      create: {
        id: `cap-sw-${vp.id}`,
        vendorId: vp.id,
        categoryId: catSoftware.id,
        experienceYears: vp.experienceYears,
        tags: JSON.stringify(["Next.js", "React", "Node.js", "TypeScript", "AWS"]),
      },
    });
    await prisma.vendorCapability.upsert({
      where: { id: `cap-ui-${vp.id}` },
      update: {},
      create: {
        id: `cap-ui-${vp.id}`,
        vendorId: vp.id,
        categoryId: catDesign.id,
        experienceYears: vp.experienceYears,
        tags: JSON.stringify(["Figma", "UI Design", "UX Research", "Prototyping"]),
      },
    });
  }
  console.log("✅ Vendor capabilities");

  // ── 7. Requirements ────────────────────────────────────────────────────────
  const req1 = await prisma.requirement.upsert({
    where: { id: "req-workstations-demo" },
    update: {},
    create: {
      id: "req-workstations-demo",
      ownerId: owner.id,
      type: "PRODUCT",
      title: "20x High-Performance AI/ML Engineering Workstations",
      description: "Apex Technologies requires 20 units of enterprise-grade AI workstations for our deep learning and neural network training team. Machines must handle 100% GPU utilization 24/7 and support multi-GPU configurations.",
      categoryId: catHardware.id,
      quantity: 20,
      minBudget: 2800000, maxBudget: 3500000, preferredBudget: 3200000, currency: "INR",
      requiredDeliveryDate: new Date("2026-11-15"),
      country: "India", state: "Maharashtra", city: "Mumbai", isRemote: false,
      status: "PUBLISHED",
      specifications: {
        create: [
          { specKey: "GPU", specValue: "NVIDIA RTX 4090 (24GB VRAM) or equivalent", isRequired: true },
          { specKey: "CPU", specValue: "Intel Core i9-14900K or AMD Ryzen 9 7950X", isRequired: true },
          { specKey: "RAM", specValue: "128GB DDR5 ECC", isRequired: true },
          { specKey: "Storage", specValue: "4TB NVMe SSD RAID-0 Array", isRequired: true },
          { specKey: "Warranty", specValue: "Minimum 3-Year On-Site", isRequired: true },
          { specKey: "Delivery", specValue: "Within 6 weeks", isRequired: false },
        ],
      },
    },
    include: { specifications: true },
  });

  const req2 = await prisma.requirement.upsert({
    where: { id: "req-fintech-platform" },
    update: {},
    create: {
      id: "req-fintech-platform",
      ownerId: owner2.id,
      type: "SERVICE",
      title: "Enterprise Fintech Dashboard & Trading Platform Development",
      description: "QuantumLeap requires a high-performance financial trading and portfolio management platform with real-time data feeds, advanced charting, and institutional-grade security.",
      categoryId: catSoftware.id,
      quantity: 1,
      minBudget: 1800000, maxBudget: 2800000, preferredBudget: 2200000, currency: "INR",
      projectStartDate: new Date("2026-11-01"),
      projectDeadline: new Date("2027-04-01"),
      expectedDurationDays: 150,
      country: "India", state: "Karnataka", city: "Bengaluru", isRemote: true,
      status: "PUBLISHED",
      specifications: {
        create: [
          { specKey: "Stack", specValue: "Next.js 15, TypeScript, PostgreSQL, Redis", isRequired: true },
          { specKey: "Real-time", specValue: "WebSocket market data feeds (<50ms latency)", isRequired: true },
          { specKey: "Security", specValue: "ISO 27001 compliant, end-to-end encryption", isRequired: true },
          { specKey: "Integrations", specValue: "NSE/BSE APIs, Zerodha Kite, payment gateways", isRequired: true },
          { specKey: "Team Size", specValue: "Minimum 4 FTE developers", isRequired: false },
        ],
      },
    },
    include: { specifications: true },
  });

  const req3 = await prisma.requirement.upsert({
    where: { id: "req-design-system" },
    update: {},
    create: {
      id: "req-design-system",
      ownerId: owner.id,
      type: "SERVICE",
      title: "Complete Product Design System & 3D Interactive UI/UX",
      description: "Apex needs a comprehensive design system with 3D interactive elements for our next-gen SaaS product. Looking for a design studio that can deliver Figma design tokens, component library, and interactive 3D hero sections.",
      categoryId: catDesign.id,
      quantity: 1,
      minBudget: 400000, maxBudget: 750000, preferredBudget: 600000, currency: "INR",
      projectStartDate: new Date("2026-11-01"),
      projectDeadline: new Date("2027-01-15"),
      expectedDurationDays: 75,
      country: "India", state: "Maharashtra", city: "Mumbai", isRemote: true,
      status: "PUBLISHED",
      specifications: {
        create: [
          { specKey: "Deliverables", specValue: "Full Figma design system + developer handoff", isRequired: true },
          { specKey: "Components", specValue: "200+ reusable UI components", isRequired: true },
          { specKey: "3D Elements", specValue: "Three.js/WebGL interactive hero animations", isRequired: false },
          { specKey: "Branding", specValue: "Updated brand identity guidelines", isRequired: false },
        ],
      },
    },
    include: { specifications: true },
  });
  console.log("✅ Requirements (3)");

  // ── 8. Offers ─────────────────────────────────────────────────────────────
  const offer1 = await prisma.offer.upsert({
    where: { requirementId_vendorId: { requirementId: req1.id, vendorId: v1User.id } },
    update: {},
    create: {
      requirementId: req1.id,
      vendorId: v1User.id,
      vendorProfileId: v1Profile.id,
      offeredPrice: 3120000, currency: "INR", quantity: 20,
      deliveryDate: new Date("2026-11-10"),
      shippingCost: 0, additionalCharges: 0,
      warranty: "3-Year Dell ProSupport On-Site",
      returnPolicy: "30-Day DOA Replacement Policy",
      description: "Supplying 20x Dell Precision 7960 Tower Workstations with NVIDIA RTX 4090. Authorized Dell Premier Partner with pre-configured imaging and asset tagging. Includes dedicated account manager and 4-hour on-site SLA.",
      status: "SUBMITTED",
      specifications: {
        create: [
          { specKey: "Model", specValue: "Dell Precision 7960 Tower" },
          { specKey: "GPU", specValue: "NVIDIA RTX 4090 24GB GDDR6X" },
          { specKey: "CPU", specValue: "Intel Core i9-14900K (24-core)" },
          { specKey: "RAM", specValue: "128GB DDR5 ECC (4x32GB)" },
          { specKey: "Storage", specValue: "2x 2TB Samsung 990 Pro NVMe RAID-0" },
        ],
      },
    },
    include: { specifications: true },
  });

  const offer2 = await prisma.offer.upsert({
    where: { requirementId_vendorId: { requirementId: req1.id, vendorId: v4User.id } },
    update: {},
    create: {
      requirementId: req1.id,
      vendorId: v4User.id,
      vendorProfileId: v4Profile.id,
      offeredPrice: 2975000, currency: "INR", quantity: 20,
      deliveryDate: new Date("2026-11-05"),
      shippingCost: 0, additionalCharges: 12000,
      warranty: "3-Year HyperCore Extended On-Site",
      returnPolicy: "45-Day Satisfaction Guarantee",
      description: "Custom-built liquid-cooled AI workstations with overclocked RTX 4090. 15% faster GPU compute than stock Dell configurations. Custom chassis with enterprise cable management and IPMI remote management. Includes 1 free on-site engineer visit per year.",
      status: "SUBMITTED",
      specifications: {
        create: [
          { specKey: "GPU", specValue: "NVIDIA RTX 4090 24GB (OC Edition +8%)" },
          { specKey: "CPU", specValue: "AMD Ryzen 9 7950X (16-core, 5.7GHz Boost)" },
          { specKey: "RAM", specValue: "128GB DDR5 ECC 6000MHz" },
          { specKey: "Cooling", specValue: "360mm AIO Liquid Cooling" },
          { specKey: "Management", specValue: "IPMI 2.0 Remote Management" },
        ],
      },
    },
    include: { specifications: true },
  });

  const offer3 = await prisma.offer.upsert({
    where: { requirementId_vendorId: { requirementId: req2.id, vendorId: v2User.id } },
    update: {},
    create: {
      requirementId: req2.id,
      vendorId: v2User.id,
      vendorProfileId: v2Profile.id,
      offeredPrice: 2150000, currency: "INR", quantity: 1,
      startDate: new Date("2026-11-05"),
      completionDate: new Date("2027-03-25"),
      estimatedDuration: "140 days",
      deliverables: "Full Next.js 15 platform, real-time WebSocket feeds, admin dashboard, mobile app, complete documentation",
      description: "Delivering a production-ready fintech trading platform with live market data integration. Our team includes 2 senior full-stack engineers, 1 DevOps/AWS architect, and 1 QA engineer.",
      status: "SUBMITTED",
      specifications: {
        create: [
          { specKey: "Team", specValue: "4 FTE — 2 Senior Full-Stack, 1 DevOps, 1 QA" },
          { specKey: "Infra", specValue: "AWS EKS + CloudFront + ElastiCache (Redis)" },
          { specKey: "Latency", specValue: "WebSocket <30ms p95 latency" },
          { specKey: "Testing", specValue: "80%+ code coverage, load tested to 10K concurrent" },
        ],
      },
    },
    include: { specifications: true },
  });

  const offer4 = await prisma.offer.upsert({
    where: { requirementId_vendorId: { requirementId: req3.id, vendorId: v3User.id } },
    update: {},
    create: {
      requirementId: req3.id,
      vendorId: v3User.id,
      vendorProfileId: v3Profile.id,
      offeredPrice: 585000, currency: "INR", quantity: 1,
      startDate: new Date("2026-11-01"),
      completionDate: new Date("2027-01-10"),
      estimatedDuration: "70 days",
      deliverables: "Figma design system, 250+ components, Three.js hero animations, brand identity kit, developer handoff documentation",
      description: "Award-winning design studio delivering comprehensive design systems for B2B SaaS. We've built design systems for 12 unicorn startups. Includes interactive 3D elements with Three.js and dedicated Figma workspace with live collaboration.",
      status: "SUBMITTED",
      specifications: {
        create: [
          { specKey: "Components", specValue: "250+ Figma components with variables" },
          { specKey: "3D", specValue: "Three.js WebGL hero animations (3 variants)" },
          { specKey: "Handoff", specValue: "Zeroheight documentation + Storybook" },
          { specKey: "Brand", specValue: "Full brand identity + motion guidelines" },
        ],
      },
    },
    include: { specifications: true },
  });
  console.log("✅ Offers (4)");

  // ── 9. Compatibility Scores ────────────────────────────────────────────────
  const scores = [
    { req: req1, offer: offer1, vendor: v1Profile, budget: 88, relevance: 96, delivery: 94, location: 72, quality: 97 },
    { req: req1, offer: offer2, vendor: v4Profile, budget: 93, relevance: 94, delivery: 98, location: 85, quality: 94 },
    { req: req2, offer: offer3, vendor: v2Profile, budget: 91, relevance: 97, delivery: 89, location: 100, quality: 95 },
    { req: req3, offer: offer4, vendor: v3Profile, budget: 86, relevance: 98, delivery: 96, location: 100, quality: 98 },
  ];

  for (const s of scores) {
    const overall = s.budget * 0.30 + s.relevance * 0.30 + s.delivery * 0.20 + s.location * 0.10 + s.quality * 0.10;
    await prisma.compatibilityScore.upsert({
      where: { offerId: s.offer.id },
      update: { overallScore: overall },
      create: {
        requirementId: s.req.id,
        offerId: s.offer.id,
        vendorProfileId: s.vendor.id,
        overallScore: overall,
        budgetScore: s.budget,
        relevanceScore: s.relevance,
        deliveryScore: s.delivery,
        locationScore: s.location,
        vendorQualityScore: s.quality,
        breakdownJson: JSON.stringify({ budget: s.budget, relevance: s.relevance, delivery: s.delivery, location: s.location, quality: s.quality }),
      },
    });
  }
  console.log("✅ Compatibility scores");

  // ── 10. Notifications ─────────────────────────────────────────────────────
  await prisma.notification.createMany({
    skipDuplicates: true,
    data: [
      {
        userId: owner.id,
        type: "OFFER_RECEIVED",
        title: "2 New Offers on Your Workstation Demand",
        message: "Nexus Hardware Solutions and HyperCore Technologies have submitted competitive bids.",
        linkUrl: `/requirements/${req1.id}`,
        isRead: false,
      },
      {
        userId: owner2.id,
        type: "OFFER_RECEIVED",
        title: "New Proposal: Fintech Platform Development",
        message: "DevCraft Studio submitted a detailed proposal for your trading platform requirement.",
        linkUrl: `/requirements/${req2.id}`,
        isRead: false,
      },
    ],
  });
  console.log("✅ Notifications");

  console.log("\n🎉 Database seeded successfully!");
  console.log("   Admin:  admin@reversemarket.io / Password123!");
  console.log("   Buyer:  owner@apextech.com / Password123!");
  console.log("   Buyer:  cto@quantumleap.io / Password123!");
  console.log("   Vendor: sales@nexushardware.com / Password123!");
  console.log("   Vendor: projects@devcraft.studio / Password123!");
  console.log("   Vendor: hello@pixelforge.design / Password123!");
  console.log("   Vendor: sales@hypercore.in / Password123!");
}

main()
  .catch((e) => { console.error("❌ Seed failed:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
