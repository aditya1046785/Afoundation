import { EB_Garamond, Manrope } from "next/font/google";

export const homeManrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-home-body",
});
export const homeGaramond = EB_Garamond({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-home-heading",
});
