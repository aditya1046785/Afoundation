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

export const metadata: Metadata = {
  metadataBase: new URL("https://nirashrayfoundation.in"),
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
    url: "https://nirashrayfoundation.in",
    siteName: "Nirashray Foundation",
    title: "Nirashray Foundation | Empowering Lives, Building Hope",
    description: "Join us in making a difference for those who need it most.",
  },
  icons: { icon: "/favicon.ico" },
  robots: { index: true, follow: true },
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
