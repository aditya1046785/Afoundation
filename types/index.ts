// Enum types — mirrored from prisma/schema.prisma so this file works before prisma generate
export type Role = "SUPER_ADMIN" | "ADMIN" | "MANAGER" | "MEMBER";
export type MembershipType = "GENERAL" | "LIFETIME" | "HONORARY" | "STUDENT";
export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
export type DonationSource = "ONLINE" | "OFFLINE" | "MANUAL";
export type DonationPaymentMode = "UPI" | "BANK_TRANSFER" | "CASH" | "CHEQUE" | "CARD" | "OTHER";
export type CertificateType = "MEMBERSHIP" | "APPRECIATION" | "VOLUNTEER" | "DONATION" | "ACHIEVEMENT";
export type AnnouncementType = "INFO" | "URGENT" | "SUCCESS" | "WARNING";
export type BlogStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

// ============================================================
// USER TYPES
// ============================================================

export interface UserData {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    role: Role;
    image?: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

// ============================================================
// MEMBER TYPES
// ============================================================

export interface MemberData {
    id: string;
    memberId: string;
    userId: string;
    fatherName?: string | null;
    dateOfBirth?: Date | null;
    gender?: string | null;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    pincode?: string | null;
    aadharNumber?: string | null;
    occupation?: string | null;
    photo?: string | null;
    membershipType: MembershipType;
    joinDate: Date;
    expiryDate?: Date | null;
    isApproved: boolean;
    createdAt: Date;
    updatedAt: Date;
    user?: UserData;
}

export interface MemberWithUser extends MemberData {
    user: UserData;
}

// ============================================================
// DONATION TYPES
// ============================================================

export interface DonationData {
    id: string;
    amount: number;
    currency: string;
    source: DonationSource;
    paymentMode?: DonationPaymentMode | null;
    paymentReference?: string | null;
    receivedBy?: string | null;
    recordedByUserId?: string | null;
    donorName: string;
    donorEmail: string;
    donorPhone?: string | null;
    donorPAN?: string | null;
    memberId?: string | null;
    referrerMemberId?: string | null;
    referralCodeUsed?: string | null;
    razorpayOrderId?: string | null;
    razorpayPaymentId?: string | null;
    razorpaySignature?: string | null;
    receiptNumber: string;
    receiptIssuedAt?: Date | null;
    purpose?: string | null;
    message?: string | null;
    notes?: string | null;
    status: PaymentStatus;
    paidAt?: Date | null;
    createdAt: Date;
    updatedAt: Date;
    member?: MemberData | null;
}

// ============================================================
// CERTIFICATE TYPES
// ============================================================

export interface CertificateData {
    id: string;
    certificateNo: string;
    memberId: string;
    type: CertificateType;
    title: string;
    description?: string | null;
    issueDate: Date;
    qrCodeData: string;
    pdfUrl?: string | null;
    issuedBy: string;
    createdAt: Date;
    member?: MemberWithUser;
}

// ============================================================
// ID CARD TYPES
// ============================================================

export interface IDCardData {
    id: string;
    memberId: string;
    cardNumber: string;
    issueDate: Date;
    expiryDate: Date;
    qrCodeData: string;
    pdfUrl?: string | null;
    isActive: boolean;
    createdAt: Date;
    member?: MemberWithUser;
}

// ============================================================
// EVENT TYPES
// ============================================================

export interface EventData {
    id: string;
    title: string;
    slug: string;
    description: string;
    date: Date;
    time: string;
    venue: string;
    image?: string | null;
    isPublished: boolean;
    createdAt: Date;
    updatedAt: Date;
}

// ============================================================
// CONTACT MESSAGE TYPES
// ============================================================

export interface ContactMessageData {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    subject: string;
    message: string;
    isRead: boolean;
    repliedAt?: Date | null;
    createdAt: Date;
}

// ============================================================
// TEAM MEMBER TYPES
// ============================================================

export interface TeamMemberData {
    id: string;
    name: string;
    role: string;
    bio?: string | null;
    photo: string;
    category: string;
    instagramUrl?: string | null;
    facebookUrl?: string | null;
    twitterUrl?: string | null;
    linkedinUrl?: string | null;
    youtubeUrl?: string | null;
    displayOrder: number;
    isVisible: boolean;
    createdAt: Date;
    updatedAt: Date;
}

// ============================================================
// ANNOUNCEMENT TYPES
// ============================================================

export interface AnnouncementData {
    id: string;
    message: string;
    linkText?: string | null;
    linkUrl?: string | null;
    type: AnnouncementType;
    isActive: boolean;
    startDate: Date;
    endDate?: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

// ============================================================
// GALLERY TYPES
// ============================================================

export interface GalleryAlbumData {
    id: string;
    title: string;
    slug: string;
    description?: string | null;
    coverImage?: string | null;
    isFeatured: boolean;
    isVisible: boolean;
    displayOrder: number;
    createdAt: Date;
    updatedAt: Date;
    photos?: GalleryPhotoData[];
    _count?: { photos: number };
}

export interface GalleryPhotoData {
    id: string;
    albumId: string;
    imageUrl: string;
    caption?: string | null;
    displayOrder: number;
    createdAt: Date;
}

// ============================================================
// BLOG TYPES
// ============================================================

export interface BlogPostData {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    featuredImage?: string | null;
    category?: string | null;
    tags?: string | null;
    authorId: string;
    status: BlogStatus;
    publishedAt?: Date | null;
    views: number;
    createdAt: Date;
    updatedAt: Date;
    author?: UserData;
}

// ============================================================
// DOWNLOAD DOCUMENT TYPES
// ============================================================

export interface DownloadDocumentData {
    id: string;
    title: string;
    description?: string | null;
    fileUrl: string;
    fileSize?: string | null;
    category: string;
    downloadCount: number;
    isVisible: boolean;
    displayOrder: number;
    createdAt: Date;
    updatedAt: Date;
}

// ============================================================
// SITE SETTINGS TYPES
// ============================================================

export interface SiteSettingsData {
    id: string;
    key: string;
    value: string;
    updatedAt: Date;
}

// ============================================================
// LOADING TYPES
// ============================================================

export interface LoadingQuoteData {
    id: string;
    quote: string;
    author: string;
    isActive: boolean;
    createdAt: Date;
}

export interface LoadingFactData {
    id: string;
    emoji: string;
    fact: string;
    isActive: boolean;
    createdAt: Date;
}

// ============================================================
// NAVBAR/FOOTER LINK TYPES
// ============================================================

export interface NavLink {
    label: string;
    url: string;
}

// ============================================================
// DASHBOARD STATS TYPES
// ============================================================

export interface DashboardStats {
    totalMembers: number;
    totalDonations: number;
    pendingApprovals: number;
    totalCertificates: number;
}

// ============================================================
// API RESPONSE TYPES
// ============================================================

export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}
