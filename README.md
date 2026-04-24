# NGO Website - Developer Documentation

Welcome to the **Developer Documentation** for this NGO web platform. This document is intended to help developers understand, update, and extend the full product.

This platform has three major product areas:
1. **Public NGO Website** for storytelling, donations, events, blogs, gallery browsing, downloads, and contact submissions.
2. **Member Portal** for approved members to view their profile, donations, ID card, certificates, referrals, and live chat.
3. **Admin CMS / ERP Dashboard** for managing members, content, donations, receipts, announcements, crowdfunding campaigns, chat sessions, and organization settings.

---

## 🛠️ 1. Complete Technology Stack

This application is built using a modern, scalable, and high-performance stack:

*   **Framework:** Next.js 16.1.6 (App Router paradigm) paired with React 19.
*   **Styling:** Tailwind CSS v4, utilizing `shadcn/ui` for accessible component primitives and `framer-motion` for complex micro-animations.
*   **Database:** PostgreSQL (Cloud instance via Supabase).
*   **ORM:** Prisma ORM (v7.4.1) for type-safe database interactions.
*   **Authentication:** NextAuth.js v5 (beta) handling secure credentials, sessions, and Role-Based Access Control (RBAC).
*   **Cloudinary:** (`next-cloudinary`) For managing, storing, and serving gallery images, team photos, and blog covers.
*   **Email Deliverability:** Resend, integrated with `react-email` templates for beautiful outbound transactional emails.
*   **Payments & Transactions:** Razorpay SDK for capturing incoming foundation donations and processing live payments securely.
*   **Document Generation:** Mixed PDF generation using direct `jsPDF` drawing for receipts and member ID cards, plus HTML capture for certificate exports.
*   **Validation & Security:** `qrcode` generation for verifying printed IDs/certificates. Form parsing powered by `zod` and `react-hook-form`.
*   **Content Editor:** `Tiptap` Rich Text Editor integration, enabling fully styled, rich content authoring for Admins (blogs and CMS content).
*   **Notifications:** `sonner` toast notifications across the dashboard and member flows.

---

## 🗄️ 2. Architectural Overview

The application follows the Next.js `src/app` router structure. The architecture is broadly segmented into three distinct functional zones:

### A. Public Website (`src/app/(public)`)
The public face of the NGO for general visitors without authentication requirements.
*   `/` (Home): Landing page with calls to action and NGO statistics.
*   `/about`: Core foundation mission, vision, and operational details.
*   `/blog`: Articles and news updates, including individual post detail pages.
*   `/contact`: Public contact form, organization details, and embedded map.
*   `/donate`: The primary financial gateway mapping directly to the Razorpay integration.
*   `/downloads`: Repository of publicly accessible reports, forms, or brochures.
*   `/events` & `/gallery`: Visual representations of past and upcoming NGO activity, including gallery album detail pages.
*   `/team`: Showcases leadership, volunteers, and core members.
*   `/pending-approval`: Public holding page for newly registered members awaiting approval.

The home page is dynamically assembled from CMS content and currently includes hero, impact statistics, about summary, causes, crowdfunding highlights, donation CTA, team preview, gallery preview, blog preview, and testimonials.

### B. Authentication (`src/app/(auth)`)
*   `/login` & `/register`: Secure endpoints validated with `zod`. Handled seamlessly by NextAuth.

**Authentication flow:** the middleware redirects authenticated users away from login/register and routes them to the correct area based on role and approval status.

### C. Dashboard Portals (`src/app/(dashboard)`)
Protected views strictly governed by user Roles (`SUPER_ADMIN`, `ADMIN`, `MANAGER`, `MEMBER`).

**1. Member Portal (`/member`)**
*   **Purpose:** The toolkit provided to approved foundation members.
*   **Features:** View their core information (`/member/profile`), browse their donation history (`/member/donations`), access their soft-copy ID Card (`/member/id-card`), fetch earned certificates (`/member/certificates`), review referral earnings (`/member/referrals`), and join member live chat (`/member/live-chat`).
*   **Dashboard landing page:** `/member/dashboard` provides a summary of member profile, donations, certificates, and ID card status.

**2. Admin CMS / ERP (`/admin`)**
*   **Purpose:** The extensive control center for managers and admins to moderate all facets of the platform.
*   **Features:**
   *   **CRM:** Manage, verify, approve, and alter member profiles.
   *   **Finances:** Review and reconcile Razorpay donation transactions.
   *   **Documenting:** Generate and issue printable, QR-verified PDF IDs, certificates, and manual donation receipts.
   *   **Fundraising:** Manage crowdfunding campaigns and referral-attributed donations.
   *   **Communication:** Read and action public inquiries, manage site announcements, and run the live chat console.
   *   **Content Management:** Use the Tiptap editor for blogging. Manage the gallery, events, team roster, downloads, and all website content pages.
   *   **Site Settings:** Manage universal configurations and dynamically alter frontend variables without touching code.

The CMS is powered by a key-value site settings system, so the public website can be reworded or restyled without code changes.

---

## 📊 3. Database Schema Overview

The database is robustly modeled in `prisma/schema.prisma` to cover all NGO operations. Notable models include:

*   **`User` / `Account` / `Session`**: Auth primitives tied to NextAuth. Tracks the user `Role` and approval state.
*   **`Member`**: Extends users that possess an official membership. Stores personal details, approval status, membership type, and referral linkage.
*   **`Donation`**: Transaction persistence, mapping Razorpay parameters (`razorpayOrderId`, `razorpayPaymentId`), donor PAN for tax reporting, offline payment modes, receipt tracking, and referral attribution.
*   **`Certificate` & `IDCard`**: Issued document records. Stores generated PDF URLs and verified QR data preventing document fraud.
*   **`ContactMessage`**: Public inquiry records with read/replied tracking.
*   **`Event`, `GalleryAlbum`, `GalleryPhoto`, `TeamMember`, `BlogPost`, `DownloadDocument`**: The core CMS models populating the public site interfaces.
*   **`Announcement`**: Site-wide banners with type-based severity and scheduling.
*   **`CrowdfundingCampaign`**: Public fundraising campaigns with target and raised amount tracking.
*   **`ChatSession` & `ChatMessage`**: Member/admin live chat records.
*   **`LoadingQuote`, `LoadingFact`**: Contextual UI components and micro-content injected into the website.
*   **`SiteSettings`**: A key-value store managing dynamic variables on the site without requiring redeployments.

---

## 🔧 4. Environment Setup

To run this application, you must define the environment variables. Use the `.env.example` as a template and create a `.env` file at the project root.

### Required Keys:

```env
# Database (PostgreSQL via Supabase or Local)
DATABASE_URL="postgresql://user:password@host:port/dbname"
DIRECT_URL="postgresql://user:password@host:port/dbname" # Needed for migrations

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-generate-with-openssl-rand-base64-32"

# Razorpay Payment Gateway
RAZORPAY_KEY_ID="rzp_test_XXXXXXXXXXXXXX"
RAZORPAY_KEY_SECRET="XXXXXXXXXXXXXXXXXXXXXX"

# Resend Email Service
RESEND_API_KEY="re_XXXXXXXXXXXXXXXXXXXXXXXXXX"
EMAIL_FROM="NGO Foundation <noreply@example.org>"

# Cloudinary Image Upload
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="XXXXXXXXXXXXXX"
CLOUDINARY_API_SECRET="XXXXXXXXXXXXXXXXXXXXXX"

# Public App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## 🏃 5. Developer Guide: Getting Started

Follow these steps to spin up the project locally:

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Initialize Database**
   Ensure your `.env` is fully populated, specifically the `DATABASE_URL` and `DIRECT_URL`.
   ```bash
   # Push Prisma schema to your fresh database
   npm run db:push
   
   # Generate Prisma Client (Usually runs automatically on install)
   npx prisma generate
   ```

3. **Seed Database (Optional but Recommended)**
   Populates your system with initial roles, site settings, and sample configuration.
   ```bash
   npm run db:seed
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser and verify the authentication flow.

5. **Prisma Studio (Database GUI)**
   Use this to freely inspect and modify rows in the database directly.
   ```bash
   npm run db:studio
   ```

---

## 💡 6. Coding Practices & Modifications

If you are modifying this project in the future, adhere to these guidelines:

*   **Database Changes:** Whenever you update `prisma/schema.prisma`, you must run `npm run db:push` (for dev) or `npm run db:migrate` (for prod trackable migrations) followed by `npx prisma generate` to refresh TypeScript types.
*   **Adding API Routes:** Next.js 16 handles APIs gracefully in `/src/app/api/.../route.ts`. Always validate `.POST` incoming payloads heavily with `zod`.
*   **Images:** NEVER store raw images locally. ALWAYS route uploads through the `Cloudinary` integrations currently persisting in the app architecture.
*   **PDF Exports:** Use the existing PDF helpers in `lib/pdf-generator.ts` and `lib/receipt-pdf.ts`. Member ID cards and receipts use direct `jsPDF` drawing, while certificate exports use HTML capture.
*   **Styling:** Use Tailwind CSS natively. For complex components (Modals, Selects, Dropdowns), leverage the `radix-ui` wrapper via `shadcn/ui` provided in `src/components/ui`.
*   **Security:** Always wrap restricted dashboard views and sensitive API routes using NextAuth session checks (`auth()`). Double-verify that `session.user.role` matches the expected threshold (e.g., stopping a standard MEMBER from accessing an ADMIN `route.ts`).
*   **Rich Text:** For editing rich textual blocks, use our existing `Tiptap` rich text editor setup instead of standard HTML textareas. Do not allow raw HTML inputs without sanitization.

---

## 🔌 7. API Surface at a Glance

The application exposes route handlers under `src/app/api` for the main workflows. These are grouped by domain in the codebase, including auth, members, donations, receipts, content, engagement, and uploads.

For operational security, avoid documenting exact internal API paths in external-facing copies of this README.

---

## 📌 8. Notes for Future Maintenance

*   The public homepage is CMS-driven; if a section looks blank, check `SiteSettings` values first.
*   Member approval is part of the auth flow, not just an admin status flag.
*   Crowdfunding, referrals, receipts, and live chat are first-class features and should be documented alongside donations and members.
*   The README should be updated whenever a new admin route or API workflow is added.

This document should continuously be maintained inside the root folder alongside the codebase. Happy coding!
