import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const SITE_SETTINGS: Record<string, string> = {
    // GLOBAL
    site_name: "Nirashray Foundation",
    site_tagline: "Empowering Lives, Building Hope",
    site_logo: "/logo.png",
    site_favicon: "/favicon.ico",
    primary_color: "#1E40AF",
    secondary_color: "#F59E0B",
    contact_email: "info@nirashray.org",
    contact_phone: "+91 98XXXXXXXX",
    contact_phone_2: "",
    address_line1: "123, Main Street",
    address_line2: "City, State - 000000",
    google_maps_url: "",
    registration_number: "REG/2024/XXXXX",
    facebook_url: "",
    instagram_url: "",
    twitter_url: "",
    linkedin_url: "",
    youtube_url: "",
    whatsapp_number: "",

    // HOMEPAGE
    hero_heading: "Nirashray Foundation",
    hero_subheading: "Empowering Lives, Building Hope — Join us in making a difference for those who need it most.",
    hero_image: "/hero-bg.jpg",
    hero_cta1_text: "Donate Now",
    hero_cta1_link: "/donate",
    hero_cta2_text: "Join Us",
    hero_cta2_link: "/register",
    about_brief_heading: "Who We Are",
    about_brief_text: "Nirashray Foundation is dedicated to empowering underprivileged communities through education, healthcare, and sustainable development programs. We work tirelessly to bring hope and opportunity to those who need it most.",
    about_brief_image: "/about-brief.jpg",
    impact_stat1_number: "500+",
    impact_stat1_label: "Lives Impacted",
    impact_stat1_icon: "Heart",
    impact_stat2_number: "100+",
    impact_stat2_label: "Active Members",
    impact_stat2_icon: "Users",
    impact_stat3_number: "50+",
    impact_stat3_label: "Events Conducted",
    impact_stat3_icon: "Calendar",
    impact_stat4_number: "₹10L+",
    impact_stat4_label: "Donations Received",
    impact_stat4_icon: "IndianRupee",
    cause1_icon: "GraduationCap",
    cause1_title: "Education for All",
    cause1_description: "Providing quality education to underprivileged children through scholarships, study materials, and mentorship programs.",
    cause2_icon: "HeartPulse",
    cause2_title: "Healthcare Support",
    cause2_description: "Organizing free health camps, medical aid, and awareness programs for underserved communities.",
    cause3_icon: "Users",
    cause3_title: "Women Empowerment",
    cause3_description: "Skill development and self-reliance programs for women to help them become financially independent.",
    testimonial1_name: "Rahul Sharma",
    testimonial1_designation: "Volunteer",
    testimonial1_quote: "Working with Nirashray Foundation has been a life-changing experience. The dedication of the team and the impact they create is truly inspiring.",
    testimonial1_image: "",
    testimonial2_name: "Priya Singh",
    testimonial2_designation: "Donor",
    testimonial2_quote: "I trust Nirashray Foundation completely with my donations. Their transparency and accountability is commendable.",
    testimonial2_image: "",
    testimonial3_name: "Dr. Amit Kumar",
    testimonial3_designation: "Advisor",
    testimonial3_quote: "Their dedication to the cause is truly inspiring. Nirashray Foundation is making a real difference in people's lives.",
    testimonial3_image: "",
    donate_cta_heading: "Make a Difference Today",
    donate_cta_subtext: "Every contribution, no matter how small, brings hope to someone in need.",
    donate_cta_bg_color: "#F59E0B",
    team_section_heading: "Meet Our Team",
    team_section_subtext: "The passionate people behind our mission",
    blog_section_heading: "Latest Stories",
    blog_section_subtext: "Read about our impact and journey",
    gallery_section_heading: "Our Gallery",
    gallery_section_subtext: "Moments that define our journey",

    // ABOUT PAGE
    about_banner_image: "/about-banner.jpg",
    about_banner_title: "About Us",
    about_story_heading: "Our Story",
    about_story_text: "Nirashray Foundation was established with a simple belief — every person deserves a chance at a better life. Founded by a group of passionate individuals who witnessed firsthand the struggles of underprivileged communities, we set out to create a meaningful, sustainable impact.\n\nOver the years, we have grown from a small volunteer group into a registered organization with hundreds of members and countless success stories. Every child we educate, every family we support, every life we touch — these are the milestones that drive us forward.",
    about_mission_heading: "Our Mission",
    about_mission_text: "To empower underprivileged communities through education, healthcare, and sustainable development, fostering a society where every individual has access to basic necessities and opportunities to thrive.",
    about_vision_heading: "Our Vision",
    about_vision_text: "A world where every individual has access to basic necessities and opportunities to thrive, regardless of their background or circumstances.",
    about_value1_icon: "Heart",
    about_value1_title: "Compassion",
    about_value1_text: "We lead with empathy and care in everything we do.",
    about_value2_icon: "Shield",
    about_value2_title: "Integrity",
    about_value2_text: "Transparency and accountability in every action.",
    about_value3_icon: "Users",
    about_value3_title: "Community",
    about_value3_text: "Together we are stronger and more impactful.",
    about_value4_icon: "Target",
    about_value4_title: "Impact",
    about_value4_text: "Measurable, sustainable change in lives.",

    // DONATE PAGE
    donate_banner_image: "/donate-banner.jpg",
    donate_banner_title: "Support Our Cause",
    donate_why_heading: "Why Your Donation Matters",
    donate_why_text: "Your generous contribution helps us provide education, healthcare, and support to those who need it most. Every rupee donated is used transparently and effectively to create lasting change.",
    donate_amounts: "500,1000,2000,5000,10000",
    donate_purposes: "Education,Healthcare,Women Empowerment,General Fund,Emergency Relief",
    donate_trust_badge1: "80G Tax Benefits Available",
    donate_trust_badge2: "100% Transparent Utilization",
    donate_trust_badge3: "Secure Payment via Razorpay",

    // CONTACT PAGE
    contact_banner_image: "/contact-banner.jpg",
    contact_banner_title: "Get in Touch",
    contact_working_hours: "Monday - Saturday: 10:00 AM - 6:00 PM",

    // FOOTER
    footer_description: "Nirashray Foundation is a registered non-profit organization dedicated to empowering underprivileged communities.",
    footer_copyright: "© 2025 Nirashray Foundation. All rights reserved.",
    footer_quick_links: JSON.stringify([
        { label: "Home", url: "/" },
        { label: "About", url: "/about" },
        { label: "Donate", url: "/donate" },
        { label: "Contact", url: "/contact" },
        { label: "Events", url: "/events" },
        { label: "Gallery", url: "/gallery" },
        { label: "Blog", url: "/blog" },
    ]),

    // NAVBAR
    navbar_links: JSON.stringify([
        { label: "Home", url: "/" },
        { label: "About", url: "/about" },
        { label: "Events", url: "/events" },
        { label: "Gallery", url: "/gallery" },
        { label: "Blog", url: "/blog" },
        { label: "Donate", url: "/donate" },
        { label: "Contact", url: "/contact" },
    ]),
    navbar_cta_text: "Join Us",
    navbar_cta_link: "/register",
};

const LOADING_QUOTES = [
    { quote: "The best way to find yourself is to lose yourself in the service of others.", author: "Mahatma Gandhi" },
    { quote: "No one has ever become poor by giving.", author: "Anne Frank" },
    { quote: "We make a living by what we get. We make a life by what we give.", author: "Winston Churchill" },
    { quote: "The meaning of life is to find your gift. The purpose of life is to give it away.", author: "Pablo Picasso" },
    { quote: "Alone we can do so little; together we can do so much.", author: "Helen Keller" },
];

const LOADING_FACTS = [
    { emoji: "🎓", fact: "500+ Children Educated" },
    { emoji: "🏥", fact: "1000+ Patients Helped" },
    { emoji: "👩", fact: "200+ Women Empowered" },
    { emoji: "🌱", fact: "50+ Communities Reached" },
    { emoji: "💙", fact: "100+ Active Volunteers" },
];

async function main() {
    console.log("🌱 Starting database seed...");

    // Create Super Admin
    const hashedPassword = await bcrypt.hash("Admin@123", 10);
    const admin = await prisma.user.upsert({
        where: { email: "admin@nirashray.org" },
        update: {},
        create: {
            name: "Super Admin",
            email: "admin@nirashray.org",
            password: hashedPassword,
            role: "SUPER_ADMIN",
            phone: "9876543210",
            isActive: true,
        },
    });

    // Create Member profile for admin
    const adminMemberCount = await prisma.member.count();
    await prisma.member.upsert({
        where: { userId: admin.id },
        update: {},
        create: {
            memberId: `NF-2025-0001`,
            userId: admin.id,
            membershipType: "HONORARY",
            isApproved: true,
        },
    });

    console.log("✅ Admin user created:", admin.email);

    // Seed site settings
    console.log("📝 Seeding site settings...");
    for (const [key, value] of Object.entries(SITE_SETTINGS)) {
        await prisma.siteSettings.upsert({
            where: { key },
            update: { value },
            create: { key, value },
        });
    }
    console.log(`✅ Seeded ${Object.keys(SITE_SETTINGS).length} site settings`);

    // Seed loading quotes
    console.log("💬 Seeding loading quotes...");
    for (const q of LOADING_QUOTES) {
        await prisma.loadingQuote.create({ data: q });
    }

    // Seed loading facts
    console.log("📊 Seeding loading facts...");
    for (const f of LOADING_FACTS) {
        await prisma.loadingFact.create({ data: f });
    }

    // Seed a sample announcement
    await prisma.announcement.create({
        data: {
            message: "Welcome to Nirashray Foundation! Register as a member and make a difference.",
            linkText: "Register Now",
            linkUrl: "/register",
            type: "INFO",
            isActive: true,
        },
    });

    console.log("✅ Seeded announcement");
    console.log("\n🎉 Database seeded successfully!");
    console.log("\n📋 Login Credentials:");
    console.log("   Email: admin@nirashray.org");
    console.log("   Password: Admin@123");
    console.log("\n⚠️  Please change the admin password after first login!");
}

main()
    .catch((e) => {
        console.error("❌ Seed error:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
