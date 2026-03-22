// Application-wide constants for Nirashray Foundation

export const APP_NAME = "Nirashray Foundation";
export const APP_TAGLINE = "Empowering Lives, Building Hope";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// Brand Colors
export const COLORS = {
    primary: "#1E40AF",
    secondary: "#F59E0B",
    accent: "#10B981",
    error: "#EF4444",
    background: "#F8FAFC",
    darkBackground: "#0F172A",
} as const;

// Membership types display labels
export const MEMBERSHIP_LABELS = {
    GENERAL: "General",
    LIFETIME: "Lifetime",
    HONORARY: "Honorary",
    STUDENT: "Student",
} as const;

// Certificate types display labels
export const CERTIFICATE_LABELS = {
    MEMBERSHIP: "Membership Certificate",
    APPRECIATION: "Appreciation Certificate",
    VOLUNTEER: "Volunteer Certificate",
    DONATION: "Donation Certificate",
    ACHIEVEMENT: "Achievement Certificate",
} as const;

// Payment status display labels
export const PAYMENT_STATUS_LABELS = {
    PENDING: "Pending",
    COMPLETED: "Completed",
    FAILED: "Failed",
    REFUNDED: "Refunded",
} as const;

// Blog status display labels
export const BLOG_STATUS_LABELS = {
    DRAFT: "Draft",
    PUBLISHED: "Published",
    ARCHIVED: "Archived",
} as const;

// Announcement type colors
export const ANNOUNCEMENT_COLORS = {
    INFO: "bg-blue-500",
    URGENT: "bg-red-500",
    SUCCESS: "bg-green-500",
    WARNING: "bg-amber-500",
} as const;

// Role display labels
export const ROLE_LABELS = {
    SUPER_ADMIN: "Super Admin",
    ADMIN: "Admin",
    MANAGER: "Manager",
    MEMBER: "Member",
} as const;

// Default team categories
export const TEAM_CATEGORIES = [
    "Core Team",
    "Board Members",
    "Volunteers",
    "Advisors",
    "Staff",
] as const;

// Document categories
export const DOCUMENT_CATEGORIES = [
    "Legal Documents",
    "Annual Reports",
    "Financial Reports",
    "Forms",
    "Brochures",
    "Certificates",
] as const;

// Pagination
export const PAGE_SIZE = 10;

// File upload limits
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// QR Code settings
export const QR_ERROR_CORRECTION = "H";

// ID Card dimensions (in mm)
export const ID_CARD_WIDTH = 85.6;
export const ID_CARD_HEIGHT = 53.98;
