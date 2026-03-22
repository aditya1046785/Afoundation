# Nirashray Foundation NGO Website - Developer Documentation

Welcome to the **Developer Documentation** for the Nirashray Foundation NGO web platform! This document serves as a comprehensive guide for any developer who needs to understand, update, or modify this complex platform.

This platform is a dual-purpose application:
1. **Public NGO Website** showcasing the foundation, processing donations, displaying galleries, and taking contact submissions.
2. **Internal ERP/CMS Dashboard** for admins and foundation members to track operations, verify IDs, issue certificates, publish blogs, and reconcile transactions.

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
*   **Document Generation:** Heavy use of `jspdf` and `html2canvas` for real-time PDF generation (in-browser) of member ID cards and certificates.
*   **Validation & Security:** `qrcode` generation for verifying printed IDs/certificates. Form parsing powered by `zod` and `react-hook-form`.
*   **Content Editor:** `Tiptap` Rich Text Editor integration, enabling fully styled, rich content authoring for Admins (in blogs, etc.).

---

## 🗄️ 2. Architectural Overview

The application follows the Next.js `src/app` router structure. The architecture is broadly segmented into three distinct functional zones:

### A. Public Website (`src/app/(public)`)
The public face of the NGO for general visitors without authentication requirements.
*   `/` (Home): Landing page with calls to action and NGO statistics.
*   `/about`: Core foundation mission, vision, and operational details.
*   `/blog`: Articles and news updates.
*   `/contact`: Public contact forms and map integrations.
*   `/donate`: The primary financial gateway mapping directly to the Razorpay integration.
*   `/downloads`: Repository of publicly accessible reports, forms, or brochures.
*   `/events` & `/gallery`: Visual representations of past and upcoming NGO activity.
*   `/team`: Showcases leadership, volunteers, and core members.

### B. Authentication (`src/app/(auth)`)
*   `/login` & `/register`: Secure endpoints validated with `zod`. Handled seamlessly by NextAuth.

### C. Dashboard Portals (`src/app/(dashboard)`)
Protected views strictly governed by user Roles (`SUPER_ADMIN`, `ADMIN`, `MANAGER`, `MEMBER`).

**1. Member Portal (`/member`)**
*   **Purpose:** The toolkit provided to approved foundation members.
*   **Features:** View their core information (`/member/profile`), browse their own physical contribution history (`/member/donations`), access their soft-copy ID Card (`/member/id-card`), and fetch their earned certificates (`/member/certificates`).

**2. Admin CMS / ERP (`/admin`)**
*   **Purpose:** The extensive control center for managers and admins to moderate all facets of the platform.
*   **Features:**
    *   **CRM:** Manage, verify, approve, and alter member profiles (`/admin/members`).
    *   **Finances:** Review and reconcile Razorpay donation transactions (`/admin/donations`).
    *   **Documenting:** Generate and issue printable, QR-verified PDF IDs and volunteer certificates to members (`/admin/certificates` & `/admin/id-cards`).
    *   **Content Management:** Use the Tiptap editor for blogging (`/admin/blog`). Manage the gallery, events, team roster, downloads, and site-wide announcements.
    *   **Ticketing:** Read and action public inquiries from the contact form (`/admin/messages`).
    *   **Site Settings:** Manage universal configurations and dynamically alter frontend variables without touching code (`/admin/website-content` & `/admin/settings`).

---

## 📊 3. Database Schema Overview

The database is robustly modeled in `prisma/schema.prisma` to cover all NGO operations. Notable models include:

*   **`User` / `Account` / `Session`**: Auth primitives tied to NextAuth. Tracks the user `Role`.
*   **`Member`**: Extending users that possess an official membership. Stores profound details (Aadhar, membership type `LIFETIME`/`GENERAL`, approval status, etc.).
*   **`Donation`**: Transaction persistence, mapping Razorpay parameters (`razorpayOrderId`, `razorpayPaymentId`), donor PAN for tax reporting, and payment status.
*   **`Certificate` & `IDCard`**: Issued document records. Stores generated PDF URLs and verified QR Data preventing document fraud.
*   **`Event`, `GalleryAlbum`, `GalleryPhoto`, `TeamMember`, `BlogPost`, `DownloadDocument`**: The core CMS models populating the public site interfaces.
*   **`Announcement`, `LoadingQuote`, `LoadingFact`**: Contextual UI components and micro-content injected into the website.
*   **`SiteSettings`**: A Key-Value store managing dynamic variables on the site without requiring redeployments.

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
EMAIL_FROM="Nirashray Foundation <noreply@nirashray.org>"

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
   Populates your system with a Super Admin, initial Site Settings, and dummy configuration.
   ```bash
   npm run db:seed
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser. Look for the `/login` route to test the seeded accounts.

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
*   **Styling:** Use Tailwind CSS natively. For complex components (Modals, Selects, Dropdowns), leverage the `radix-ui` wrapper via `shadcn/ui` provided in `src/components/ui`.
*   **Security:** Always wrap restricted dashboard views and sensitive API routes using NextAuth session checks (`auth()`). Double-verify that `session.user.role` matches the expected threshold (e.g., stopping a standard MEMBER from accessing an ADMIN `route.ts`).
*   **Rich Text:** For editing rich textual blocks, use our existing `Tiptap` rich text editor setup instead of standard HTML textareas. Do not allow raw HTML inputs without sanitization.

This document should continuously be maintained inside the root folder alongside the codebase. Happy coding!
