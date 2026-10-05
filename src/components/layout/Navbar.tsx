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
  Search,
  Package,
  Wrench,
  CheckCircle2,
  Users
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
            height: "70px",
          }}
        >
          {/* Left: Brand Logo & Navigation */}
          <div style={{ display: "flex", alignItems: "center", gap: "36px" }}>
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
              }}
            >
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  background: "var(--grad-primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#05070d",
                  boxShadow: "0 0 16px rgba(0, 255, 157, 0.35)",
                }}
              >
                <Sparkles size={19} />
              </div>
              <span style={{ color: "var(--text-primary)" }}>
                Reverse<span className="text-gradient-cyan">Market</span>
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav
              style={{
                display: "none",
                alignItems: "center",
                gap: "28px",
                fontSize: "14px",
                fontWeight: 600,
              }}
              className="desktop-nav"
            >
              <style jsx>{`
                @media (min-width: 992px) {
                  .desktop-nav {
                    display: flex !important;
                  }
                }
              `}</style>

              <Link
                href="/requirements"
                style={{
                  color: pathname === "/requirements" ? "var(--accent-cyan)" : "var(--text-secondary)",
                  transition: "color var(--transition-fast)",
                }}
              >
                Browse Demands
              </Link>

              <Link
                href="/requirements?type=PRODUCT"
                style={{
                  color: pathname.includes("type=PRODUCT") ? "var(--accent-cyan)" : "var(--text-secondary)",
                  transition: "color var(--transition-fast)",
                }}
              >
                Products
              </Link>

              <Link
                href="/requirements?type=SERVICE"
                style={{
                  color: pathname.includes("type=SERVICE") ? "var(--accent-cyan)" : "var(--text-secondary)",
                  transition: "color var(--transition-fast)",
                }}
              >
                Services
              </Link>

              <Link
                href="/vendor-dashboard"
                style={{
                  color: pathname === "/vendor-dashboard" ? "var(--accent-cyan)" : "var(--text-secondary)",
                  transition: "color var(--transition-fast)",
                }}
              >
                Vendor Hub
              </Link>
            </nav>
          </div>

          {/* Right Side Clean Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Notifications (if logged in) */}
            {currentUser && (
              <div style={{ position: "relative" }}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  aria-label="Notifications"
                  style={{
                    position: "relative",
                    width: "38px",
                    height: "38px",
                    borderRadius: "var(--radius-sm)",
                    background: "var(--bg-tertiary)",
                    border: "1px solid var(--border-subtle)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--text-primary)",
                  }}
                >
                  <Bell size={17} />
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
                        width: "18px",
                        height: "18px",
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
                      top: "48px",
                      width: "320px",
                      background: "var(--bg-secondary)",
                      border: "1px solid var(--border-glow)",
                      borderRadius: "var(--radius-md)",
                      boxShadow: "var(--shadow-lg)",
                      zIndex: 200,
                      padding: "16px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
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

                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "260px", overflowY: "auto" }}>
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
                              padding: "10px",
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

            {/* Become a Vendor (for non-vendors/guests) */}
            {(!currentUser || currentUser?.role !== "VENDOR") && (
              <Link href="/register?role=VENDOR" className="desktop-vendor-link">
                <style jsx>{`
                  @media (max-width: 900px) {
                    :global(.desktop-vendor-link) {
                      display: none !important;
                    }
                  }
                `}</style>
                <Button
                  variant="outline"
                  size="sm"
                  style={{
                    borderColor: "rgba(157, 78, 221, 0.4)",
                    color: "var(--accent-purple)",
                    fontSize: "13px",
                  }}
                >
                  Become a Vendor
                </Button>
              </Link>
            )}

            {/* Primary CTA: Post a Requirement */}
            <Link href="/requirements/new">
              <Button
                variant="glow"
                size="sm"
                leftIcon={<PlusCircle size={15} />}
                style={{ fontWeight: 700 }}
              >
                Post a Requirement
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
                    gap: "8px",
                    padding: "6px 12px",
                    borderRadius: "var(--radius-sm)",
                    background: "var(--bg-tertiary)",
                    border: "1px solid var(--border-subtle)",
                    color: "var(--text-primary)",
                    fontSize: "13px",
                    fontWeight: 600,
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
                    }}
                  >
                    {currentUser.name?.charAt(0) || "U"}
                  </div>
                  <span className="user-name" style={{ maxWidth: "100px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {currentUser.name}
                  </span>
                  <ChevronDown size={14} />
                </button>

                {/* Clean User Dropdown */}
                {userDropdownOpen && (
                  <div
                    style={{
                      position: "absolute",
                      right: 0,
                      top: "44px",
                      width: "220px",
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
                          <Layers size={15} /> Buyer Command Center
                        </Link>
                      )}

                      {currentUser.role === "VENDOR" && (
                        <Link
                          href="/vendor-dashboard"
                          onClick={() => setUserDropdownOpen(false)}
                          style={{ padding: "8px 12px", borderRadius: "6px", fontSize: "13px", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "8px" }}
                        >
                          <Briefcase size={15} /> Vendor Opportunity Hub
                        </Link>
                      )}

                      <Link
                        href="/messages"
                        onClick={() => setUserDropdownOpen(false)}
                        style={{ padding: "8px 12px", borderRadius: "6px", fontSize: "13px", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "8px" }}
                      >
                        <MessageSquare size={15} /> Private Chat
                      </Link>

                      {currentUser.role === "ADMIN" && (
                        <Link
                          href="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          style={{ padding: "8px 12px", borderRadius: "6px", fontSize: "13px", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "8px" }}
                        >
                          <ShieldCheck size={15} /> Admin Console
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
                        <LogOut size={15} /> Sign Out
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

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "8px",
                color: "var(--text-primary)",
              }}
              className="mobile-toggle"
              aria-label="Open menu"
            >
              <style jsx>{`
                .mobile-toggle {
                  display: flex;
                }
                @media (min-width: 992px) {
                  .mobile-toggle {
                    display: none;
                  }
                }
              `}</style>
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div
            style={{
              padding: "20px 24px",
              background: "var(--bg-secondary)",
              borderBottom: "1px solid var(--border-glow)",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              fontSize: "15px",
              fontWeight: 600,
            }}
          >
            <Link href="/requirements" onClick={() => setMobileMenuOpen(false)}>
              Browse Demands
            </Link>
            <Link href="/requirements?type=PRODUCT" onClick={() => setMobileMenuOpen(false)}>
              Products Needed
            </Link>
            <Link href="/requirements?type=SERVICE" onClick={() => setMobileMenuOpen(false)}>
              Services Needed
            </Link>
            <Link href="/requirements/new" onClick={() => setMobileMenuOpen(false)} style={{ color: "var(--accent-cyan)", fontWeight: 700 }}>
              + Post a Requirement
            </Link>
            <Link href="/register?role=VENDOR" onClick={() => setMobileMenuOpen(false)} style={{ color: "var(--accent-purple)", fontWeight: 700 }}>
              ★ Become a Vendor (Register)
            </Link>
            {currentUser && (
              <>
                <Link href={currentUser.role === "VENDOR" ? "/vendor-dashboard" : "/dashboard"} onClick={() => setMobileMenuOpen(false)}>
                  My Portal
                </Link>
                <Link href="/messages" onClick={() => setMobileMenuOpen(false)}>
                  Private Chat
                </Link>
              </>
            )}
          </div>
        )}
      </header>

      {/* Floating Discreet Persona Switcher (For easy demo testing without cluttering Navbar) */}
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
              minWidth: "220px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.05em" }}>
                DEMO PERSONAS
              </span>
              <button onClick={() => setShowDevWidget(false)} style={{ color: "var(--text-muted)", fontSize: "12px" }}>
                ✕
              </button>
            </div>
            <div style={{ display: "flex", gap: "6px" }}>
              <button
                onClick={() => switchPersona("owner@apextech.com")}
                style={{
                  flex: 1,
                  padding: "6px",
                  borderRadius: "6px",
                  background: currentUser?.email === "owner@apextech.com" ? "var(--accent-cyan)" : "var(--bg-tertiary)",
                  color: currentUser?.email === "owner@apextech.com" ? "#05070d" : "var(--text-primary)",
                  fontSize: "12px",
                  fontWeight: 700,
                }}
              >
                Buyer
              </button>
              <button
                onClick={() => switchPersona("sales@nexushardware.com")}
                style={{
                  flex: 1,
                  padding: "6px",
                  borderRadius: "6px",
                  background: currentUser?.email === "sales@nexushardware.com" ? "var(--accent-cyan)" : "var(--bg-tertiary)",
                  color: currentUser?.email === "sales@nexushardware.com" ? "#05070d" : "var(--text-primary)",
                  fontSize: "12px",
                  fontWeight: 700,
                }}
              >
                Vendor
              </button>
              <button
                onClick={() => switchPersona("admin@reversemarket.io")}
                style={{
                  flex: 1,
                  padding: "6px",
                  borderRadius: "6px",
                  background: currentUser?.email === "admin@reversemarket.io" ? "var(--accent-cyan)" : "var(--bg-tertiary)",
                  color: currentUser?.email === "admin@reversemarket.io" ? "#05070d" : "var(--text-primary)",
                  fontSize: "12px",
                  fontWeight: 700,
                }}
              >
                Admin
              </button>
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
