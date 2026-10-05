import { RequirementRepository } from "@/repositories/requirement.repository";
import { UserRepository } from "@/repositories/user.repository";
import { AdminRepository } from "@/repositories/admin.repository";
import { MatchingEngine } from "@/lib/matching-engine";
import { createNotification } from "@/lib/notifications";
import { RequirementType } from "@prisma/client";

export class RequirementService {
  static async createRequirement(ownerId: string, input: any) {
    const requirement = await RequirementRepository.create({
      ownerId,
      type: input.type as RequirementType,
      title: input.title,
      description: input.description,
      categoryId: input.categoryId,
      subcategoryId: input.subcategoryId,
      quantity: input.quantity,
      minBudget: input.minBudget,
      maxBudget: input.maxBudget,
      preferredBudget: input.preferredBudget,
      currency: input.currency || "INR",
      requiredDeliveryDate: input.requiredDeliveryDate ? new Date(input.requiredDeliveryDate) : null,
      preferredDeliveryDate: input.preferredDeliveryDate ? new Date(input.preferredDeliveryDate) : null,
      projectStartDate: input.projectStartDate ? new Date(input.projectStartDate) : null,
      projectDeadline: input.projectDeadline ? new Date(input.projectDeadline) : null,
      expectedDurationDays: input.expectedDurationDays,
      country: input.country || "India",
      state: input.state,
      city: input.city,
      pincode: input.pincode,
      isRemote: input.isRemote ?? false,
      specifications: input.specifications,
      attachments: input.attachments,
    });

    // Notify matching vendors asynchronously
    try {
      const allVendors = await UserRepository.getAllVendors(20);
      const weights = await AdminRepository.getMatchingWeights();
      const engine = new MatchingEngine(weights);

      for (const vendor of allVendors) {
        const preview = engine.computeCompatibility(
          {
            type: requirement.type,
            minBudget: requirement.minBudget,
            maxBudget: requirement.maxBudget,
            preferredBudget: requirement.preferredBudget,
            categoryId: requirement.categoryId,
            city: requirement.city,
            state: requirement.state,
            isRemote: requirement.isRemote,
            requiredDeliveryDate: requirement.requiredDeliveryDate,
            projectDeadline: requirement.projectDeadline,
            specifications: requirement.specifications,
          },
          {
            id: vendor.id,
            city: vendor.city,
            state: vendor.state,
            isRemoteAvailable: vendor.isRemoteAvailable,
            experienceYears: vendor.experienceYears,
            rating: vendor.rating,
            completedOrders: vendor.completedOrders,
            responseRate: vendor.responseRate,
            verified: vendor.verified,
            categoriesProvided: vendor.categoriesProvided,
          }
        );

        if (preview.overallScore >= 70) {
          await createNotification({
            userId: vendor.userId,
            type: "VENDOR_MATCH",
            title: `New Matching Requirement (${preview.overallScore}% Match)`,
            message: `A new requirement matching your capabilities was posted: "${requirement.title}"`,
            linkUrl: `/requirements/${requirement.id}`,
          });
        }
      }
    } catch (err) {
      console.error("Non-fatal vendor match notification error:", err);
    }

    return requirement;
  }

  static async getRequirementById(id: string) {
    return RequirementRepository.findById(id);
  }

  static async getOwnerRequirements(ownerId: string) {
    return RequirementRepository.findByOwner(ownerId);
  }

  static async getOpenRequirements(filter?: any) {
    return RequirementRepository.findOpenRequirements(filter);
  }
}
