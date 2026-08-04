# Homepage Overview

This document describes the current homepage architecture, content flow, data sources, section order, and CMS-controlled settings for the Nirashray Foundation site. It is intended as a renovation reference so the homepage can be redesigned without losing existing behavior.

## 1) Homepage route and rendering model

- Route: `/`
- Page file: `src/app/(public)/page.tsx`
- Render mode: `force-dynamic`
- Metadata:
  - Title: `Home | Nirashray Foundation`
  - Description: `Nirashray Foundation — Empowering Lives, Building Hope. Join us in making a difference through education, healthcare, and community development.`

The homepage is a server component that fetches content from Prisma and global site settings before rendering the section components.

## 2) Page shell around the homepage

The public layout wraps the homepage with these persistent elements:

1. Announcement bar
2. Navbar
3. Main content area
4. Footer
5. Floating WhatsApp button

Files involved:
- `src/app/(public)/layout.tsx`
- `src/components/public/AnnouncementBar.tsx`
- `src/components/public/Navbar.tsx`
- `src/components/public/Footer.tsx`
- `src/components/public/WhatsAppFloatButton.tsx`

### Layout behavior

- The announcement bar is fetched from `/api/announcements` and can auto-rotate through multiple messages.
- The navbar is sticky/fixed and shifts down by the announcement bar height using the CSS variable `--announcement-height`.
- Footer shows organization, quick links, get-involved links, and contact details.

## 3) Homepage section order

The homepage currently renders sections in this order:

1. Hero section
2. About brief
3. Causes section
4. Crowdfunding section, if active campaigns exist
5. Donate CTA
6. Team preview, if visible team members exist
7. Gallery preview, if featured visible albums exist
8. Blog preview, if published posts exist
9. Testimonials section

Source: `src/app/(public)/page.tsx`

## 4) Data sources used on the homepage

The homepage fetches a single settings object and several content collections in parallel.

### Settings
- Loaded by: `getAllSiteSettings()`
- Source: `lib/site-settings.ts`
- Stored in the `siteSettings` table
- Used by almost every section for editable copy, links, images, and labels

### Prisma queries on homepage

- `teamMember.findMany`
  - Filter: `isVisible: true`
  - Ordered by: `displayOrder asc`
  - Limit: 8
- `blogPost.findMany`
  - Filter: `status: PUBLISHED`
  - Ordered by: `publishedAt desc`
  - Limit: 3
- `galleryAlbum.findMany` for featured albums
  - Filter: `isVisible: true`, `isFeatured: true`
  - Includes up to 4 photos per album
  - Ordered by: `displayOrder asc`
  - Limit: 3
- `galleryAlbum.findMany` for all visible gallery images
  - Filter: `isVisible: true`
  - Used to build a shuffled gallery image pool for the hero/about sections
- `crowdfundingCampaign.findMany`
  - Filter: `isActive: true`
  - Ordered by: `createdAt desc`
  - Limit: 4
- `member.count`
  - Filter: `isApproved: true`
- `donation.aggregate`
  - Filter: `status: COMPLETED`
  - Sums total donations
- `donation.groupBy`
  - Grouped by `donorEmail`
  - Filter: `status: COMPLETED`
  - Used to count unique supporters
- `donation.findMany`
  - Filter: `status: COMPLETED`
  - Ordered by `paidAt desc`, then `createdAt desc`
  - Limit: 8
  - Used for the live donation feed in the hero

## 5) Section-by-section breakdown

### 5.1 Hero section

File: `src/components/public/home/HeroSection.tsx`

**Purpose**
- First screen impression
- Primary fundraising and membership entry point
- Displays live impact numbers and a live donor feed

**Content and controls**
- Eyebrow text: `hero_badge_text`
- Main heading: `hero_heading`
- Subheading: `hero_subheading`
- Supporting suffix: `hero_description_suffix`
- Primary CTA text/link: `hero_cta1_text`, `hero_cta1_link`
- Secondary CTA text/link: `hero_cta2_text`, `hero_cta2_link`

**Current visual style**
- Warm cream background
- Large serif headline
- Soft glow blobs, paper-like noise, floating particles
- Split layout on desktop: text on the left, live impact card on the right

**Interactive/live behavior**
- Animated counters for live impact metrics
- Fetches `/api/public/recent-donations` every 9 seconds
- Merges new donations into a scrolling donor feed
- Respectful reduced-motion support via `useReducedMotion()`

**Stats shown in the hero**
- Donations raised
- Active supporters

**Data source logic**
- `liveImpact` from homepage server data
- Fallback values from settings:
  - `impact_stat1_number`
  - `impact_stat2_number`
  - `impact_stat3_number`

**Important note**
- `hero_image` exists in CMS settings and seed data, but the current Hero section does not actually render it.
- That means the background is currently style-driven, not image-driven.

---

### 5.2 About brief

File: `src/components/public/home/AboutBrief.tsx`

**Purpose**
- Short story/about section
- Introduces the organization
- Builds trust with a visual gallery and compliance highlights

**Content and controls**
- Eyebrow: `about_brief_eyebrow`
- Heading: `about_brief_heading`
- Body text: `about_brief_text`
- Main image: `about_brief_image`
- CTA text/link: `about_brief_cta_text`, `about_brief_cta_link`
- Highlights: `about_brief_highlights`

**Behavior**
- If `about_brief_text` is empty, the whole section returns `null` and does not render.
- Uses gallery images from the homepage query plus fallbacks from `about_brief_image` and `hero_image`.
- Automatically rotates the main image every 4.5 seconds.
- Thumbnail strip lets the user pick the active image.

**Highlights shown by default**
- Registered NGO under Societies Registration Act
- 80G Tax Exemption Certificate
- Fully transparent fund utilization
- Active across multiple communities

**Visual style**
- Editorial layout with image gallery on one side and copy on the other
- Soft amber accents and rounded photo framing

---

### 5.3 Causes section

File: `src/components/public/home/CausesSection.tsx`

**Purpose**
- Summarizes the organization’s 3 main impact pillars
- Links directly into donation flows

**Content and controls**
- Eyebrow: `causes_eyebrow`
- Heading: `causes_heading`
- Subtext: `causes_subtext`
- Button label: `causes_card_cta_text`
- Per-cause fields:
  - `cause1_title`, `cause1_description`, `cause1_icon`
  - `cause2_title`, `cause2_description`, `cause2_icon`
  - `cause3_title`, `cause3_description`, `cause3_icon`

**Behavior**
- If no cause titles are present, the section returns `null`.
- Cards link to `/donate?purpose=<cause title>`.
- Icons are mapped from Lucide icon names.

**Default cause topics in seed data**
- Education for All
- Healthcare Support
- Women Empowerment

**Visual style**
- Horizontal scroller on small screens
- Card-based layout with oversized background numbers
- Very light paper/noise effects and soft shadows

---

### 5.4 Crowdfunding section

File: `src/components/public/home/CrowdfundingSection.tsx`

**Purpose**
- Promotes active campaigns
- Shows progress toward funding goals

**Behavior**
- Renders only if active campaigns are found
- Shows up to 4 campaigns
- On mobile, cards become horizontally scrollable
- On larger screens, cards are in a grid

**Campaign card content**
- Image
- Category badge
- Title
- Description
- Raised amount
- Goal amount
- Progress bar percentage
- Donate button linking to the donate page with campaign query params

**CTA behavior**
- Main button: `/donate`
- Per-card button: `/donate?campaign=<id>&campaignTitle=<title>`

**Visual style**
- Warm, magazine-like cards
- Strong image emphasis
- Animated liquid progress bar feel

---

### 5.5 Donate CTA

File: `src/components/public/home/DonateCTA.tsx`

**Purpose**
- Final conversion block before the lower sections
- Encourages direct donation with preset amounts

**Content and controls**
- Eyebrow: `donate_cta_eyebrow`
- Heading: `donate_cta_heading`
- Subtext: `donate_cta_subtext`
- Button text: `donate_cta_button_text`
- Trust line: `donate_cta_trust_text`
- Preset amounts: `donate_amounts`

**Behavior**
- Preset amount buttons link to `/donate?amount=<value>`
- Custom button links to `/donate`
- Layout is always rendered, regardless of content availability

**Default trust message**
- Tax benefits under 80G of Income Tax Act
- Secure payment via Razorpay

**Visual style**
- Dark, high-contrast section
- Gold accent button and glowing background blobs
- Acts as a final strong call to action

---

### 5.6 Team preview

File: `src/components/public/home/TeamPreview.tsx`

**Purpose**
- Introduces a few visible team members
- Builds trust and humanizes the organization

**Content and controls**
- Heading: `team_section_heading`
- Subtext: `team_section_subtext`

**Behavior**
- Renders only if `members.length > 0`
- Shows social links if present on each member
- First 3 members are visible on smaller screens; more appear on medium screens and above
- CTA leads to `/team`

**Data source**
- Visible team members only
- Ordered by `displayOrder`

**Visual style**
- Portrait cards with soft editorial framing
- Hover overlay for social links
- Large serif names and muted role labels

---

### 5.7 Gallery preview

File: `src/components/public/home/GalleryPreview.tsx`

**Purpose**
- Displays featured albums
- Gives a visual story of activities and events

**Content and controls**
- Heading: `gallery_section_heading`
- Subtext: `gallery_section_subtext`

**Behavior**
- Renders only if albums exist
- Uses album cover image first, otherwise first photo in the album
- Links each card to `/gallery/<slug>`
- CTA leads to `/gallery`

**Data source**
- Featured, visible albums only
- Up to 3 albums on the homepage

**Visual style**
- Tall image cards with strong overlays and title labels
- Slight staggered composition for a hand-crafted editorial look

---

### 5.8 Blog preview

File: `src/components/public/home/BlogPreview.tsx`

**Purpose**
- Highlights recent published writing
- Drives traffic to the blog

**Content and controls**
- Heading: `blog_section_heading`
- Subtext: `blog_section_subtext`

**Behavior**
- Renders only if posts exist
- Shows up to 3 latest published posts
- Links each article to `/blog/<slug>`
- CTA leads to `/blog`

**Data source**
- Published blog posts only
- Ordered by newest first

**Visual style**
- Magazine / journal style
- Image card with metadata and excerpt
- Clean article hierarchy

---

### 5.9 Testimonials section

File: `src/components/public/home/TestimonialsSection.tsx`

**Purpose**
- Adds social proof
- Rotates through supporter feedback

**Content and controls**
- Eyebrow: `testimonials_eyebrow`
- Heading: `testimonials_heading`
- Testimonial items:
  - `testimonial1_name`, `testimonial1_designation`, `testimonial1_quote`, `testimonial1_image`
  - `testimonial2_*`
  - `testimonial3_*`

**Behavior**
- Renders only if at least one testimonial has a name and quote
- Uses previous/next buttons and dot navigation
- Shows a single testimonial at a time
- Uses initials fallback if no image is provided

**Visual style**
- Centered quote layout
- Large decorative quote mark in the background
- Five star display under the quote

---

## 6) Site settings used by the homepage

The homepage is heavily CMS-driven. Most editable text is stored in `siteSettings` and loaded into a `Record<string, string>`.

### Core homepage settings groups

#### Hero
- `hero_badge_text`
- `hero_heading`
- `hero_subheading`
- `hero_description_suffix`
- `hero_image`
- `hero_cta1_text`
- `hero_cta1_link`
- `hero_cta2_text`
- `hero_cta2_link`

#### About brief
- `about_brief_eyebrow`
- `about_brief_heading`
- `about_brief_text`
- `about_brief_image`
- `about_brief_highlights`
- `about_brief_cta_text`
- `about_brief_cta_link`

#### Impact stats
- `impact_stat1_number`, `impact_stat1_label`, `impact_stat1_icon`
- `impact_stat2_number`, `impact_stat2_label`, `impact_stat2_icon`
- `impact_stat3_number`, `impact_stat3_label`, `impact_stat3_icon`
- `impact_stat4_number`, `impact_stat4_label`, `impact_stat4_icon`

#### Causes
- `causes_eyebrow`
- `causes_heading`
- `causes_subtext`
- `causes_card_cta_text`
- `cause1_title`, `cause1_description`, `cause1_icon`
- `cause2_title`, `cause2_description`, `cause2_icon`
- `cause3_title`, `cause3_description`, `cause3_icon`

#### Donate CTA
- `donate_cta_eyebrow`
- `donate_cta_heading`
- `donate_cta_subtext`
- `donate_cta_button_text`
- `donate_cta_trust_text`
- `donate_amounts`

#### Testimonials
- `testimonials_eyebrow`
- `testimonials_heading`
- `testimonial1_name`, `testimonial1_designation`, `testimonial1_quote`, `testimonial1_image`
- `testimonial2_name`, `testimonial2_designation`, `testimonial2_quote`, `testimonial2_image`
- `testimonial3_name`, `testimonial3_designation`, `testimonial3_quote`, `testimonial3_image`

#### Section headings
- `team_section_heading`
- `team_section_subtext`
- `blog_section_heading`
- `blog_section_subtext`
- `gallery_section_heading`
- `gallery_section_subtext`

## 7) CMS editing surface

The homepage settings are editable in the dashboard via the homepage CMS editor:

- File: `src/components/dashboard/cms/CMSHomeEditor.tsx`

It already organizes the homepage into tabs for:
- Hero
- Stats
- About
- Causes
- Donate CTA
- Testimonials
- Section headings

This is the main place to update homepage copy without code changes.

## 8) Important renovation notes

1. The page is currently visually coherent but highly section-heavy, so layout changes should preserve the current order of donation-focused content.
2. The homepage uses a warm cream, amber, and slate editorial style across sections.
3. Several sections are conditional and disappear if content is missing:
   - About brief
   - Causes
   - Crowdfunding
   - Team preview
   - Gallery preview
   - Blog preview
   - Testimonials
4. The hero has live polling and animated counters, so redesigns should consider motion reduction and fallback states.
5. The hero currently does not use `hero_image`, even though the setting exists.
6. `ImpactStats.tsx` exists in the codebase and CMS has a stats tab, but the homepage route currently does not mount that component.
7. The homepage uses recent dynamic content, so visual spacing should tolerate changing list lengths and empty states.
8. Mobile behavior is different from desktop in several sections:
   - Horizontal scrolling causes/campaign cards on smaller screens
   - Team preview shows fewer cards on small screens
   - Donation feed and gallery thumbnails need compact layouts

## 9) Suggested mental model for renovation

Think of the homepage as four narrative layers:

1. **Immediate identity and conversion**
   - Hero
   - Primary donation and join CTAs

2. **Trust and story**
   - About brief
   - Testimonials
   - Team preview

3. **Proof of impact**
   - Causes
   - Crowdfunding
   - Live donation feed
   - Gallery
   - Blog

4. **Final conversion push**
   - Donate CTA

That structure should remain intact unless you intentionally want a different conversion flow.
