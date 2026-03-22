import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { ToastProvider } from "@/components/providers/ToastProvider";
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

export const metadata: Metadata = {
  title: {
    default: "Nirashray Foundation | Empowering Lives, Building Hope",
    template: "%s | Nirashray Foundation",
  },
  description:
    "Nirashray Foundation is a registered non-profit organization dedicated to empowering underprivileged communities through education, healthcare, and sustainable development programs.",
  keywords: ["NGO", "non-profit", "charity", "donation", "education", "healthcare", "India"],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    siteName: "Nirashray Foundation",
    title: "Nirashray Foundation | Empowering Lives, Building Hope",
    description: "Join us in making a difference for those who need it most.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
  },
  icons: { icon: "/favicon.ico" },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="min-h-screen bg-slate-50 font-sans antialiased">
        <AuthProvider>
          {children}
          <ToastProvider />
        </AuthProvider>
      </body>
    </html>
  );
}
