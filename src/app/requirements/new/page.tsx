import { Suspense } from "react";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { RequirementWizard } from "@/components/wizard/RequirementWizard";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Lock,
  UserPlus,
  LogIn,
  ShieldCheck,
  MessageSquare,
  Sparkles,
  ArrowRight,
  AlertTriangle,
  Layers,
  CheckCircle2
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function NewRequirementPage() {
  const session = await getSession();

  // If user is NOT authenticated, strictly enforce registration
  if (!session) {
    return (
      <div style={{ padding: "60px 0 100px 0" }}>
        <div className="container" style={{ maxWidth: "680px" }}>
          <div style={{ textAlign: "center", marginBottom: "36px" }}>
            <Badge variant="cyan">Registration Mandatory</Badge>
            <h1
              style={{
                fontSize: "32px",
                fontWeight: 800,
                fontFamily: "var(--font-display)",
                marginTop: "12px",
                letterSpacing: "-0.02em",
              }}
            >
              Registration Required to Post a Requirement
            </h1>
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: "15px",
                marginTop: "8px",
                lineHeight: 1.6,
              }}
            >
              ReverseMarket requires all demand posters to have a verified Requirement Owner account.
              This guarantees verified proposals, eliminates spam, and secures your private procurement chat.
            </p>
          </div>

          <Card glow={true}>
            {/* Value propositions */}
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
                  <ShieldCheck size={18} color="var(--accent-cyan)" />
                  <span style={{ fontWeight: 700, fontSize: "14px", color: "var(--text-primary)" }}>
                    Verified Reverse Bidding
                  </span>
                </div>
                <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                  Only certified, rating-audited suppliers discover your RFP and submit proposals.
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
                    Multi-Factor Compatibility
                  </span>
                </div>
                <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                  Offers scored automatically across budget, speed, specs, and distance.
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
                  <MessageSquare size={18} color="var(--accent-purple)" />
                  <span style={{ fontWeight: 700, fontSize: "14px", color: "var(--text-primary)" }}>
                    Private Encrypted Chat
                  </span>
                </div>
                <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                  Directly clarify warranty, pricing, and timeline details before awarding.
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
                  <Layers size={18} color="var(--accent-amber)" />
                  <span style={{ fontWeight: 700, fontSize: "14px", color: "var(--text-primary)" }}>
                    Side-by-Side Comparison
                  </span>
                </div>
                <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                  Compare competing vendor deliverables in a unified comparison matrix.
                </p>
              </div>
            </div>

            {/* Registration Actions */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <Link href="/register?role=REQUIREMENT_OWNER&redirect=/requirements/new" style={{ width: "100%" }}>
                <Button
                  variant="glow"
                  size="lg"
                  style={{ width: "100%", justifyContent: "center" }}
                  leftIcon={<UserPlus size={18} />}
                  rightIcon={<ArrowRight size={18} />}
                >
                  Register as Requirement Owner (Free)
                </Button>
              </Link>

              <Link href="/login?redirect=/requirements/new" style={{ width: "100%" }}>
                <Button
                  variant="secondary"
                  size="md"
                  style={{ width: "100%", justifyContent: "center" }}
                  leftIcon={<LogIn size={16} />}
                >
                  Already Registered? Sign In to Post
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // If user is a VENDOR, prompt them that requirement posting requires a Buyer account
  if (session.role === "VENDOR") {
    return (
      <div style={{ padding: "60px 0 100px 0" }}>
        <div className="container" style={{ maxWidth: "600px" }}>
          <Card glow={true}>
            <div style={{ textAlign: "center", marginBottom: "24px" }}>
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "50%",
                  background: "rgba(245, 158, 11, 0.15)",
                  color: "var(--accent-amber)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px auto",
                  border: "1px solid rgba(245, 158, 11, 0.3)",
                }}
              >
                <AlertTriangle size={24} />
              </div>
              <Badge variant="amber">Vendor Account Active</Badge>
              <h1
                style={{
                  fontSize: "24px",
                  fontWeight: 800,
                  fontFamily: "var(--font-display)",
                  marginTop: "12px",
                }}
              >
                Buyer Account Required to Post Demands
              </h1>
              <p
                style={{
                  color: "var(--text-secondary)",
                  fontSize: "14px",
                  marginTop: "8px",
                  lineHeight: 1.6,
                }}
              >
                You are currently signed in as <strong>{session.name}</strong> with a Vendor profile.
                Vendors submit proposals on open requirements. To post requirements, you need a Requirement Owner account.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <Link href="/vendor-dashboard" style={{ width: "100%" }}>
                <Button variant="glow" size="md" style={{ width: "100%", justifyContent: "center" }}>
                  Go to Vendor Opportunity Portal
                </Button>
              </Link>
              <Link href="/register?role=REQUIREMENT_OWNER&redirect=/requirements/new" style={{ width: "100%" }}>
                <Button variant="secondary" size="md" style={{ width: "100%", justifyContent: "center" }}>
                  Create a Requirement Owner Account
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // User is authenticated as REQUIREMENT_OWNER or ADMIN
  return (
    <div style={{ padding: "50px 0 80px 0" }}>
      <div className="container">
        <Suspense fallback={<div style={{ textAlign: "center", padding: "40px", color: "var(--text-secondary)" }}>Loading requirement builder...</div>}>
          <RequirementWizard />
        </Suspense>
      </div>
    </div>
  );
}
