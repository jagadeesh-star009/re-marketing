import { UserRepository } from "@/repositories/user.repository";
import { hashPassword, verifyPassword, signToken, SessionUser } from "@/lib/auth";
import { Role } from "@prisma/client";

export class AuthService {
  static async register(data: {
    name: string;
    email: string;
    password: string;
    role: Role;
    phone?: string;
    businessName?: string;
    description?: string;
    city?: string;
    state?: string;
    experienceYears?: number;
    isRemoteAvailable?: boolean;
    categoriesProvided?: string;
  }) {
    const existing = await UserRepository.findByEmail(data.email);
    if (existing) {
      throw new Error("An account with this email address already exists.");
    }

    const passwordHash = await hashPassword(data.password);
    const user = await UserRepository.createUser({
      name: data.name,
      email: data.email,
      passwordHash,
      role: data.role,
      phone: data.phone,
    });

    let vendorProfileId: string | undefined;
    if (data.role === "VENDOR") {
      const vendorProfile = await UserRepository.createVendorProfile(user.id, {
        businessName: data.businessName || data.name,
        description: data.description || "Certified marketplace vendor",
        city: data.city || "Bengaluru",
        state: data.state || "Karnataka",
        experienceYears: data.experienceYears ?? 3,
        isRemoteAvailable: data.isRemoteAvailable ?? true,
        categoriesProvided: data.categoriesProvided,
      });
      vendorProfileId = vendorProfile.id;
    }

    const sessionUser: SessionUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      vendorProfileId,
    };

    const token = signToken(sessionUser);
    return { user: sessionUser, token };
  }

  static async login(data: { email: string; password: string }) {
    const user = await UserRepository.findByEmail(data.email);
    if (!user || !user.isActive) {
      throw new Error("Invalid email or password credentials.");
    }

    const isValid = await verifyPassword(data.password, user.passwordHash);
    if (!isValid) {
      throw new Error("Invalid email or password credentials.");
    }

    const sessionUser: SessionUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      vendorProfileId: user.vendorProfile?.id,
    };

    const token = signToken(sessionUser);
    return { user: sessionUser, token };
  }
}
