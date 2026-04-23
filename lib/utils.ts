import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, parseISO } from "date-fns";

/**
 * Merge Tailwind CSS classes safely
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Format date to human-readable string
 */
export function formatDate(date: Date | string | null | undefined, formatStr = "dd MMM yyyy"): string {
    if (!date) return "N/A";
    const d = typeof date === "string" ? parseISO(date) : date;
    return format(d, formatStr);
}

/**
 * Format date with time
 */
export function formatDateTime(date: Date | string | null | undefined): string {
    if (!date) return "N/A";
    const d = typeof date === "string" ? parseISO(date) : date;
    return format(d, "dd MMM yyyy, hh:mm a");
}

/**
 * Format relative time (e.g., "2 days ago")
 */
export function formatRelativeTime(date: Date | string | null | undefined): string {
    if (!date) return "N/A";
    const d = typeof date === "string" ? parseISO(date) : date;
    return formatDistanceToNow(d, { addSuffix: true });
}

/**
 * Format currency in Indian format with ₹ symbol
 */
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

/**
 * Convert amount to words (Indian format)
 */
export function amountToWords(amount: number): string {
    const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
        "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen",
        "Eighteen", "Nineteen"];
    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

    function convertHundreds(num: number): string {
        let result = "";
        if (num >= 100) {
            result += ones[Math.floor(num / 100)] + " Hundred ";
            num %= 100;
        }
        if (num >= 20) {
            result += tens[Math.floor(num / 10)] + " ";
            num %= 10;
        }
        if (num > 0) {
            result += ones[num] + " ";
        }
        return result.trim();
    }

    if (amount === 0) return "Zero Rupees Only";

    let result = "";
    const crore = Math.floor(amount / 10000000);
    const lakh = Math.floor((amount % 10000000) / 100000);
    const thousand = Math.floor((amount % 100000) / 1000);
    const hundred = amount % 1000;

    if (crore > 0) result += convertHundreds(crore) + " Crore ";
    if (lakh > 0) result += convertHundreds(lakh) + " Lakh ";
    if (thousand > 0) result += convertHundreds(thousand) + " Thousand ";
    if (hundred > 0) result += convertHundreds(hundred);

    return result.trim() + " Rupees Only";
}

/**
 * Generate a slug from a title
 */
export function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
}

/**
 * Generate Member ID in format NF-YYYY-XXXX
 */
export function generateMemberId(count: number): string {
    const year = new Date().getFullYear();
    const seq = String(count + 1).padStart(4, "0");
    return `NF-${year}-${seq}`;
}

/**
 * Generate receipt number in format DON-YYYY-XXXXX
 */
export function generateReceiptNumber(count: number): string {
    const year = new Date().getFullYear();
    const seq = String(count + 1).padStart(5, "0");
    return `DON-${year}-${seq}`;
}

/**
 * Generate certificate number in format CERT-YYYY-XXXX
 */
export function generateCertificateNo(count: number): string {
    const year = new Date().getFullYear();
    const seq = String(count + 1).padStart(4, "0");
    return `CERT-${year}-${seq}`;
}

/**
 * Generate foundation certificate number in format NF/YYYY/###
 */
export function generateFoundationCertificateNo(count: number): string {
    const year = new Date().getFullYear();
    const seq = String(count + 1).padStart(3, "0");
    return `NF/${year}/${seq}`;
}

/**
 * Format date as "12th January, 2025"
 */
export function formatCertificateDate(date: Date | string): string {
    const d = typeof date === "string" ? new Date(date) : date;
    const day = d.getDate();
    const month = d.toLocaleString("en-IN", { month: "long" });
    const year = d.getFullYear();

    const mod100 = day % 100;
    const suffix = mod100 >= 11 && mod100 <= 13
        ? "th"
        : day % 10 === 1
            ? "st"
            : day % 10 === 2
                ? "nd"
                : day % 10 === 3
                    ? "rd"
                    : "th";

    return `${day}${suffix} ${month}, ${year}`;
}

/**
 * Generate ID card number in format ID-YYYY-XXXX
 */
export function generateCardNumber(count: number): string {
    const year = new Date().getFullYear();
    const seq = String(count + 1).padStart(4, "0");
    return `ID-${year}-${seq}`;
}

/**
 * Truncate text to a given length
 */
export function truncate(text: string, length: number): string {
    if (text.length <= length) return text;
    return text.substring(0, length) + "...";
}

/**
 * Estimate reading time for blog posts
 */
export function estimateReadTime(content: string): string {
    const wordsPerMinute = 200;
    const words = content.split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} min read`;
}

/**
 * Get initials from name
 */
export function getInitials(name: string): string {
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2);
}

/**
 * Parse JSON safely with fallback
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
    try {
        return JSON.parse(json) as T;
    } catch {
        return fallback;
    }
}

/**
 * Validate Indian phone number
 */
export function isValidIndianPhone(phone: string): boolean {
    return /^[6-9]\d{9}$/.test(phone.replace(/[\s-+]/g, "").replace(/^91/, ""));
}

/**
 * Format phone number for display
 */
export function formatPhone(phone: string): string {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 10) {
        return `+91 ${cleaned.substring(0, 5)} ${cleaned.substring(5)}`;
    }
    return phone;
}

// Aliases for backward compatibility
export const estimateReadingTime = estimateReadTime;
export const truncateText = truncate;

