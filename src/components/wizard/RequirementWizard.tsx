"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Package,
  Wrench,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  DollarSign,
  Calendar,
  MapPin,
  ListPlus,
  Paperclip,
  Eye,
  Sparkles,
  AlertCircle,
  Plus,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

export const RequirementWizard: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedType = searchParams.get("type") as "PRODUCT" | "SERVICE" | null;

  const [currentStep, setCurrentStep] = useState(1);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    type: "PRODUCT" | "SERVICE";
    title: string;
    description: string;
    categoryId: string;
    subcategoryId: string;
    quantity: number;
    minBudget: number;
    maxBudget: number;
    preferredBudget: number;
    currency: string;
    requiredDeliveryDate: string;
    preferredDeliveryDate: string;
    projectStartDate: string;
    projectDeadline: string;
    expectedDurationDays: number;
    country: string;
    state: string;
    city: string;
    pincode: string;
    isRemote: boolean;
    specifications: Array<{ specKey: string; specValue: string; isRequired: boolean }>;
    attachments: Array<{ fileUrl: string; fileName: string; fileType: string; fileSize: number }>;
  }>({
    type: preselectedType || "PRODUCT",
    title: "",
    description: "",
    categoryId: "",
    subcategoryId: "",
    quantity: 1,
    minBudget: 50000,
    maxBudget: 100000,
    preferredBudget: 80000,
    currency: "INR",
    requiredDeliveryDate: "",
    preferredDeliveryDate: "",
    projectStartDate: "",
    projectDeadline: "",
    expectedDurationDays: 30,
    country: "India",
    state: "Karnataka",
    city: "Bengaluru",
    pincode: "560100",
    isRemote: false,
    specifications: [
      { specKey: "Technical Specs", specValue: "", isRequired: true },
    ],
    attachments: [],
  });

  useEffect(() => {
    // Fetch categories
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (data.categories && data.categories.length > 0) {
          setCategories(data.categories);
          const firstMatching = data.categories.find(
            (c: any) => c.type === formData.type || c.type === "BOTH"
          );
          if (firstMatching) {
            setFormData((prev) => ({
              ...prev,
              categoryId: firstMatching.id,
              subcategoryId: firstMatching.subcategories?.[0]?.id || "",
            }));
          }
        }
      })
      .catch((e) => console.error("Error loading categories:", e));
  }, [formData.type]);

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addSpec = () => {
    setFormData((prev) => ({
      ...prev,
      specifications: [...prev.specifications, { specKey: "", specValue: "", isRequired: true }],
    }));
  };

  const removeSpec = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      specifications: prev.specifications.filter((_, i) => i !== index),
    }));
  };

  const updateSpec = (index: number, key: string, value: any) => {
    setFormData((prev) => {
      const updated = [...prev.specifications];
      updated[index] = { ...updated[index], [key]: value };
      return { ...prev, specifications: updated };
    });
  };

  const handleNext = () => {
    setError(null);
    if (currentStep === 2) {
      if (!formData.title || formData.title.length < 5) {
        setError("Please enter a title (at least 5 characters).");
        return;
      }
      if (!formData.description || formData.description.length < 15) {
        setError("Please enter a detailed description (at least 15 characters).");
        return;
      }
    }
    if (currentStep === 3) {
      if (formData.minBudget <= 0 || formData.maxBudget <= 0) {
        setError("Please enter valid budget numbers.");
        return;
      }
      if (formData.minBudget > formData.maxBudget) {
        setError("Minimum budget cannot exceed maximum budget.");
        return;
      }
    }
    setCurrentStep((prev) => Math.min(prev + 1, 8));
  };

  const handleBack = () => {
    setError(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/requirements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to publish requirement");
      }
      router.push(`/requirements/${data.requirement.id}`);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { num: 1, title: "Category Type" },
    { num: 2, title: "Overview" },
    { num: 3, title: "Budget" },
    { num: 4, title: "Timeline" },
    { num: 5, title: "Location" },
    { num: 6, title: "Specifications" },
    { num: 7, title: "Attachments" },
    { num: 8, title: "Review & Publish" },
  ];

  return (
    <div style={{ maxWidth: "840px", margin: "0 auto" }}>
      {/* Wizard Header & Progress Indicator */}
      <div style={{ marginBottom: "32px", textAlign: "center" }}>
        <Badge variant="cyan">Step {currentStep} of 8</Badge>
        <h1 style={{ fontSize: "28px", fontWeight: 800, marginTop: "8px", fontFamily: "var(--font-display)" }}>
          {steps[currentStep - 1].title}
        </h1>
        <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "4px" }}>
          Tell the marketplace what you need. Compatible vendors will formulate tailored offers for you.
        </p>

        {/* Progress bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: "24px",
            position: "relative",
            gap: "6px",
          }}
        >
          {steps.map((s) => (
            <div
              key={s.num}
              style={{
                flex: 1,
                height: "6px",
                borderRadius: "var(--radius-full)",
                background: s.num <= currentStep ? "var(--grad-primary)" : "var(--bg-tertiary)",
                transition: "background var(--transition-normal)",
              }}
              title={`Step ${s.num}: ${s.title}`}
            />
          ))}
        </div>
      </div>

      {error && (
        <div
          style={{
            padding: "14px 18px",
            borderRadius: "var(--radius-sm)",
            background: "rgba(244, 63, 94, 0.12)",
            border: "1px solid rgba(244, 63, 94, 0.3)",
            color: "var(--accent-rose)",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "24px",
            fontSize: "14px",
          }}
        >
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* STEP 1: What do you need? */}
      {currentStep === 1 && (
        <Card>
          <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "20px" }}>
            What kind of requirement are you sourcing?
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <div
              onClick={() => updateField("type", "PRODUCT")}
              style={{
                padding: "28px",
                borderRadius: "var(--radius-md)",
                border: formData.type === "PRODUCT" ? "2px solid var(--accent-cyan)" : "1px solid var(--border-subtle)",
                background: formData.type === "PRODUCT" ? "rgba(0, 242, 254, 0.05)" : "var(--bg-input)",
                cursor: "pointer",
                textAlign: "center",
                transition: "all var(--transition-fast)",
              }}
            >
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "14px",
                  background: "rgba(0, 242, 254, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--accent-cyan)",
                  margin: "0 auto 16px auto",
                }}
              >
                <Package size={28} />
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "6px" }}>Physical Product</h3>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                Hardware, equipment, electronics, component batches, manufactured goods.
              </p>
            </div>

            <div
              onClick={() => updateField("type", "SERVICE")}
              style={{
                padding: "28px",
                borderRadius: "var(--radius-md)",
                border: formData.type === "SERVICE" ? "2px solid var(--accent-purple)" : "1px solid var(--border-subtle)",
                background: formData.type === "SERVICE" ? "rgba(139, 92, 246, 0.05)" : "var(--bg-input)",
                cursor: "pointer",
                textAlign: "center",
                transition: "all var(--transition-fast)",
              }}
            >
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "14px",
                  background: "rgba(139, 92, 246, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--accent-purple)",
                  margin: "0 auto 16px auto",
                }}
              >
                <Wrench size={28} />
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "6px" }}>Service / Project</h3>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                Software development, design, consulting, engineering, agency contracts.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* STEP 2: Overview */}
      {currentStep === 2 && (
        <Card>
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <Input
              label="Requirement Title"
              placeholder={formData.type === "PRODUCT" ? "e.g. 10x Developer Workstations with RTX 4080" : "e.g. Full-Stack Next.js Reverse Marketplace Platform"}
              value={formData.title}
              onChange={(e) => updateField("title", e.target.value)}
              required
            />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>
                  Category *
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => updateField("categoryId", e.target.value)}
                  style={{ width: "100%", padding: "12px", background: "var(--bg-input)", color: "var(--text-primary)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-sm)" }}
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>
                  Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => updateField("quantity", parseInt(e.target.value) || 1)}
                  style={{ width: "100%", padding: "12px", background: "var(--bg-input)", color: "var(--text-primary)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-sm)" }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>
                Detailed Description & Purpose *
              </label>
              <textarea
                rows={4}
                placeholder="Describe your context, why you need it, and essential expectations..."
                value={formData.description}
                onChange={(e) => updateField("description", e.target.value)}
                style={{ width: "100%", padding: "12px", background: "var(--bg-input)", color: "var(--text-primary)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-sm)" }}
              />
            </div>
          </div>
        </Card>
      )}

      {/* STEP 3: Budget */}
      {currentStep === 3 && (
        <Card>
          <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "16px" }}>
            Target Budget Parameters
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
            <Input
              label="Minimum Budget (₹)"
              type="number"
              value={formData.minBudget}
              onChange={(e) => updateField("minBudget", parseFloat(e.target.value) || 0)}
              required
            />
            <Input
              label="Maximum Budget (₹)"
              type="number"
              value={formData.maxBudget}
              onChange={(e) => updateField("maxBudget", parseFloat(e.target.value) || 0)}
              required
            />
            <Input
              label="Preferred Target (₹)"
              type="number"
              value={formData.preferredBudget}
              onChange={(e) => updateField("preferredBudget", parseFloat(e.target.value) || 0)}
            />
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "16px" }}>
            The matching engine evaluates offers based on whether they fall within your range and reward offers that provide high value without price gouging.
          </p>
        </Card>
      )}

      {/* STEP 4: Timeline */}
      {currentStep === 4 && (
        <Card>
          <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "16px" }}>
            Delivery Schedule & Milestones
          </h2>
          {formData.type === "PRODUCT" ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <Input
                label="Required Delivery Date"
                type="date"
                value={formData.requiredDeliveryDate}
                onChange={(e) => updateField("requiredDeliveryDate", e.target.value)}
              />
              <Input
                label="Preferred Delivery Date"
                type="date"
                value={formData.preferredDeliveryDate}
                onChange={(e) => updateField("preferredDeliveryDate", e.target.value)}
              />
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
              <Input
                label="Project Start Date"
                type="date"
                value={formData.projectStartDate}
                onChange={(e) => updateField("projectStartDate", e.target.value)}
              />
              <Input
                label="Project Deadline"
                type="date"
                value={formData.projectDeadline}
                onChange={(e) => updateField("projectDeadline", e.target.value)}
              />
              <Input
                label="Expected Duration (Days)"
                type="number"
                value={formData.expectedDurationDays}
                onChange={(e) => updateField("expectedDurationDays", parseInt(e.target.value) || 30)}
              />
            </div>
          )}
        </Card>
      )}

      {/* STEP 5: Location */}
      {currentStep === 5 && (
        <Card>
          <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "16px" }}>
            Geographic / Remote Collaboration
          </h2>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontSize: "14px" }}>
              <input
                type="checkbox"
                checked={formData.isRemote}
                onChange={(e) => updateField("isRemote", e.target.checked)}
                style={{ width: "18px", height: "18px", accentColor: "var(--accent-cyan)" }}
              />
              <span>100% Remote / Online delivery acceptable</span>
            </label>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
            <Input
              label="City"
              placeholder="e.g. Bengaluru"
              value={formData.city}
              onChange={(e) => updateField("city", e.target.value)}
            />
            <Input
              label="State"
              placeholder="e.g. Karnataka"
              value={formData.state}
              onChange={(e) => updateField("state", e.target.value)}
            />
            <Input
              label="Pincode"
              placeholder="e.g. 560100"
              value={formData.pincode}
              onChange={(e) => updateField("pincode", e.target.value)}
            />
          </div>
        </Card>
      )}

      {/* STEP 6: Dynamic Specifications */}
      {currentStep === 6 && (
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div>
              <h2 style={{ fontSize: "18px", fontWeight: 700 }}>
                {formData.type === "PRODUCT" ? "Product Specifications" : "Required Skills & Deliverables"}
              </h2>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                Add key attributes vendors must match.
              </p>
            </div>
            <Button size="sm" variant="secondary" onClick={addSpec} leftIcon={<Plus size={14} />}>
              Add Field
            </Button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {formData.specifications.map((spec, i) => (
              <div key={i} style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <input
                  placeholder="Key (e.g. RAM, GPU, Framework)"
                  value={spec.specKey}
                  onChange={(e) => updateSpec(i, "specKey", e.target.value)}
                  style={{ flex: 1, padding: "10px", background: "var(--bg-input)", color: "var(--text-primary)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-sm)" }}
                />
                <input
                  placeholder="Value (e.g. 64GB DDR5, RTX 4080, Next.js)"
                  value={spec.specValue}
                  onChange={(e) => updateSpec(i, "specValue", e.target.value)}
                  style={{ flex: 2, padding: "10px", background: "var(--bg-input)", color: "var(--text-primary)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-sm)" }}
                />
                {formData.specifications.length > 1 && (
                  <button
                    onClick={() => removeSpec(i)}
                    style={{ color: "var(--accent-rose)", padding: "8px" }}
                    title="Remove"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* STEP 7: Attachments */}
      {currentStep === 7 && (
        <Card>
          <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px" }}>
            Documents & Reference Files
          </h2>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "20px" }}>
            Attach reference blueprints, RFP documents, or visual mockups.
          </p>

          <div
            style={{
              padding: "40px 20px",
              border: "2px dashed var(--border-glow)",
              borderRadius: "var(--radius-md)",
              textAlign: "center",
              background: "rgba(0, 242, 254, 0.02)",
            }}
          >
            <Paperclip size={32} color="var(--accent-cyan)" style={{ marginBottom: "12px" }} />
            <h4 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "4px" }}>
              Upload Architecture / Specs Document
            </h4>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "16px" }}>
              PDF, PNG, JPG, or DOCX up to 25MB
            </p>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                const sampleAttachment = {
                  fileUrl: "https://reversemarket.io/docs/spec_v1.pdf",
                  fileName: "Project_Requirements_v1.pdf",
                  fileType: "application/pdf",
                  fileSize: 1048576,
                };
                setFormData((prev) => ({
                  ...prev,
                  attachments: [...prev.attachments, sampleAttachment],
                }));
              }}
            >
              Attach Sample Document
            </Button>

            {formData.attachments.length > 0 && (
              <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
                {formData.attachments.map((att, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 14px",
                      background: "var(--bg-input)",
                      borderRadius: "var(--radius-sm)",
                    }}
                  >
                    <span style={{ fontSize: "13px", color: "var(--text-primary)" }}>{att.fileName}</span>
                    <span style={{ fontSize: "11px", color: "var(--accent-cyan)" }}>Attached</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* STEP 8: Review & Publish */}
      {currentStep === 8 && (
        <Card glow={true}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
            <div>
              <Badge variant={formData.type === "PRODUCT" ? "cyan" : "purple"}>
                {formData.type}
              </Badge>
              <h2 style={{ fontSize: "22px", fontWeight: 800, marginTop: "8px", fontFamily: "var(--font-display)" }}>
                {formData.title}
              </h2>
            </div>
            <div style={{ textAlign: "right" }}>
              <span style={{ fontSize: "12px", color: "var(--text-muted)", display: "block" }}>Budget Scope</span>
              <span style={{ fontSize: "18px", fontWeight: 800, color: "var(--accent-cyan)", fontFamily: "var(--font-display)" }}>
                ₹{formData.minBudget.toLocaleString()} – ₹{formData.maxBudget.toLocaleString()}
              </span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px", fontSize: "14px" }}>
            <div>
              <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>Description:</span>
              <p style={{ color: "var(--text-secondary)", marginTop: "4px", lineHeight: 1.6 }}>
                {formData.description}
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>Location:</span>
                <span style={{ display: "block", color: "var(--text-primary)" }}>
                  {formData.isRemote ? "Remote / Online Friendly" : `${formData.city}, ${formData.state}`}
                </span>
              </div>
              <div>
                <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>Timeline:</span>
                <span style={{ display: "block", color: "var(--text-primary)" }}>
                  {formData.type === "PRODUCT" ? (formData.requiredDeliveryDate || "Flexible") : `${formData.expectedDurationDays} Days`}
                </span>
              </div>
            </div>

            <div>
              <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>Key Specifications ({formData.specifications.length}):</span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "6px" }}>
                {formData.specifications.map((s, idx) => (
                  <span
                    key={idx}
                    style={{
                      background: "var(--bg-tertiary)",
                      padding: "4px 10px",
                      borderRadius: "var(--radius-sm)",
                      fontSize: "12px",
                      border: "1px solid var(--border-subtle)",
                    }}
                  >
                    <strong>{s.specKey}:</strong> {s.specValue || "N/A"}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Action Controls */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "32px" }}>
        {currentStep > 1 ? (
          <Button variant="secondary" onClick={handleBack} leftIcon={<ChevronLeft size={16} />}>
            Back
          </Button>
        ) : (
          <div />
        )}

        {currentStep < 8 ? (
          <Button variant="primary" onClick={handleNext} rightIcon={<ChevronRight size={16} />}>
            Next Step
          </Button>
        ) : (
          <Button
            variant="glow"
            onClick={handleSubmit}
            isLoading={loading}
            rightIcon={<Sparkles size={16} />}
          >
            Publish Live Requirement
          </Button>
        )}
      </div>
    </div>
  );
};
