import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { ToastProvider } from "@/components/providers/ToastProvider";
import { homeManrope, homeGaramond } from "@/components/public/home/homeFonts";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});




const siteUrl = "https://www.nirashrayfoundation.in";

const siteName = "Nirashray Foundation";

const siteTitle =
  "Nirashray Foundation | Education, Gau Seva & Annakshetra";

const siteDescription =
  "Support Nirashray Foundation's mission of empowering girls through education, protecting rescued cattle, and serving free meals at Prayagraj Sangam. Join our seva.";

const ogTitle =
  "Nirashray Foundation | Empowering Lives, Building Hope";

const ogDescription =
  "Together, we can create lasting change. Support Kanya Shiksha, Gau Seva, Magh Mela Annakshetra and community welfare initiatives.";

const ogImage = "/favicon.ico";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  // General SEO
  title: {
    default: siteTitle,
    template: "%s | Nirashray Foundation",
  },

  description: siteDescription,

  applicationName: siteName,
  creator: siteName,
  publisher: siteName,

  category: "Non-Profit Organization",

  keywords: [
    "Nirashray Foundation",
    "NGO in Prayagraj",
    "NGO in Uttar Pradesh",
    "Kanya Shiksha",
    "Gau Seva",
    "Magh Mela Annakshetra",
    "Girls Education NGO",
    "Digital Education",
    "Charity in India",
    "Volunteer NGO",
    "Community Welfare",
    "Non-Profit Organization",
    "Donate to NGO",
  ],

  // WhatsApp, Facebook, LinkedIn previews
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName,
    title: ogTitle,
    description: ogDescription,

    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: "Nirashray Foundation - Education, Gau Seva and Community Welfare",
        type: "image/jpeg",
      },
    ],
  },

  // Twitter / X preview
  twitter: {
    card: "summary_large_image",
    title: ogTitle,
    description: ogDescription,
    images: [ogImage],
  },

  // Search Engine Crawling
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // Browser Favicon
  icons: {
    icon: "/favicon.ico",
  },
};


export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} ${homeManrope.variable} ${homeGaramond.variable}`}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <AuthProvider>
          {children}
          <ToastProvider />
        </AuthProvider>
      </body>
    </html>
  );
}
