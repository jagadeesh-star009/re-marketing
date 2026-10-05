import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export class UserRepository {
  static async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        vendorProfile: true,
        userProfile: true,
      },
    });
  }

  static async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        vendorProfile: true,
        userProfile: true,
      },
    });
  }

  static async createUser(data: {
    email: string;
    passwordHash: string;
    name: string;
    role: Role;
    phone?: string;
  }) {
    return prisma.user.create({
      data: {
        email: data.email.toLowerCase().trim(),
        passwordHash: data.passwordHash,
        name: data.name,
        role: data.role,
        phone: data.phone,
        userProfile: {
          create: {},
        },
      },
      include: {
        userProfile: true,
      },
    });
  }

  static async createVendorProfile(userId: string, data: {
    businessName: string;
    description: string;
    tagline?: string;
    city: string;
    state: string;
    isRemoteAvailable?: boolean;
    experienceYears?: number;
    categoriesProvided?: string;
  }) {
    return prisma.vendorProfile.create({
      data: {
        userId,
        businessName: data.businessName,
        description: data.description,
        tagline: data.tagline,
        city: data.city,
        state: data.state,
        isRemoteAvailable: data.isRemoteAvailable ?? true,
        experienceYears: data.experienceYears ?? 3,
        categoriesProvided: data.categoriesProvided,
      },
    });
  }

  static async getAllVendors(limit = 50) {
    return prisma.vendorProfile.findMany({
      take: limit,
      include: {
        user: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        services: true,
        products: true,
      },
      orderBy: { rating: "desc" },
    });
  }
}
