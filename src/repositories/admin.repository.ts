import { prisma } from "@/lib/prisma";

export class AdminRepository {
  static async getPlatformKPIs() {
    const [
      totalUsers,
      requirementOwners,
      vendors,
      productRequirements,
      serviceRequirements,
      activeRequirements,
      totalOffers,
      totalShortlists,
      successfulSelections,
      completedOrders,
      reviewsCount,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "REQUIREMENT_OWNER" } }),
      prisma.user.count({ where: { role: "VENDOR" } }),
      prisma.requirement.count({ where: { type: "PRODUCT" } }),
      prisma.requirement.count({ where: { type: "SERVICE" } }),
      prisma.requirement.count({
        where: { status: { in: ["PUBLISHED", "MATCHED", "SHORTLISTED"] } },
      }),
      prisma.offer.count(),
      prisma.shortlist.count(),
      prisma.selection.count(),
      prisma.selection.count({ where: { status: "COMPLETED" } }),
      prisma.review.count(),
    ]);

    return {
      totalUsers,
      requirementOwners,
      vendors,
      productRequirements,
      serviceRequirements,
      activeRequirements,
      totalOffers,
      totalShortlists,
      successfulSelections,
      completedOrders,
      reviewsCount,
    };
  }

  static async getMatchingWeights() {
    const weights = await prisma.matchingWeight.findFirst({
      where: { isDefault: true },
    });

    if (!weights) {
      return prisma.matchingWeight.create({
        data: {
          budgetWeight: 0.30,
          relevanceWeight: 0.30,
          deliveryWeight: 0.20,
          locationWeight: 0.10,
          vendorQualityWeight: 0.10,
          isDefault: true,
        },
      });
    }

    return weights;
  }

  static async updateMatchingWeights(weights: {
    budgetWeight: number;
    relevanceWeight: number;
    deliveryWeight: number;
    locationWeight: number;
    vendorQualityWeight: number;
  }) {
    const existing = await this.getMatchingWeights();
    return prisma.matchingWeight.update({
      where: { id: existing.id },
      data: weights,
    });
  }

  static async getAllUsers(limit = 100) {
    return prisma.user.findMany({
      take: limit,
      include: {
        vendorProfile: true,
        _count: {
          select: { requirements: true, offers: true, reviewsReceived: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async getAllRequirements(limit = 100) {
    return prisma.requirement.findMany({
      take: limit,
      include: {
        owner: { select: { id: true, name: true, email: true } },
        category: true,
        _count: { select: { offers: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async getAllCategories() {
    return prisma.category.findMany({
      include: {
        subcategories: true,
        _count: { select: { requirements: true } },
      },
      orderBy: { name: "asc" },
    });
  }
}
