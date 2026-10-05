"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Users,
  Package,
  Wrench,
  Sliders,
  Award,
  Layers,
  Save,
  CheckCircle2,
  AlertCircle,
  Database,
  TrendingUp,
  Settings
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

interface AdminClientProps {
  initialData: {
    kpis: any;
    users: any[];
    requirements: any[];
    weights: any;
    categories: any[];
  };
}

export const AdminClient: React.FC<AdminClientProps> = ({ initialData }) => {
  const [kpis] = useState(initialData.kpis);
  const [users] = useState(initialData.users);
  const [requirements] = useState(initialData.requirements);
  const [categories] = useState(initialData.categories);

  const [weights, setWeights] = useState({
    budgetWeight: initialData.weights?.budgetWeight || 0.30,
    relevanceWeight: initialData.weights?.relevanceWeight || 0.30,
    deliveryWeight: initialData.weights?.deliveryWeight || 0.20,
    locationWeight: initialData.weights?.locationWeight || 0.10,
    vendorQualityWeight: initialData.weights?.vendorQualityWeight || 0.10,
  });

  const [savingWeights, setSavingWeights] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "weights" | "users" | "requirements">("overview");

  const totalWeight =
    weights.budgetWeight +
    weights.relevanceWeight +
    weights.deliveryWeight +
    weights.locationWeight +
    weights.vendorQualityWeight;

  const handleSaveWeights = async () => {
    setSavingWeights(true);
    setSaveSuccess(false);
    try {
      const res = await fetch("/api/admin/weights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(weights),
      });
      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingWeights(false);
    }
  };

  return (
    <div style={{ padding: "40px 0 80px 0" }}>
      <div className="container">
        {/* Admin Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <Badge variant="cyan">Command Console</Badge>
            <h1 style={{ fontSize: "30px", fontWeight: 800, fontFamily: "var(--font-display)", marginTop: "6px" }}>
              Platform Operations & Governance
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
              Oversee marketplace volume, tune algorithm weights, and manage users.
            </p>
          </div>

          {/* Navigation Tabs */}
          <div style={{ display: "flex", gap: "8px", background: "var(--bg-tertiary)", padding: "4px", borderRadius: "var(--radius-sm)" }}>
            <button
              onClick={() => setActiveTab("overview")}
              style={{
                padding: "8px 16px",
                borderRadius: "var(--radius-xs)",
                background: activeTab === "overview" ? "var(--bg-card)" : "transparent",
                color: activeTab === "overview" ? "var(--accent-cyan)" : "var(--text-secondary)",
                fontWeight: 600,
                fontSize: "13px",
              }}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("weights")}
              style={{
                padding: "8px 16px",
                borderRadius: "var(--radius-xs)",
                background: activeTab === "weights" ? "var(--bg-card)" : "transparent",
                color: activeTab === "weights" ? "var(--accent-cyan)" : "var(--text-secondary)",
                fontWeight: 600,
                fontSize: "13px",
              }}
            >
              Matching Weights
            </button>
            <button
              onClick={() => setActiveTab("users")}
              style={{
                padding: "8px 16px",
                borderRadius: "var(--radius-xs)",
                background: activeTab === "users" ? "var(--bg-card)" : "transparent",
                color: activeTab === "users" ? "var(--accent-cyan)" : "var(--text-secondary)",
                fontWeight: 600,
                fontSize: "13px",
              }}
            >
              Users ({users.length})
            </button>
            <button
              onClick={() => setActiveTab("requirements")}
              style={{
                padding: "8px 16px",
                borderRadius: "var(--radius-xs)",
                background: activeTab === "requirements" ? "var(--bg-card)" : "transparent",
                color: activeTab === "requirements" ? "var(--accent-cyan)" : "var(--text-secondary)",
                fontWeight: 600,
                fontSize: "13px",
              }}
            >
              Requirements ({requirements.length})
            </button>
          </div>
        </div>

        {/* TAB 1: OVERVIEW METRICS */}
        {activeTab === "overview" && (
          <div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "18px",
                marginBottom: "36px",
              }}
            >
              <Card>
                <span style={{ fontSize: "12px", color: "var(--text-muted)", display: "block" }}>Total Registered Users</span>
                <div style={{ fontSize: "28px", fontWeight: 800, color: "var(--text-primary)", fontFamily: "var(--font-display)", marginTop: "4px" }}>
                  {kpis.totalUsers}
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
                  {kpis.requirementOwners} Owners · {kpis.vendors} Vendors
                </div>
              </Card>

              <Card>
                <span style={{ fontSize: "12px", color: "var(--text-muted)", display: "block" }}>Active Demands</span>
                <div style={{ fontSize: "28px", fontWeight: 800, color: "var(--accent-cyan)", fontFamily: "var(--font-display)", marginTop: "4px" }}>
                  {kpis.activeRequirements}
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
                  {kpis.productRequirements} Products · {kpis.serviceRequirements} Services
                </div>
              </Card>

              <Card>
                <span style={{ fontSize: "12px", color: "var(--text-muted)", display: "block" }}>Proposals Submitted</span>
                <div style={{ fontSize: "28px", fontWeight: 800, color: "var(--accent-purple)", fontFamily: "var(--font-display)", marginTop: "4px" }}>
                  {kpis.totalOffers}
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
                  {kpis.totalShortlists} Shortlisted
                </div>
              </Card>

              <Card>
                <span style={{ fontSize: "12px", color: "var(--text-muted)", display: "block" }}>Awarded Selections</span>
                <div style={{ fontSize: "28px", fontWeight: 800, color: "var(--accent-emerald)", fontFamily: "var(--font-display)", marginTop: "4px" }}>
                  {kpis.successfulSelections}
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
                  {kpis.completedOrders} Fully Completed
                </div>
              </Card>
            </div>

            {/* Categories & Architecture Status */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }} className="admin-grid">
              <style jsx>{`
                @media (max-width: 860px) {
                  .admin-grid { grid-template-columns: 1fr !important; }
                }
              `}</style>

              <Card>
                <h3 style={{ fontSize: "17px", fontWeight: 700, marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Layers size={18} color="var(--accent-cyan)" /> Configured Categories
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {categories.map((cat) => (
                    <div key={cat.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px", background: "var(--bg-tertiary)", borderRadius: "var(--radius-sm)" }}>
                      <div>
                        <div style={{ fontSize: "14px", fontWeight: 600 }}>{cat.name}</div>
                        <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{cat.subcategories?.length || 0} subcategories</span>
                      </div>
                      <Badge variant={cat.type === "PRODUCT" ? "cyan" : cat.type === "SERVICE" ? "purple" : "emerald"}>
                        {cat.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              </Card>

              <Card>
                <h3 style={{ fontSize: "17px", fontWeight: 700, marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Database size={18} color="var(--accent-emerald)" /> Infrastructure Health
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "13px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border-subtle)" }}>
                    <span style={{ color: "var(--text-muted)" }}>Database Engine</span>
                    <span style={{ fontWeight: 600, color: "var(--accent-emerald)" }}>Prisma Relational SQL (Active)</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border-subtle)" }}>
                    <span style={{ color: "var(--text-muted)" }}>Serverless Runtime</span>
                    <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>Vercel Edge / Node.js 24+</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border-subtle)" }}>
                    <span style={{ color: "var(--text-muted)" }}>Matching Engine</span>
                    <span style={{ fontWeight: 600, color: "var(--accent-cyan)" }}>Multi-Factor Deterministic Algorithm</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}>
                    <span style={{ color: "var(--text-muted)" }}>WCAG Accessibility</span>
                    <span style={{ fontWeight: 600, color: "var(--accent-emerald)" }}>2.2 AA Compliant</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* TAB 2: MATCHING WEIGHTS CONFIGURATION */}
        {activeTab === "weights" && (
          <Card glow={true} style={{ maxWidth: "700px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div>
                <h2 style={{ fontSize: "20px", fontWeight: 800 }}>Matching Algorithm Weights</h2>
                <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "2px" }}>
                  Adjust factor weights dynamically. The system automatically normalizes weights to sum to 100%.
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: "12px", color: "var(--text-muted)", display: "block" }}>Sum</span>
                <span style={{ fontSize: "18px", fontWeight: 800, color: Math.abs(totalWeight - 1.0) < 0.01 ? "var(--accent-emerald)" : "var(--accent-amber)" }}>
                  {Math.round(totalWeight * 100)}%
                </span>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Budget Weight */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", fontWeight: 600, marginBottom: "6px" }}>
                  <span>Budget Compatibility Weight</span>
                  <span style={{ color: "var(--accent-cyan)" }}>{Math.round(weights.budgetWeight * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={Math.round(weights.budgetWeight * 100)}
                  onChange={(e) => setWeights({ ...weights, budgetWeight: parseFloat(e.target.value) / 100 })}
                  style={{ width: "100%", accentColor: "var(--accent-cyan)" }}
                />
              </div>

              {/* Relevance Weight */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", fontWeight: 600, marginBottom: "6px" }}>
                  <span>Requirement Relevance Weight</span>
                  <span style={{ color: "var(--accent-cyan)" }}>{Math.round(weights.relevanceWeight * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={Math.round(weights.relevanceWeight * 100)}
                  onChange={(e) => setWeights({ ...weights, relevanceWeight: parseFloat(e.target.value) / 100 })}
                  style={{ width: "100%", accentColor: "var(--accent-cyan)" }}
                />
              </div>

              {/* Delivery Weight */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", fontWeight: 600, marginBottom: "6px" }}>
                  <span>Delivery / Deadline Weight</span>
                  <span style={{ color: "var(--accent-cyan)" }}>{Math.round(weights.deliveryWeight * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={Math.round(weights.deliveryWeight * 100)}
                  onChange={(e) => setWeights({ ...weights, deliveryWeight: parseFloat(e.target.value) / 100 })}
                  style={{ width: "100%", accentColor: "var(--accent-cyan)" }}
                />
              </div>

              {/* Location Weight */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", fontWeight: 600, marginBottom: "6px" }}>
                  <span>Location Proximity / Remote Weight</span>
                  <span style={{ color: "var(--accent-cyan)" }}>{Math.round(weights.locationWeight * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={Math.round(weights.locationWeight * 100)}
                  onChange={(e) => setWeights({ ...weights, locationWeight: parseFloat(e.target.value) / 100 })}
                  style={{ width: "100%", accentColor: "var(--accent-cyan)" }}
                />
              </div>

              {/* Vendor Quality Weight */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", fontWeight: 600, marginBottom: "6px" }}>
                  <span>Vendor Quality & Historical Rating Weight</span>
                  <span style={{ color: "var(--accent-cyan)" }}>{Math.round(weights.vendorQualityWeight * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={Math.round(weights.vendorQualityWeight * 100)}
                  onChange={(e) => setWeights({ ...weights, vendorQualityWeight: parseFloat(e.target.value) / 100 })}
                  style={{ width: "100%", accentColor: "var(--accent-cyan)" }}
                />
              </div>

              {saveSuccess && (
                <div style={{ padding: "10px 14px", background: "rgba(16, 185, 129, 0.1)", color: "var(--accent-emerald)", borderRadius: "var(--radius-sm)", fontSize: "13px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <CheckCircle2 size={16} /> Weights successfully updated and applied platform-wide.
                </div>
              )}

              <Button
                variant="glow"
                onClick={handleSaveWeights}
                isLoading={savingWeights}
                leftIcon={<Save size={16} />}
              >
                Save Matching Weights
              </Button>
            </div>
          </Card>
        )}

        {/* TAB 3: USERS LIST */}
        {activeTab === "users" && (
          <Card>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border-subtle)", textAlign: "left", color: "var(--text-muted)" }}>
                    <th style={{ padding: "12px" }}>User / Business</th>
                    <th style={{ padding: "12px" }}>Email</th>
                    <th style={{ padding: "12px" }}>Role</th>
                    <th style={{ padding: "12px" }}>Joined</th>
                    <th style={{ padding: "12px" }}>Activity</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                      <td style={{ padding: "12px", fontWeight: 600, color: "var(--text-primary)" }}>
                        {u.vendorProfile?.businessName || u.name}
                      </td>
                      <td style={{ padding: "12px", color: "var(--text-secondary)" }}>{u.email}</td>
                      <td style={{ padding: "12px" }}>
                        <Badge variant={u.role === "ADMIN" ? "rose" : u.role === "VENDOR" ? "purple" : "cyan"}>
                          {u.role}
                        </Badge>
                      </td>
                      <td style={{ padding: "12px", color: "var(--text-muted)" }}>
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td style={{ padding: "12px", color: "var(--text-secondary)" }}>
                        {u._count.requirements} Demands · {u._count.offers} Proposals
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* TAB 4: ALL REQUIREMENTS */}
        {activeTab === "requirements" && (
          <Card>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border-subtle)", textAlign: "left", color: "var(--text-muted)" }}>
                    <th style={{ padding: "12px" }}>Requirement Title</th>
                    <th style={{ padding: "12px" }}>Type</th>
                    <th style={{ padding: "12px" }}>Owner</th>
                    <th style={{ padding: "12px" }}>Budget Range</th>
                    <th style={{ padding: "12px" }}>Offers</th>
                    <th style={{ padding: "12px" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {requirements.map((req) => (
                    <tr key={req.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                      <td style={{ padding: "12px", fontWeight: 600, color: "var(--text-primary)" }}>
                        {req.title}
                      </td>
                      <td style={{ padding: "12px" }}>
                        <Badge variant={req.type === "PRODUCT" ? "cyan" : "purple"}>
                          {req.type}
                        </Badge>
                      </td>
                      <td style={{ padding: "12px", color: "var(--text-secondary)" }}>{req.owner?.name}</td>
                      <td style={{ padding: "12px", color: "var(--text-secondary)" }}>
                        ₹{req.minBudget.toLocaleString()} – ₹{req.maxBudget.toLocaleString()}
                      </td>
                      <td style={{ padding: "12px", fontWeight: 700, color: "var(--accent-cyan)" }}>
                        {req._count.offers}
                      </td>
                      <td style={{ padding: "12px" }}>
                        <Link href={`/requirements/${req.id}`}>
                          <Button size="sm" variant="ghost">Inspect</Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};
