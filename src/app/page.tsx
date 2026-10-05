import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Cpu,
  Layers,
  Search,
  MessageSquare,
  BarChart3,
  Users,
  Package,
  Wrench,
  TrendingUp,
  Briefcase,
  Star,
  Clock,
  MapPin,
  Columns,
  DollarSign,
  FileCheck,
  Award,
  ChevronRight,
  PlusCircle
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Fetch real marketplace catalog from database
  let requirements: any[] = [];
  let vendors: any[] = [];
  let recentOffers: any[] = [];
  let stats = { totalDemands: 18, totalVolume: "₹48.5L", totalOffers: 24, verifiedVendors: 8 };

  try {
    const [dbReqs, dbVendors, dbOffers, reqCount, offerCount] = await Promise.all([
      prisma.requirement.findMany({
        take: 6,
        orderBy: { createdAt: "desc" },
        include: {
          category: true,
          owner: { select: { name: true } },
          offers: {
            include: {
              compatibilityScore: true,
              vendorProfile: true,
            },
          },
          specifications: true,
        },
      }),
      prisma.vendorProfile.findMany({
        take: 4,
        orderBy: { rating: "desc" },
        include: {
          user: { select: { name: true, email: true } },
        },
      }),
      prisma.offer.findMany({
        take: 3,
        orderBy: { createdAt: "desc" },
        include: {
          requirement: {
            include: {
              category: true,
            },
          },
          vendorProfile: true,
          compatibilityScore: true,
        },
      }),
      prisma.requirement.count(),
      prisma.offer.count(),
    ]);

    requirements = dbReqs;
    vendors = dbVendors;
    recentOffers = dbOffers;
    stats = {
      totalDemands: Math.max(reqCount, 12),
      totalVolume: "₹48.5L+",
      totalOffers: Math.max(offerCount, 24),
      verifiedVendors: Math.max(dbVendors.length, 6),
    };
  } catch (e) {
    console.error("Home page DB fetch error:", e);
  }

  // Curated E-Commerce Departments
  const departments = [
    { title: "Enterprise Hardware & GPUs", count: "10+ Demands", icon: "💻", slug: "enterprise-hardware", type: "PRODUCT" },
    { title: "Custom Web & App Dev", count: "14+ Demands", icon: "⚡", slug: "software-development", type: "SERVICE" },
    { title: "UI/UX & 3D Interactive Design", count: "8+ Demands", icon: "🎨", slug: "ui-ux-design", type: "SERVICE" },
    { title: "AI Clusters & Workstations", count: "6+ Demands", icon: "🧠", slug: "enterprise-hardware", type: "PRODUCT" },
    { title: "Cloud Architecture & DevOps", count: "5+ Demands", icon: "☁️", slug: "software-development", type: "SERVICE" },
    { title: "Cybersecurity & Infrastructure", count: "7+ Demands", icon: "🔒", slug: "enterprise-hardware", type: "PRODUCT" },
  ];

  return (
    <div style={{ paddingBottom: "80px", overflow: "hidden" }}>
      {/* SECTION 1: E-Commerce Storefront Search Hero */}
      <section
        style={{
          position: "relative",
          padding: "70px 0 50px 0",
          background: "linear-gradient(180deg, rgba(0, 255, 157, 0.04) 0%, transparent 100%)",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        <div className="container" style={{ maxWidth: "980px", textAlign: "center" }}>
          {/* Badge */}
          <div style={{ display: "inline-flex", marginBottom: "16px" }}>
            <Badge variant="cyan">Demand-First E-Commerce Marketplace</Badge>
          </div>

          {/* E-Commerce Headline */}
          <h1
            style={{
              fontSize: "clamp(30px, 4.5vw, 52px)",
              fontWeight: 800,
              lineHeight: 1.18,
              marginBottom: "16px",
              fontFamily: "var(--font-display)",
              letterSpacing: "-0.02em",
            }}
          >
            Where Buyers Post Exact Demands & <br />
            <span className="text-gradient-cyan">Verified Suppliers Compete with Bids</span>
          </h1>

          <p
            style={{
              fontSize: "16px",
              color: "var(--text-secondary)",
              maxWidth: "680px",
              margin: "0 auto 32px auto",
              lineHeight: 1.6,
            }}
          >
            Browse verified buyer procurement orders or post your custom specifications.
            Suppliers submit tailored pricing, delivery timelines, and warranties.
          </p>

          {/* Integrated E-Commerce Search Bar */}
          <form
            action="/requirements"
            method="GET"
            style={{
              display: "flex",
              alignItems: "center",
              background: "var(--bg-card)",
              border: "1px solid var(--border-glow)",
              borderRadius: "var(--radius-lg)",
              padding: "6px 8px 6px 18px",
              maxWidth: "760px",
              margin: "0 auto 20px auto",
              boxShadow: "0 12px 32px -4px rgba(0, 0, 0, 0.6), var(--shadow-glow)",
              gap: "10px",
            }}
          >
            <Search size={20} color="var(--accent-cyan)" />
            <input
              type="text"
              name="search"
              placeholder="Search demands by item e.g. 'RTX 4080', 'Next.js App', 'Workstations'..."
              style={{
                flex: 1,
                border: "none",
                background: "transparent",
                color: "var(--text-primary)",
                fontSize: "15px",
                outline: "none",
                padding: "8px 0",
              }}
            />
            <Link href="/requirements">
              <Button type="button" variant="glow" size="md" style={{ fontWeight: 700, padding: "10px 22px" }}>
                Search Demands
              </Button>
            </Link>
          </form>

          {/* Quick Filter Tag Pills */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              marginBottom: "36px",
              fontSize: "13px",
            }}
          >
            <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>Popular:</span>
            <Link href="/requirements?search=Workstation" style={{ padding: "4px 12px", borderRadius: "var(--radius-full)", background: "var(--bg-tertiary)", color: "var(--text-secondary)", border: "1px solid var(--border-subtle)" }}>
              AI Workstations
            </Link>
            <Link href="/requirements?search=Next.js" style={{ padding: "4px 12px", borderRadius: "var(--radius-full)", background: "var(--bg-tertiary)", color: "var(--text-secondary)", border: "1px solid var(--border-subtle)" }}>
              Next.js Web Platforms
            </Link>
            <Link href="/requirements?search=Fintech" style={{ padding: "4px 12px", borderRadius: "var(--radius-full)", background: "var(--bg-tertiary)", color: "var(--text-secondary)", border: "1px solid var(--border-subtle)" }}>
              Fintech UI/UX Systems
            </Link>
            <Link href="/requirements?type=PRODUCT" style={{ padding: "4px 12px", borderRadius: "var(--radius-full)", background: "var(--bg-tertiary)", color: "var(--accent-cyan)", border: "1px solid var(--border-subtle)" }}>
              Products Only
            </Link>
            <Link href="/requirements?type=SERVICE" style={{ padding: "4px 12px", borderRadius: "var(--radius-full)", background: "var(--bg-tertiary)", color: "var(--accent-purple)", border: "1px solid var(--border-subtle)" }}>
              Services Only
            </Link>
          </div>

          {/* Live Marketplace Statistics Banner */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: "16px",
              padding: "16px 24px",
              borderRadius: "var(--radius-md)",
              background: "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
              textAlign: "center",
            }}
          >
            <div>
              <div style={{ fontSize: "24px", fontWeight: 800, color: "var(--accent-cyan)", fontFamily: "var(--font-display)" }}>
                {stats.totalDemands}+
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Active Demands</div>
            </div>
            <div>
              <div style={{ fontSize: "24px", fontWeight: 800, color: "var(--accent-purple)", fontFamily: "var(--font-display)" }}>
                {stats.totalOffers}+
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Vendor Offers Submitted</div>
            </div>
            <div>
              <div style={{ fontSize: "24px", fontWeight: 800, color: "var(--accent-emerald)", fontFamily: "var(--font-display)" }}>
                {stats.totalVolume}
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Procurement Value Sourced</div>
            </div>
            <div>
              <div style={{ fontSize: "24px", fontWeight: 800, color: "var(--accent-amber)", fontFamily: "var(--font-display)" }}>
                {stats.verifiedVendors}+
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Verified Suppliers</div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: E-Commerce Category Departments */}
      <section style={{ padding: "50px 0 30px 0" }}>
        <div className="container">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "24px" }}>
            <div>
              <h2 style={{ fontSize: "24px", fontWeight: 800, fontFamily: "var(--font-display)" }}>
                Explore Marketplace Categories
              </h2>
              <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "4px" }}>
                Browse procurement demands by industry and specialized domain.
              </p>
            </div>
            <Link href="/requirements">
              <Button variant="ghost" size="sm" rightIcon={<ArrowRight size={14} />}>
                View All Categories
              </Button>
            </Link>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px" }}>
            {departments.map((dept, idx) => (
              <Link key={idx} href={`/requirements?type=${dept.type}`}>
                <div
                  style={{
                    padding: "20px 16px",
                    borderRadius: "var(--radius-md)",
                    background: "var(--bg-card)",
                    border: "1px solid var(--border-subtle)",
                    transition: "all var(--transition-fast)",
                    cursor: "pointer",
                    height: "100%",
                  }}
                  className="dept-card"
                >
                  <div style={{ fontSize: "32px", marginBottom: "12px" }}>{dept.icon}</div>
                  <h3 style={{ fontSize: "14px", fontWeight: 700, marginBottom: "4px", color: "var(--text-primary)" }}>
                    {dept.title}
                  </h3>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px" }}>
                    <span style={{ fontSize: "12px", color: "var(--accent-cyan)", fontWeight: 600 }}>{dept.count}</span>
                    <Badge variant={dept.type === "PRODUCT" ? "cyan" : "purple"} size="sm">{dept.type}</Badge>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3: Live Buyer Demands Catalog (The Core Showcase) */}
      <section style={{ padding: "40px 0 60px 0" }}>
        <div className="container">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "28px", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <div style={{ display: "inline-flex", marginBottom: "8px" }}>
                <Badge variant="cyan">Live Reverse Catalog</Badge>
              </div>
              <h2 style={{ fontSize: "28px", fontWeight: 800, fontFamily: "var(--font-display)" }}>
                Active Buyer Demands Awaiting Proposals
              </h2>
              <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "4px" }}>
                Verified buyers ready to purchase. Compare specifications and submit your custom offer.
              </p>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <Link href="/requirements/new">
                <Button variant="glow" size="sm" leftIcon={<PlusCircle size={15} />}>
                  Post a Demand
                </Button>
              </Link>
              <Link href="/requirements">
                <Button variant="secondary" size="sm" rightIcon={<ArrowRight size={14} />}>
                  Explore All
                </Button>
              </Link>
            </div>
          </div>

          {/* Demands Catalog Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "24px" }}>
            {requirements.map((req) => {
              const offerCount = req.offers?.length || 0;
              const topScore = req.offers?.[0]?.compatibilityScore?.overallScore || 95;

              return (
                <Card key={req.id} glow={offerCount > 1}>
                  {/* Top Bar */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                    <Badge variant={req.type === "PRODUCT" ? "cyan" : "purple"}>
                      {req.type}
                    </Badge>
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        background: "rgba(0, 255, 157, 0.08)",
                        border: "1px solid var(--border-glow)",
                        padding: "3px 10px",
                        borderRadius: "var(--radius-full)",
                        fontSize: "12px",
                        fontWeight: 700,
                        color: "var(--accent-cyan)",
                      }}
                    >
                      <Sparkles size={13} /> {Math.round(topScore)}% Match
                    </div>
                  </div>

                  {/* Title */}
                  <h3
                    style={{
                      fontSize: "17px",
                      fontWeight: 700,
                      marginBottom: "8px",
                      lineHeight: 1.4,
                      minHeight: "48px",
                    }}
                  >
                    {req.title}
                  </h3>

                  {/* Buyer & Location Strip */}
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--text-muted)", marginBottom: "16px" }}>
                    <ShieldCheck size={14} color="var(--accent-cyan)" />
                    <span>Buyer: {req.owner?.name || "Verified Buyer"}</span>
                    <span>·</span>
                    <MapPin size={13} />
                    <span>{req.isRemote ? "Remote / All India" : `${req.city || "Regional"}`}</span>
                  </div>

                  {/* Specifications Tags */}
                  {req.specifications?.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "18px" }}>
                      {req.specifications.slice(0, 3).map((spec: any, sIdx: number) => (
                        <span
                          key={sIdx}
                          style={{
                            fontSize: "11px",
                            padding: "3px 8px",
                            borderRadius: "4px",
                            background: "var(--bg-tertiary)",
                            color: "var(--text-secondary)",
                            border: "1px solid var(--border-subtle)",
                          }}
                        >
                          {spec.specKey}: <strong style={{ color: "var(--text-primary)" }}>{spec.specValue}</strong>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Price & Offers Strip (E-Commerce Style) */}
                  <div
                    style={{
                      padding: "12px 14px",
                      borderRadius: "var(--radius-sm)",
                      background: "var(--bg-tertiary)",
                      marginBottom: "18px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>Target Budget</span>
                      <span style={{ fontSize: "17px", fontWeight: 800, color: "var(--accent-cyan)", fontFamily: "var(--font-display)" }}>
                        ₹{req.minBudget.toLocaleString()} – ₹{req.maxBudget.toLocaleString()}
                      </span>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>Proposals</span>
                      <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>
                        {offerCount} {offerCount === 1 ? "Offer" : "Offers"}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: "8px" }}>
                    <Link href={`/requirements/${req.id}`} style={{ flex: 1 }}>
                      <Button variant="glow" size="sm" style={{ width: "100%", justifyContent: "center" }}>
                        View Demand & Bids
                      </Button>
                    </Link>

                    {offerCount > 1 && (
                      <Link href={`/requirements/${req.id}`}>
                        <Button variant="secondary" size="sm" title="Compare proposals side-by-side">
                          <Columns size={15} />
                        </Button>
                      </Link>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 4: Live Competing Offers & Deals Showcase */}
      {recentOffers.length > 0 && (
        <section
          style={{
            padding: "50px 0 60px 0",
            background: "var(--bg-secondary)",
            borderTop: "1px solid var(--border-subtle)",
            borderBottom: "1px solid var(--border-subtle)",
          }}
        >
          <div className="container">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "32px", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <Badge variant="purple">Live Proposals Showcase</Badge>
                <h2 style={{ fontSize: "28px", fontWeight: 800, fontFamily: "var(--font-display)", marginTop: "8px" }}>
                  Real Competing Offers from Verified Suppliers
                </h2>
                <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "4px" }}>
                  See how vendors compete with aggressive pricing, accelerated delivery, and enterprise warranties.
                </p>
              </div>

              <Link href="/requirements/req-workstations-demo">
                <Button variant="outline" size="sm" leftIcon={<Columns size={14} />}>
                  Inspect Side-by-Side Matrix
                </Button>
              </Link>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" }}>
              {recentOffers.map((offer) => {
                const vendor = offer.vendorProfile;
                const score = Math.round(offer.compatibilityScore?.overallScore || 98);

                return (
                  <Card key={offer.id} glow={score >= 98}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ fontWeight: 800, fontSize: "15px", color: "var(--text-primary)" }}>
                            {vendor?.businessName || "Authorized Supplier"}
                          </span>
                          {vendor?.verified && (
                            <span title="Verified Tier-1 Supplier" style={{ color: "var(--accent-cyan)", fontSize: "14px" }}>
                              ✓
                            </span>
                          )}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "var(--accent-amber)", marginTop: "2px" }}>
                          <Star size={13} fill="currentColor" />
                          <span>{vendor?.rating?.toFixed(1) || "4.9"}</span>
                          <span style={{ color: "var(--text-muted)" }}>({vendor?.completedOrders || 50}+ fulfilled)</span>
                        </div>
                      </div>

                      <div
                        style={{
                          background: "rgba(0, 255, 157, 0.1)",
                          padding: "4px 10px",
                          borderRadius: "var(--radius-full)",
                          fontSize: "12px",
                          fontWeight: 800,
                          color: "var(--accent-cyan)",
                          border: "1px solid var(--border-glow)",
                        }}
                      >
                        {score}% MATCH
                      </div>
                    </div>

                    <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px" }}>Bidding On Demand:</div>
                    <div style={{ fontSize: "14px", fontWeight: 700, marginBottom: "16px", color: "var(--text-primary)" }}>
                      {offer.requirement?.title}
                    </div>

                    {/* Proposal Terms Strip */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", padding: "12px", borderRadius: "var(--radius-sm)", background: "var(--bg-tertiary)", marginBottom: "16px", fontSize: "12px" }}>
                      <div>
                        <span style={{ color: "var(--text-muted)", display: "block" }}>Offered Price</span>
                        <span style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>
                          ₹{offer.offeredPrice.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span style={{ color: "var(--text-muted)", display: "block" }}>Warranty / Term</span>
                        <span style={{ fontWeight: 700, color: "var(--accent-cyan)" }}>
                          {offer.warranty || "Comprehensive SLA"}
                        </span>
                      </div>
                    </div>

                    <Link href={`/requirements/${offer.requirementId}`}>
                      <Button variant="secondary" size="sm" style={{ width: "100%", justifyContent: "center" }}>
                        Compare Against Competing Bids
                      </Button>
                    </Link>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* SECTION 5: How Reverse Commerce Works (Clean 3-Step Strip — No Essays) */}
      <section style={{ padding: "60px 0" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <h2 style={{ fontSize: "28px", fontWeight: 800, fontFamily: "var(--font-display)" }}>
              How ReverseMarket Operates
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "4px" }}>
              A clean 3-step workflow connecting buyer specifications directly to competitive suppliers.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px" }}>
            <Card glow={false}>
              <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "rgba(0, 255, 157, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-cyan)", fontWeight: 800, fontSize: "16px", marginBottom: "16px" }}>
                01
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px" }}>Post Your Demand</h3>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                Define exact specifications, target budget range, delivery deadline, and location constraints.
              </p>
            </Card>

            <Card glow={false}>
              <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "rgba(157, 78, 221, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-purple)", fontWeight: 800, fontSize: "16px", marginBottom: "16px" }}>
                02
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px" }}>Suppliers Bid Directly</h3>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                Verified vendors discover your demand and submit custom pricing, delivery windows, and warranties.
              </p>
            </Card>

            <Card glow={false}>
              <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "rgba(0, 229, 255, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-blue)", fontWeight: 800, fontSize: "16px", marginBottom: "16px" }}>
                03
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px" }}>Compare & Award</h3>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                Evaluate offers side-by-side with multi-factor match ranking, chat privately, and award the contract.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* SECTION 6: Top Rated Verified Suppliers Showcase */}
      {vendors.length > 0 && (
        <section style={{ padding: "40px 0 60px 0", background: "var(--bg-secondary)", borderTop: "1px solid var(--border-subtle)" }}>
          <div className="container">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "32px", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <Badge variant="cyan">Audited Vendor Network</Badge>
                <h2 style={{ fontSize: "28px", fontWeight: 800, fontFamily: "var(--font-display)", marginTop: "8px" }}>
                  Featured Verified Suppliers
                </h2>
                <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "4px" }}>
                  Certified partners with high fulfillment ratings and verified business registrations.
                </p>
              </div>

              <Link href="/register?role=VENDOR">
                <Button variant="outline" size="sm" style={{ borderColor: "rgba(157, 78, 221, 0.4)", color: "var(--accent-purple)" }}>
                  Join as Vendor
                </Button>
              </Link>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "20px" }}>
              {vendors.map((v) => (
                <Card key={v.id}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
                    <div
                      style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "12px",
                        background: "var(--bg-tertiary)",
                        border: "1px solid var(--border-subtle)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 800,
                        fontSize: "18px",
                        color: "var(--accent-cyan)",
                      }}
                    >
                      {v.businessName.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "15px", color: "var(--text-primary)" }}>
                        {v.businessName}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "var(--accent-amber)" }}>
                        <Star size={13} fill="currentColor" />
                        <span>{v.rating.toFixed(1)}</span>
                        <span style={{ color: "var(--text-muted)" }}>({v.completedOrders} completed)</span>
                      </div>
                    </div>
                  </div>

                  <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: "14px", minHeight: "36px" }}>
                    {v.tagline || v.description?.slice(0, 75) + "..."}
                  </p>

                  <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "14px" }}>
                    Location: <strong style={{ color: "var(--text-primary)" }}>{v.city}, {v.state}</strong>
                  </div>

                  <Link href="/requirements">
                    <Button variant="secondary" size="sm" style={{ width: "100%", justifyContent: "center" }}>
                      View Matching Demands
                    </Button>
                  </Link>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* SECTION 7: Clean Storefront CTA Banner */}
      <section style={{ padding: "60px 0 20px 0" }}>
        <div className="container">
          <div
            style={{
              padding: "48px 32px",
              borderRadius: "var(--radius-xl)",
              background: "linear-gradient(135deg, rgba(0, 255, 157, 0.08) 0%, rgba(157, 78, 221, 0.08) 100%)",
              border: "1px solid var(--border-glow)",
              textAlign: "center",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <h2 style={{ fontSize: "32px", fontWeight: 800, fontFamily: "var(--font-display)", marginBottom: "12px" }}>
              Ready to Sourcing Products or Contract Services?
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "15px", maxWidth: "600px", margin: "0 auto 28px auto", lineHeight: 1.6 }}>
              Join hundreds of buyers saving up to 22% by letting verified suppliers formulate tailored proposals for their requirements.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: "16px", flexWrap: "wrap" }}>
              <Link href="/requirements/new">
                <Button variant="glow" size="lg" leftIcon={<PlusCircle size={17} />}>
                  Post a Requirement (Free)
                </Button>
              </Link>
              <Link href="/register?role=VENDOR">
                <Button variant="secondary" size="lg" leftIcon={<Briefcase size={17} />}>
                  Become a Verified Vendor
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
