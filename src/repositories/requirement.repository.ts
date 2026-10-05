import { prisma } from "@/lib/prisma";
import { RequirementStatus, RequirementType } from "@prisma/client";

export class RequirementRepository {
  static async create(data: {
    ownerId: string;
    type: RequirementType;
    title: string;
    description: string;
    categoryId: string;
    subcategoryId?: string | null;
    quantity?: number;
    minBudget: number;
    maxBudget: number;
    preferredBudget?: number | null;
    currency?: string;
    requiredDeliveryDate?: Date | null;
    preferredDeliveryDate?: Date | null;
    projectStartDate?: Date | null;
    projectDeadline?: Date | null;
    expectedDurationDays?: number | null;
    country?: string;
    state?: string | null;
    city?: string | null;
    pincode?: string | null;
    isRemote?: boolean;
    specifications?: Array<{ specKey: string; specValue: string; isRequired?: boolean }>;
    attachments?: Array<{ fileUrl: string; fileName: string; fileType: string; fileSize: number }>;
  }) {
    return prisma.requirement.create({
      data: {
        ownerId: data.ownerId,
        type: data.type,
        title: data.title,
        description: data.description,
        categoryId: data.categoryId,
        subcategoryId: data.subcategoryId,
        quantity: data.quantity ?? 1,
        minBudget: data.minBudget,
        maxBudget: data.maxBudget,
        preferredBudget: data.preferredBudget,
        currency: data.currency ?? "INR",
        requiredDeliveryDate: data.requiredDeliveryDate,
        preferredDeliveryDate: data.preferredDeliveryDate,
        projectStartDate: data.projectStartDate,
        projectDeadline: data.projectDeadline,
        expectedDurationDays: data.expectedDurationDays,
        country: data.country ?? "India",
        state: data.state,
        city: data.city,
        pincode: data.pincode,
        isRemote: data.isRemote ?? false,
        status: "PUBLISHED",
        specifications: {
          create: data.specifications?.map((s) => ({
            specKey: s.specKey,
            specValue: s.specValue,
            isRequired: s.isRequired ?? true,
          })) ?? [],
        },
        attachments: {
          create: data.attachments?.map((a) => ({
            fileUrl: a.fileUrl,
            fileName: a.fileName,
            fileType: a.fileType,
            fileSize: a.fileSize,
          })) ?? [],
        },
      },
      include: {
        category: true,
        subcategory: true,
        specifications: true,
        attachments: true,
      },
    });
  }

  static async findById(id: string) {
    return prisma.requirement.findUnique({
      where: { id },
      include: {
        owner: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        category: true,
        subcategory: true,
        specifications: true,
        attachments: true,
        offers: {
          include: {
            vendor: {
              select: { id: true, name: true, email: true, avatarUrl: true },
            },
            vendorProfile: true,
            specifications: true,
            attachments: true,
            compatibilityScore: true,
          },
          orderBy: { offeredPrice: "asc" },
        },
        shortlists: true,
        selections: {
          include: {
            offer: true,
            vendorProfile: true,
          },
        },
        compatibilityScores: {
          include: {
            vendorProfile: true,
          },
        },
      },
    });
  }

  static async findByOwner(ownerId: string) {
    return prisma.requirement.findMany({
      where: { ownerId },
      include: {
        category: true,
        specifications: true,
        _count: {
          select: { offers: true, shortlists: true },
        },
        selections: {
          include: {
            vendorProfile: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async findOpenRequirements(filter?: {
    type?: RequirementType;
    categoryId?: string;
    city?: string;
    isRemote?: boolean;
    search?: string;
  }) {
    return prisma.requirement.findMany({
      where: {
        status: { in: ["PUBLISHED", "MATCHED", "SHORTLISTED"] },
        ...(filter?.type ? { type: filter.type } : {}),
        ...(filter?.categoryId ? { categoryId: filter.categoryId } : {}),
        ...(filter?.isRemote !== undefined ? { isRemote: filter.isRemote } : {}),
        ...(filter?.search
          ? {
              OR: [
                { title: { contains: filter.search } },
                { description: { contains: filter.search } },
              ],
            }
          : {}),
      },
      include: {
        category: true,
        subcategory: true,
        specifications: true,
        _count: {
          select: { offers: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async updateStatus(id: string, status: RequirementStatus) {
    return prisma.requirement.update({
      where: { id },
      data: { status },
    });
  }
}
