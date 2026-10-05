import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { MatchingEngine, DEFAULT_WEIGHTS } from "@/lib/matching-engine";
import {
  Sparkles,
  TrendingUp,
  FileCheck,
  Award,
  Clock,
  ArrowRight,
  Send,
  Star,
  MapPin,
  CheckCircle2
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function VendorDashboardPage() {
  const session = await getSession();

  // If user is NOT authenticated, strictly enforce vendor registration
  if (!session) {
    return (
      <div style={{ padding: "60px 0 100px 0" }}>
        <div className="container" style={{ maxWidth: "680px" }}>
          <div style={{ textAlign: "center", marginBottom: "36px" }}>
            <Badge variant="purple">Vendor Registration Mandatory</Badge>
            <h1
              style={{
                fontSize: "32px",
                fontWeight: 800,
                fontFamily: "var(--font-display)",
                marginTop: "12px",
                letterSpacing: "-0.02em",
              }}
            >
              Vendor Registration Required to Access Demands
            </h1>
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: "15px",
                marginTop: "8px",
                lineHeight: 1.6,
              }}
            >
              ReverseMarket flips traditional commerce: buyers post their exact budget and requirements,
              and verified vendors formulate custom bids. To access the live opportunity feed and submit offers,
              registration is mandatory.
            </p>
          </div>

          <Card glow={true}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "32px" }}>
              <div
                style={{
                  padding: "16px",
                  borderRadius: "var(--radius-sm)",
                  background: "var(--bg-tertiary)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                  <TrendingUp size={18} color="var(--accent-purple)" />
                  <span style={{ fontWeight: 700, fontSize: "14px", color: "var(--text-primary)" }}>
                    Direct Buyer Demand Feed
                  </span>
                </div>
                <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                  Discover active RFPs with confirmed budgets and realistic delivery schedules.
                </p>
              </div>

              <div
                style={{
                  padding: "16px",
                  borderRadius: "var(--radius-sm)",
                  background: "var(--bg-tertiary)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                  <Sparkles size={18} color="var(--accent-cyan)" />
                  <span style={{ fontWeight: 700, fontSize: "14px", color: "var(--text-primary)" }}>
                    AI Match Scoring
                  </span>
                </div>
                <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                  Demands are scored against your location, domain expertise, and past ratings.
                </p>
              </div>

              <div
                style={{
                  padding: "16px",
                  borderRadius: "var(--radius-sm)",
                  background: "var(--bg-tertiary)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                  <Send size={18} color="var(--accent-emerald)" />
                  <span style={{ fontWeight: 700, fontSize: "14px", color: "var(--text-primary)" }}>
                    1-Click Proposal Submission
                  </span>
                </div>
                <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                  Submit pricing, milestones, warranties, and custom spec deliverables effortlessly.
                </p>
              </div>

              <div
                style={{
                  padding: "16px",
                  borderRadius: "var(--radius-sm)",
                  background: "var(--bg-tertiary)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                  <Award size={18} color="var(--accent-amber)" />
                  <span style={{ fontWeight: 700, fontSize: "14px", color: "var(--text-primary)" }}>
                    Meritocratic Selection
                  </span>
                </div>
                <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                  Win enterprise and consumer contracts based on quality and speed, not ad spend.
                </p>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <Link href="/register?role=VENDOR&redirect=/vendor-dashboard" style={{ width: "100%" }}>
                <Button
                  variant="glow"
                  size="lg"
                  style={{ width: "100%", justifyContent: "center" }}
                  rightIcon={<ArrowRight size={18} />}
                >
                  Register as a Verified Vendor
                </Button>
              </Link>

              <Link href="/login?redirect=/vendor-dashboard" style={{ width: "100%" }}>
                <Button
                  variant="secondary"
                  size="md"
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  Already Registered? Sign In as Vendor
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Fetch vendor profile
  const vendorProfile = await prisma.vendorProfile.findUnique({
    where: { userId: session.id },
  });

  if (!vendorProfile && session.role !== "ADMIN") {
    redirect("/register?role=VENDOR");
  }

  // Fetch submitted offers by this vendor
  const submittedOffers = await prisma.offer.findMany({
    where: { vendorId: session.id },
    include: {
      requirement: {
        include: {
          category: true,
          owner: { select: { name: true } },
        },
      },
      compatibilityScore: true,
      selections: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // Fetch open requirements for recommendation engine
  const openRequirements = await prisma.requirement.findMany({
    where: {
      status: { in: ["PUBLISHED", "MATCHED"] },
      // Exclude requirements already bid on
      offers: {
        none: { vendorId: session.id },
      },
    },
    include: {
      category: true,
      specifications: true,
    },
    take: 15,
  });

  // Run matching engine to score each open requirement for this vendor
  const engine = new MatchingEngine(DEFAULT_WEIGHTS);
  const scoredRequirements = openRequirements.map((req) => {
    let score = 85;
    if (vendorProfile) {
      const preview = engine.computeCompatibility(
        {
          type: req.type,
          minBudget: req.minBudget,
          maxBudget: req.maxBudget,
          preferredBudget: req.preferredBudget,
          categoryId: req.categoryId,
          categoryName: req.category?.name,
          city: req.city,
          state: req.state,
          isRemote: req.isRemote,
          requiredDeliveryDate: req.requiredDeliveryDate,
          projectDeadline: req.projectDeadline,
          specifications: req.specifications,
        },
        {
          id: vendorProfile.id,
          city: vendorProfile.city,
          state: vendorProfile.state,
          isRemoteAvailable: vendorProfile.isRemoteAvailable,
          experienceYears: vendorProfile.experienceYears,
          rating: vendorProfile.rating,
          completedOrders: vendorProfile.completedOrders,
          responseRate: vendorProfile.responseRate,
          verified: vendorProfile.verified,
          categoriesProvided: vendorProfile.categoriesProvided,
        }
      );
      score = preview.overallScore;
    }
    return { ...req, matchScore: score };
  });

  // Sort by highest match score first
  scoredRequirements.sort((a, b) => b.matchScore - a.matchScore);

  const shortlistedCount = submittedOffers.filter((o) => o.status === "SHORTLISTED").length;
  const selectedCount = submittedOffers.filter((o) => o.status === "SELECTED").length;

  return (
    <div style={{ padding: "40px 0 80px 0" }}>
      <div className="container">
        {/* Vendor Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginBottom: "32px",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div>
            <Badge variant="purple">Vendor Opportunity Portal</Badge>
            <h1
              style={{
                fontSize: "30px",
                fontWeight: 800,
                marginTop: "8px",
                fontFamily: "var(--font-display)",
              }}
            >
              {vendorProfile?.businessName || session.name}
            </h1>
            <p style={{ color: "var(--text-secondary)", marginTop: "4px" }}>
              Discover active buyer demands matching your capabilities and submit winning proposals.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                padding: "8px 16px",
                borderRadius: "var(--radius-sm)",
                background: "var(--bg-tertiary)",
                border: "1px solid var(--border-subtle)",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "13px",
              }}
            >
              <Star size={14} color="var(--accent-amber)" fill="currentColor" />
              <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>
                {vendorProfile?.rating?.toFixed(1) || "5.0"}
              </span>
              <span style={{ color: "var(--text-muted)" }}>({vendorProfile?.reviewCount || 0} reviews)</span>
            </div>
          </div>
        </div>

        {/* Opportunity Metrics Strip */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "20px",
            marginBottom: "40px",
          }}
        >
          <Card glow={false}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "rgba(0, 242, 254, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-cyan)" }}>
                <TrendingUp size={18} />
              </div>
              <span style={{ fontSize: "14px", fontWeight: 700 }}>Recommended Needs</span>
            </div>
            <div style={{ fontSize: "28px", fontWeight: 800, color: "var(--accent-cyan)", fontFamily: "var(--font-display)" }}>
              {scoredRequirements.length}
            </div>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
              Direct category and capability matches
            </p>
          </Card>

          <Card glow={false}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "rgba(139, 92, 246, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-purple)" }}>
                <Send size={18} />
              </div>
              <span style={{ fontSize: "14px", fontWeight: 700 }}>Submitted Offers</span>
            </div>
            <div style={{ fontSize: "28px", fontWeight: 800, color: "var(--accent-purple)", fontFamily: "var(--font-display)" }}>
              {submittedOffers.length}
            </div>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
              Proposals in review with buyers
            </p>
          </Card>

          <Card glow={shortlistedCount > 0}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "rgba(245, 158, 11, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-amber)" }}>
                <Clock size={18} />
              </div>
              <span style={{ fontSize: "14px", fontWeight: 700 }}>Shortlisted</span>
            </div>
            <div style={{ fontSize: "28px", fontWeight: 800, color: "var(--accent-amber)", fontFamily: "var(--font-display)" }}>
              {shortlistedCount}
            </div>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
              Top candidates under final selection
            </p>
          </Card>

          <Card glow={selectedCount > 0}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "rgba(16, 185, 129, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-emerald)" }}>
                <Award size={18} />
              </div>
              <span style={{ fontSize: "14px", fontWeight: 700 }}>Contracts Awarded</span>
            </div>
            <div style={{ fontSize: "28px", fontWeight: 800, color: "var(--accent-emerald)", fontFamily: "var(--font-display)" }}>
              {selectedCount}
            </div>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
              Winning offers selected by buyers
            </p>
          </Card>
        </div>

        {/* SECTION: Recommended Requirements (The Reverse Marketplace Match Engine) */}
        <div style={{ marginBottom: "48px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div>
              <h2 style={{ fontSize: "22px", fontWeight: 800, fontFamily: "var(--font-display)" }}>
                Recommended Buyer Demands For You
              </h2>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "2px" }}>
                Ranked by our algorithm based on your location, past delivery ratings, and domain certifications.
              </p>
            </div>
          </div>

          {scoredRequirements.length === 0 ? (
            <EmptyState
              icon={<Sparkles size={28} />}
              title="All caught up!"
              description="You have submitted offers to all open matching requirements. New demands are posted constantly."
            />
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
                gap: "24px",
              }}
            >
              {scoredRequirements.map((req) => (
                <Card key={req.id} glow={req.matchScore >= 90}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        background: "rgba(0, 242, 254, 0.1)",
                        border: "1px solid var(--border-glow)",
                        padding: "3px 10px",
                        borderRadius: "var(--radius-full)",
                        fontSize: "12px",
                        fontWeight: 800,
                        color: "var(--accent-cyan)",
                      }}
                    >
                      <Sparkles size={13} /> {Math.round(req.matchScore)}% MATCH
                    </div>
                    <Badge variant={req.type === "PRODUCT" ? "cyan" : "purple"}>
                      {req.type}
                    </Badge>
                  </div>

                  <h3 style={{ fontSize: "17px", fontWeight: 700, marginBottom: "8px", lineHeight: 1.4 }}>
                    {req.title}
                  </h3>
                  <p
                    style={{
                      fontSize: "13px",
                      color: "var(--text-secondary)",
                      marginBottom: "16px",
                      lineHeight: 1.6,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {req.description}
                  </p>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "12px", marginBottom: "18px", color: "var(--text-secondary)" }}>
                    <div>
                      <span style={{ color: "var(--text-muted)", display: "block" }}>Target Budget</span>
                      <span style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "14px" }}>
                        ₹{req.minBudget.toLocaleString()} – ₹{req.maxBudget.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span style={{ color: "var(--text-muted)", display: "block" }}>Location</span>
                      <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>
                        {req.isRemote ? "Remote / Online" : `${req.city || "Regional"}`}
                      </span>
                    </div>
                  </div>

                  <Link href={`/requirements/${req.id}`}>
                    <Button variant="glow" size="sm" style={{ width: "100%" }} rightIcon={<ArrowRight size={14} />}>
                      View Requirement & Submit Offer
                    </Button>
                  </Link>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* SECTION: Submitted Proposals & Status Tracker */}
        <div>
          <h2 style={{ fontSize: "22px", fontWeight: 800, fontFamily: "var(--font-display)", marginBottom: "20px" }}>
            Your Submitted Proposals ({submittedOffers.length})
          </h2>

          {submittedOffers.length === 0 ? (
            <Card style={{ textAlign: "center", padding: "40px" }}>
              <p style={{ color: "var(--text-secondary)" }}>You have not submitted any offers yet.</p>
            </Card>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {submittedOffers.map((offer) => (
                <Card key={offer.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                        <Badge variant={offer.status === "SELECTED" ? "emerald" : offer.status === "SHORTLISTED" ? "cyan" : "neutral"}>
                          {offer.status}
                        </Badge>
                        <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                          Submitted {new Date(offer.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 style={{ fontSize: "17px", fontWeight: 700 }}>{offer.requirement.title}</h3>
                      <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
                        Buyer: {offer.requirement.owner?.name} · Warranty: {offer.warranty || "Standard"}
                      </p>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>
                          ₹{offer.offeredPrice.toLocaleString()}
                        </div>
                        {offer.compatibilityScore && (
                          <span style={{ fontSize: "12px", color: "var(--accent-cyan)", fontWeight: 700 }}>
                            {Math.round(offer.compatibilityScore.overallScore)}% Match Score
                          </span>
                        )}
                      </div>
                      <Link href={`/requirements/${offer.requirementId}`}>
                        <Button size="sm" variant="secondary">
                          View Status
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
