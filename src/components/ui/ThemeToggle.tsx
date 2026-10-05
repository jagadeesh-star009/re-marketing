"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export const ThemeToggle: React.FC = () => {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const saved = localStorage.getItem("rm_theme") as "dark" | "light" | null;
    if (saved) {
      setTheme(saved);
      document.documentElement.setAttribute("data-theme", saved);
    } else {
      document.documentElement.setAttribute("data-theme", "dark");
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("rm_theme", nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
  };

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "38px",
        height: "38px",
        borderRadius: "var(--radius-sm)",
        background: "var(--bg-tertiary)",
        border: "1px solid var(--border-subtle)",
        color: "var(--text-primary)",
        cursor: "pointer",
        transition: "all var(--transition-fast)",
      }}
      title={`Toggle theme (${theme === "dark" ? "Dark" : "Light"})`}
    >
      {theme === "dark" ? <Sun size={18} color="var(--accent-cyan)" /> : <Moon size={18} color="var(--accent-indigo)" />}
    </button>
  );
};
