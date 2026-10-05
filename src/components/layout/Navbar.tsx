"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Sparkles,
  Layers,
  Briefcase,
  ShieldCheck,
  PlusCircle,
  Bell,
  MessageSquare,
  LogOut,
  User,
  ChevronDown,
  Menu,
  X,
  Users,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Button } from "@/components/ui/Button";

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showDevWidget, setShowDevWidget] = useState(false);

  const fetchSession = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.user) {
        setCurrentUser(data.user);
        fetchNotifications();
      } else {
        setCurrentUser(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      if (data.notifications) {
        setNotifications(data.notifications);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchSession();
  }, [pathname]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setCurrentUser(null);
    setUserDropdownOpen(false);
    router.push("/");
    router.refresh();
  };

  const switchPersona = async (email: string) => {
    try {
      await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: "Password123!" }),
      });
      await fetchSession();
      setUserDropdownOpen(false);
      router.refresh();
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const navLinks = [
    { href: "/requirements", label: "Browse Demands" },
    { href: "/requirements?type=PRODUCT", label: "Products" },
    { href: "/requirements?type=SERVICE", label: "Services" },
    { href: "/vendor-dashboard", label: "Vendor Hub" },
  ];

  const isActive = (href: string) => {
    if (href === "/requirements") return pathname === "/requirements";
    return pathname + (typeof window !== "undefined" ? window.location.search : "") === href
      || (href.includes("?") && typeof window !== "undefined" && window.location.search.includes(href.split("?")[1]));
  };

  return (
    <>
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "var(--bg-glass)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid var(--border-subtle)",
          width: "100%",
        }}
      >
        <div
          className="container"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: "68px",
          }}
        >
          {/* Left: Brand Logo & Desktop Navigation */}
          <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
            {/* Logo */}
            <Link
              href="/"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontFamily: "var(--font-display)",
                fontSize: "20px",
                fontWeight: 800,
                letterSpacing: "-0.02em",
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "10px",
                  background: "var(--grad-primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#05070d",
                  boxShadow: "0 0 16px rgba(0, 255, 157, 0.35)",
                  flexShrink: 0,
                }}
              >
                <Sparkles size={18} />
              </div>
              <span style={{ color: "var(--text-primary)" }}>
                Reverse<span className="text-gradient-cyan">Market</span>
              </span>
            </Link>

            {/* Desktop Navigation — hidden on mobile via .nav-desktop class */}
            <nav
              className="nav-desktop"
              style={{
                alignItems: "center",
                gap: "28px",
                fontSize: "14px",
                fontWeight: 600,
              }}
            >
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="nav-link"
                  style={{
                    color: pathname === link.href.split("?")[0] && link.href === "/requirements"
                      ? "var(--accent-cyan)"
                      : "var(--text-secondary)",
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Right Side Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Notifications — only if logged in */}
            {currentUser && (
              <div style={{ position: "relative" }}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  aria-label="Notifications"
                  style={{
                    position: "relative",
                    width: "36px",
                    height: "36px",
                    borderRadius: "var(--radius-sm)",
                    background: "var(--bg-tertiary)",
                    border: "1px solid var(--border-subtle)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--text-primary)",
                    flexShrink: 0,
                  }}
                >
                  <Bell size={16} />
                  {unreadCount > 0 && (
                    <span
                      style={{
                        position: "absolute",
                        top: "-4px",
                        right: "-4px",
                        background: "var(--accent-rose)",
                        color: "#fff",
                        fontSize: "10px",
                        fontWeight: 800,
                        width: "17px",
                        height: "17px",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div
                    style={{
                      position: "absolute",
                      right: 0,
                      top: "46px",
                      width: "300px",
                      background: "var(--bg-secondary)",
                      border: "1px solid var(--border-glow)",
                      borderRadius: "var(--radius-md)",
                      boxShadow: "var(--shadow-lg)",
                      zIndex: 200,
                      padding: "14px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                      <span style={{ fontWeight: 700, fontSize: "14px", color: "var(--text-primary)" }}>
                        Notifications
                      </span>
                      <button
                        onClick={async () => {
                          await fetch("/api/notifications", {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ all: true }),
                          });
                          fetchNotifications();
                        }}
                        style={{ fontSize: "12px", color: "var(--accent-cyan)", fontWeight: 600 }}
                      >
                        Mark all read
                      </button>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "260px", overflowY: "auto" }}>
                      {notifications.length === 0 ? (
                        <p style={{ fontSize: "13px", color: "var(--text-muted)", textAlign: "center", padding: "16px 0" }}>
                          No notifications yet.
                        </p>
                      ) : (
                        notifications.slice(0, 5).map((n) => (
                          <Link
                            key={n.id}
                            href={n.linkUrl || "#"}
                            onClick={() => setShowNotifications(false)}
                            style={{
                              padding: "9px",
                              borderRadius: "var(--radius-sm)",
                              background: n.isRead ? "transparent" : "rgba(0, 255, 157, 0.06)",
                              borderLeft: n.isRead ? "none" : "3px solid var(--accent-cyan)",
                              display: "block",
                            }}
                          >
                            <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
                              {n.title}
                            </div>
                            <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
                              {n.message}
                            </div>
                          </Link>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Become a Vendor — desktop only, hidden on mobile via CSS */}
            {(!currentUser || currentUser?.role !== "VENDOR") && (
              <Link href="/register?role=VENDOR" className="nav-vendor-link" style={{ alignItems: "center" }}>
                <Button
                  variant="outline"
                  size="sm"
                  style={{
                    borderColor: "rgba(157, 78, 221, 0.4)",
                    color: "var(--accent-purple)",
                    fontSize: "13px",
                    whiteSpace: "nowrap",
                  }}
                >
                  Become a Vendor
                </Button>
              </Link>
            )}

            {/* Post a Requirement CTA — desktop only */}
            <Link href="/requirements/new" className="nav-vendor-link" style={{ alignItems: "center" }}>
              <Button
                variant="glow"
                size="sm"
                leftIcon={<PlusCircle size={14} />}
                style={{ fontWeight: 700, whiteSpace: "nowrap" }}
              >
                Post Requirement
              </Button>
            </Link>

            {/* User Session or Auth */}
            {currentUser ? (
              <div style={{ position: "relative" }}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "7px",
                    padding: "5px 10px",
                    borderRadius: "var(--radius-sm)",
                    background: "var(--bg-tertiary)",
                    border: "1px solid var(--border-subtle)",
                    color: "var(--text-primary)",
                    fontSize: "13px",
                    fontWeight: 600,
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      background: currentUser.role === "VENDOR" ? "var(--accent-purple)" : "var(--accent-cyan)",
                      color: "#05070d",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "11px",
                      fontWeight: 800,
                      flexShrink: 0,
                    }}
                  >
                    {currentUser.name?.charAt(0) || "U"}
                  </div>
                  <span
                    style={{
                      maxWidth: "90px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      display: "none",
                    }}
                    className="nav-desktop"
                  >
                    {currentUser.name}
                  </span>
                  <ChevronDown size={13} />
                </button>

                {/* User Dropdown */}
                {userDropdownOpen && (
                  <div
                    style={{
                      position: "absolute",
                      right: 0,
                      top: "44px",
                      width: "210px",
                      background: "var(--bg-secondary)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: "var(--radius-md)",
                      boxShadow: "var(--shadow-lg)",
                      zIndex: 200,
                      padding: "8px",
                    }}
                  >
                    <div style={{ padding: "8px 12px", borderBottom: "1px solid var(--border-subtle)", marginBottom: "6px" }}>
                      <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>{currentUser.name}</div>
                      <div style={{ fontSize: "11px", color: "var(--accent-cyan)", fontWeight: 600 }}>{currentUser.role}</div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      {currentUser.role === "REQUIREMENT_OWNER" && (
                        <Link
                          href="/dashboard"
                          onClick={() => setUserDropdownOpen(false)}
                          style={{ padding: "8px 12px", borderRadius: "6px", fontSize: "13px", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "8px" }}
                        >
                          <Layers size={14} /> My Dashboard
                        </Link>
                      )}

                      {currentUser.role === "VENDOR" && (
                        <Link
                          href="/vendor-dashboard"
                          onClick={() => setUserDropdownOpen(false)}
                          style={{ padding: "8px 12px", borderRadius: "6px", fontSize: "13px", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "8px" }}
                        >
                          <Briefcase size={14} /> Vendor Hub
                        </Link>
                      )}

                      <Link
                        href="/messages"
                        onClick={() => setUserDropdownOpen(false)}
                        style={{ padding: "8px 12px", borderRadius: "6px", fontSize: "13px", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "8px" }}
                      >
                        <MessageSquare size={14} /> Messages
                      </Link>

                      {currentUser.role === "ADMIN" && (
                        <Link
                          href="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          style={{ padding: "8px 12px", borderRadius: "6px", fontSize: "13px", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "8px" }}
                        >
                          <ShieldCheck size={14} /> Admin Console
                        </Link>
                      )}

                      <button
                        onClick={handleLogout}
                        style={{
                          width: "100%",
                          textAlign: "left",
                          padding: "8px 12px",
                          borderRadius: "6px",
                          fontSize: "13px",
                          color: "var(--accent-rose)",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          marginTop: "4px",
                          borderTop: "1px solid var(--border-subtle)",
                        }}
                      >
                        <LogOut size={14} /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login">
                <Button variant="secondary" size="sm">
                  Sign In
                </Button>
              </Link>
            )}

            {/* Mobile Hamburger — hidden on desktop via .nav-mobile-toggle class */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="nav-mobile-toggle"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              style={{
                alignItems: "center",
                justifyContent: "center",
                width: "36px",
                height: "36px",
                borderRadius: "var(--radius-sm)",
                background: "var(--bg-tertiary)",
                border: "1px solid var(--border-subtle)",
                color: "var(--text-primary)",
                flexShrink: 0,
              }}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div
            style={{
              padding: "20px 24px 28px 24px",
              background: "var(--bg-secondary)",
              borderBottom: "1px solid var(--border-glow)",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            }}
          >
            {/* Section: Browse */}
            <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: "8px", marginTop: "4px" }}>
              MARKETPLACE
            </div>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="mobile-drawer-link"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  fontSize: "15px",
                  fontWeight: 600,
                  padding: "9px 12px",
                  borderRadius: "var(--radius-sm)",
                  display: "block",
                  background: pathname === link.href.split("?")[0] && !link.href.includes("?") ? "rgba(0,255,157,0.07)" : "transparent",
                  color: pathname === link.href.split("?")[0] && !link.href.includes("?") ? "var(--accent-cyan)" : "var(--text-secondary)",
                }}
              >
                {link.label}
              </Link>
            ))}

            {/* Divider */}
            <div style={{ height: "1px", background: "var(--border-subtle)", margin: "14px 0" }} />

            {/* Section: CTAs */}
            <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: "8px" }}>
              ACTIONS
            </div>
            <Link href="/requirements/new" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="glow" size="md" leftIcon={<PlusCircle size={16} />} style={{ width: "100%", justifyContent: "center", fontWeight: 700 }}>
                Post a Requirement
              </Button>
            </Link>
            <div style={{ height: "8px" }} />
            {(!currentUser || currentUser?.role !== "VENDOR") && (
              <Link href="/register?role=VENDOR" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" size="md" style={{ width: "100%", justifyContent: "center", borderColor: "rgba(157,78,221,0.4)", color: "var(--accent-purple)" }}>
                  Become a Vendor
                </Button>
              </Link>
            )}

            {/* User section */}
            {currentUser && (
              <>
                <div style={{ height: "1px", background: "var(--border-subtle)", margin: "14px 0" }} />
                <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: "8px" }}>
                  MY ACCOUNT
                </div>
                <Link
                  href={currentUser.role === "VENDOR" ? "/vendor-dashboard" : "/dashboard"}
                  onClick={() => setMobileMenuOpen(false)}
                  className="mobile-drawer-link"
                  style={{ fontSize: "15px", fontWeight: 600, padding: "9px 12px", borderRadius: "var(--radius-sm)", display: "block" }}
                >
                  My Portal
                </Link>
                <Link
                  href="/messages"
                  onClick={() => setMobileMenuOpen(false)}
                  className="mobile-drawer-link"
                  style={{ fontSize: "15px", fontWeight: 600, padding: "9px 12px", borderRadius: "var(--radius-sm)", display: "block" }}
                >
                  Messages
                </Link>
              </>
            )}
          </div>
        )}
      </header>

      {/* Floating Demo Persona Switcher */}
      <div
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          zIndex: 999,
        }}
      >
        {showDevWidget ? (
          <div
            style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-glow)",
              borderRadius: "var(--radius-md)",
              boxShadow: "var(--shadow-lg)",
              padding: "12px 16px",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              minWidth: "210px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.05em" }}>
                DEMO PERSONAS
              </span>
              <button onClick={() => setShowDevWidget(false)} style={{ color: "var(--text-muted)", fontSize: "14px" }}>
                ✕
              </button>
            </div>
            <div style={{ display: "flex", gap: "6px" }}>
              {[
                { label: "Buyer", email: "owner@apextech.com" },
                { label: "Vendor", email: "sales@nexushardware.com" },
                { label: "Admin", email: "admin@reversemarket.io" },
              ].map(({ label, email }) => (
                <button
                  key={email}
                  onClick={() => switchPersona(email)}
                  style={{
                    flex: 1,
                    padding: "6px 4px",
                    borderRadius: "6px",
                    background: currentUser?.email === email ? "var(--accent-cyan)" : "var(--bg-tertiary)",
                    color: currentUser?.email === email ? "#05070d" : "var(--text-primary)",
                    fontSize: "12px",
                    fontWeight: 700,
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowDevWidget(true)}
            style={{
              background: "var(--bg-tertiary)",
              border: "1px solid var(--border-subtle)",
              color: "var(--text-secondary)",
              padding: "6px 12px",
              borderRadius: "var(--radius-full)",
              fontSize: "12px",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "6px",
              boxShadow: "var(--shadow-md)",
              backdropFilter: "blur(12px)",
            }}
          >
            <Users size={13} color="var(--accent-cyan)" />
            <span>Switch Role</span>
          </button>
        )}
      </div>
    </>
  );
};
