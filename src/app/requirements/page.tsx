import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Package, Wrench, Search, Clock, MapPin, Sparkles, PlusCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function RequirementsDirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; search?: string }>;
}) {
  const params = await searchParams;
  const typeFilter = params.type as "PRODUCT" | "SERVICE" | undefined;
  const searchFilter = params.search;

  let requirements: any[] = [];
  try {
    requirements = await prisma.requirement.findMany({
      where: {
        status: { in: ["PUBLISHED", "MATCHED", "SHORTLISTED", "VENDOR_SELECTED"] },
        ...(typeFilter ? { type: typeFilter } : {}),
        ...(searchFilter
          ? {
              OR: [
                { title: { contains: searchFilter } },
                { description: { contains: searchFilter } },
              ],
            }
          : {}),
      },
      include: {
        category: true,
        specifications: true,
        _count: {
          select: { offers: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (e) {
    console.error("Failed to load requirements from database:", e);
  }

  return (
    <div style={{ padding: "40px 0 80px 0" }}>
      <div className="container">
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginBottom: "32px",
            flexWrap: "wrap",
            gap: "20px",
          }}
        >
          <div>
            <Badge variant="cyan">Reverse Market Directory</Badge>
            <h1
              style={{
                fontSize: "32px",
                fontWeight: 800,
                marginTop: "8px",
                fontFamily: "var(--font-display)",
              }}
            >
              Explore Open Requirements
            </h1>
            <p style={{ color: "var(--text-secondary)", marginTop: "4px" }}>
              Active demands posted by buyers waiting for tailored vendor proposals.
            </p>
          </div>

          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <Link href="/requirements/new">
              <Button variant="glow" leftIcon={<PlusCircle size={16} />}>
                Post Requirement
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "28px",
            flexWrap: "wrap",
          }}
        >
          <Link href="/requirements">
            <Button variant={!typeFilter ? "primary" : "secondary"} size="sm">
              All Demands ({requirements.length})
            </Button>
          </Link>
          <Link href="/requirements?type=PRODUCT">
            <Button
              variant={typeFilter === "PRODUCT" ? "primary" : "secondary"}
              size="sm"
              leftIcon={<Package size={14} />}
            >
              Products
            </Button>
          </Link>
          <Link href="/requirements?type=SERVICE">
            <Button
              variant={typeFilter === "SERVICE" ? "primary" : "secondary"}
              size="sm"
              leftIcon={<Wrench size={14} />}
            >
              Services
            </Button>
          </Link>
        </div>

        {/* Requirements Grid */}
        {requirements.length === 0 ? (
          <EmptyState
            icon={<Search size={28} />}
            title="No requirements found"
            description="There are currently no active demands matching your filters. Tell the market what you are looking for!"
            actionText="Post a New Requirement"
            actionHref="/requirements/new"
          />
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
              gap: "24px",
            }}
          >
            {requirements.map((req) => (
              <Card key={req.id} glow={req.status === "PUBLISHED"}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "12px",
                  }}
                >
                  <Badge variant={req.type === "PRODUCT" ? "cyan" : "purple"}>
                    {req.type}
                  </Badge>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "var(--accent-cyan)",
                      fontWeight: 700,
                      background: "rgba(0, 242, 254, 0.08)",
                      padding: "3px 8px",
                      borderRadius: "var(--radius-sm)",
                    }}
                  >
                    {req._count.offers} {req._count.offers === 1 ? "Offer" : "Offers"} Received
                  </div>
                </div>

                <h3
                  style={{
                    fontSize: "18px",
                    fontWeight: 700,
                    marginBottom: "10px",
                    lineHeight: 1.4,
                  }}
                >
                  {req.title}
                </h3>

                <p
                  style={{
                    fontSize: "13px",
                    color: "var(--text-secondary)",
                    marginBottom: "20px",
                    lineHeight: 1.6,
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {req.description}
                </p>

                {/* Key Spec tags */}
                {req.specifications.length > 0 && (
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "6px",
                      marginBottom: "20px",
                    }}
                  >
                    {req.specifications?.slice(0, 3).map((s: any, idx: number) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: "11px",
                          background: "var(--bg-tertiary)",
                          padding: "3px 8px",
                          borderRadius: "4px",
                          color: "var(--text-secondary)",
                          border: "1px solid var(--border-subtle)",
                        }}
                      >
                        {s.specKey}: {s.specValue}
                      </span>
                    ))}
                  </div>
                )}

                {/* Footer metadata & inspect CTA */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingTop: "16px",
                    borderTop: "1px solid var(--border-subtle)",
                  }}
                >
                  <div>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>
                      Budget
                    </span>
                    <span
                      style={{
                        fontSize: "16px",
                        fontWeight: 800,
                        color: "var(--text-primary)",
                        fontFamily: "var(--font-display)",
                      }}
                    >
                      ₹{req.minBudget.toLocaleString()} – ₹{req.maxBudget.toLocaleString()}
                    </span>
                  </div>

                  <Link href={`/requirements/${req.id}`}>
                    <Button size="sm" variant="secondary">
                      View Details
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
