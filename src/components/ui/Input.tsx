import React, { InputHTMLAttributes, forwardRef } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, rightIcon, id, className = "", style, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "6px", width: "100%" }}>
        {label && (
          <label
            htmlFor={inputId}
            style={{
              fontSize: "13px",
              fontWeight: 600,
              color: "var(--text-secondary)",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>{label}</span>
            {props.required && <span style={{ color: "var(--accent-cyan)" }}>*</span>}
          </label>
        )}

        <div style={{ position: "relative", display: "flex", alignItems: "center", width: "100%" }}>
          {leftIcon && (
            <div
              style={{
                position: "absolute",
                left: "14px",
                color: "var(--text-muted)",
                pointerEvents: "none",
                display: "flex",
                alignItems: "center",
              }}
            >
              {leftIcon}
            </div>
          )}

          <input
            id={inputId}
            ref={ref}
            style={{
              width: "100%",
              padding: leftIcon ? "12px 14px 12px 42px" : rightIcon ? "12px 42px 12px 14px" : "12px 14px",
              fontSize: "14px",
              background: "var(--bg-input)",
              color: "var(--text-primary)",
              border: error ? "1px solid var(--accent-rose)" : "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-sm)",
              transition: "all var(--transition-fast)",
              ...style,
            }}
            className={`custom-input ${className}`}
            {...props}
          />

          {rightIcon && (
            <div
              style={{
                position: "absolute",
                right: "14px",
                color: "var(--text-muted)",
                display: "flex",
                alignItems: "center",
              }}
            >
              {rightIcon}
            </div>
          )}
        </div>

        {hint && !error && (
          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{hint}</span>
        )}
        {error && (
          <span style={{ fontSize: "12px", color: "var(--accent-rose)", fontWeight: 500 }}>
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
