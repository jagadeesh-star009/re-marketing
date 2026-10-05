import { prisma } from "@/lib/prisma";
import { OfferStatus, SelectionStatus } from "@prisma/client";

export class OfferRepository {
  static async create(data: {
    requirementId: string;
    vendorId: string;
    vendorProfileId: string;
    offeredPrice: number;
    currency?: string;
    quantity?: number;
    deliveryDate?: Date | null;
    shippingCost?: number;
    additionalCharges?: number;
    warranty?: string | null;
    returnPolicy?: string | null;
    startDate?: Date | null;
    completionDate?: Date | null;
    estimatedDuration?: string | null;
    deliverables?: string | null;
    milestonesJson?: string | null;
    description: string;
    vendorNotes?: string | null;
    specifications?: Array<{ specKey: string; specValue: string }>;
    attachments?: Array<{ fileUrl: string; fileName: string; fileType: string; fileSize: number }>;
  }) {
    return prisma.offer.create({
      data: {
        requirementId: data.requirementId,
        vendorId: data.vendorId,
        vendorProfileId: data.vendorProfileId,
        offeredPrice: data.offeredPrice,
        currency: data.currency ?? "INR",
        quantity: data.quantity ?? 1,
        deliveryDate: data.deliveryDate,
        shippingCost: data.shippingCost ?? 0,
        additionalCharges: data.additionalCharges ?? 0,
        warranty: data.warranty,
        returnPolicy: data.returnPolicy,
        startDate: data.startDate,
        completionDate: data.completionDate,
        estimatedDuration: data.estimatedDuration,
        deliverables: data.deliverables,
        milestonesJson: data.milestonesJson,
        description: data.description,
        vendorNotes: data.vendorNotes,
        status: "SUBMITTED",
        specifications: {
          create: data.specifications ?? [],
        },
        attachments: {
          create: data.attachments ?? [],
        },
      },
      include: {
        vendorProfile: true,
        specifications: true,
        attachments: true,
      },
    });
  }

  static async findById(id: string) {
    return prisma.offer.findUnique({
      where: { id },
      include: {
        requirement: {
          include: {
            owner: { select: { id: true, name: true, email: true } },
            category: true,
            specifications: true,
          },
        },
        vendor: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        vendorProfile: true,
        specifications: true,
        attachments: true,
        compatibilityScore: true,
      },
    });
  }

  static async findByVendor(vendorId: string) {
    return prisma.offer.findMany({
      where: { vendorId },
      include: {
        requirement: {
          include: {
            category: true,
            owner: { select: { id: true, name: true } },
          },
        },
        compatibilityScore: true,
        selections: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async updateStatus(id: string, status: OfferStatus) {
    return prisma.offer.update({
      where: { id },
      data: { status },
    });
  }

  static async upsertCompatibilityScore(data: {
    requirementId: string;
    offerId?: string | null;
    vendorProfileId: string;
    overallScore: number;
    budgetScore: number;
    relevanceScore: number;
    deliveryScore: number;
    locationScore: number;
    vendorQualityScore: number;
    breakdownJson: string;
  }) {
    if (data.offerId) {
      return prisma.compatibilityScore.upsert({
        where: { offerId: data.offerId },
        create: {
          requirementId: data.requirementId,
          offerId: data.offerId,
          vendorProfileId: data.vendorProfileId,
          overallScore: data.overallScore,
          budgetScore: data.budgetScore,
          relevanceScore: data.relevanceScore,
          deliveryScore: data.deliveryScore,
          locationScore: data.locationScore,
          vendorQualityScore: data.vendorQualityScore,
          breakdownJson: data.breakdownJson,
        },
        update: {
          overallScore: data.overallScore,
          budgetScore: data.budgetScore,
          relevanceScore: data.relevanceScore,
          deliveryScore: data.deliveryScore,
          locationScore: data.locationScore,
          vendorQualityScore: data.vendorQualityScore,
          breakdownJson: data.breakdownJson,
          calculatedAt: new Date(),
        },
      });
    }

    return prisma.compatibilityScore.create({
      data: {
        requirementId: data.requirementId,
        vendorProfileId: data.vendorProfileId,
        overallScore: data.overallScore,
        budgetScore: data.budgetScore,
        relevanceScore: data.relevanceScore,
        deliveryScore: data.deliveryScore,
        locationScore: data.locationScore,
        vendorQualityScore: data.vendorQualityScore,
        breakdownJson: data.breakdownJson,
      },
    });
  }

  static async toggleShortlist(requirementId: string, offerId: string, vendorId: string, ownerId: string) {
    const existing = await prisma.shortlist.findUnique({
      where: {
        requirementId_offerId: {
          requirementId,
          offerId,
        },
      },
    });

    if (existing) {
      await prisma.shortlist.delete({
        where: { id: existing.id },
      });
      await prisma.offer.update({
        where: { id: offerId },
        data: { status: "SUBMITTED" },
      });
      return { shortlisted: false };
    } else {
      await prisma.shortlist.create({
        data: {
          requirementId,
          offerId,
          vendorId,
          ownerId,
        },
      });
      await prisma.offer.update({
        where: { id: offerId },
        data: { status: "SHORTLISTED" },
      });
      return { shortlisted: true };
    }
  }

  static async selectOffer(requirementId: string, offerId: string, vendorId: string, ownerId: string) {
    return prisma.$transaction(async (tx) => {
      // 1. Mark this offer as SELECTED
      await tx.offer.update({
        where: { id: offerId },
        data: { status: "SELECTED" },
      });

      // 2. Mark other submitted/shortlisted offers for this requirement as REJECTED
      await tx.offer.updateMany({
        where: {
          requirementId,
          id: { not: offerId },
          status: { in: ["SUBMITTED", "SHORTLISTED", "UNDER_REVIEW"] },
        },
        data: { status: "REJECTED" },
      });

      // 3. Mark the requirement as VENDOR_SELECTED
      await tx.requirement.update({
        where: { id: requirementId },
        data: { status: "VENDOR_SELECTED" },
      });

      // 4. Create the selection record
      return tx.selection.upsert({
        where: { requirementId },
        create: {
          requirementId,
          offerId,
          vendorId,
          ownerId,
          status: "IN_PROGRESS",
        },
        update: {
          offerId,
          vendorId,
          status: "IN_PROGRESS",
          selectedAt: new Date(),
        },
      });
    });
  }

  static async completeSelection(selectionId: string) {
    return prisma.$transaction(async (tx) => {
      const selection = await tx.selection.update({
        where: { id: selectionId },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
        },
      });

      await tx.requirement.update({
        where: { id: selection.requirementId },
        data: { status: "COMPLETED" },
      });

      // Increment completed orders count on vendor profile
      await tx.vendorProfile.update({
        where: { id: selection.vendorId },
        data: { completedOrders: { increment: 1 } },
      });

      return selection;
    });
  }
}
