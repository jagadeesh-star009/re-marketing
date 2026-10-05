"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Sparkles, Mail, Lock, User, Briefcase, AlertCircle, ArrowRight, Building, MapPin } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = searchParams.get("role") === "VENDOR" ? "VENDOR" : "REQUIREMENT_OWNER";

  const [role, setRole] = useState<"REQUIREMENT_OWNER" | "VENDOR">(initialRole);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");

  // Vendor fields
  const [businessName, setBusinessName] = useState("");
  const [description, setDescription] = useState("");
  const [city, setCity] = useState("Bengaluru");
  const [state, setState] = useState("Karnataka");
  const [experienceYears, setExperienceYears] = useState(3);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload: any = {
        name,
        email,
        password,
        role,
        phone,
      };

      if (role === "VENDOR") {
        payload.businessName = businessName || name;
        payload.description = description || "Verified marketplace vendor";
        payload.city = city;
        payload.state = state;
        payload.experienceYears = experienceYears;
        payload.isRemoteAvailable = true;
      }

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create account");
      }

      const redirectUrl = searchParams.get("redirect");
      if (redirectUrl) {
        router.push(redirectUrl);
      } else if (data.user.role === "VENDOR") {
        router.push("/vendor-dashboard");
      } else {
        router.push("/dashboard");
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "50px 0 100px 0" }}>
      <div className="container" style={{ maxWidth: "560px" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <Badge variant="cyan">Join ReverseMarket</Badge>
          <h1 style={{ fontSize: "28px", fontWeight: 800, fontFamily: "var(--font-display)", marginTop: "8px" }}>
            Create Your Platform Account
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "4px" }}>
            Whether you want to source products or fulfill buyer demands.
          </p>
        </div>

        {/* Role Selection Tabs */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "24px" }}>
          <div
            onClick={() => setRole("REQUIREMENT_OWNER")}
            style={{
              padding: "16px",
              borderRadius: "var(--radius-sm)",
              border: role === "REQUIREMENT_OWNER" ? "2px solid var(--accent-cyan)" : "1px solid var(--border-subtle)",
              background: role === "REQUIREMENT_OWNER" ? "rgba(0, 242, 254, 0.08)" : "var(--bg-card)",
              cursor: "pointer",
              textAlign: "center",
              transition: "all var(--transition-fast)",
            }}
          >
            <User size={20} color="var(--accent-cyan)" style={{ marginBottom: "6px" }} />
            <div style={{ fontWeight: 700, fontSize: "14px", color: "var(--text-primary)" }}>Requirement Owner</div>
            <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Post needs & receive offers</span>
          </div>

          <div
            onClick={() => setRole("VENDOR")}
            style={{
              padding: "16px",
              borderRadius: "var(--radius-sm)",
              border: role === "VENDOR" ? "2px solid var(--accent-purple)" : "1px solid var(--border-subtle)",
              background: role === "VENDOR" ? "rgba(139, 92, 246, 0.08)" : "var(--bg-card)",
              cursor: "pointer",
              textAlign: "center",
              transition: "all var(--transition-fast)",
            }}
          >
            <Briefcase size={20} color="var(--accent-purple)" style={{ marginBottom: "6px" }} />
            <div style={{ fontWeight: 700, fontSize: "14px", color: "var(--text-primary)" }}>Vendor / Seller</div>
            <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Discover needs & submit bids</span>
          </div>
        </div>

        <Card glow={true}>
          {error && (
            <div
              style={{
                padding: "12px 16px",
                borderRadius: "var(--radius-sm)",
                background: "rgba(244, 63, 94, 0.12)",
                border: "1px solid rgba(244, 63, 94, 0.3)",
                color: "var(--accent-rose)",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "20px",
                fontSize: "13px",
              }}
            >
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <Input
              label="Full Name / Representative"
              placeholder="e.g. Vikram Verma"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              leftIcon={<User size={16} />}
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="name@company.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail size={16} />}
            />

            <Input
              label="Password (min 8 chars)"
              type="password"
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock size={16} />}
            />

            <Input
              label="Phone Number"
              type="tel"
              placeholder="+91 98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            {/* Extra Vendor Fields */}
            {role === "VENDOR" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px", paddingTop: "12px", borderTop: "1px solid var(--border-subtle)" }}>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--accent-purple)" }}>
                  Vendor Capabilities Profile
                </span>

                <Input
                  label="Business / Studio Name"
                  placeholder="e.g. Zenith Cloud Labs"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  leftIcon={<Building size={16} />}
                />

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <Input
                    label="City"
                    placeholder="Bengaluru"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    leftIcon={<MapPin size={16} />}
                  />
                  <Input
                    label="State"
                    placeholder="Karnataka"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "4px", display: "block" }}>
                    Years in Business
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(parseInt(e.target.value) || 1)}
                    style={{ width: "100%", padding: "10px", background: "var(--bg-input)", color: "var(--text-primary)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-sm)" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "4px", display: "block" }}>
                    Company Description & Domain Specialties
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe your manufacturing, inventory, or engineering specialties..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    style={{ width: "100%", padding: "10px", background: "var(--bg-input)", color: "var(--text-primary)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-sm)" }}
                  />
                </div>
              </div>
            )}

            <Button
              type="submit"
              variant="glow"
              isLoading={loading}
              style={{ width: "100%", marginTop: "10px" }}
              rightIcon={<ArrowRight size={16} />}
            >
              Complete Registration
            </Button>
          </form>
        </Card>

        <p style={{ textAlign: "center", fontSize: "13px", color: "var(--text-secondary)", marginTop: "20px" }}>
          Already registered?{" "}
          <Link href="/login" style={{ color: "var(--accent-cyan)", fontWeight: 600 }}>
            Sign In here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: "center", padding: "60px" }}>Loading registration...</div>}>
      <RegisterContent />
    </Suspense>
  );
}
