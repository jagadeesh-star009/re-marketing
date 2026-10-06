/**
 * Extended seed: 5-6 new demands, 7-8 new vendors, offers, compatibility scores
 * Uses free online placeholder images (ui-avatars, picsum)
 */
import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function avatar(name: string, bg: string = "0f172a", color: string = "00ff9d") {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${bg}&color=${color}&size=200&bold=true&font-size=0.4`;
}

function banner(seed: number) {
  return `https://picsum.photos/seed/${seed}/1200/400`;
}

async function main() {
  console.log("🌱 Extended seed: vendors, demands, offers...\n");
  const pw = await bcrypt.hash("Password123!", 12);

  // ── Get existing categories ──────────────────────────────────────────────
  const catHardware = await prisma.category.findUnique({ where: { slug: "enterprise-hardware" }, include: { subcategories: true } });
  const catSoftware = await prisma.category.findUnique({ where: { slug: "software-development" }, include: { subcategories: true } });
  const catDesign   = await prisma.category.findUnique({ where: { slug: "ui-ux-design" }, include: { subcategories: true } });

  if (!catHardware || !catSoftware || !catDesign) {
    console.error("❌ Base categories missing. Run seed-postgres.ts first."); process.exit(1);
  }

  // ── Extra Categories ─────────────────────────────────────────────────────
  const catCyber = await prisma.category.upsert({
    where: { slug: "cybersecurity" }, update: {},
    create: { name: "Cybersecurity & Compliance", slug: "cybersecurity", description: "Security audits, penetration testing, and compliance services", type: "SERVICE", icon: "🔒" },
  });
  const catNetwork = await prisma.category.upsert({
    where: { slug: "networking-infra" }, update: {},
    create: { name: "Networking & Infrastructure", slug: "networking-infra", description: "Network switches, firewalls, routers, structured cabling", type: "PRODUCT", icon: "🌐" },
  });
  const catCloud = await prisma.category.upsert({
    where: { slug: "cloud-services" }, update: {},
    create: { name: "Cloud & DevOps Services", slug: "cloud-services", description: "Cloud architecture, DevOps pipelines, SRE services", type: "SERVICE", icon: "☁️" },
  });
  console.log("✅ Extra categories");

  // ── NEW REQUIREMENT OWNERS ───────────────────────────────────────────────
  const ownerA = await prisma.user.upsert({
    where: { email: "cto@globaledge.com" }, update: {},
    create: {
      email: "cto@globaledge.com", name: "Rohit Kapoor", passwordHash: pw, role: "REQUIREMENT_OWNER", phone: "+91 98112 30045",
      userProfile: { create: { companyName: "GlobalEdge Corp", city: "Delhi", state: "Delhi", country: "India" } },
    },
  });
  const ownerB = await prisma.user.upsert({
    where: { email: "it@retailnow.in" }, update: {},
    create: {
      email: "it@retailnow.in", name: "Sneha Iyer", passwordHash: pw, role: "REQUIREMENT_OWNER", phone: "+91 77012 44556",
      userProfile: { create: { companyName: "RetailNow Pvt Ltd", city: "Chennai", state: "Tamil Nadu", country: "India" } },
    },
  });
  const ownerC = await prisma.user.upsert({
    where: { email: "director@securebank.io" }, update: {},
    create: {
      email: "director@securebank.io", name: "Vikram Nair", passwordHash: pw, role: "REQUIREMENT_OWNER", phone: "+91 91055 78901",
      userProfile: { create: { companyName: "SecureBank Systems", city: "Mumbai", state: "Maharashtra", country: "India" } },
    },
  });
  console.log("✅ Requirement owners (3 new)");

  // ── 7 NEW VENDORS ────────────────────────────────────────────────────────
  const vendors: any[] = [];

  const vDefs = [
    {
      email: "sales@technova-it.com", name: "TechNova IT Solutions", pw,
      profile: {
        businessName: "TechNova IT Solutions",
        tagline: "Pan-India Authorised Laptop & Desktop Reseller",
        description: "Tier-1 distributor for Lenovo, HP, and Acer commercial devices. Serving 200+ enterprises across India with volume pricing, AMC, and same-day imaging services.",
        city: "Delhi", state: "Delhi", experienceYears: 9, rating: 4.7, reviewCount: 63, completedOrders: 178, responseRate: 96.4, verified: true,
        serviceRadiusKm: 2000, isRemoteAvailable: true,
        logoUrl: avatar("TechNova IT", "1e3a5c", "60a5fa"),
        categoriesProvided: "Enterprise Hardware & Electronics",
      },
      catId: catHardware.id,
      tags: ["Laptops", "Desktops", "Lenovo", "HP", "Acer", "Bulk Supply"],
    },
    {
      email: "hello@cloudbridge.dev", name: "CloudBridge Systems", pw,
      profile: {
        businessName: "CloudBridge Systems",
        tagline: "AWS Premier Partner — Cloud-Native Engineering",
        description: "AWS Premier Consulting Partner with 50+ certified engineers. Specialises in cloud migrations, Kubernetes orchestration, and cost-optimised infrastructure for Series B+ startups.",
        city: "Bengaluru", state: "Karnataka", experienceYears: 8, rating: 4.88, reviewCount: 44, completedOrders: 102, responseRate: 99.1, verified: true,
        serviceRadiusKm: 0, isRemoteAvailable: true,
        logoUrl: avatar("CloudBridge", "0c1a2e", "38bdf8"),
        categoriesProvided: "Cloud & DevOps Services, Software Development",
      },
      catId: catCloud.id,
      tags: ["AWS", "Kubernetes", "Terraform", "CI/CD", "EKS", "RDS", "CloudFront"],
    },
    {
      email: "team@secureedge.tech", name: "SecureEdge Technologies", pw,
      profile: {
        businessName: "SecureEdge Technologies",
        tagline: "CERT-In Empanelled Cybersecurity & Pen-Testing Firm",
        description: "CERT-In empanelled cybersecurity firm providing VAPT, SOC-as-a-Service, ISO 27001 implementation, and red team exercises. Served 80+ BFSI and fintech clients.",
        city: "Mumbai", state: "Maharashtra", experienceYears: 11, rating: 4.92, reviewCount: 38, completedOrders: 74, responseRate: 98.7, verified: true,
        serviceRadiusKm: 0, isRemoteAvailable: true,
        logoUrl: avatar("SecureEdge", "1a0a0a", "f43f5e"),
        categoriesProvided: "Cybersecurity & Compliance",
      },
      catId: catCyber.id,
      tags: ["VAPT", "SOC", "ISO 27001", "Pen Testing", "CERT-In", "BFSI"],
    },
    {
      email: "bd@agileforge.io", name: "AgileForge Digital", pw,
      profile: {
        businessName: "AgileForge Digital",
        tagline: "Full-Stack Product Engineering & SaaS Development",
        description: "Full-stack product engineering studio. Built 30+ SaaS products from 0 to 1 for funded startups. Strong in React, Node.js, Python (FastAPI), and PostgreSQL. Dedicated Scrum teams.",
        city: "Chennai", state: "Tamil Nadu", experienceYears: 6, rating: 4.82, reviewCount: 29, completedOrders: 58, responseRate: 97.2, verified: true,
        serviceRadiusKm: 0, isRemoteAvailable: true,
        logoUrl: avatar("AgileForge", "0f2027", "a78bfa"),
        categoriesProvided: "Software Development, Cloud & DevOps Services",
      },
      catId: catSoftware.id,
      tags: ["React", "Node.js", "Python", "FastAPI", "PostgreSQL", "SaaS"],
    },
    {
      email: "ops@netstream.in", name: "NetStream Infrastructure", pw,
      profile: {
        businessName: "NetStream Infrastructure Pvt Ltd",
        tagline: "Cisco Gold Partner — Enterprise Networking & Security",
        description: "Cisco Gold Certified Partner. Specialists in enterprise LAN/WAN, SD-WAN, Fortinet firewalls, structured cabling, and full data-centre build-outs. 150+ network deployments.",
        city: "Pune", state: "Maharashtra", experienceYears: 13, rating: 4.85, reviewCount: 56, completedOrders: 147, responseRate: 98.0, verified: true,
        serviceRadiusKm: 800, isRemoteAvailable: false,
        logoUrl: avatar("NetStream", "061020", "22d3ee"),
        categoriesProvided: "Networking & Infrastructure, Enterprise Hardware & Electronics",
      },
      catId: catNetwork.id,
      tags: ["Cisco", "Fortinet", "SD-WAN", "Firewall", "Switches", "Structured Cabling"],
    },
    {
      email: "studio@prismui.design", name: "PrismUI Studio", pw,
      profile: {
        businessName: "PrismUI Studio",
        tagline: "Figma Design Systems & SaaS UI/UX Specialists",
        description: "Premium design studio for enterprise SaaS. Delivered 40+ design systems, 80+ product UI overhauls. Strong in Figma design tokens, accessibility-first components, and Lottie animations.",
        city: "Hyderabad", state: "Telangana", experienceYears: 5, rating: 4.93, reviewCount: 31, completedOrders: 67, responseRate: 99.5, verified: true,
        serviceRadiusKm: 0, isRemoteAvailable: true,
        logoUrl: avatar("PrismUI", "1a0533", "e879f9"),
        categoriesProvided: "UI/UX & Product Design",
      },
      catId: catDesign.id,
      tags: ["Figma", "Design System", "SaaS UI", "Lottie", "Accessibility", "Tokens"],
    },
    {
      email: "cloud@greencloud.solutions", name: "GreenCloud Solutions", pw,
      profile: {
        businessName: "GreenCloud Solutions",
        tagline: "Azure & GCP Cloud Architecture & Migration Partner",
        description: "Microsoft Azure Gold Partner & Google Cloud Premier Partner. Expert in enterprise cloud migrations, hybrid cloud, and FinOps cost optimisation. Serving 60+ enterprise clients.",
        city: "Gurgaon", state: "Haryana", experienceYears: 7, rating: 4.76, reviewCount: 40, completedOrders: 88, responseRate: 97.8, verified: true,
        serviceRadiusKm: 0, isRemoteAvailable: true,
        logoUrl: avatar("GreenCloud", "052e16", "4ade80"),
        categoriesProvided: "Cloud & DevOps Services",
      },
      catId: catCloud.id,
      tags: ["Azure", "GCP", "Cloud Migration", "FinOps", "Kubernetes", "Hybrid Cloud"],
    },
  ];

  for (const v of vDefs) {
    const user = await prisma.user.upsert({
      where: { email: v.email }, update: {},
      create: { email: v.email, name: v.name, passwordHash: v.pw, role: "VENDOR" },
    });
    const profile = await prisma.vendorProfile.upsert({
      where: { userId: user.id }, update: {},
      create: { userId: user.id, ...v.profile, country: "India", pincode: undefined },
    });
    await prisma.vendorCapability.upsert({
      where: { id: `xcap-${profile.id}` }, update: {},
      create: {
        id: `xcap-${profile.id}`, vendorId: profile.id, categoryId: v.catId,
        experienceYears: v.profile.experienceYears,
        tags: JSON.stringify(v.tags),
      },
    });
    vendors.push({ user, profile, catId: v.catId });
    process.stdout.write(`  ✔ ${v.profile.businessName}\n`);
  }
  console.log("✅ 7 new vendors with capabilities\n");

  // ── 5 NEW REQUIREMENTS ───────────────────────────────────────────────────
  const existingOwner = await prisma.user.findUnique({ where: { email: "owner@apextech.com" } });
  const existingOwner2 = await prisma.user.findUnique({ where: { email: "cto@quantumleap.io" } });

  const reqs: any[] = [];

  const req4 = await prisma.requirement.upsert({
    where: { id: "req-laptops-remote" }, update: {},
    create: {
      id: "req-laptops-remote",
      ownerId: ownerA.id, type: "PRODUCT",
      title: "100x Corporate Laptops for Remote Workforce Deployment",
      description: "GlobalEdge Corp is expanding its remote workforce to 100 new employees across 8 cities. Require business-grade laptops with pre-loaded Windows 11 Pro, MS Office, and our MDM profile. Centralised imaging and individual courier delivery to employee addresses required.",
      categoryId: catHardware.id, quantity: 100,
      minBudget: 5500000, maxBudget: 7800000, preferredBudget: 6500000, currency: "INR",
      requiredDeliveryDate: new Date("2026-11-30"),
      country: "India", state: "Delhi", city: "Delhi", isRemote: false, status: "PUBLISHED",
      specifications: { create: [
        { specKey: "Model", specValue: "Lenovo ThinkPad E14 Gen 5 or equivalent", isRequired: true },
        { specKey: "Processor", specValue: "Intel Core i5-1335U or AMD Ryzen 5 7530U", isRequired: true },
        { specKey: "RAM", specValue: "16GB DDR4/DDR5", isRequired: true },
        { specKey: "Storage", specValue: "512GB NVMe SSD", isRequired: true },
        { specKey: "OS", specValue: "Windows 11 Pro (pre-activated)", isRequired: true },
        { specKey: "Warranty", specValue: "3-Year On-Site Warranty", isRequired: true },
        { specKey: "Delivery", specValue: "Individual delivery to 8 cities", isRequired: false },
      ]},
    }, include: { specifications: true },
  });
  reqs.push(req4);

  const req5 = await prisma.requirement.upsert({
    where: { id: "req-cyber-audit" }, update: {},
    create: {
      id: "req-cyber-audit",
      ownerId: ownerC.id, type: "SERVICE",
      title: "Enterprise Cybersecurity VAPT & ISO 27001 Compliance Audit",
      description: "SecureBank Systems requires a comprehensive security audit covering VAPT (web, API, mobile, network), red team exercise, and full ISO 27001:2022 gap analysis with remediation roadmap. Must be CERT-In empanelled.",
      categoryId: catCyber.id, quantity: 1,
      minBudget: 800000, maxBudget: 1600000, preferredBudget: 1200000, currency: "INR",
      projectStartDate: new Date("2026-11-10"),
      projectDeadline: new Date("2027-01-31"),
      expectedDurationDays: 82,
      country: "India", state: "Maharashtra", city: "Mumbai", isRemote: true, status: "PUBLISHED",
      specifications: { create: [
        { specKey: "Scope", specValue: "Web apps (6), Mobile apps (2), APIs (15+), Internal network", isRequired: true },
        { specKey: "Compliance", specValue: "ISO 27001:2022 full gap analysis + implementation roadmap", isRequired: true },
        { specKey: "Certification", specValue: "CERT-In empanelled firm mandatory", isRequired: true },
        { specKey: "Red Team", specValue: "2-week adversarial simulation exercise", isRequired: false },
        { specKey: "Deliverable", specValue: "Executive report + Technical findings + Remediation plan", isRequired: true },
      ]},
    }, include: { specifications: true },
  });
  reqs.push(req5);

  const req6 = await prisma.requirement.upsert({
    where: { id: "req-ecommerce-b2b" }, update: {},
    create: {
      id: "req-ecommerce-b2b",
      ownerId: ownerB.id, type: "SERVICE",
      title: "B2B E-Commerce Platform — Multi-Vendor Marketplace Development",
      description: "RetailNow Pvt Ltd requires a full-featured B2B multi-vendor marketplace with vendor onboarding, bulk ordering, GST invoicing, and an integrated logistics management system. Platform must support 10,000+ SKUs and 500 concurrent buyers.",
      categoryId: catSoftware.id, quantity: 1,
      minBudget: 2200000, maxBudget: 3500000, preferredBudget: 2800000, currency: "INR",
      projectStartDate: new Date("2026-12-01"),
      projectDeadline: new Date("2027-06-01"),
      expectedDurationDays: 182,
      country: "India", state: "Tamil Nadu", city: "Chennai", isRemote: true, status: "PUBLISHED",
      specifications: { create: [
        { specKey: "Stack", specValue: "Next.js 15, PostgreSQL, Redis, Elasticsearch", isRequired: true },
        { specKey: "Vendors", specValue: "Multi-vendor portal (500+ vendor accounts)", isRequired: true },
        { specKey: "SKUs", specValue: "10,000+ product catalogue with bulk upload", isRequired: true },
        { specKey: "Payments", specValue: "Razorpay + Bank Transfer + Credit Line integration", isRequired: true },
        { specKey: "GST", specValue: "Automated GST invoice generation & filing export", isRequired: true },
        { specKey: "Logistics", specValue: "Delhivery + Blue Dart + Shiprocket integration", isRequired: false },
      ]},
    }, include: { specifications: true },
  });
  reqs.push(req6);

  const req7 = await prisma.requirement.upsert({
    where: { id: "req-network-infra" }, update: {},
    create: {
      id: "req-network-infra",
      ownerId: existingOwner?.id || ownerA.id, type: "PRODUCT",
      title: "Enterprise Network Infrastructure — 3 Office Locations",
      description: "Apex Technologies is upgrading network infrastructure across 3 offices (Mumbai HQ, Bengaluru, Hyderabad). Requires core switches, distribution switches, Fortinet firewalls, wireless APs, and full structured cabling with 5-year support contract.",
      categoryId: catNetwork.id, quantity: 1,
      minBudget: 1800000, maxBudget: 2900000, preferredBudget: 2400000, currency: "INR",
      requiredDeliveryDate: new Date("2026-12-20"),
      country: "India", city: "Mumbai", state: "Maharashtra", isRemote: false, status: "PUBLISHED",
      specifications: { create: [
        { specKey: "Core Switch", specValue: "Cisco Catalyst 9300 Series (3x, one per office)", isRequired: true },
        { specKey: "Distribution", specValue: "Cisco Catalyst 9200L (9x PoE switches)", isRequired: true },
        { specKey: "Firewall", specValue: "Fortinet FortiGate 200F or equivalent", isRequired: true },
        { specKey: "Wireless", specValue: "Cisco Catalyst Wi-Fi 6E APs (60 units total)", isRequired: true },
        { specKey: "Support", specValue: "5-Year SmartNet or equivalent SLA", isRequired: true },
        { specKey: "Installation", specValue: "Full turnkey installation & structured cabling", isRequired: true },
      ]},
    }, include: { specifications: true },
  });
  reqs.push(req7);

  const req8 = await prisma.requirement.upsert({
    where: { id: "req-cloud-migration" }, update: {},
    create: {
      id: "req-cloud-migration",
      ownerId: existingOwner2?.id || ownerC.id, type: "SERVICE",
      title: "On-Premise to AWS Cloud Migration — 40+ Workloads",
      description: "QuantumLeap Fintech needs to migrate 40+ on-premise workloads to AWS. Includes lift-and-shift, re-platforming (RDS, EKS), WAF setup, CloudFront CDN, DR strategy, and 6 months post-migration managed services.",
      categoryId: catCloud.id, quantity: 1,
      minBudget: 1500000, maxBudget: 2600000, preferredBudget: 2000000, currency: "INR",
      projectStartDate: new Date("2026-11-15"),
      projectDeadline: new Date("2027-03-15"),
      expectedDurationDays: 120,
      country: "India", state: "Karnataka", city: "Bengaluru", isRemote: true, status: "PUBLISHED",
      specifications: { create: [
        { specKey: "Workloads", specValue: "40+ servers — mix of Linux & Windows", isRequired: true },
        { specKey: "Target", specValue: "AWS (Mumbai ap-south-1 region, HA across 2 AZs)", isRequired: true },
        { specKey: "Database", specValue: "Oracle → Aurora PostgreSQL migration included", isRequired: true },
        { specKey: "Certifications", specValue: "AWS Migration Competency or Premier Partner", isRequired: true },
        { specKey: "Post-Migration", specValue: "6 months managed services & cost optimisation", isRequired: false },
      ]},
    }, include: { specifications: true },
  });
  reqs.push(req8);

  const req9 = await prisma.requirement.upsert({
    where: { id: "req-hr-lms-platform" }, update: {},
    create: {
      id: "req-hr-lms-platform",
      ownerId: ownerA.id, type: "SERVICE",
      title: "Corporate HR Portal & Learning Management System (LMS)",
      description: "GlobalEdge Corp requires an integrated HR management platform with attendance, leave, payroll, and a full LMS with video courses, assessments, certifications, and gamified learning paths for 1,200 employees.",
      categoryId: catSoftware.id, quantity: 1,
      minBudget: 1200000, maxBudget: 2000000, preferredBudget: 1600000, currency: "INR",
      projectStartDate: new Date("2026-12-01"),
      projectDeadline: new Date("2027-05-01"),
      expectedDurationDays: 150,
      country: "India", state: "Delhi", city: "Delhi", isRemote: true, status: "PUBLISHED",
      specifications: { create: [
        { specKey: "Users", specValue: "1,200 employees (scalable to 5,000)", isRequired: true },
        { specKey: "HR Modules", specValue: "Attendance, Leave, Payroll, Appraisal, Onboarding", isRequired: true },
        { specKey: "LMS", specValue: "Video courses, SCORM, assessments, certifications", isRequired: true },
        { specKey: "Integrations", specValue: "Slack, Google Workspace, Biometric systems", isRequired: false },
        { specKey: "Mobile", specValue: "Responsive web + Android/iOS apps", isRequired: true },
      ]},
    }, include: { specifications: true },
  });
  reqs.push(req9);

  console.log(`✅ ${reqs.length} new requirements\n`);

  // ── OFFERS ────────────────────────────────────────────────────────────────
  // Map vendors by email for easy lookup
  const vMap: Record<string, any> = {};
  for (const v of vDefs) {
    const u = await prisma.user.findUnique({ where: { email: v.email } });
    const p = await prisma.vendorProfile.findUnique({ where: { userId: u!.id } });
    vMap[v.email] = { user: u, profile: p };
  }
  // Also get existing vendors
  const nexusUser = await prisma.user.findUnique({ where: { email: "sales@nexushardware.com" } });
  const nexusProfile = nexusUser ? await prisma.vendorProfile.findUnique({ where: { userId: nexusUser.id } }) : null;
  const devCraftUser = await prisma.user.findUnique({ where: { email: "projects@devcraft.studio" } });
  const devCraftProfile = devCraftUser ? await prisma.vendorProfile.findUnique({ where: { userId: devCraftUser.id } }) : null;
  const hyperUser = await prisma.user.findUnique({ where: { email: "sales@hypercore.in" } });
  const hyperProfile = hyperUser ? await prisma.vendorProfile.findUnique({ where: { userId: hyperUser.id } }) : null;

  const offerDefs = [
    // req4: Laptops — TechNova + Nexus both bid
    {
      reqId: req4.id, vendorUserId: vMap["sales@technova-it.com"].user.id, vendorProfileId: vMap["sales@technova-it.com"].profile.id,
      price: 6350000, deliveryDate: new Date("2026-11-25"), warranty: "3-Year Lenovo Premier On-Site", returnPolicy: "14-Day DOA Policy",
      description: "Supplying 100x Lenovo ThinkPad E14 Gen 5 (i5-1335U, 16GB DDR5, 512GB NVMe). Includes centralized imaging with your MDM profile, asset tagging, and individual courier delivery across 8 cities via BlueDart. Dedicated account manager assigned.",
      specs: [
        { specKey: "Model", specValue: "Lenovo ThinkPad E14 Gen 5 (21JR)" },
        { specKey: "CPU", specValue: "Intel Core i5-1335U (10-core, 4.6GHz)" },
        { specKey: "Display", specValue: "14\" IPS FHD 300-nit, Anti-glare" },
        { specKey: "Battery", specValue: "57Whr — up to 13hrs" },
        { specKey: "Weight", specValue: "1.57 kg" },
      ],
      budget: 89, relevance: 95, deliveryScore: 91, location: 80, quality: 92,
    },
    {
      reqId: req4.id, vendorUserId: nexusUser!.id, vendorProfileId: nexusProfile!.id,
      price: 6820000, deliveryDate: new Date("2026-11-28"), warranty: "3-Year HP Care Pack On-Site", returnPolicy: "30-Day DOA",
      description: "HP EliteBook 845 G11 with AMD Ryzen 5 Pro 8540U — the best-in-class business laptop for corporate fleets. HP Authorized reseller. Includes HP Device-as-a-Service portal access and free replacement unit during warranty claims.",
      specs: [
        { specKey: "Model", specValue: "HP EliteBook 845 G11" },
        { specKey: "CPU", specValue: "AMD Ryzen 5 Pro 8540U (6-core)" },
        { specKey: "Security", specValue: "HP Wolf Security + TPM 2.0 + IR Webcam" },
        { specKey: "Display", specValue: "14\" WUXGA IPS 400-nit Sure View" },
        { specKey: "Certifications", specValue: "MIL-STD-810H Certified" },
      ],
      budget: 82, relevance: 91, deliveryScore: 85, location: 78, quality: 95,
    },
    // req5: Cyber audit — SecureEdge
    {
      reqId: req5.id, vendorUserId: vMap["team@secureedge.tech"].user.id, vendorProfileId: vMap["team@secureedge.tech"].profile.id,
      price: 1180000, warranty: "12-Month Re-test SLA Included", returnPolicy: "N/A",
      startDate: new Date("2026-11-12"), completionDate: new Date("2027-01-28"),
      description: "CERT-In empanelled firm. Full VAPT covering all 6 web apps, 2 mobile apps, 15+ APIs, and internal network. Includes 2-week red team exercise. ISO 27001:2022 gap analysis with 90-day remediation roadmap. Executive board presentation included at no extra cost.",
      specs: [
        { specKey: "Team", specValue: "CISSP Lead + 3 Certified Ethical Hackers (CEH)" },
        { specKey: "Tools", specValue: "Burp Suite Pro, Nessus, Metasploit, OWASP ZAP" },
        { specKey: "Reports", specValue: "Executive Summary + Technical CVSS-scored findings" },
        { specKey: "ISO Gap", specValue: "114 controls assessed (Annex A, ISO 27001:2022)" },
      ],
      budget: 92, relevance: 98, deliveryScore: 95, location: 100, quality: 97,
    },
    // req6: B2B Ecommerce — AgileForge + DevCraft
    {
      reqId: req6.id, vendorUserId: vMap["bd@agileforge.io"].user.id, vendorProfileId: vMap["bd@agileforge.io"].profile.id,
      price: 2720000, warranty: "6-Month Bug-Fix Warranty Post-Launch", returnPolicy: "N/A",
      startDate: new Date("2026-12-05"), completionDate: new Date("2027-05-28"),
      description: "End-to-end B2B marketplace with multi-vendor portal, bulk ordering, GST invoicing, and logistics integrations. Built on Next.js 15 + Postgres + Redis + Elasticsearch. Dedicated Scrum team of 5 with weekly demos. Proven track record — built IndiaKart B2B platform (current 8,000 vendors).",
      specs: [
        { specKey: "Team", specValue: "5 FTE — 2 FullStack, 1 DevOps, 1 QA, 1 PM" },
        { specKey: "Architecture", specValue: "Microservices + Event-driven (Kafka)" },
        { specKey: "Search", specValue: "Elasticsearch with faceted product search" },
        { specKey: "Performance", specValue: "< 1.5s LCP, 500 concurrent sessions tested" },
      ],
      budget: 93, relevance: 96, deliveryScore: 88, location: 100, quality: 90,
    },
    {
      reqId: req6.id, vendorUserId: devCraftUser!.id, vendorProfileId: devCraftProfile!.id,
      price: 2950000, warranty: "12-Month Support & Maintenance", returnPolicy: "N/A",
      startDate: new Date("2026-12-01"), completionDate: new Date("2027-05-20"),
      description: "Premium B2B marketplace with dedicated UX phase, design system, and full-stack implementation. Includes 12-month post-launch support. DevCraft has delivered 3 similar B2B platforms with combined GMV of ₹200Cr+.",
      specs: [
        { specKey: "Team", specValue: "6 FTE — 3 FullStack, 1 UX, 1 DevOps, 1 BA" },
        { specKey: "Design", specValue: "Figma design system included (no extra cost)" },
        { specKey: "Infra", specValue: "AWS ECS Fargate + CloudFront + ElastiCache" },
        { specKey: "Support", specValue: "12-month post-launch SLA — 99.9% uptime" },
      ],
      budget: 86, relevance: 94, deliveryScore: 92, location: 100, quality: 94,
    },
    // req7: Network infra — NetStream
    {
      reqId: req7.id, vendorUserId: vMap["ops@netstream.in"].user.id, vendorProfileId: vMap["ops@netstream.in"].profile.id,
      price: 2350000, deliveryDate: new Date("2026-12-15"), warranty: "5-Year Cisco SmartNet + 2-Year Onsite Labour", returnPolicy: "DOA within 7 days",
      description: "Complete turnkey network upgrade across 3 offices. Cisco Gold Partner — all hardware at authorized pricing. Includes structured cabling (Cat6A), core/distribution switches, FortiGate firewalls, Cisco Wi-Fi 6E APs, and full commissioning. Single throat to choke across all 3 sites.",
      specs: [
        { specKey: "Core", specValue: "3x Cisco Catalyst 9300-48P (StackWise)" },
        { specKey: "Dist", specValue: "9x Cisco Catalyst 9200L-24P" },
        { specKey: "Firewall", specValue: "Fortinet FortiGate 200F (HA pair each office)" },
        { specKey: "Wireless", specValue: "60x Cisco C9136I Wi-Fi 6E APs" },
        { specKey: "Cabling", specValue: "Cat6A + fibre backbone, OFC patch panels" },
      ],
      budget: 91, relevance: 97, deliveryScore: 96, location: 88, quality: 94,
    },
    // req8: Cloud migration — CloudBridge + GreenCloud
    {
      reqId: req8.id, vendorUserId: vMap["hello@cloudbridge.dev"].user.id, vendorProfileId: vMap["hello@cloudbridge.dev"].profile.id,
      price: 1950000, warranty: "6-Month Post-Migration Managed Services", returnPolicy: "N/A",
      startDate: new Date("2026-11-18"), completionDate: new Date("2027-03-10"),
      description: "AWS Premier Partner with AWS Migration Competency. Migrating 40+ workloads using the 7R framework. Includes Oracle to Aurora PostgreSQL migration, EKS containerisation, WAF + Shield setup, CloudFront, and DR with RTO<4h. 6 months managed services included.",
      specs: [
        { specKey: "Partner", specValue: "AWS Premier Partner — Migration Competency" },
        { specKey: "Approach", specValue: "7R framework — Rehost, Replatform, Refactor" },
        { specKey: "Database", specValue: "Oracle 19c → Aurora PostgreSQL via SCT + DMS" },
        { specKey: "Team", specValue: "AWS Certified Solutions Architect lead + 4 engineers" },
        { specKey: "DR", specValue: "Cross-region DR — RTO < 4hrs, RPO < 1hr" },
      ],
      budget: 94, relevance: 98, deliveryScore: 90, location: 100, quality: 96,
    },
    {
      reqId: req8.id, vendorUserId: vMap["cloud@greencloud.solutions"].user.id, vendorProfileId: vMap["cloud@greencloud.solutions"].profile.id,
      price: 2100000, warranty: "8-Month Post-Migration Managed Services + FinOps", returnPolicy: "N/A",
      startDate: new Date("2026-11-20"), completionDate: new Date("2027-03-18"),
      description: "Hybrid cloud approach — workloads split between AWS (primary) and Azure (DR), giving true vendor independence. Includes FinOps dashboard, Reserved Instance recommendations (projected 35% cost savings year 1). Microsoft Gold + Google Cloud Premier Partner.",
      specs: [
        { specKey: "Strategy", specValue: "Multi-cloud: AWS primary + Azure DR" },
        { specKey: "FinOps", specValue: "Cost dashboard + RI/SP recommendations (35% savings)" },
        { specKey: "Team", specValue: "6 certified cloud architects" },
        { specKey: "Governance", specValue: "Landing Zone + CloudGuard CSPM included" },
      ],
      budget: 88, relevance: 94, deliveryScore: 87, location: 100, quality: 93,
    },
    // req9: HR+LMS — AgileForge
    {
      reqId: req9.id, vendorUserId: vMap["bd@agileforge.io"].user.id, vendorProfileId: vMap["bd@agileforge.io"].profile.id,
      price: 1550000, warranty: "6-Month Bug-Fix + 1-Year Feature Updates", returnPolicy: "N/A",
      startDate: new Date("2026-12-05"), completionDate: new Date("2027-04-28"),
      description: "Integrated HR + LMS platform built on React + Node.js + PostgreSQL. Covers all 5 HR modules + full LMS with SCORM 1.2/2004 support, video streaming, AI-powered learning paths, and gamification. Android/iOS apps included. Successfully delivered similar platform for 1,800-employee organisation.",
      specs: [
        { specKey: "HR Modules", specValue: "Attendance (biometric), Leave, Payroll, Appraisal, Onboarding" },
        { specKey: "LMS", specValue: "SCORM 1.2/2004, Video HLS streaming, AI learning paths" },
        { specKey: "Apps", specValue: "React Native iOS + Android (included)" },
        { specKey: "Gamification", specValue: "Points, badges, leaderboards, certificates" },
        { specKey: "Integrations", specValue: "Slack, Google Workspace, BioMax biometric" },
      ],
      budget: 93, relevance: 96, deliveryScore: 91, location: 100, quality: 89,
    },
    // Also add HyperCore offering on laptops req
    {
      reqId: req4.id, vendorUserId: hyperUser!.id, vendorProfileId: hyperProfile!.id,
      price: 5980000, deliveryDate: new Date("2026-11-22"), warranty: "3-Year HyperCore Premium On-Site", returnPolicy: "21-Day DOA",
      description: "Custom-configured HP ZBook Power G11 workstation-laptops for power users. Spec-for-spec the most powerful option — ideal if remote team includes data scientists or designers. 5% faster SSD throughput vs standard SKUs. Optional upgrade to 32GB RAM at ₹48,000 extra.",
      specs: [
        { specKey: "Model", specValue: "HP ZBook Power G11 15.6\"" },
        { specKey: "CPU", specValue: "AMD Ryzen 7 Pro 8845HS (8-core, 5.1GHz)" },
        { specKey: "GPU", specValue: "NVIDIA RTX 2000 Ada 8GB (optional)" },
        { specKey: "RAM", specValue: "16GB DDR5 5600MHz (upgradeable)" },
        { specKey: "Storage", specValue: "512GB Samsung 990 Pro NVMe" },
      ],
      budget: 96, relevance: 88, deliveryScore: 97, location: 82, quality: 91,
    },
  ];

  let offerCount = 0;
  for (const o of offerDefs) {
    try {
      const offer = await prisma.offer.upsert({
        where: { requirementId_vendorId: { requirementId: o.reqId, vendorId: o.vendorUserId } },
        update: {
          offeredPrice: o.price,
          status: "SUBMITTED",
          deliveryDate: (o as any).deliveryDate || null,
          startDate: (o as any).startDate || null,
          completionDate: (o as any).completionDate || null,
          warranty: o.warranty,
          returnPolicy: o.returnPolicy || "N/A",
          description: o.description,
        },
        create: {
          requirementId: o.reqId, vendorId: o.vendorUserId, vendorProfileId: o.vendorProfileId,
          offeredPrice: o.price, currency: "INR", quantity: 1,
          deliveryDate: (o as any).deliveryDate || null,
          startDate: (o as any).startDate || null,
          completionDate: (o as any).completionDate || null,
          shippingCost: 0, additionalCharges: 0,
          warranty: o.warranty, returnPolicy: o.returnPolicy || "N/A",
          description: o.description,
          status: "SUBMITTED",
          specifications: { create: o.specs.map((s) => ({ specKey: s.specKey, specValue: s.specValue })) },
        },
        include: { specifications: true },
      });

      // Compatibility score
      const overall = o.budget * 0.30 + o.relevance * 0.30 + o.deliveryScore * 0.20 + o.location * 0.10 + o.quality * 0.10;
      await prisma.compatibilityScore.upsert({
        where: { offerId: offer.id },
        update: {
          overallScore: overall,
          budgetScore: o.budget,
          relevanceScore: o.relevance,
          deliveryScore: o.deliveryScore,
          locationScore: o.location,
          vendorQualityScore: o.quality,
        },
        create: {
          requirementId: o.reqId, offerId: offer.id, vendorProfileId: o.vendorProfileId,
          overallScore: overall,
          budgetScore: o.budget, relevanceScore: o.relevance,
          deliveryScore: o.deliveryScore,
          locationScore: o.location, vendorQualityScore: o.quality,
          breakdownJson: JSON.stringify(o),
        },
      });
      offerCount++;
    } catch (e: any) {
      console.error(`  ❌ Failed offer: req=${o.reqId} vendor=${o.vendorUserId}`, e);
    }
  }
  console.log(`✅ ${offerCount} offers + compatibility scores\n`);

  // ── Notifications for new owners ─────────────────────────────────────────
  await prisma.notification.createMany({
    skipDuplicates: true,
    data: [
      { userId: ownerA.id, type: "OFFER_RECEIVED", title: "3 Offers on Your Laptop Demand", message: "TechNova IT, Nexus Hardware, and HyperCore submitted bids on your 100x laptop requirement.", linkUrl: `/requirements/${req4.id}`, isRead: false },
      { userId: ownerA.id, type: "OFFER_RECEIVED", title: "1 Offer on HR+LMS Platform", message: "AgileForge Digital submitted a detailed proposal for your HR & LMS platform.", linkUrl: `/requirements/${req9.id}`, isRead: false },
      { userId: ownerB.id, type: "OFFER_RECEIVED", title: "2 Offers on B2B Marketplace", message: "AgileForge Digital and DevCraft Studio both submitted competitive proposals.", linkUrl: `/requirements/${req6.id}`, isRead: false },
      { userId: ownerC.id, type: "OFFER_RECEIVED", title: "Cybersecurity Proposal Received", message: "SecureEdge Technologies (CERT-In empanelled) submitted a comprehensive VAPT proposal.", linkUrl: `/requirements/${req5.id}`, isRead: false },
    ],
  });

  console.log("✅ Notifications\n");
  console.log("🎉 Extended seed complete!");
  console.log(`   Requirements added: ${reqs.length}`);
  console.log(`   Vendors added: ${vDefs.length}`);
  console.log(`   Offers + scores: ${offerCount}`);
}

main()
  .catch((e) => { console.error("❌ Seed failed:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
