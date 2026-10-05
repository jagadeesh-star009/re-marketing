import { z } from "zod";

export const RegisterSchema = z.object({
  name: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["REQUIREMENT_OWNER", "VENDOR"]),
  phone: z.string().optional(),
  // Vendor specific
  businessName: z.string().optional(),
  description: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  experienceYears: z.coerce.number().optional(),
  isRemoteAvailable: z.boolean().optional(),
  categoriesProvided: z.string().optional(),
});

export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const RequirementSchema = z.object({
  type: z.enum(["PRODUCT", "SERVICE"]),
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(15, "Please provide a detailed description (at least 15 characters)"),
  categoryId: z.string().min(1, "Category is required"),
  subcategoryId: z.string().optional().nullable(),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1").default(1),
  minBudget: z.coerce.number().min(0, "Minimum budget cannot be negative"),
  maxBudget: z.coerce.number().min(1, "Maximum budget must be greater than 0"),
  preferredBudget: z.coerce.number().optional().nullable(),
  currency: z.string().default("INR"),
  // Product
  requiredDeliveryDate: z.string().optional().nullable(),
  preferredDeliveryDate: z.string().optional().nullable(),
  // Service
  projectStartDate: z.string().optional().nullable(),
  projectDeadline: z.string().optional().nullable(),
  expectedDurationDays: z.coerce.number().optional().nullable(),
  // Location
  country: z.string().default("India"),
  state: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  pincode: z.string().optional().nullable(),
  isRemote: z.boolean().default(false),
  // Dynamic specifications
  specifications: z.array(
    z.object({
      specKey: z.string(),
      specValue: z.string(),
      isRequired: z.boolean().default(true),
    })
  ).optional(),
  attachments: z.array(
    z.object({
      fileUrl: z.string(),
      fileName: z.string(),
      fileType: z.string(),
      fileSize: z.number(),
    })
  ).optional(),
});

export const OfferSchema = z.object({
  requirementId: z.string().min(1, "Requirement ID is required"),
  offeredPrice: z.coerce.number().min(1, "Offered price must be greater than 0"),
  currency: z.string().default("INR"),
  quantity: z.coerce.number().default(1),
  deliveryDate: z.string().optional().nullable(),
  shippingCost: z.coerce.number().default(0),
  additionalCharges: z.coerce.number().default(0),
  warranty: z.string().optional().nullable(),
  returnPolicy: z.string().optional().nullable(),
  startDate: z.string().optional().nullable(),
  completionDate: z.string().optional().nullable(),
  estimatedDuration: z.string().optional().nullable(),
  deliverables: z.string().optional().nullable(),
  milestonesJson: z.string().optional().nullable(),
  description: z.string().min(10, "Please provide comprehensive offer details (at least 10 characters)"),
  vendorNotes: z.string().optional().nullable(),
  specifications: z.array(
    z.object({
      specKey: z.string(),
      specValue: z.string(),
    })
  ).optional(),
  attachments: z.array(
    z.object({
      fileUrl: z.string(),
      fileName: z.string(),
      fileType: z.string(),
      fileSize: z.number(),
    })
  ).optional(),
});

export const MessageSchema = z.object({
  conversationId: z.string().min(1),
  content: z.string().min(1, "Message cannot be empty"),
  attachments: z.array(
    z.object({
      fileUrl: z.string(),
      fileName: z.string(),
      fileType: z.string(),
      fileSize: z.number(),
    })
  ).optional(),
});

export const ReviewSchema = z.object({
  requirementId: z.string().min(1),
  selectionId: z.string().optional().nullable(),
  revieweeId: z.string().min(1),
  rating: z.coerce.number().min(1).max(5),
  comment: z.string().min(5, "Review comment must be at least 5 characters"),
});

export const MatchingWeightsSchema = z.object({
  budgetWeight: z.coerce.number().min(0).max(1),
  relevanceWeight: z.coerce.number().min(0).max(1),
  deliveryWeight: z.coerce.number().min(0).max(1),
  locationWeight: z.coerce.number().min(0).max(1),
  vendorQualityWeight: z.coerce.number().min(0).max(1),
});
