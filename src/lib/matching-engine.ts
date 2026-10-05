export interface MatchingWeights {
  budgetWeight: number;       // default 0.30
  relevanceWeight: number;    // default 0.30
  deliveryWeight: number;     // default 0.20
  locationWeight: number;     // default 0.10
  vendorQualityWeight: number;// default 0.10
}

export const DEFAULT_WEIGHTS: MatchingWeights = {
  budgetWeight: 0.30,
  relevanceWeight: 0.30,
  deliveryWeight: 0.20,
  locationWeight: 0.10,
  vendorQualityWeight: 0.10,
};

export interface MatchingRequirementInput {
  type: "PRODUCT" | "SERVICE";
  minBudget: number;
  maxBudget: number;
  preferredBudget?: number | null;
  categoryId: string;
  categoryName?: string;
  city?: string | null;
  state?: string | null;
  isRemote?: boolean;
  requiredDeliveryDate?: Date | string | null;
  projectDeadline?: Date | string | null;
  specifications?: Array<{ specKey: string; specValue: string; isRequired?: boolean }>;
}

export interface MatchingOfferInput {
  offeredPrice: number;
  deliveryDate?: Date | string | null;
  completionDate?: Date | string | null;
  shippingCost?: number;
  warranty?: string | null;
  specifications?: Array<{ specKey: string; specValue: string }>;
}

export interface MatchingVendorInput {
  id: string;
  city: string;
  state: string;
  isRemoteAvailable: boolean;
  experienceYears: number;
  rating: number;
  completedOrders: number;
  responseRate: number;
  verified: boolean;
  categoriesProvided?: string | null;
}

export interface CompatibilityResult {
  overallScore: number;
  budgetScore: number;
  relevanceScore: number;
  deliveryScore: number;
  locationScore: number;
  vendorQualityScore: number;
  breakdown: {
    budget: string;
    relevance: string;
    delivery: string;
    location: string;
    vendorQuality: string;
  };
}

export class MatchingEngine {
  private weights: MatchingWeights;

  constructor(customWeights?: Partial<MatchingWeights>) {
    this.weights = { ...DEFAULT_WEIGHTS, ...customWeights };
    this.normalizeWeights();
  }

  private normalizeWeights() {
    const total =
      this.weights.budgetWeight +
      this.weights.relevanceWeight +
      this.weights.deliveryWeight +
      this.weights.locationWeight +
      this.weights.vendorQualityWeight;

    if (total > 0 && Math.abs(total - 1.0) > 0.001) {
      this.weights.budgetWeight /= total;
      this.weights.relevanceWeight /= total;
      this.weights.deliveryWeight /= total;
      this.weights.locationWeight /= total;
      this.weights.vendorQualityWeight /= total;
    }
  }

  /**
   * Calculate budget score (0 - 100)
   */
  public calculateBudgetScore(
    offeredPrice: number,
    minBudget: number,
    maxBudget: number,
    preferredBudget?: number | null
  ): { score: number; explanation: string } {
    if (minBudget <= 0 && maxBudget <= 0) {
      return { score: 100, explanation: "Open budget requirement." };
    }

    const targetMax = maxBudget > 0 ? maxBudget : minBudget * 1.5;
    const targetMin = minBudget > 0 ? minBudget : targetMax * 0.5;

    // Perfect fit: within min and max
    if (offeredPrice >= targetMin && offeredPrice <= targetMax) {
      // If preferred budget is specified and match is close
      if (preferredBudget && preferredBudget > 0) {
        const diffPercent = Math.abs(offeredPrice - preferredBudget) / preferredBudget;
        const score = Math.max(85, Math.round(100 - diffPercent * 25));
        return {
          score,
          explanation: `Offered price ₹${offeredPrice.toLocaleString()} aligns with preferred budget ₹${preferredBudget.toLocaleString()}.`,
        };
      }
      return {
        score: 95,
        explanation: `Offered price ₹${offeredPrice.toLocaleString()} is within your specified range (₹${targetMin.toLocaleString()} - ₹${targetMax.toLocaleString()}).`,
      };
    }

    // Lower than min budget (great savings, small caution for underbidding)
    if (offeredPrice < targetMin) {
      const discountRatio = (targetMin - offeredPrice) / targetMin;
      if (discountRatio <= 0.25) {
        return {
          score: 98,
          explanation: `High value offer: ${Math.round(discountRatio * 100)}% below minimum budget without compromising quality scope.`,
        };
      }
      return {
        score: 88,
        explanation: `Significantly below budget (₹${offeredPrice.toLocaleString()}). Ensure scope details match your standards.`,
      };
    }

    // Higher than max budget (score penalization)
    const overRatio = (offeredPrice - targetMax) / targetMax;
    if (overRatio <= 0.1) {
      return {
        score: 75,
        explanation: `Slightly above maximum budget by ${(overRatio * 100).toFixed(0)}%.`,
      };
    } else if (overRatio <= 0.3) {
      return {
        score: 55,
        explanation: `Exceeds maximum budget by ${(overRatio * 100).toFixed(0)}%.`,
      };
    } else {
      const score = Math.max(15, Math.round(40 - (overRatio - 0.3) * 50));
      return {
        score,
        explanation: `Significantly exceeds maximum budget (₹${offeredPrice.toLocaleString()} vs ₹${targetMax.toLocaleString()}).`,
      };
    }
  }

  /**
   * Calculate relevance score (0 - 100)
   */
  public calculateRelevanceScore(
    req: MatchingRequirementInput,
    vendor: MatchingVendorInput,
    offer?: MatchingOfferInput
  ): { score: number; explanation: string } {
    let baseScore = 80;
    let matchedSpecsCount = 0;
    const totalSpecs = req.specifications?.length || 0;

    // Check category alignment
    if (vendor.categoriesProvided) {
      const vendorCats = vendor.categoriesProvided.toLowerCase();
      if (req.categoryName && vendorCats.includes(req.categoryName.toLowerCase())) {
        baseScore += 15;
      }
    } else {
      baseScore += 10;
    }

    // Check specifications alignment
    if (totalSpecs > 0 && offer?.specifications && offer.specifications.length > 0) {
      req.specifications?.forEach((reqSpec) => {
        const found = offer.specifications?.find(
          (os) => os.specKey.toLowerCase().trim() === reqSpec.specKey.toLowerCase().trim()
        );
        if (found) matchedSpecsCount++;
      });
      const specRatio = matchedSpecsCount / totalSpecs;
      baseScore = Math.round(baseScore * 0.7 + specRatio * 30);
    } else if (totalSpecs === 0) {
      baseScore = Math.min(100, baseScore + 5);
    }

    const finalScore = Math.min(100, Math.max(30, baseScore));
    return {
      score: finalScore,
      explanation:
        totalSpecs > 0
          ? `Matched ${matchedSpecsCount} of ${totalSpecs} specified requirement attributes.`
          : `Direct category match with certified domain capabilities.`,
    };
  }

  /**
   * Calculate delivery / deadline score (0 - 100)
   */
  public calculateDeliveryScore(
    req: MatchingRequirementInput,
    offer?: MatchingOfferInput
  ): { score: number; explanation: string } {
    const targetDateStr = req.type === "PRODUCT" ? req.requiredDeliveryDate : req.projectDeadline;
    if (!targetDateStr) {
      return { score: 95, explanation: "Flexible delivery timeline specified." };
    }

    const targetDate = new Date(targetDateStr).getTime();
    const proposedDateStr = req.type === "PRODUCT" ? offer?.deliveryDate : offer?.completionDate;

    if (!proposedDateStr) {
      return { score: 85, explanation: "Standard timeline proposed by vendor." };
    }

    const proposedDate = new Date(proposedDateStr).getTime();
    const diffDays = Math.round((proposedDate - targetDate) / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
      const aheadDays = Math.abs(diffDays);
      return {
        score: Math.min(100, 92 + Math.min(8, aheadDays * 2)),
        explanation: aheadDays === 0
          ? "Delivers precisely on the required target date."
          : `Fast fulfillment: Ready ${aheadDays} day${aheadDays > 1 ? "s" : ""} ahead of schedule.`,
      };
    } else if (diffDays <= 3) {
      return {
        score: 80,
        explanation: `Minor delay of ${diffDays} day${diffDays > 1 ? "s" : ""} beyond deadline.`,
      };
    } else if (diffDays <= 7) {
      return {
        score: 65,
        explanation: `Estimated delivery is 1 week past requested timeline.`,
      };
    } else {
      return {
        score: Math.max(20, 50 - diffDays * 2),
        explanation: `Estimated delivery is ${diffDays} days past requested deadline.`,
      };
    }
  }

  /**
   * Calculate location score (0 - 100)
   */
  public calculateLocationScore(
    req: MatchingRequirementInput,
    vendor: MatchingVendorInput
  ): { score: number; explanation: string } {
    if (req.isRemote && vendor.isRemoteAvailable) {
      return {
        score: 100,
        explanation: "100% remote collaboration compatible.",
      };
    }

    if (req.city && vendor.city && req.city.trim().toLowerCase() === vendor.city.trim().toLowerCase()) {
      return {
        score: 100,
        explanation: `Same city presence (${vendor.city}). Local dispatch & in-person support available.`,
      };
    }

    if (req.state && vendor.state && req.state.trim().toLowerCase() === vendor.state.trim().toLowerCase()) {
      return {
        score: 85,
        explanation: `Same state location (${vendor.state}). Standard regional logistics applicable.`,
      };
    }

    if (vendor.isRemoteAvailable) {
      return {
        score: 80,
        explanation: "Remote fulfillment with verified interstate courier / digital delivery.",
      };
    }

    return {
      score: 55,
      explanation: `Vendor located in ${vendor.city}, ${vendor.state}. Additional transit time may apply.`,
    };
  }

  /**
   * Calculate vendor quality score (0 - 100)
   */
  public calculateVendorQualityScore(vendor: MatchingVendorInput): { score: number; explanation: string } {
    // Rating (0 to 5) -> 50%
    const ratingScore = Math.min(100, (vendor.rating / 5.0) * 100);

    // Completed orders -> 25%
    let orderScore = 60;
    if (vendor.completedOrders >= 50) orderScore = 100;
    else if (vendor.completedOrders >= 20) orderScore = 90;
    else if (vendor.completedOrders >= 5) orderScore = 80;
    else if (vendor.completedOrders >= 1) orderScore = 70;

    // Response rate -> 15%
    const responseScore = Math.min(100, vendor.responseRate);

    // Verification bonus -> 10%
    const verificationScore = vendor.verified ? 100 : 60;

    const weightedScore = Math.round(
      ratingScore * 0.5 + orderScore * 0.25 + responseScore * 0.15 + verificationScore * 0.1
    );

    return {
      score: Math.min(100, weightedScore),
      explanation: `Rating ${vendor.rating.toFixed(1)}/5 · ${vendor.completedOrders} completed transactions · ${vendor.responseRate.toFixed(0)}% response rate.`,
    };
  }

  /**
   * Master compatibility calculation
   */
  public computeCompatibility(
    req: MatchingRequirementInput,
    vendor: MatchingVendorInput,
    offer?: MatchingOfferInput
  ): CompatibilityResult {
    // If offer is present, compute budget score from offer price.
    // If vendor preview without offer, compute estimated budget alignment.
    const priceToEvaluate = offer ? offer.offeredPrice : (req.preferredBudget || (req.minBudget + req.maxBudget) / 2);
    const budgetRes = this.calculateBudgetScore(
      priceToEvaluate,
      req.minBudget,
      req.maxBudget,
      req.preferredBudget
    );

    const relevanceRes = this.calculateRelevanceScore(req, vendor, offer);
    const deliveryRes = this.calculateDeliveryScore(req, offer);
    const locationRes = this.calculateLocationScore(req, vendor);
    const qualityRes = this.calculateVendorQualityScore(vendor);

    const overallScore = Math.round(
      budgetRes.score * this.weights.budgetWeight +
      relevanceRes.score * this.weights.relevanceWeight +
      deliveryRes.score * this.weights.deliveryWeight +
      locationRes.score * this.weights.locationWeight +
      qualityRes.score * this.weights.vendorQualityWeight
    );

    return {
      overallScore: Math.min(100, Math.max(10, overallScore)),
      budgetScore: budgetRes.score,
      relevanceScore: relevanceRes.score,
      deliveryScore: deliveryRes.score,
      locationScore: locationRes.score,
      vendorQualityScore: qualityRes.score,
      breakdown: {
        budget: budgetRes.explanation,
        relevance: relevanceRes.explanation,
        delivery: deliveryRes.explanation,
        location: locationRes.explanation,
        vendorQuality: qualityRes.explanation,
      },
    };
  }
}
