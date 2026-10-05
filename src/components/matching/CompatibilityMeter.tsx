"use client";

import React, { useState } from "react";
import { Sparkles, ChevronDown, ChevronUp, DollarSign, Target, Clock, MapPin, Award } from "lucide-react";

export interface CompatibilityMeterProps {
  overallScore: number;
  budgetScore?: number;
  relevanceScore?: number;
  deliveryScore?: number;
  locationScore?: number;
  vendorQualityScore?: number;
  breakdown?: {
    budget?: string;
    relevance?: string;
    delivery?: string;
    location?: string;
    vendorQuality?: string;
  } | null;
  compact?: boolean;
}

export const CompatibilityMeter: React.FC<CompatibilityMeterProps> = ({
  overallScore,
  budgetScore,
  relevanceScore,
  deliveryScore,
  locationScore,
  vendorQualityScore,
  breakdown,
  compact = false,
}) => {
  const [expanded, setExpanded] = useState(false);

  // Score color gradient
  const getScoreColor = (score: number) => {
    if (score >= 90) return { hex: "#00f2fe", grad: "var(--grad-primary)", label: "EXCELLENT MATCH" };
    if (score >= 80) return { hex: "#10b981", grad: "linear-gradient(135deg, #10b981, #059669)", label: "HIGH MATCH" };
    if (score >= 65) return { hex: "#f59e0b", grad: "linear-gradient(135deg, #f59e0b, #d97706)", label: "MODERATE MATCH" };
    return { hex: "#f43f5e", grad: "linear-gradient(135deg, #f43f5e, #e11d48)", label: "LOW FIT" };
  };

  const status = getScoreColor(overallScore);

  if (compact) {
    return (
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          background: "rgba(0, 242, 254, 0.08)",
          border: `1px solid ${status.hex}44`,
          padding: "4px 10px",
          borderRadius: "var(--radius-full)",
        }}
      >
        <Sparkles size={14} color={status.hex} />
        <span style={{ fontSize: "14px", fontWeight: 800, color: status.hex, fontFamily: "var(--font-display)" }}>
          {Math.round(overallScore)}%
        </span>
        <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)" }}>
          COMPATIBLE
        </span>
      </div>
    );
  }

  const factors = [
    { name: "Budget", weight: "30%", score: budgetScore, icon: <DollarSign size={14} />, desc: breakdown?.budget },
    { name: "Relevance", weight: "30%", score: relevanceScore, icon: <Target size={14} />, desc: breakdown?.relevance },
    { name: "Delivery", weight: "20%", score: deliveryScore, icon: <Clock size={14} />, desc: breakdown?.delivery },
    { name: "Location", weight: "10%", score: locationScore, icon: <MapPin size={14} />, desc: breakdown?.location },
    { name: "Vendor Quality", weight: "10%", score: vendorQualityScore, icon: <Award size={14} />, desc: breakdown?.vendorQuality },
  ];

  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-glow)",
        borderRadius: "var(--radius-md)",
        padding: "16px 20px",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      {/* Header bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              background: status.grad,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#06090f",
              fontWeight: 800,
              fontSize: "18px",
              fontFamily: "var(--font-display)",
              boxShadow: `0 0 16px ${status.hex}55`,
            }}
          >
            {Math.round(overallScore)}%
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Sparkles size={14} color={status.hex} />
              <span style={{ fontSize: "12px", fontWeight: 700, color: status.hex, letterSpacing: "0.04em" }}>
                {status.label}
              </span>
            </div>
            <div style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
              Multi-Factor Compatibility
            </div>
          </div>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            fontSize: "12px",
            fontWeight: 600,
            color: "var(--accent-cyan)",
            padding: "6px 10px",
            borderRadius: "var(--radius-sm)",
            background: "rgba(0, 242, 254, 0.08)",
          }}
        >
          <span>{expanded ? "Hide Breakdown" : "View Breakdown"}</span>
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {/* Expanded Factor Breakdown */}
      {expanded && (
        <div
          style={{
            marginTop: "16px",
            paddingTop: "16px",
            borderTop: "1px solid var(--border-subtle)",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          {factors.map((factor, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-primary)", fontWeight: 600 }}>
                  <span style={{ color: "var(--accent-cyan)" }}>{factor.icon}</span>
                  <span>{factor.name}</span>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 400 }}>({factor.weight})</span>
                </div>
                <span style={{ fontWeight: 700, color: factor.score !== undefined && factor.score >= 80 ? "var(--accent-cyan)" : "var(--text-secondary)" }}>
                  {factor.score !== undefined ? `${Math.round(factor.score)}%` : "N/A"}
                </span>
              </div>

              {/* Progress track */}
              {factor.score !== undefined && (
                <div style={{ width: "100%", height: "6px", background: "var(--bg-tertiary)", borderRadius: "var(--radius-full)", overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%",
                      width: `${factor.score}%`,
                      background: factor.score >= 80 ? "var(--grad-primary)" : "var(--accent-amber)",
                      borderRadius: "var(--radius-full)",
                      transition: "width 0.6s ease-out",
                    }}
                  />
                </div>
              )}

              {factor.desc && (
                <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
                  {factor.desc}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
