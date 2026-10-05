import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  Sparkles,
  PlusCircle,
  Package,
  Wrench,
  Clock,
  ArrowRight,
  Bookmark,
  Award,
  CheckCircle2,
  AlertTriangle,
  MessageSquare
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function OwnerDashboardPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  // Fetch owner's requirements with offers, shortlists, and selections
  const requirements = await prisma.requirement.findMany({
    where: { ownerId: session.id },
    include: {
      category: true,
      specifications: true,
      offers: {
        include: {
          vendorProfile: true,
          compatibilityScore: true,
        },
      },
      shortlists: {
        include: {
          offer: {
            include: {
              vendorProfile: true,
              compatibilityScore: true,
            },
          },
        },
      },
      selections: {
        include: {
          vendorProfile: true,
          offer: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalOffersCount = requirements.reduce((acc, r) => acc + r.offers.length, 0);
  const activeRequirements = requirements.filter((r) => r.status !== "COMPLETED" && r.status !== "CANCELLED");
  const selectedVendors = requirements.filter((r) => r.selections.length > 0);

  // Collect all shortlisted offers across all requirements
  const allShortlisted = requirements.flatMap((r) =>
    r.shortlists.map((s) => ({ ...s, requirementTitle: r.title }))
  );

  return (
    <div style={{ padding: "40px 0 80px 0" }}>
      <div className="container">
        {/* Dashboard Header */}
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
            <Badge variant="cyan">Requirement Owner Command Center</Badge>
            <h1
              style={{
                fontSize: "30px",
                fontWeight: 800,
                marginTop: "8px",
                fontFamily: "var(--font-display)",
              }}
            >
              Welcome back, {session.name}
            </h1>
            <p style={{ color: "var(--text-secondary)", marginTop: "4px" }}>
              Track active demands, review incoming proposals, and award contracts.
            </p>
          </div>

          <Link href="/requirements/new">
            <Button variant="glow" leftIcon={<PlusCircle size={16} />}>
              Create New Requirement
            </Button>
          </Link>
        </div>

        {/* Actionable Triad: What is happening? What needs attention? What should I do next? */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "20px",
            marginBottom: "36px",
          }}
        >
          {/* Card 1: What is happening */}
          <Card glow={false}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "rgba(0, 242, 254, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-cyan)" }}>
                <Clock size={18} />
              </div>
              <h3 style={{ fontSize: "16px", fontWeight: 700 }}>What is Happening</h3>
            </div>
            <div style={{ fontSize: "28px", fontWeight: 800, color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>
              {activeRequirements.length} Active Demands
            </div>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
              {totalOffersCount} competing vendor proposals received across your listings.
            </p>
          </Card>

          {/* Card 2: What needs attention */}
          <Card glow={allShortlisted.length > 0}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "rgba(139, 92, 246, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-purple)" }}>
                <Bookmark size={18} />
              </div>
              <h3 style={{ fontSize: "16px", fontWeight: 700 }}>What Needs Attention</h3>
            </div>
            <div style={{ fontSize: "28px", fontWeight: 800, color: "var(--accent-purple)", fontFamily: "var(--font-display)" }}>
              {allShortlisted.length} In Shortlist
            </div>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
              Proposals bookmarked and ready for final vendor selection.
            </p>
          </Card>

          {/* Card 3: What should I do next */}
          <Card glow={false}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "rgba(16, 185, 129, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-emerald)" }}>
                <Award size={18} />
              </div>
              <h3 style={{ fontSize: "16px", fontWeight: 700 }}>Active Projects</h3>
            </div>
            <div style={{ fontSize: "28px", fontWeight: 800, color: "var(--accent-emerald)", fontFamily: "var(--font-display)" }}>
              {selectedVendors.length} Awarded
            </div>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
              Projects currently in delivery and fulfillment phase.
            </p>
          </Card>
        </div>

        {/* Section: Your Posted Requirements */}
        <div style={{ marginBottom: "48px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h2 style={{ fontSize: "22px", fontWeight: 800, fontFamily: "var(--font-display)" }}>
              Your Requirements & Incoming Proposals
            </h2>
          </div>

          {requirements.length === 0 ? (
            <EmptyState
              icon={<Package size={28} />}
              title="You haven't posted a requirement yet."
              description="Tell the market what you're looking for, whether hardware equipment or a full-scale engineering team."
              actionText="Post Your First Requirement"
              actionHref="/requirements/new"
            />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {requirements.map((req) => (
                <Card key={req.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                        <Badge variant={req.type === "PRODUCT" ? "cyan" : "purple"}>
                          {req.type}
                        </Badge>
                        <Badge variant={req.status === "VENDOR_SELECTED" ? "emerald" : "neutral"}>
                          {req.status.replace("_", " ")}
                        </Badge>
                        <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                          Created {new Date(req.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 style={{ fontSize: "18px", fontWeight: 700 }}>{req.title}</h3>
                      <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
                        Budget: ₹{req.minBudget.toLocaleString()} – ₹{req.maxBudget.toLocaleString()} · Location: {req.isRemote ? "Remote Friendly" : `${req.city}, ${req.state}`}
                      </p>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ textAlign: "right" }}>
                        <span style={{ fontSize: "20px", fontWeight: 800, color: "var(--accent-cyan)", fontFamily: "var(--font-display)" }}>
                          {req.offers.length}
                        </span>
                        <span style={{ fontSize: "12px", color: "var(--text-muted)", display: "block" }}>
                          Offers
                        </span>
                      </div>
                      <Link href={`/requirements/${req.id}`}>
                        <Button size="sm" variant="secondary" rightIcon={<ArrowRight size={14} />}>
                          Manage Offers
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {/* Best Match Highlight if offers exist */}
                  {req.offers.length > 0 && (
                    <div
                      style={{
                        marginTop: "16px",
                        padding: "12px 16px",
                        borderRadius: "var(--radius-sm)",
                        background: "rgba(0, 242, 254, 0.04)",
                        border: "1px solid var(--border-glow)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        fontSize: "13px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <Sparkles size={16} color="var(--accent-cyan)" />
                        <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                          Top Matching Proposal: {req.offers[0]?.vendorProfile?.businessName}
                        </span>
                        <span style={{ color: "var(--accent-cyan)", fontWeight: 700 }}>
                          ({Math.round(req.offers[0]?.compatibilityScore?.overallScore || 90)}% Match)
                        </span>
                      </div>
                      <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>
                        ₹{req.offers[0]?.offeredPrice?.toLocaleString()}
                      </span>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Section: Shortlisted Opportunities */}
        {allShortlisted.length > 0 && (
          <div>
            <h2 style={{ fontSize: "22px", fontWeight: 800, fontFamily: "var(--font-display)", marginBottom: "20px" }}>
              My Shortlisted Vendor Offers ({allShortlisted.length})
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" }}>
              {allShortlisted.map((s) => (
                <Card key={s.id} glow={true}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                    <div>
                      <h4 style={{ fontSize: "16px", fontWeight: 700 }}>{s.offer?.vendorProfile?.businessName}</h4>
                      <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                        For: {s.requirementTitle}
                      </span>
                    </div>
                    <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--accent-cyan)" }}>
                      ₹{s.offer?.offeredPrice.toLocaleString()}
                    </div>
                  </div>
                  {s.notes && (
                    <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "16px" }}>
                      &ldquo;{s.notes}&rdquo;
                    </p>
                  )}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "12px", borderTop: "1px solid var(--border-subtle)" }}>
                    <span style={{ fontSize: "12px", color: "var(--accent-cyan)", fontWeight: 700 }}>
                      {Math.round(s.offer?.compatibilityScore?.overallScore || 90)}% Match
                    </span>
                    <Link href={`/requirements/${s.requirementId}`}>
                      <Button size="sm" variant="glow">
                        Review & Select
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
