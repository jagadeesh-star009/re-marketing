"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Package,
  Wrench,
  DollarSign,
  Calendar,
  MapPin,
  Sparkles,
  CheckCircle2,
  Bookmark,
  MessageSquare,
  Award,
  ChevronRight,
  ShieldCheck,
  Send,
  FileText,
  Star,
  Columns
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CompatibilityMeter } from "@/components/matching/CompatibilityMeter";
import { Modal } from "@/components/ui/Modal";

interface RequirementDetailClientProps {
  requirement: any;
  currentUser: any;
}

export const RequirementDetailClient: React.FC<RequirementDetailClientProps> = ({
  requirement,
  currentUser,
}) => {
  const router = useRouter();
  const [shortlistedOffers, setShortlistedOffers] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    requirement.shortlists?.forEach((s: any) => {
      initial[s.offerId] = true;
    });
    return initial;
  });

  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(() => {
    return requirement.selections?.[0]?.offerId || null;
  });

  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Vendor Offer Submission Form State
  const [offerForm, setOfferForm] = useState({
    offeredPrice: requirement.preferredBudget || requirement.minBudget,
    deliveryDate: "",
    warranty: requirement.type === "PRODUCT" ? "1-Year Comprehensive Onsite" : "",
    shippingCost: 0,
    deliverables: requirement.type === "SERVICE" ? "Full scope delivery according to specs." : "",
    description: "",
    vendorNotes: "",
  });

  // Shortlist Toggle
  const handleToggleShortlist = async (offerId: string, vendorId: string) => {
    setActionLoading(`shortlist-${offerId}`);
    try {
      const res = await fetch("/api/offers/shortlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requirementId: requirement.id,
          offerId,
          vendorId,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setShortlistedOffers((prev) => ({
          ...prev,
          [offerId]: data.shortlisted,
        }));
        router.refresh();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  // Select Winning Offer
  const handleSelectOffer = async (offerId: string, vendorId: string) => {
    if (!confirm("Are you sure you want to select this offer? This will award the contract to this vendor and notify other participants.")) {
      return;
    }
    setActionLoading(`select-${offerId}`);
    try {
      const res = await fetch("/api/offers/select", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requirementId: requirement.id,
          offerId,
          vendorId,
        }),
      });
      if (res.ok) {
        setSelectedOfferId(offerId);
        alert("🎉 Vendor offer selected successfully! The contract is now awarded.");
        router.refresh();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  // Start Private Chat
  const handleStartChat = async (vendorUserId: string, offerId?: string) => {
    try {
      const res = await fetch("/api/chat/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requirementId: requirement.id,
          ownerId: requirement.ownerId,
          vendorId: vendorUserId,
          offerId,
        }),
      });
      const data = await res.json();
      if (data.conversation) {
        router.push(`/messages?conversationId=${data.conversation.id}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Submit Offer (Vendor)
  const handleSubmitOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading("submitting-offer");
    try {
      const res = await fetch("/api/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requirementId: requirement.id,
          offeredPrice: parseFloat(offerForm.offeredPrice.toString()),
          deliveryDate: offerForm.deliveryDate || null,
          warranty: offerForm.warranty || null,
          shippingCost: parseFloat(offerForm.shippingCost.toString()) || 0,
          deliverables: offerForm.deliverables || null,
          description: offerForm.description,
          vendorNotes: offerForm.vendorNotes || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to submit offer");
      } else {
        alert("Offer submitted successfully! The matching engine computed your compatibility.");
        setOfferModalOpen(false);
        router.refresh();
      }
    } catch (err: any) {
      alert(err.message || "Failed to submit offer");
    } finally {
      setActionLoading(null);
    }
  };

  const isOwner = currentUser?.id === requirement.ownerId;
  const isVendor = currentUser?.role === "VENDOR";
  const userOffer = requirement.offers?.find((o: any) => o.vendorId === currentUser?.id);

  return (
    <div style={{ padding: "40px 0 80px 0" }}>
      <div className="container">
        {/* Requirement Header */}
        <div style={{ marginBottom: "32px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px", flexWrap: "wrap" }}>
            <Badge variant={requirement.type === "PRODUCT" ? "cyan" : "purple"}>
              {requirement.type}
            </Badge>
            <Badge variant={requirement.status === "VENDOR_SELECTED" ? "emerald" : "neutral"}>
              STATUS: {requirement.status.replace("_", " ")}
            </Badge>
            <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>
              Posted by {requirement.owner?.name} on {new Date(requirement.createdAt).toLocaleDateString()}
            </span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "20px" }}>
            <div style={{ maxWidth: "800px" }}>
              <h1 style={{ fontSize: "28px", fontWeight: 800, fontFamily: "var(--font-display)", lineHeight: 1.3 }}>
                {requirement.title}
              </h1>
              <p style={{ color: "var(--text-secondary)", marginTop: "12px", fontSize: "15px", lineHeight: 1.7 }}>
                {requirement.description}
              </p>
            </div>

            {/* Budget & Primary CTA Card */}
            <div
              style={{
                background: "var(--bg-card)",
                padding: "20px 24px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-glow)",
                minWidth: "260px",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <span style={{ fontSize: "12px", color: "var(--text-muted)", display: "block" }}>
                Target Budget Range
              </span>
              <div style={{ fontSize: "24px", fontWeight: 800, color: "var(--accent-cyan)", fontFamily: "var(--font-display)", margin: "4px 0 12px 0" }}>
                ₹{requirement.minBudget.toLocaleString()} – ₹{requirement.maxBudget.toLocaleString()}
              </div>

              {isVendor && !userOffer && requirement.status !== "VENDOR_SELECTED" && (
                <Button
                  variant="glow"
                  size="md"
                  style={{ width: "100%" }}
                  onClick={() => setOfferModalOpen(true)}
                  leftIcon={<Send size={16} />}
                >
                  Submit Tailored Offer
                </Button>
              )}

              {!currentUser && requirement.status !== "VENDOR_SELECTED" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <Link href={`/register?role=VENDOR&redirect=/requirements/${requirement.id}`} style={{ width: "100%" }}>
                    <Button
                      variant="glow"
                      size="md"
                      style={{ width: "100%", justifyContent: "center" }}
                      leftIcon={<Send size={15} />}
                    >
                      Register as Vendor to Bid
                    </Button>
                  </Link>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", textAlign: "center" }}>
                    Registration is mandatory to submit proposals.
                  </span>
                </div>
              )}

              {currentUser && !isVendor && !isOwner && requirement.status !== "VENDOR_SELECTED" && (
                <div style={{ padding: "10px", borderRadius: "var(--radius-sm)", background: "var(--bg-tertiary)", fontSize: "12px", color: "var(--text-secondary)", textAlign: "center" }}>
                  <span>Want to bid? </span>
                  <Link href={`/register?role=VENDOR&redirect=/requirements/${requirement.id}`} style={{ color: "var(--accent-cyan)", fontWeight: 700 }}>
                    Register as a Vendor
                  </Link>
                </div>
              )}

              {userOffer && (
                <div style={{ fontSize: "13px", color: "var(--accent-emerald)", fontWeight: 600 }}>
                  ✓ You have submitted an offer (₹{userOffer.offeredPrice.toLocaleString()})
                </div>
              )}

              {requirement.offers?.length > 1 && (
                <Button
                  variant="secondary"
                  size="sm"
                  style={{ width: "100%", marginTop: "10px" }}
                  onClick={() => setCompareModalOpen(true)}
                  leftIcon={<Columns size={15} />}
                >
                  Side-by-Side Comparison
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Specifications & Timeline Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px", marginBottom: "40px" }}>
          {/* Key Specs Card */}
          <Card>
            <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Package size={18} color="var(--accent-cyan)" /> Requested Specifications
            </h3>
            {requirement.specifications?.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {requirement.specifications.map((s: any) => (
                  <div key={s.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", padding: "6px 0", borderBottom: "1px solid var(--border-subtle)" }}>
                    <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>{s.specKey}</span>
                    <span style={{ color: "var(--text-primary)", fontWeight: 700 }}>{s.specValue}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>Standard category parameters apply.</p>
            )}
          </Card>

          {/* Logistics & Location Card */}
          <Card>
            <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
              <MapPin size={18} color="var(--accent-purple)" /> Location & Logistics
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--border-subtle)" }}>
                <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>Target Location</span>
                <span style={{ color: "var(--text-primary)", fontWeight: 700 }}>
                  {requirement.city ? `${requirement.city}, ${requirement.state}` : "National Delivery"}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--border-subtle)" }}>
                <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>Remote Friendly</span>
                <span style={{ color: requirement.isRemote ? "var(--accent-emerald)" : "var(--text-secondary)", fontWeight: 700 }}>
                  {requirement.isRemote ? "Yes (Digital / Courier)" : "Onsite presence required"}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0" }}>
                <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>Quantity</span>
                <span style={{ color: "var(--text-primary)", fontWeight: 700 }}>
                  {requirement.quantity} unit(s)
                </span>
              </div>
            </div>
          </Card>

          {/* Timeline Card */}
          <Card>
            <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Calendar size={18} color="var(--accent-emerald)" /> Timeline Constraints
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px" }}>
              {requirement.type === "PRODUCT" ? (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--border-subtle)" }}>
                    <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>Required Delivery Date</span>
                    <span style={{ color: "var(--text-primary)", fontWeight: 700 }}>
                      {requirement.requiredDeliveryDate ? new Date(requirement.requiredDeliveryDate).toLocaleDateString() : "Flexible"}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0" }}>
                    <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>Preferred Window</span>
                    <span style={{ color: "var(--text-primary)", fontWeight: 700 }}>
                      {requirement.preferredDeliveryDate ? new Date(requirement.preferredDeliveryDate).toLocaleDateString() : "Immediate Dispatch"}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--border-subtle)" }}>
                    <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>Project Deadline</span>
                    <span style={{ color: "var(--text-primary)", fontWeight: 700 }}>
                      {requirement.projectDeadline ? new Date(requirement.projectDeadline).toLocaleDateString() : "Flexible"}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0" }}>
                    <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>Expected Duration</span>
                    <span style={{ color: "var(--text-primary)", fontWeight: 700 }}>
                      {requirement.expectedDurationDays ? `${requirement.expectedDurationDays} Days` : "Milestone based"}
                    </span>
                  </div>
                </>
              )}
            </div>
          </Card>
        </div>

        {/* SECTION: Competing Vendor Offers & Compatibility */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
            <div>
              <h2 style={{ fontSize: "24px", fontWeight: 800, fontFamily: "var(--font-display)" }}>
                Competing Vendor Offers ({requirement.offers?.length || 0})
              </h2>
              <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "2px" }}>
                Each offer is ranked by the independent multi-factor matching engine.
              </p>
            </div>

            {requirement.offers?.length > 1 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCompareModalOpen(true)}
                leftIcon={<Columns size={16} />}
              >
                Side-by-Side Compare Matrix
              </Button>
            )}
          </div>

          {/* Offers List */}
          {requirement.offers?.length === 0 ? (
            <Card style={{ textAlign: "center", padding: "40px" }}>
              <Sparkles size={36} color="var(--accent-cyan)" style={{ marginBottom: "12px" }} />
              <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "6px" }}>
                Waiting for Vendor Submissions
              </h3>
              <p style={{ fontSize: "14px", color: "var(--text-secondary)", maxWidth: "480px", margin: "0 auto" }}>
                Your requirement is live across the marketplace. Relevant suppliers and engineering providers have been notified.
              </p>
            </Card>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {requirement.offers.map((offer: any) => {
                const isShortlisted = shortlistedOffers[offer.id];
                const isSelected = selectedOfferId === offer.id || offer.status === "SELECTED";
                const comp = offer.compatibilityScore;
                const breakdown = comp?.breakdownJson ? JSON.parse(comp.breakdownJson) : null;

                return (
                  <Card
                    key={offer.id}
                    glow={isSelected || (comp && comp.overallScore >= 90)}
                    style={{
                      borderLeft: isSelected ? "4px solid var(--accent-emerald)" : undefined,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", marginBottom: "16px" }}>
                      {/* Vendor Info */}
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div
                            style={{
                              width: "40px",
                              height: "40px",
                              borderRadius: "10px",
                              background: "rgba(0, 242, 254, 0.1)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "var(--accent-cyan)",
                              fontWeight: 800,
                            }}
                          >
                            {offer.vendorProfile?.businessName?.[0] || "V"}
                          </div>
                          <div>
                            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-primary)" }}>
                              {offer.vendorProfile?.businessName || offer.vendor?.name}
                            </h3>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "var(--text-muted)" }}>
                              <span style={{ display: "flex", alignItems: "center", gap: "2px", color: "var(--accent-amber)" }}>
                                <Star size={13} fill="currentColor" /> {offer.vendorProfile?.rating?.toFixed(1) || "5.0"}
                              </span>
                              <span>·</span>
                              <span>{offer.vendorProfile?.completedOrders || 0} completed</span>
                              <span>·</span>
                              <span>{offer.vendorProfile?.city}, {offer.vendorProfile?.state}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Offered Price & Status Pill */}
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>
                          ₹{offer.offeredPrice.toLocaleString()}
                        </div>
                        {isSelected ? (
                          <Badge variant="emerald">WINNING OFFER SELECTED</Badge>
                        ) : isShortlisted ? (
                          <Badge variant="cyan">SHORTLISTED</Badge>
                        ) : (
                          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                            Submitted {new Date(offer.createdAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Compatibility Meter Breakdown */}
                    {comp && (
                      <div style={{ marginBottom: "20px" }}>
                        <CompatibilityMeter
                          overallScore={comp.overallScore}
                          budgetScore={comp.budgetScore}
                          relevanceScore={comp.relevanceScore}
                          deliveryScore={comp.deliveryScore}
                          locationScore={comp.locationScore}
                          vendorQualityScore={comp.vendorQualityScore}
                          breakdown={breakdown}
                        />
                      </div>
                    )}

                    {/* Proposal Details */}
                    <div style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "18px" }}>
                      <p>{offer.description}</p>
                      {offer.vendorNotes && (
                        <p style={{ marginTop: "8px", fontStyle: "italic", color: "var(--accent-cyan)", fontSize: "13px" }}>
                          &ldquo;{offer.vendorNotes}&rdquo;
                        </p>
                      )}
                    </div>

                    {/* Specs & Warranties */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "20px" }}>
                      {offer.warranty && (
                        <span style={{ background: "var(--bg-tertiary)", padding: "4px 10px", borderRadius: "var(--radius-sm)", fontSize: "12px", border: "1px solid var(--border-subtle)" }}>
                          <strong>Warranty:</strong> {offer.warranty}
                        </span>
                      )}
                      {offer.deliveryDate && (
                        <span style={{ background: "var(--bg-tertiary)", padding: "4px 10px", borderRadius: "var(--radius-sm)", fontSize: "12px", border: "1px solid var(--border-subtle)" }}>
                          <strong>Estimated Delivery:</strong> {new Date(offer.deliveryDate).toLocaleDateString()}
                        </span>
                      )}
                      {offer.shippingCost === 0 ? (
                        <span style={{ background: "rgba(16, 185, 129, 0.1)", color: "var(--accent-emerald)", padding: "4px 10px", borderRadius: "var(--radius-sm)", fontSize: "12px" }}>
                          Free Dispatch & Delivery
                        </span>
                      ) : (
                        <span style={{ background: "var(--bg-tertiary)", padding: "4px 10px", borderRadius: "var(--radius-sm)", fontSize: "12px" }}>
                          Shipping: ₹{offer.shippingCost}
                        </span>
                      )}
                    </div>

                    {/* Owner Action Buttons */}
                    <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "12px", paddingTop: "14px", borderTop: "1px solid var(--border-subtle)", flexWrap: "wrap" }}>
                      {/* Chat privately */}
                      <Button
                        size="sm"
                        variant="secondary"
                        leftIcon={<MessageSquare size={14} />}
                        onClick={() => handleStartChat(offer.vendorId, offer.id)}
                      >
                        Chat Privately
                      </Button>

                      {isOwner && (
                        <>
                          {/* Shortlist button */}
                          <Button
                            size="sm"
                            variant={isShortlisted ? "primary" : "outline"}
                            leftIcon={<Bookmark size={14} />}
                            isLoading={actionLoading === `shortlist-${offer.id}`}
                            onClick={() => handleToggleShortlist(offer.id, offer.vendorProfileId)}
                          >
                            {isShortlisted ? "Shortlisted" : "Shortlist"}
                          </Button>

                          {/* Select Offer button */}
                          {!isSelected && requirement.status !== "VENDOR_SELECTED" && (
                            <Button
                              size="sm"
                              variant="glow"
                              leftIcon={<Award size={14} />}
                              isLoading={actionLoading === `select-${offer.id}`}
                              onClick={() => handleSelectOffer(offer.id, offer.vendorProfileId)}
                            >
                              Select Winning Offer
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* SIDE-BY-SIDE COMPARISON MODAL */}
        <Modal
          isOpen={compareModalOpen}
          onClose={() => setCompareModalOpen(false)}
          title="Offer Comparison Workspace"
          description={`Direct side-by-side analysis for "${requirement.title}"`}
          maxWidth="940px"
        >
          <div style={{ overflowX: "auto", margin: "10px 0" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border-subtle)", textAlign: "left" }}>
                  <th style={{ padding: "12px", color: "var(--text-muted)" }}>Attribute</th>
                  {requirement.offers?.map((o: any) => (
                    <th key={o.id} style={{ padding: "12px", color: "var(--text-primary)", fontWeight: 700 }}>
                      {o.vendorProfile?.businessName}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  <td style={{ padding: "12px", color: "var(--text-muted)", fontWeight: 600 }}>Compatibility</td>
                  {requirement.offers?.map((o: any) => (
                    <td key={o.id} style={{ padding: "12px" }}>
                      <span style={{ fontSize: "15px", fontWeight: 800, color: "var(--accent-cyan)" }}>
                        {Math.round(o.compatibilityScore?.overallScore || 0)}%
                      </span>
                    </td>
                  ))}
                </tr>
                <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  <td style={{ padding: "12px", color: "var(--text-muted)", fontWeight: 600 }}>Offered Price</td>
                  {requirement.offers?.map((o: any) => (
                    <td key={o.id} style={{ padding: "12px", fontWeight: 700, color: "var(--text-primary)" }}>
                      ₹{o.offeredPrice.toLocaleString()}
                    </td>
                  ))}
                </tr>
                <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  <td style={{ padding: "12px", color: "var(--text-muted)", fontWeight: 600 }}>Delivery / Timeline</td>
                  {requirement.offers?.map((o: any) => (
                    <td key={o.id} style={{ padding: "12px", color: "var(--text-secondary)" }}>
                      {o.deliveryDate ? new Date(o.deliveryDate).toLocaleDateString() : o.estimatedDuration || "Standard"}
                    </td>
                  ))}
                </tr>
                <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  <td style={{ padding: "12px", color: "var(--text-muted)", fontWeight: 600 }}>Vendor Rating</td>
                  {requirement.offers?.map((o: any) => (
                    <td key={o.id} style={{ padding: "12px", color: "var(--accent-amber)", fontWeight: 700 }}>
                      ★ {o.vendorProfile?.rating?.toFixed(1) || "5.0"}
                    </td>
                  ))}
                </tr>
                <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  <td style={{ padding: "12px", color: "var(--text-muted)", fontWeight: 600 }}>Warranty / Guarantee</td>
                  {requirement.offers?.map((o: any) => (
                    <td key={o.id} style={{ padding: "12px", color: "var(--text-secondary)" }}>
                      {o.warranty || "Standard terms"}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td style={{ padding: "12px", color: "var(--text-muted)", fontWeight: 600 }}>Action</td>
                  {requirement.offers?.map((o: any) => (
                    <td key={o.id} style={{ padding: "12px" }}>
                      {isOwner && requirement.status !== "VENDOR_SELECTED" && (
                        <Button
                          size="sm"
                          variant="glow"
                          onClick={() => {
                            setCompareModalOpen(false);
                            handleSelectOffer(o.id, o.vendorProfileId);
                          }}
                        >
                          Select
                        </Button>
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </Modal>

        {/* VENDOR SUBMIT OFFER MODAL */}
        <Modal
          isOpen={offerModalOpen}
          onClose={() => setOfferModalOpen(false)}
          title="Submit Tailored Proposal"
          description={`Formulate your offer for "${requirement.title}"`}
        >
          <form onSubmit={handleSubmitOffer} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "4px", display: "block" }}>
                  Your Offered Price (₹) *
                </label>
                <input
                  type="number"
                  required
                  value={offerForm.offeredPrice}
                  onChange={(e) => setOfferForm({ ...offerForm, offeredPrice: parseFloat(e.target.value) || 0 })}
                  style={{ width: "100%", padding: "10px", background: "var(--bg-input)", color: "var(--text-primary)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-sm)" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "4px", display: "block" }}>
                  Proposed Delivery Date
                </label>
                <input
                  type="date"
                  value={offerForm.deliveryDate}
                  onChange={(e) => setOfferForm({ ...offerForm, deliveryDate: e.target.value })}
                  style={{ width: "100%", padding: "10px", background: "var(--bg-input)", color: "var(--text-primary)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-sm)" }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "4px", display: "block" }}>
                Warranty & Return Terms
              </label>
              <input
                type="text"
                placeholder="e.g. 3-Year Onsite ProSupport + 14-day DOA replacement"
                value={offerForm.warranty}
                onChange={(e) => setOfferForm({ ...offerForm, warranty: e.target.value })}
                style={{ width: "100%", padding: "10px", background: "var(--bg-input)", color: "var(--text-primary)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-sm)" }}
              />
            </div>

            <div>
              <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "4px", display: "block" }}>
                Comprehensive Proposal & Deliverables *
              </label>
              <textarea
                rows={4}
                required
                placeholder="Describe your exact product OEM models or service scope, technology stack, and milestones..."
                value={offerForm.description}
                onChange={(e) => setOfferForm({ ...offerForm, description: e.target.value })}
                style={{ width: "100%", padding: "10px", background: "var(--bg-input)", color: "var(--text-primary)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-sm)" }}
              />
            </div>

            <div>
              <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "4px", display: "block" }}>
                Special Vendor Notes
              </label>
              <input
                type="text"
                placeholder="e.g. Includes complimentary setup and 60 days hypercare support."
                value={offerForm.vendorNotes}
                onChange={(e) => setOfferForm({ ...offerForm, vendorNotes: e.target.value })}
                style={{ width: "100%", padding: "10px", background: "var(--bg-input)", color: "var(--text-primary)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-sm)" }}
              />
            </div>

            <Button
              type="submit"
              variant="glow"
              isLoading={actionLoading === "submitting-offer"}
              style={{ marginTop: "10px" }}
            >
              Submit Offer & Calculate Match Score
            </Button>
          </form>
        </Modal>
      </div>
    </div>
  );
};
