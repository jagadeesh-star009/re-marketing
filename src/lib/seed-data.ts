import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { MatchingEngine, DEFAULT_WEIGHTS } from "@/lib/matching-engine";

export async function seedMarketplaceData() {
  console.log("Seeding ReverseMarket database...");

  // Default matching weights
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

  const defaultPassword = await hashPassword("Password123!");

  // 1. Admin User
  const admin = await prisma.user.upsert({
    where: { email: "admin@reversemarket.io" },
    update: {},
    create: {
      email: "admin@reversemarket.io",
      name: "ReverseMarket Admin",
      passwordHash: defaultPassword,
      role: "ADMIN",
      userProfile: {
        create: {
          bio: "Platform Administrator & Operations",
          city: "Bengaluru",
          state: "Karnataka",
          country: "India",
        },
      },
    },
  });

  // 2. Requirement Owners
  const owner1 = await prisma.user.upsert({
    where: { email: "owner@apextech.com" },
    update: {},
    create: {
      email: "owner@apextech.com",
      name: "Rajesh Sharma",
      passwordHash: defaultPassword,
      role: "REQUIREMENT_OWNER",
      phone: "+91 98765 43210",
      userProfile: {
        create: {
          companyName: "Apex Logistics & Systems",
          bio: "VP of Technology Procurement",
          city: "Bengaluru",
          state: "Karnataka",
          country: "India",
        },
      },
    },
  });

  const owner2 = await prisma.user.upsert({
    where: { email: "priya@innovatestudio.in" },
    update: {},
    create: {
      email: "priya@innovatestudio.in",
      name: "Priya Patel",
      passwordHash: defaultPassword,
      role: "REQUIREMENT_OWNER",
      phone: "+91 98123 45678",
      userProfile: {
        create: {
          companyName: "Innovate Product Studio",
          bio: "Founder & Head of Product",
          city: "Mumbai",
          state: "Maharashtra",
          country: "India",
        },
      },
    },
  });

  // 3. Vendors
  const vendorUser1 = await prisma.user.upsert({
    where: { email: "sales@nexushardware.com" },
    update: {},
    create: {
      email: "sales@nexushardware.com",
      name: "Nexus Enterprise Hardware",
      passwordHash: defaultPassword,
      role: "VENDOR",
      phone: "+91 80011 22334",
    },
  });

  const vendorProfile1 = await prisma.vendorProfile.upsert({
    where: { userId: vendorUser1.id },
    update: {},
    create: {
      userId: vendorUser1.id,
      businessName: "Nexus Enterprise Systems",
      tagline: "Certified Enterprise Workstations & Servers",
      description: "Tier-1 authorized OEM distributor supplying AI workstations, GPU clusters, and enterprise laptops across India.",
      city: "Bengaluru",
      state: "Karnataka",
      country: "India",
      isRemoteAvailable: true,
      serviceRadiusKm: 500,
      experienceYears: 8,
      rating: 4.9,
      reviewCount: 48,
      completedOrders: 126,
      responseRate: 99.0,
      verified: true,
      categoriesProvided: "Enterprise Hardware & Electronics, Laptops & Workstations, Servers",
    },
  });

  const vendorUser2 = await prisma.user.upsert({
    where: { email: "vikram@zenithcraft.io" },
    update: {},
    create: {
      email: "vikram@zenithcraft.io",
      name: "Zenith Cloud & Software",
      passwordHash: defaultPassword,
      role: "VENDOR",
      phone: "+91 99887 76655",
    },
  });

  const vendorProfile2 = await prisma.vendorProfile.upsert({
    where: { userId: vendorUser2.id },
    update: {},
    create: {
      userId: vendorUser2.id,
      businessName: "Zenith Engineering Studio",
      tagline: "Futuristic Web Apps, Microservices & High-Scale Cloud",
      description: "Specialized engineering boutique delivering modern Next.js 16, TypeScript, distributed backends, and AI pipelines.",
      city: "Bengaluru",
      state: "Karnataka",
      country: "India",
      isRemoteAvailable: true,
      experienceYears: 6,
      rating: 4.8,
      reviewCount: 34,
      completedOrders: 52,
      responseRate: 98.0,
      verified: true,
      categoriesProvided: "Custom Software & Web Development, Next.js & React Apps, Cloud Infrastructure",
    },
  });

  const vendorUser3 = await prisma.user.upsert({
    where: { email: "ananya@lumindesign.com" },
    update: {},
    create: {
      email: "ananya@lumindesign.com",
      name: "Lumin Creative Studio",
      passwordHash: defaultPassword,
      role: "VENDOR",
      phone: "+91 98450 11223",
    },
  });

  const vendorProfile3 = await prisma.vendorProfile.upsert({
    where: { userId: vendorUser3.id },
    update: {},
    create: {
      userId: vendorUser3.id,
      businessName: "Lumin Design Labs",
      tagline: "Award-winning Product Design & Design Systems",
      description: "Crafting futuristic, high-conversion UI/UX, 3D interaction design, and comprehensive design tokens for top startups.",
      city: "Mumbai",
      state: "Maharashtra",
      country: "India",
      isRemoteAvailable: true,
      experienceYears: 5,
      rating: 4.95,
      reviewCount: 29,
      completedOrders: 44,
      responseRate: 97.0,
      verified: true,
      categoriesProvided: "UI/UX & Brand Design, Product Design, Brand Identity",
    },
  });

  // 4. Categories & Subcategories
  const catHardware = await prisma.category.upsert({
    where: { slug: "enterprise-hardware" },
    update: {},
    create: {
      name: "Enterprise Hardware & Electronics",
      slug: "enterprise-hardware",
      type: "PRODUCT",
      description: "Laptops, workstations, GPU rigs, servers, and enterprise networking equipment.",
      icon: "Cpu",
      subcategories: {
        create: [
          { name: "Laptops & Mobile Workstations", slug: "laptops-workstations" },
          { name: "AI & Deep Learning GPU Servers", slug: "ai-gpu-servers" },
          { name: "Networking & Security Hardware", slug: "networking-hardware" },
        ],
      },
    },
    include: { subcategories: true },
  });

  const catSoftware = await prisma.category.upsert({
    where: { slug: "software-development" },
    update: {},
    create: {
      name: "Custom Software & Web Development",
      slug: "software-development",
      type: "SERVICE",
      description: "Full-stack web applications, mobile platforms, APIs, and cloud architecture.",
      icon: "Code",
      subcategories: {
        create: [
          { name: "Next.js & Modern Web Applications", slug: "nextjs-web-apps" },
          { name: "Cloud Architecture & DevOps", slug: "cloud-devops" },
          { name: "Mobile App Development", slug: "mobile-apps" },
        ],
      },
    },
    include: { subcategories: true },
  });

  const catDesign = await prisma.category.upsert({
    where: { slug: "ui-ux-design" },
    update: {},
    create: {
      name: "UI/UX & Brand Design",
      slug: "ui-ux-design",
      type: "SERVICE",
      description: "User experience research, design systems, interactive prototypes, and branding.",
      icon: "Palette",
      subcategories: {
        create: [
          { name: "Futuristic Web & Mobile UI/UX", slug: "ui-ux-systems" },
          { name: "Brand Identity & Guidelines", slug: "brand-identity" },
        ],
      },
    },
    include: { subcategories: true },
  });

  // 5. Requirements
  // Requirement 1: Products (AI Workstations)
  const subcatLaptop = catHardware.subcategories[0];
  const reqWorkstations = await prisma.requirement.upsert({
    where: { id: "req-workstations-demo" },
    update: {},
    create: {
      id: "req-workstations-demo",
      ownerId: owner1.id,
      type: "PRODUCT",
      title: "10x High-Performance AI Engineering Workstations (64GB RAM, RTX 4080)",
      description: "We are scaling our internal computer vision and LLM research division. Require 10 turnkey developer workstations with minimum 64GB DDR5, RTX 4080 or better GPU, 2TB NVMe SSD, and 3-year onsite enterprise warranty. Fast dispatch to our Bengaluru tech campus required.",
      categoryId: catHardware.id,
      subcategoryId: subcatLaptop?.id,
      quantity: 10,
      minBudget: 1800000,
      maxBudget: 2200000,
      preferredBudget: 2000000,
      currency: "INR",
      requiredDeliveryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // in 14 days
      preferredDeliveryDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      country: "India",
      state: "Karnataka",
      city: "Bengaluru",
      pincode: "560103",
      isRemote: false,
      status: "PUBLISHED",
      specifications: {
        create: [
          { specKey: "Processor", specValue: "Intel Core i9 14th Gen or AMD Ryzen 9", isRequired: true },
          { specKey: "RAM", specValue: "64GB DDR5 5600MHz", isRequired: true },
          { specKey: "GPU", specValue: "NVIDIA RTX 4080 16GB VRAM", isRequired: true },
          { specKey: "Storage", specValue: "2TB PCIe 4.0 NVMe SSD", isRequired: true },
          { specKey: "Warranty", specValue: "3 Years Next Business Day Onsite", isRequired: true },
        ],
      },
    },
    include: { specifications: true },
  });

  // Requirement 2: Service (Next.js Application Development)
  const subcatNext = catSoftware.subcategories[0];
  const reqWebDev = await prisma.requirement.upsert({
    where: { id: "req-webdev-demo" },
    update: {},
    create: {
      id: "req-webdev-demo",
      ownerId: owner2.id,
      type: "SERVICE",
      title: "Futuristic Real-Time Reverse Marketplace Platform (Next.js + Prisma)",
      description: "Looking for an expert development agency to build a high-performance reverse marketplace. Requirements include multi-factor matching engine, private real-time chat, side-by-side offer comparison workspace, and strict role-based access control. Must have proven Next.js & TypeScript production track record.",
      categoryId: catSoftware.id,
      subcategoryId: subcatNext?.id,
      quantity: 1,
      minBudget: 350000,
      maxBudget: 500000,
      preferredBudget: 420000,
      currency: "INR",
      projectStartDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      projectDeadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      expectedDurationDays: 40,
      country: "India",
      state: "Maharashtra",
      city: "Mumbai",
      isRemote: true,
      status: "PUBLISHED",
      specifications: {
        create: [
          { specKey: "Architecture", specValue: "Next.js App Router & TypeScript", isRequired: true },
          { specKey: "Database", specValue: "Prisma ORM with Relational SQL", isRequired: true },
          { specKey: "Design Standard", specValue: "Modern, Futuristic, Dark/Light Themes, WCAG 2.2 AA", isRequired: true },
          { specKey: "Matching Engine", specValue: "Rule-based multi-factor compatibility scoring", isRequired: true },
        ],
      },
    },
    include: { specifications: true },
  });

  // 6. Vendor Offers & Compatibility Scores
  const engine = new MatchingEngine(DEFAULT_WEIGHTS);

  // Offer 1 for Workstations by Nexus
  const offer1 = await prisma.offer.upsert({
    where: {
      requirementId_vendorId: {
        requirementId: reqWorkstations.id,
        vendorId: vendorUser1.id,
      },
    },
    update: {},
    create: {
      requirementId: reqWorkstations.id,
      vendorId: vendorUser1.id,
      vendorProfileId: vendorProfile1.id,
      offeredPrice: 1950000,
      currency: "INR",
      quantity: 10,
      deliveryDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000), // 8 days (faster than required 14 days)
      shippingCost: 0,
      additionalCharges: 0,
      warranty: "3-Year Dell ProSupport Onsite with Keep Your Hard Drive service",
      returnPolicy: "14-day DOA replacement guarantee",
      description: "Direct OEM batch from Dell Technologies. Precision 5860 Tower Workstations equipped with Intel Core i9-14900K, 64GB DDR5, NVIDIA RTX 4080 Super 16GB, and dual 1TB Samsung 990 Pro NVMe SSDs in RAID 0. Hand-delivered and deployed directly to your Bengaluru office.",
      vendorNotes: "Includes complimentary pre-installation of Ubuntu 24.04 LTS with CUDA 12.4 and PyTorch 2.3 toolchain.",
      status: "SHORTLISTED",
      specifications: {
        create: [
          { specKey: "Processor", specValue: "Intel Core i9-14900K" },
          { specKey: "RAM", specValue: "64GB DDR5 5600MHz" },
          { specKey: "GPU", specValue: "NVIDIA RTX 4080 Super 16GB" },
          { specKey: "Storage", specValue: "2TB (2x1TB) Samsung 990 Pro PCIe 4.0 NVMe" },
          { specKey: "Warranty", specValue: "3 Years Dell ProSupport Onsite" },
        ],
      },
    },
    include: { specifications: true },
  });

  // Calculate compatibility for Offer 1
  const comp1 = engine.computeCompatibility(
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
      id: vendorProfile1.id,
      city: vendorProfile1.city,
      state: vendorProfile1.state,
      isRemoteAvailable: vendorProfile1.isRemoteAvailable,
      experienceYears: vendorProfile1.experienceYears,
      rating: vendorProfile1.rating,
      completedOrders: vendorProfile1.completedOrders,
      responseRate: vendorProfile1.responseRate,
      verified: vendorProfile1.verified,
      categoriesProvided: vendorProfile1.categoriesProvided,
    },
    {
      offeredPrice: offer1.offeredPrice,
      deliveryDate: offer1.deliveryDate,
      specifications: offer1.specifications,
    }
  );

  await prisma.compatibilityScore.upsert({
    where: { offerId: offer1.id },
    update: {},
    create: {
      requirementId: reqWorkstations.id,
      offerId: offer1.id,
      vendorProfileId: vendorProfile1.id,
      overallScore: comp1.overallScore,
      budgetScore: comp1.budgetScore,
      relevanceScore: comp1.relevanceScore,
      deliveryScore: comp1.deliveryScore,
      locationScore: comp1.locationScore,
      vendorQualityScore: comp1.vendorQualityScore,
      breakdownJson: JSON.stringify(comp1.breakdown),
    },
  });

  // Shortlist record for Offer 1
  await prisma.shortlist.upsert({
    where: {
      requirementId_offerId: {
        requirementId: reqWorkstations.id,
        offerId: offer1.id,
      },
    },
    update: {},
    create: {
      requirementId: reqWorkstations.id,
      offerId: offer1.id,
      vendorId: vendorProfile1.id,
      ownerId: owner1.id,
      notes: "Top match with local Bengaluru presence and complimentary CUDA setup.",
    },
  });

  // Offer 2 for Web Dev by Zenith
  const offer2 = await prisma.offer.upsert({
    where: {
      requirementId_vendorId: {
        requirementId: reqWebDev.id,
        vendorId: vendorUser2.id,
      },
    },
    update: {},
    create: {
      requirementId: reqWebDev.id,
      vendorId: vendorUser2.id,
      vendorProfileId: vendorProfile2.id,
      offeredPrice: 410000,
      currency: "INR",
      quantity: 1,
      startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      completionDate: new Date(Date.now() + 38 * 24 * 60 * 60 * 1000),
      estimatedDuration: "35 Days",
      deliverables: "Full architecture, multi-factor matching engine, private chat workspace, side-by-side comparison, admin panel, and 100% test coverage.",
      milestonesJson: JSON.stringify([
        { milestone: "Design System & Architecture", days: 7, percentage: 25 },
        { milestone: "Core Reverse Marketplace Flow & Matching Engine", days: 15, percentage: 35 },
        { milestone: "Chat, Comparison Workspace & Notifications", days: 10, percentage: 25 },
        { milestone: "Admin Panel, Testing & Vercel Production Launch", days: 6, percentage: 15 },
      ]),
      description: "Zenith Studio proposes a senior 2-engineer pod. We have built 4 enterprise marketplaces and maintain production Next.js apps handling 100k+ daily queries. Architecture includes Prisma repository isolation and WCAG 2.2 AA compliance.",
      vendorNotes: "Includes 60 days of post-launch hypercare maintenance and bug guarantees.",
      status: "SELECTED",
      specifications: {
        create: [
          { specKey: "Architecture", specValue: "Next.js App Router & TypeScript" },
          { specKey: "Database", specValue: "Prisma ORM with Relational SQL" },
          { specKey: "Design Standard", specValue: "Modern, Futuristic, Dark/Light Themes, WCAG 2.2 AA" },
          { specKey: "Matching Engine", specValue: "Rule-based multi-factor compatibility scoring" },
        ],
      },
    },
    include: { specifications: true },
  });

  // Calculate compatibility for Offer 2
  const comp2 = engine.computeCompatibility(
    {
      type: "SERVICE",
      minBudget: reqWebDev.minBudget,
      maxBudget: reqWebDev.maxBudget,
      preferredBudget: reqWebDev.preferredBudget,
      categoryId: reqWebDev.categoryId,
      categoryName: "Custom Software & Web Development",
      city: reqWebDev.city,
      state: reqWebDev.state,
      isRemote: reqWebDev.isRemote,
      projectDeadline: reqWebDev.projectDeadline,
      specifications: reqWebDev.specifications,
    },
    {
      id: vendorProfile2.id,
      city: vendorProfile2.city,
      state: vendorProfile2.state,
      isRemoteAvailable: vendorProfile2.isRemoteAvailable,
      experienceYears: vendorProfile2.experienceYears,
      rating: vendorProfile2.rating,
      completedOrders: vendorProfile2.completedOrders,
      responseRate: vendorProfile2.responseRate,
      verified: vendorProfile2.verified,
      categoriesProvided: vendorProfile2.categoriesProvided,
    },
    {
      offeredPrice: offer2.offeredPrice,
      completionDate: offer2.completionDate,
      specifications: offer2.specifications,
    }
  );

  await prisma.compatibilityScore.upsert({
    where: { offerId: offer2.id },
    update: {},
    create: {
      requirementId: reqWebDev.id,
      offerId: offer2.id,
      vendorProfileId: vendorProfile2.id,
      overallScore: comp2.overallScore,
      budgetScore: comp2.budgetScore,
      relevanceScore: comp2.relevanceScore,
      deliveryScore: comp2.deliveryScore,
      locationScore: comp2.locationScore,
      vendorQualityScore: comp2.vendorQualityScore,
      breakdownJson: JSON.stringify(comp2.breakdown),
    },
  });

  // Selection for Offer 2
  const selection2 = await prisma.selection.upsert({
    where: { requirementId: reqWebDev.id },
    update: {},
    create: {
      requirementId: reqWebDev.id,
      offerId: offer2.id,
      vendorId: vendorProfile2.id,
      ownerId: owner2.id,
      status: "IN_PROGRESS",
    },
  });

  await prisma.requirement.update({
    where: { id: reqWebDev.id },
    data: { status: "VENDOR_SELECTED" },
  });

  // 7. Chat Conversation
  const conversation = await prisma.conversation.upsert({
    where: {
      requirementId_ownerId_vendorId: {
        requirementId: reqWorkstations.id,
        ownerId: owner1.id,
        vendorId: vendorUser1.id,
      },
    },
    update: {},
    create: {
      requirementId: reqWorkstations.id,
      ownerId: owner1.id,
      vendorId: vendorUser1.id,
      offerId: offer1.id,
    },
  });

  await prisma.message.createMany({
    data: [
      {
        conversationId: conversation.id,
        senderId: owner1.id,
        content: "Hi Nexus team, we reviewed your offer of ₹19,50,000 for the 10 AI workstations. Can you confirm if onsite warranty covers drive replacement without returning our SSDs due to data compliance?",
        isRead: true,
        createdAt: new Date(Date.now() - 3600000 * 5),
      },
      {
        conversationId: conversation.id,
        senderId: vendorUser1.id,
        content: "Hello Rajesh! Yes, absolutely. We have included Dell ProSupport Plus with 'Keep Your Hard Drive' warranty. In any failure event, Dell replaces the drive and you retain the damaged disk on-premises.",
        isRead: true,
        createdAt: new Date(Date.now() - 3600000 * 3),
      },
      {
        conversationId: conversation.id,
        senderId: owner1.id,
        content: "Outstanding. I have added your offer to my shortlist. We are doing a final review this afternoon with the finance committee.",
        isRead: false,
        createdAt: new Date(Date.now() - 3600000),
      },
    ],
  });

  // 8. Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: owner1.id,
        type: "OFFER_RECEIVED",
        title: "New High-Match Offer Received (94%)",
        message: "Nexus Enterprise Systems submitted an offer of ₹19,50,000 for your AI Workstations requirement.",
        linkUrl: `/requirements/${reqWorkstations.id}`,
      },
      {
        userId: vendorUser1.id,
        type: "OFFER_SHORTLISTED",
        title: "Your Offer Was Shortlisted!",
        message: "Rajesh Sharma added your offer for 10x AI Engineering Workstations to their shortlist.",
        linkUrl: `/offers/${offer1.id}`,
      },
      {
        userId: vendorUser2.id,
        type: "OFFER_SELECTED",
        title: "Congratulations! You Were Selected",
        message: "Priya Patel selected your offer for the Reverse Marketplace Platform project.",
        linkUrl: `/requirements/${reqWebDev.id}`,
      },
    ],
  });

  console.log("Database successfully seeded with realistic ReverseMarket data!");
  return { success: true };
}
