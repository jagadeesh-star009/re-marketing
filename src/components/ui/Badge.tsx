import React from "react";

export interface BadgeProps {
  children: React.ReactNode;
  variant?: "cyan" | "purple" | "emerald" | "amber" | "rose" | "neutral";
  size?: "sm" | "md";
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "cyan",
  size = "md",
}) => {
  const styles: Record<string, { bg: string; text: string; border: string }> = {
    cyan: {
      bg: "rgba(0, 242, 254, 0.12)",
      text: "var(--accent-cyan)",
      border: "rgba(0, 242, 254, 0.35)",
    },
    purple: {
      bg: "rgba(139, 92, 246, 0.12)",
      text: "var(--accent-purple)",
      border: "rgba(139, 92, 246, 0.35)",
    },
    emerald: {
      bg: "rgba(16, 185, 129, 0.12)",
      text: "var(--accent-emerald)",
      border: "rgba(16, 185, 129, 0.35)",
    },
    amber: {
      bg: "rgba(245, 158, 11, 0.12)",
      text: "var(--accent-amber)",
      border: "rgba(245, 158, 11, 0.35)",
    },
    rose: {
      bg: "rgba(244, 63, 94, 0.12)",
      text: "var(--accent-rose)",
      border: "rgba(244, 63, 94, 0.35)",
    },
    neutral: {
      bg: "var(--bg-tertiary)",
      text: "var(--text-secondary)",
      border: "var(--border-subtle)",
    },
  };

  const v = styles[variant] || styles.cyan;
  const padding = size === "sm" ? "2px 8px" : "4px 12px";
  const fontSize = size === "sm" ? "11px" : "12px";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        padding,
        fontSize,
        fontWeight: 600,
        borderRadius: "var(--radius-full)",
        background: v.bg,
        color: v.text,
        border: `1px solid ${v.border}`,
        letterSpacing: "0.03em",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
};
