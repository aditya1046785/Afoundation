import { z } from "zod";

// ============================================================
// AUTH SCHEMAS
// ============================================================

export const loginSchema = z.object({
    email: z.string().trim().toLowerCase().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
});

export const registerSchema = z
    .object({
        name: z.string().min(2, "Name must be at least 2 characters"),
        email: z.string().trim().toLowerCase().email("Invalid email address"),
        phone: z
            .string()
            .transform((val) => val === "" ? undefined : val)
            .pipe(z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian phone number").optional()),
        position: z.enum(["Volunteer", "Manager", "General Member", "Team Member"]),
        password: z.string().min(8, "Password must be at least 8 characters"),
        confirmPassword: z.string(),
        agreeToTerms: z.boolean().refine((val) => val === true, "You must agree to the terms"),
        referralCode: z.string().trim().optional(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
    });

// ============================================================
// MEMBER SCHEMAS
// ============================================================

export const memberSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    phone: z
        .string()
        .min(10, "Phone must be 10 digits")
        .regex(/^[6-9]\d{9}$/, "Enter a valid Indian phone number"),
    password: z.string().min(8, "Password must be at least 8 characters").optional(),
    fatherName: z.string().optional(),
    dateOfBirth: z.string().optional(),
    gender: z.enum(["Male", "Female", "Other"]).optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    pincode: z.string().optional(),
    aadharNumber: z.string().optional(),
    occupation: z.string().optional(),
    position: z.string().min(2, "Position is required").optional(),
    membershipType: z.enum(["GENERAL", "LIFETIME", "HONORARY", "STUDENT"]).default("GENERAL"),
    photo: z.string().optional(),
});

export const memberProfileSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    phone: z
        .string()
        .min(10, "Phone must be 10 digits")
        .regex(/^[6-9]\d{9}$/, "Enter a valid Indian phone number"),
    fatherName: z.string().optional(),
    dateOfBirth: z.string().optional(),
    gender: z.enum(["Male", "Female", "Other"]).optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    pincode: z.string().optional(),
    occupation: z.string().optional(),
});

// ============================================================
// DONATION SCHEMAS
// ============================================================

export const donationSchema = z.object({
    amount: z.number().min(1, "Amount must be at least ₹1"),
    donorName: z.string().min(2, "Name must be at least 2 characters"),
    donorEmail: z.string().email("Invalid email address"),
    donorPhone: z
        .string()
        .optional()
        .refine(
            (val) => !val || (val.length === 10 && /^[6-9]\d{9}$/.test(val)),
            "Enter a valid 10-digit Indian phone number"
        ),
    donorPAN: z.string().optional(),
    purpose: z.string().optional(),
    message: z.string().optional(),
    referralCode: z.string().trim().optional(),
});

export const manualDonationSchema = z.object({
    amount: z.number().min(1, "Amount must be at least ₹1"),
    donorName: z.string().min(2, "Name must be at least 2 characters"),
    donorEmail: z.string().email("Invalid email address"),
    donorPhone: z
        .string()
        .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian phone number")
        .optional()
        .or(z.literal("")),
    donorPAN: z.string().optional(),
    source: z.enum(["OFFLINE", "MANUAL"]).default("MANUAL"),
    paymentMode: z.enum(["UPI", "BANK_TRANSFER", "CASH", "CHEQUE", "CARD", "OTHER"]),
    paymentReference: z.string().trim().optional(),
    receivedBy: z.string().trim().optional(),
    purpose: z.string().trim().optional(),
    notes: z.string().trim().optional(),
    referralCode: z.string().trim().optional(),
    referrerMemberId: z.string().trim().optional(),
    memberId: z.string().trim().optional(),
}).superRefine((data, ctx) => {
    const paymentReference = data.paymentReference?.trim() || "";

    if (data.paymentMode !== "CASH" && !paymentReference) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Transaction ID / reference is required for non-cash payments",
            path: ["paymentReference"],
        });
    }
});

// ============================================================
// CONTACT SCHEMA
// ============================================================

export const contactSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    phone: z.string().optional(),
    subject: z.string().min(3, "Subject must be at least 3 characters"),
    message: z.string().min(10, "Message must be at least 10 characters"),
});

// ============================================================
// EVENT SCHEMA
// ============================================================

export const eventSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    slug: z.string().min(3, "Slug must be at least 3 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    date: z.string().min(1, "Date is required"),
    time: z.string().min(1, "Time is required"),
    venue: z.string().min(3, "Venue must be at least 3 characters"),
    image: z.string().optional(),
    isPublished: z.boolean().default(false),
});

// ============================================================
// CERTIFICATE SCHEMA
// ============================================================

export const certificateSchema = z.object({
    memberId: z.string().min(1, "Member is required"),
    type: z.enum(["MEMBERSHIP", "APPRECIATION", "VOLUNTEER", "DONATION", "ACHIEVEMENT"]),
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().optional(),
    issuedBy: z.string().min(2, "Issued by is required"),
});

// Simple certificate generator form schema
export const generateCertificateSchema = z.object({
    memberId: z.string().optional(),
    recipientName: z.string().trim().min(2, "Recipient name must be at least 2 characters").optional(),
}).refine((data) => Boolean(data.memberId || data.recipientName), {
    message: "Select a member or enter a recipient name",
    path: ["memberId"],
});

// ============================================================
// TEAM MEMBER SCHEMA
// ============================================================

export const teamMemberSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    role: z.string().min(2, "Role/Designation is required"),
    bio: z.string().optional(),
    photo: z.string().min(1, "Photo is required"),
    category: z.string().min(1, "Category is required"),
    instagramUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
    facebookUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
    twitterUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
    linkedinUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
    youtubeUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
    displayOrder: z.number().default(0),
    isVisible: z.boolean().default(true),
});

// ============================================================
// BLOG SCHEMA
// ============================================================

export const blogPostSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    slug: z.string().min(3, "Slug must be at least 3 characters"),
    excerpt: z.string().min(10, "Excerpt must be at least 10 characters"),
    content: z.string().min(50, "Content must be at least 50 characters"),
    featuredImage: z.string().optional(),
    category: z.string().optional(),
    tags: z.string().optional(),
    status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
});

// ============================================================
// ANNOUNCEMENT SCHEMA
// ============================================================

export const announcementSchema = z.object({
    message: z.string().min(5, "Message must be at least 5 characters"),
    linkText: z.string().optional(),
    linkUrl: z.string().optional(),
    type: z.enum(["INFO", "URGENT", "SUCCESS", "WARNING"]).default("INFO"),
    isActive: z.boolean().default(true),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().optional(),
});

// ============================================================
// DOWNLOAD DOCUMENT SCHEMA
// ============================================================

export const downloadDocumentSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().optional(),
    fileUrl: z.string().min(1, "File is required"),
    fileSize: z.string().optional(),
    category: z.string().min(1, "Category is required"),
    displayOrder: z.number().default(0),
    isVisible: z.boolean().default(true),
});

// ============================================================
// ALBUM SCHEMA
// ============================================================

export const albumSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    slug: z.string().min(3, "Slug must be at least 3 characters"),
    description: z.string().optional(),
    coverImage: z.string().optional(),
    isFeatured: z.boolean().default(false),
    isVisible: z.boolean().default(true),
});

// ============================================================
// LOADING QUOTE AND FACT SCHEMAS
// ============================================================

export const loadingQuoteSchema = z.object({
    quote: z.string().min(10, "Quote must be at least 10 characters"),
    author: z.string().min(2, "Author name is required"),
    isActive: z.boolean().default(true),
});

export const loadingFactSchema = z.object({
    emoji: z.string().min(1, "Emoji is required"),
    fact: z.string().min(5, "Fact must be at least 5 characters"),
    isActive: z.boolean().default(true),
});

// ============================================================
// USER SCHEMA
// ============================================================

export const changePasswordSchema = z
    .object({
        currentPassword: z.string().min(1, "Current password is required"),
        newPassword: z.string().min(8, "Password must be at least 8 characters"),
        confirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
    });

export const changeRoleSchema = z.object({
    role: z.enum(["MEMBER", "MANAGER", "ADMIN", "SUPER_ADMIN"]),
});

// Type exports
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type MemberInput = z.infer<typeof memberSchema>;
export type MemberProfileInput = z.infer<typeof memberProfileSchema>;
export type DonationInput = z.infer<typeof donationSchema>;
export type ManualDonationInput = z.infer<typeof manualDonationSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type EventInput = z.infer<typeof eventSchema>;
export type CertificateInput = z.infer<typeof certificateSchema>;
export type GenerateCertificateInput = z.infer<typeof generateCertificateSchema>;
export type TeamMemberInput = z.infer<typeof teamMemberSchema>;
export type BlogPostInput = z.infer<typeof blogPostSchema>;
export type AnnouncementInput = z.infer<typeof announcementSchema>;
export type DownloadDocumentInput = z.infer<typeof downloadDocumentSchema>;
export type AlbumInput = z.infer<typeof albumSchema>;
export type LoadingQuoteInput = z.infer<typeof loadingQuoteSchema>;
export type LoadingFactInput = z.infer<typeof loadingFactSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type ChangeRoleInput = z.infer<typeof changeRoleSchema>;
