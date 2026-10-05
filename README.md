# ⚡ REVERSEMARKET — Futuristic Reverse Marketplace Platform

> **"Users post what they need → Relevant vendors discover the requirement → Vendors submit offers → ReverseMarket calculates compatibility → Users compare offers → Chat privately → Shortlist → Select the most suitable offer."**

**ReverseMarket** reverses traditional e-commerce by putting buyer demand first. Supporting both tangible **Products** and contractual **Services**, the platform automatically scores proposals using an intelligent 5-factor matching engine and delivers a cyber-futuristic procurement experience.

---

## 🚀 Live Demo & Local Access

The platform is running locally in production mode:

- **Web App URL:** [http://localhost:3002](http://localhost:3002)
- **API Base:** [http://localhost:3002/api](http://localhost:3002/api)

### 🔑 Demo Accounts (All Passwords: `Password123!`)

| Role | Name | Email | Purpose / Context |
| :--- | :--- | :--- | :--- |
| **Admin** | ReverseMarket Admin | `admin@reversemarket.io` | Global oversight, KPIs, user & category control |
| **Buyer** | Rajesh Sharma | `owner@apextech.com` | Posted AI Workstation requirement with 3 competing offers |
| **Buyer** | Priya Patel | `priya@innovatestudio.in` | Posted Next.js App & Fintech UI requirements |
| **Vendor** | Nexus Enterprise Hardware | `sales@nexushardware.com` | Tier-1 OEM distributor (Workstations, GPU servers) |
| **Vendor** | HyperCore Technologies | `sales@hypercore.in` | High-density AI computing specialist |
| **Vendor** | SysTech Hardware Hub | `contact@systechdevices.in` | Value/budget workstation integrator |
| **Vendor** | Zenith Cloud & Software | `vikram@zenithcraft.io` | Next.js & distributed cloud software studio |
| **Vendor** | Lumin Design Labs | `ananya@lumindesign.com` | High-end 3D & UI/UX product design agency |

---

## 🧠 5-Factor Intelligent Matching Engine

Every proposal submitted by a vendor is processed through the **ReverseMarket Multi-Factor Matching Engine** (`src/lib/matching-engine.ts`), which evaluates:

$$\text{Overall Score} = \sum (\text{Factor Score}_i \times \text{Weight}_i)$$

1. **Budget Alignment (30%)**:
   - Exact preferred budget = `100%`
   - Within min/max budget range = Linear interpolation between `80%` and `100%`
   - Outside budget envelope = Non-linear penalty curves
2. **Relevance & Category Match (30%)**:
   - Exact category & subcategory alignment
   - Keyword proximity between specification keys and vendor capabilities
3. **Delivery / Timeline Competence (20%)**:
   - Early delivery relative to buyer deadline = Bonuses up to `100%`
   - Late delivery = Daily step penalty
4. **Geographic Proximity (10%)**:
   - Same city = `100%`
   - Same state = `80%`
   - Same country / within service radius = `65%`
   - Remote-enabled services = Automatic `95%`
5. **Vendor Quality & Reputation (10%)**:
   - Platform rating (0–5 stars), verified status (+10 pts), order completion rate, and response rate

---

## 🛠️ System Architecture

Built on **Next.js 16 (App Router)** and **TypeScript** with complete separation of concerns:

```
remarket_project/
├── prisma/
│   ├── schema.prisma           # 28 relational entities (SQLite / Postgres)
│   └── dev.db                  # Local SQLite database
├── src/
│   ├── app/
│   │   ├── page.tsx            # Futuristic Landing page with live DB metrics
│   │   ├── globals.css         # Dark cyber tokens, glassmorphism, animations
│   │   ├── layout.tsx          # Master layout with Navbar & Footer
│   │   ├── requirements/
│   │   │   ├── page.tsx        # Searchable requirement feed with filters
│   │   │   ├── new/page.tsx    # Multi-step requirement posting wizard
│   │   │   └── [id]/page.tsx   # Requirement details, offers, comparison matrix
│   │   ├── dashboard/          # Buyer command center (shortlists, demands)
│   │   ├── vendor-dashboard/   # Vendor opportunity portal with ML match feed
│   │   ├── admin/              # Admin console (KPIs, categories, users)
│   │   ├── messages/           # Private buyer-vendor chat workspace
│   │   ├── login/ & register/  # Authentication flows
│   │   └── api/                # REST endpoints for auth, offers, chat, admin
│   ├── components/
│   │   ├── matching/           # Animated CompatibilityMeter component
│   │   ├── wizard/             # 5-step RequirementWizard with specifications
│   │   ├── ui/                 # Accessible, reusable button, card, modal, badge
│   │   └── layout/             # Navigation, status indicators
│   ├── lib/
│   │   ├── auth.ts             # JWT signing + bcrypt password hashing
│   │   ├── matching-engine.ts  # 5-factor compatibility scoring engine
│   │   ├── prisma.ts           # Prisma singleton client
│   │   └── validations.ts      # Zod validation schemas
│   ├── repositories/           # Data access layer (User, Requirement, Offer, Chat)
│   └── services/               # Business logic services
├── tests/
│   └── marketplace-flow.test.ts # 12 comprehensive unit and integration tests
└── scripts/
    ├── check-db-detail.ts      # Terminal DB inspector
    └── enrich-seed.ts          # Seed data generator
```

---

## 🌟 Key Features

### 1. Requirements Directory & Details
- Browse live demands categorized by **Products** or **Services**.
- Detailed view with full technical specifications, budget ranges, and location requirements.
- **Side-by-Side Comparison Matrix**: Compares pricing, delivery timeline, compatibility scores, warranties, and specifications across competing vendors in a unified tabular matrix.

### 2. Multi-Step Requirement Wizard (`/requirements/new`)
- Step-by-step guided creation: Type & Category selection → Budget & Delivery timeline → Technical Specifications builder → Geographic scope → Preview & Publish.

### 3. Vendor Opportunity Portal (`/vendor-dashboard`)
- Live opportunity feed sorted by compatibility match score.
- 1-click offer submission modal with pricing, milestones, warranty, and return policies.
- Track proposal statuses: `SUBMITTED` → `SHORTLISTED` → `SELECTED`.

### 4. Buyer Command Center (`/dashboard`)
- Manage active demands, monitor incoming proposals, shortlist top candidates, and award contracts with transaction integrity.

### 5. Private Messaging (`/messages`)
- Secure, contextual messaging between requirement owners and shortlisted vendors before awarding.

### 6. Admin Control Center (`/admin`)
- Platform-wide GMV, volume statistics, category taxonomies, and user moderation.

---

## 🧪 Testing & Verification

Run the automated test suite covering matching math, Zod validations, and database transactions:

```bash
npm run test
```

Expected output:
```
==================================================================
REVERSEMARKET COMPREHENSIVE AUTOMATED TEST SUITE
==================================================================
[Group 1: Matching Engine Unit Calculations]
  ✓ PASS: Budget within range with exact preferred price scores >= 90%
  ✓ PASS: Budget exceeding max by 50% is appropriately penalized (< 60%)
  ✓ PASS: Fulfillment delivered 3 days ahead of schedule scores >= 90%
  ✓ PASS: Same city vendor location scores 100%
  ✓ PASS: Overall compatibility calculated accurately: 99%
  ✓ PASS: Multi-factor score breakdown explanations generated properly
[Group 2: Zod Schema Validations]
  ✓ PASS: Valid requirement data passes Zod validation
  ✓ PASS: Invalid requirement data properly fails Zod validation
[Group 3: Database & Transaction Lifecycle Integration]
  ✓ PASS: Database contains verified ADMIN, REQUIREMENT_OWNER, and VENDOR records
  ✓ PASS: Requirements contain related vendor offers
  ✓ PASS: Requirements contain calculated compatibility scores
  ✓ PASS: Winning vendor offer successfully selected and awarded
==================================================================
TEST SUITE SUMMARY: 12 PASSED, 0 FAILED
==================================================================
```

---

## 💻 Developer Commands

```bash
# Start development server
npm run dev

# Run automated tests
npm run test

# Re-seed database with realistic data
npm run seed

# Build production bundle
npm run build

# Start production server
npm run start
```
