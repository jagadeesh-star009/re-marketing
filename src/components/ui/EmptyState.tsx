import React from "react";
import { Button } from "./Button";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  actionHref?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  onAction,
  actionHref,
}) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "60px 24px",
        background: "var(--bg-card)",
        border: "1px dashed var(--border-subtle)",
        borderRadius: "var(--radius-lg)",
        margin: "16px 0",
      }}
    >
      {icon && (
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            background: "rgba(0, 242, 254, 0.08)",
            border: "1px solid var(--border-glow)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--accent-cyan)",
            marginBottom: "20px",
          }}
        >
          {icon}
        </div>
      )}
      <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px", color: "var(--text-primary)" }}>
        {title}
      </h3>
      <p
        style={{
          fontSize: "14px",
          color: "var(--text-secondary)",
          maxWidth: "460px",
          marginBottom: actionText ? "24px" : "0",
          lineHeight: 1.6,
        }}
      >
        {description}
      </p>

      {actionText && (
        actionHref ? (
          <a href={actionHref}>
            <Button variant="primary">{actionText}</Button>
          </a>
        ) : (
          <Button variant="primary" onClick={onAction}>
            {actionText}
          </Button>
        )
      )}
    </div>
  );
};
