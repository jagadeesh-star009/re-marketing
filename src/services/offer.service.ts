import { OfferRepository } from "@/repositories/offer.repository";
import { RequirementRepository } from "@/repositories/requirement.repository";
import { AdminRepository } from "@/repositories/admin.repository";
import { MatchingEngine } from "@/lib/matching-engine";
import { createNotification } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";

export class OfferService {
  static async submitOffer(vendorId: string, vendorProfileId: string, input: any) {
    const requirement = await RequirementRepository.findById(input.requirementId);
    if (!requirement) {
      throw new Error("Requirement not found");
    }

    if (requirement.status === "COMPLETED" || requirement.status === "CANCELLED") {
      throw new Error("This requirement is no longer accepting new offers.");
    }

    const offer = await OfferRepository.create({
      requirementId: input.requirementId,
      vendorId,
      vendorProfileId,
      offeredPrice: input.offeredPrice,
      currency: input.currency || "INR",
      quantity: input.quantity ?? 1,
      deliveryDate: input.deliveryDate ? new Date(input.deliveryDate) : null,
      shippingCost: input.shippingCost ?? 0,
      additionalCharges: input.additionalCharges ?? 0,
      warranty: input.warranty,
      returnPolicy: input.returnPolicy,
      startDate: input.startDate ? new Date(input.startDate) : null,
      completionDate: input.completionDate ? new Date(input.completionDate) : null,
      estimatedDuration: input.estimatedDuration,
      deliverables: input.deliverables,
      milestonesJson: input.milestonesJson,
      description: input.description,
      vendorNotes: input.vendorNotes,
      specifications: input.specifications,
      attachments: input.attachments,
    });

    // Compute compatibility score
    const vendorProfile = await prisma.vendorProfile.findUnique({
      where: { id: vendorProfileId },
    });

    if (vendorProfile) {
      const weights = await AdminRepository.getMatchingWeights();
      const engine = new MatchingEngine(weights);

      const comp = engine.computeCompatibility(
        {
          type: requirement.type,
          minBudget: requirement.minBudget,
          maxBudget: requirement.maxBudget,
          preferredBudget: requirement.preferredBudget,
          categoryId: requirement.categoryId,
          categoryName: requirement.category?.name,
          city: requirement.city,
          state: requirement.state,
          isRemote: requirement.isRemote,
          requiredDeliveryDate: requirement.requiredDeliveryDate,
          projectDeadline: requirement.projectDeadline,
          specifications: requirement.specifications,
        },
        {
          id: vendorProfile.id,
          city: vendorProfile.city,
          state: vendorProfile.state,
          isRemoteAvailable: vendorProfile.isRemoteAvailable,
          experienceYears: vendorProfile.experienceYears,
          rating: vendorProfile.rating,
          completedOrders: vendorProfile.completedOrders,
          responseRate: vendorProfile.responseRate,
          verified: vendorProfile.verified,
          categoriesProvided: vendorProfile.categoriesProvided,
        },
        {
          offeredPrice: offer.offeredPrice,
          deliveryDate: offer.deliveryDate,
          completionDate: offer.completionDate,
          specifications: offer.specifications,
        }
      );

      await OfferRepository.upsertCompatibilityScore({
        requirementId: requirement.id,
        offerId: offer.id,
        vendorProfileId: vendorProfile.id,
        overallScore: comp.overallScore,
        budgetScore: comp.budgetScore,
        relevanceScore: comp.relevanceScore,
        deliveryScore: comp.deliveryScore,
        locationScore: comp.locationScore,
        vendorQualityScore: comp.vendorQualityScore,
        breakdownJson: JSON.stringify(comp.breakdown),
      });

      // Notify the requirement owner
      await createNotification({
        userId: requirement.ownerId,
        type: "OFFER_RECEIVED",
        title: `New Offer Received (${comp.overallScore}% Compatibility)`,
        message: `${vendorProfile.businessName} submitted an offer of ₹${offer.offeredPrice.toLocaleString()} for "${requirement.title}"`,
        linkUrl: `/requirements/${requirement.id}`,
      });
    }

    return offer;
  }

  static async toggleShortlist(requirementId: string, offerId: string, vendorId: string, ownerId: string) {
    const res = await OfferRepository.toggleShortlist(requirementId, offerId, vendorId, ownerId);

    if (res.shortlisted) {
      const vendorUser = await prisma.user.findFirst({
        where: { vendorProfile: { id: vendorId } },
      });
      if (vendorUser) {
        await createNotification({
          userId: vendorUser.id,
          type: "OFFER_SHORTLISTED",
          title: "Offer Shortlisted!",
          message: `Your offer has been shortlisted by the requirement owner.`,
          linkUrl: `/offers/${offerId}`,
        });
      }
    }

    return res;
  }

  static async selectOffer(requirementId: string, offerId: string, vendorId: string, ownerId: string) {
    const selection = await OfferRepository.selectOffer(requirementId, offerId, vendorId, ownerId);

    // Notify selected vendor
    const vendorUser = await prisma.user.findFirst({
      where: { vendorProfile: { id: vendorId } },
    });
    if (vendorUser) {
      await createNotification({
        userId: vendorUser.id,
        type: "OFFER_SELECTED",
        title: "Offer Selected! Congratulations",
        message: `Your offer has been selected as the winning proposal! You can now coordinate fulfillment.`,
        linkUrl: `/requirements/${requirementId}`,
      });
    }

    return selection;
  }
}
