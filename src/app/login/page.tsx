"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Sparkles, Mail, Lock, AlertCircle, ArrowRight, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to sign in");
      }

      if (redirectUrl) {
        router.push(redirectUrl);
      } else if (data.user.role === "ADMIN") {
        router.push("/admin");
      } else if (data.user.role === "VENDOR") {
        router.push("/vendor-dashboard");
      } else {
        router.push("/dashboard");
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (quickEmail: string) => {
    setEmail(quickEmail);
    setPassword("Password123!");
  };

  return (
    <div style={{ padding: "60px 0 100px 0" }}>
      <div className="container" style={{ maxWidth: "460px" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "var(--grad-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#06090f",
              margin: "0 auto 16px auto",
              boxShadow: "0 0 20px rgba(0, 242, 254, 0.3)",
            }}
          >
            <Sparkles size={24} />
          </div>
          <h1 style={{ fontSize: "26px", fontWeight: 800, fontFamily: "var(--font-display)" }}>
            Sign in to ReverseMarket
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "4px" }}>
            Access your buyer requirements or vendor opportunities.
          </p>
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

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
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
              label="Password"
              type="password"
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock size={16} />}
            />

            <Button
              type="submit"
              variant="glow"
              isLoading={loading}
              style={{ width: "100%", marginTop: "6px" }}
              rightIcon={<ArrowRight size={16} />}
            >
              Sign In
            </Button>
          </form>

          {/* Quick Demo Personas Strip */}
          <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px solid var(--border-subtle)" }}>
            <span style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "10px", textAlign: "center", fontWeight: 600 }}>
              1-Click Demo Accounts (Password: Password123!)
            </span>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
              <button
                type="button"
                onClick={() => handleQuickLogin("owner@apextech.com")}
                style={{
                  padding: "8px",
                  borderRadius: "var(--radius-sm)",
                  background: "var(--bg-tertiary)",
                  color: "var(--text-primary)",
                  fontSize: "12px",
                  fontWeight: 600,
                  border: "1px solid var(--border-subtle)",
                }}
              >
                Buyer
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin("sales@nexushardware.com")}
                style={{
                  padding: "8px",
                  borderRadius: "var(--radius-sm)",
                  background: "var(--bg-tertiary)",
                  color: "var(--text-primary)",
                  fontSize: "12px",
                  fontWeight: 600,
                  border: "1px solid var(--border-subtle)",
                }}
              >
                Vendor
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin("admin@reversemarket.io")}
                style={{
                  padding: "8px",
                  borderRadius: "var(--radius-sm)",
                  background: "var(--bg-tertiary)",
                  color: "var(--text-primary)",
                  fontSize: "12px",
                  fontWeight: 600,
                  border: "1px solid var(--border-subtle)",
                }}
              >
                Admin
              </button>
            </div>
          </div>
        </Card>

        <p style={{ textAlign: "center", fontSize: "13px", color: "var(--text-secondary)", marginTop: "20px" }}>
          Don&apos;t have an account yet?{" "}
          <Link href={`/register${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ""}`} style={{ color: "var(--accent-cyan)", fontWeight: 600 }}>
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: "center", padding: "60px", color: "var(--text-secondary)" }}>Loading sign in...</div>}>
      <LoginContent />
    </Suspense>
  );
}
