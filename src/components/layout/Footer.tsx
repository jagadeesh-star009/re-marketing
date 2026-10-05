import React from "react";
import Link from "next/link";
import { Sparkles, ShieldCheck, CheckCircle2, Lock, Headphones } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer
      style={{
        background: "var(--bg-secondary)",
        borderTop: "1px solid var(--border-subtle)",
        padding: "60px 0 30px 0",
        marginTop: "auto",
        position: "relative",
        zIndex: 1,
      }}
    >
      <div className="container">
        {/* Top Trust Strip */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "24px",
            paddingBottom: "40px",
            marginBottom: "40px",
            borderBottom: "1px solid var(--border-subtle)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "rgba(0, 255, 157, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-cyan)" }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "14px", color: "var(--text-primary)" }}>100% Escrow Protected</div>
              <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Funds held safely until delivery verified</div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "rgba(157, 78, 221, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-purple)" }}>
              <CheckCircle2 size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "14px", color: "var(--text-primary)" }}>Verified Vendors Only</div>
              <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Audited suppliers with proven track records</div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "rgba(0, 229, 255, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-blue)" }}>
              <Lock size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "14px", color: "var(--text-primary)" }}>Private Direct Negotiation</div>
              <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Encrypted buyer-seller communications</div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "rgba(255, 183, 3, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-amber)" }}>
              <Headphones size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "14px", color: "var(--text-primary)" }}>24/7 Procurement Support</div>
              <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Dedicated resolution and delivery desk</div>
            </div>
          </div>
        </div>

        {/* Footer Links Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "40px",
            marginBottom: "50px",
          }}
        >
          {/* Brand Col */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  background: "var(--grad-primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#05070d",
                }}
              >
                <Sparkles size={17} />
              </div>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "18px" }}>
                Reverse<span className="text-gradient-cyan">Market</span>
              </span>
            </div>
            <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.6, maxWidth: "300px" }}>
              The needs-first reverse marketplace. Post your demand specifications, receive competitive supplier bids, compare proposals side-by-side, and award contracts safely.
            </p>
          </div>

          {/* Marketplace Categories */}
          <div>
            <h4 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "16px", color: "var(--text-primary)" }}>
              Marketplace
            </h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "10px", fontSize: "14px", color: "var(--text-secondary)" }}>
              <li><Link href="/requirements">Browse All Demands</Link></li>
              <li><Link href="/requirements?type=PRODUCT">Product Demands</Link></li>
              <li><Link href="/requirements?type=SERVICE">Service Demands</Link></li>
              <li><Link href="/requirements/new">Post a Requirement</Link></li>
              <li><Link href="/vendor-dashboard">Verified Vendors</Link></li>
            </ul>
          </div>

          {/* For Buyers */}
          <div>
            <h4 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "16px", color: "var(--text-primary)" }}>
              For Buyers
            </h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "10px", fontSize: "14px", color: "var(--text-secondary)" }}>
              <li><Link href="/requirements/new">How to Post Demands</Link></li>
              <li><Link href="/dashboard">Buyer Command Center</Link></li>
              <li><Link href="/register?role=REQUIREMENT_OWNER">Create Buyer Account</Link></li>
              <li><Link href="/messages">Private Chat Workspace</Link></li>
              <li><Link href="/requirements">Compare Vendor Bids</Link></li>
            </ul>
          </div>

          {/* For Vendors */}
          <div>
            <h4 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "16px", color: "var(--text-primary)" }}>
              For Suppliers & Vendors
            </h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "10px", fontSize: "14px", color: "var(--text-secondary)" }}>
              <li><Link href="/register?role=VENDOR">Become a Verified Vendor</Link></li>
              <li><Link href="/vendor-dashboard">Live Opportunity Feed</Link></li>
              <li><Link href="/vendor-dashboard">Submit Tailored Proposals</Link></li>
              <li><Link href="/login">Vendor Portal Login</Link></li>
              <li><Link href="/vendor-dashboard">Zero Upfront Listing Fees</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: "24px",
            borderTop: "1px solid var(--border-subtle)",
            fontSize: "13px",
            color: "var(--text-muted)",
            gap: "16px",
          }}
        >
          <div>
            © {new Date().getFullYear()} ReverseMarket Inc. All rights reserved.
          </div>
          <div style={{ display: "flex", gap: "24px" }}>
            <Link href="/requirements" style={{ color: "var(--text-secondary)" }}>Marketplace</Link>
            <Link href="/register" style={{ color: "var(--text-secondary)" }}>Register</Link>
            <Link href="/login" style={{ color: "var(--text-secondary)" }}>Sign In</Link>
            <Link href="/admin" style={{ color: "var(--text-secondary)" }}>Administration</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
