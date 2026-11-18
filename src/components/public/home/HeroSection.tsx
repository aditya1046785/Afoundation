import Image from "next/image";
import Link from "next/link";
import { EB_Garamond, Manrope } from "next/font/google";
import {
  ArrowRight,
  BadgeCheck,
  GraduationCap,
  HandHeart,
  Heart,
  IdCard,
  Landmark,
  PawPrint,
  ShieldCheck,
  Soup,
} from "lucide-react";
import styles from "./HeroSection.module.css";

const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-hero-body",
});
const garamond = EB_Garamond({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-hero-heading",
});

function HeroAccreditations() {
  return (
    <div className="flex flex-wrap items-center justify-start gap-3 md:gap-4 mb-6">
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[12px] bg-[#ffffff] border border-[#c0c8c3]/60 text-[#1c1c19] shadow-sm text-[11px] leading-[14px] tracking-[0.06em] font-semibold">
        <BadgeCheck
          aria-hidden="true"
          className="shrink-0 size-[17px] text-[#ab3600]"
        />
        <span>Income Tax 80G Certified (50% Tax Relief)</span>
      </div>
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[12px] bg-[#ffffff] border border-[#c0c8c3]/60 text-[#1c1c19] shadow-sm text-[11px] leading-[14px] tracking-[0.06em] font-semibold">
        <Landmark
          aria-hidden="true"
          className="shrink-0 size-[17px] text-[#023727]"
        />
        <span>NITI Aayog Darpan:REG/2025/0559454</span>
      </div>
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[12px] bg-[#ffffff] border border-[#c0c8c3]/60 text-[#1c1c19] shadow-sm text-[11px] leading-[14px] tracking-[0.06em] font-semibold">
        <ShieldCheck
          aria-hidden="true"
          className="shrink-0 size-[17px] text-[#023727]"
        />
        <span>100% Audited Seva Ledger</span>
      </div>
    </div>
  );
}

function HeroTrustPillars() {
  return (
    <div className="grid grid-cols-1 min-[400px]:grid-cols-2 xl:grid-cols-4 gap-3 w-full">
      <div className="bg-[#ffffff] p-3.5 rounded-[8px] border border-[#c0c8c3]/60 shadow-sm flex items-center gap-3">
        <div className="w-11 h-11 rounded-[4px] bg-[#ffdbcf]/50 flex items-center justify-center shrink-0">
          <BadgeCheck
            aria-hidden="true"
            className="shrink-0 text-[#ab3600] size-[22px]"
          />
        </div>
        <div className="min-w-0">
          <div className="text-xs leading-4 tracking-[0.04em] text-[#023727] font-bold leading-snug">
            80G Tax Exemption
          </div>
          <div className="text-[12px] text-[#414944] font-medium">
            100% Tax Deductible
          </div>
        </div>
      </div>

      <div className="bg-[#ffffff] p-3.5 rounded-[8px] border border-[#c0c8c3]/60 shadow-sm flex items-center gap-3">
        <div className="w-11 h-11 rounded-[4px] bg-[#ffdbcf]/50 flex items-center justify-center shrink-0">
          <GraduationCap
            aria-hidden="true"
            className="shrink-0 text-[#ab3600] size-[22px]"
          />
        </div>
        <div className="min-w-0">
          <div className="text-xs leading-4 tracking-[0.04em] text-[#023727] font-bold leading-snug">
            Girls Vidyapeeth
          </div>
          <div className="text-[12px] text-[#414944] font-medium">
            Free Tech &amp; Coding
          </div>
        </div>
      </div>

      <div className="bg-[#ffffff] p-3.5 rounded-[8px] border border-[#c0c8c3]/60 shadow-sm flex items-center gap-3">
        <div className="w-11 h-11 rounded-[4px] bg-[#023727]/10 flex items-center justify-center shrink-0">
          <PawPrint
            aria-hidden="true"
            className="shrink-0 text-[#023727] size-[22px]"
          />
        </div>
        <div className="min-w-0">
          <div className="text-xs leading-4 tracking-[0.04em] text-[#023727] font-bold leading-snug">
            Surabhi Gaushala
          </div>
          <div className="text-[12px] text-[#414944] font-medium">
            Rescued &amp; Medical Care
          </div>
        </div>
      </div>

      <div className="bg-[#ffffff] p-3.5 rounded-[8px] border border-[#c0c8c3]/60 shadow-sm flex items-center gap-3">
        <div className="w-11 h-11 rounded-[4px] bg-[#ffdea6]/60 flex items-center justify-center shrink-0">
          <Soup
            aria-hidden="true"
            className="shrink-0 text-[#402c00] size-[22px]"
          />
        </div>
        <div className="min-w-0">
          <div className="text-xs leading-4 tracking-[0.04em] text-[#023727] font-bold leading-snug">
            Magh Mela Bhandara
          </div>
          <div className="text-[12px] text-[#414944] font-medium">
            24/7 Annakshetra Seva
          </div>
        </div>
      </div>
    </div>
  );
}

function HeroMissionCard() {
  return (
    <div className="lg:col-span-5 flex justify-center w-full">
      <div className="w-full max-w-md rounded-3xl p-2.5 bg-gradient-to-b from-[#e5a93c]/80 via-[#f7bd48]/40 to-[#ab3600]/60 shadow-[0_20px_50px_rgba(31,25,22,0.18)]">
        <div className="bg-[#ffffff] rounded-[22px] overflow-hidden shadow-inner flex flex-col border border-[#c0c8c3]/40">
          <div className="relative h-72 sm:h-80 overflow-hidden bg-[#023727]">
            <Image
              alt="Nirashray Foundation field operations across Prayagraj and Kashi"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCHGYZtTzlGXpQIhI5HlXA61OSk7DLL_aUwzHvfQzm2k9-iQj51xkmQKoT7g1SKnsS2IP1nF0BVjpA2mrhIOh1TftBqCLjIEgs1XkUmzF9L9xUF-GEl1HOI40-aJ_xxe8TQnYmsz0oWmhaBjD7FY78Bh4aRq7cB84LxWWZos8XqMuwNL2qG5BWQmH2-hRNIctLOUQFcW3n0kglOHwTBgVN06jMYFOu3xMqmnT0hoHV3"
              fill
              unoptimized
              sizes="(min-width: 1024px) 448px, 100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent"></div>

            <div className="absolute top-3.5 left-3.5 bg-[#ffffff] px-3.5 py-1.5 rounded-[12px] flex items-center gap-1.5 text-[#ab3600] shadow-md border border-[#c0c8c3]/40">
              <HandHeart
                aria-hidden="true"
                className="shrink-0 size-[16px] text-[#ab3600]"
              />
              <span className="text-[11px] leading-[14px] tracking-[0.06em] font-bold text-[#1c1c19]">
                त्रिवेणी व काशी सेवा धाम
              </span>
            </div>

            <div className="absolute bottom-3 right-3.5 bg-[#023727]/90 backdrop-blur-md px-3 py-1 rounded-[4px] text-[#bbedd6] text-[11px] leading-[14px] tracking-[0.06em] flex items-center gap-1.5 border border-[#1f4e3d]">
              <span className="w-2 h-2 rounded-[12px] bg-[#f7bd48] motion-safe:animate-pulse"></span>
              <span>सक्रिय क्षेत्र सेवाएँ • UP &amp; Bihar</span>
            </div>
          </div>

          <div className="p-6 space-y-3.5 text-left">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-[22px] leading-[30px] text-[#023727] font-bold">
                श्री काशी-प्रयाग समग्र सेवा प्रकल्प
              </h3>
              <span className="px-2.5 py-1 rounded bg-[#ffdea6] text-[#402c00] text-[11px] font-bold uppercase">
                निःस्वार्थ सेवा
              </span>
            </div>

            <p className="text-sm leading-5 text-[#414944] leading-relaxed">
              निराश्रय फ़ाउंडेशन द्वारा संचालित निःशुल्क बालिका तकनीकी
              विद्यापीठ, वृद्ध व अस्वस्थ गोवंश का आजीवन संरक्षण तथा संगम तट पर
              निरंतर त्रिवेणी महाप्रसाद अन्नक्षेत्र।
            </p>

            <div className="pt-3 border-t border-[#c0c8c3]/40 flex flex-wrap gap-3 items-center justify-between text-xs leading-4 tracking-[0.04em]">
              <div className="flex items-center gap-1.5 text-[#ab3600] font-bold">
                <BadgeCheck
                  aria-hidden="true"
                  className="shrink-0 size-[18px]"
                />
                <span>80G प्रमाणित न्यास</span>
              </div>
              <Link
                className="inline-flex items-center gap-1.5 text-[#023727] font-bold hover:text-[#ab3600] transition-colors"
                href="#events"
              >
                <span>Explore All Seva Projects</span>
                <ArrowRight
                  aria-hidden="true"
                  className="shrink-0 size-[16px]"
                />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function HeroSection() {
  return (
    <div className={`${styles.hero} ${manrope.variable} ${garamond.variable}`}>
      <section className="relative w-full pb-14 pt-28 lg:pb-20 overflow-hidden bg-gradient-to-b from-[#f6f3ee] via-[#fcf9f4] to-[#f6f3ee] border-b border-[#c0c8c3]/30">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 bg-[#fcf9f4]/90 z-10"></div>
          <Image
            alt="Sacred Prayagraj Ghats and Sangam background"
            className="w-full h-full object-cover opacity-15 filter blur-[1px] scale-105"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDlqL1IgNu2ldHcBUm_SGRqjj5Ejs0fpuDXnYDcq9NvRIKSx27CLRVPpFJ_avprE0hlkUCXoWEI0oONz8OdbIwBSLOtQL3B8HcyAnqars51xxfBErSHSGLQ3F1RuCyqopqey2PZYxArf5GrPh27l6OAJen1BIqFNKFEzOc8W27cCJK1HvRR7z09HmVIl3Ep91Z2Rx8CL6hQI39mAfW8Cm-ASfKLeD0ufwOK5rrIpqn5"
            fill
            unoptimized
            sizes="100vw"
          />
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#ffdea6]/30 rounded-[12px] filter blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-10 w-80 h-80 bg-[#ffdbcf]/30 rounded-[12px] filter blur-3xl pointer-events-none"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-20">
          <HeroAccreditations />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            <div className="lg:col-span-7 flex flex-col items-start text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-[12px] bg-[#023727]/10 border border-[#023727]/20 text-[#023727] text-xs leading-4 tracking-[0.04em] font-bold mb-4 shadow-sm">
                <HandHeart
                  aria-hidden="true"
                  className="shrink-0 size-[18px] text-[#ab3600]"
                />
                <span className="tracking-wide">
                  Nirashray Foundation • Trust Registered Non-Profit • 80G
                  Tax-Exempt
                </span>
              </div>

              <h1 className="text-[32px] sm:text-5xl text-[#023727] font-bold tracking-tight leading-tight mb-4">
                Empowering Lives Through Tech Education, Kanya Shiksha &amp;
                Holy Gauseva
              </h1>

              <div className="flex items-center gap-3 mb-4">
                <span className="h-0.5 w-10 bg-[#ab3600]"></span>
                <span className="text-[22px] leading-[30px] text-[#ab3600] font-semibold tracking-wide">
                  “कन्या शिक्षा • सुरभि गऊ सेवा • माघ मेला अन्नक्षेत्र • वैदिक
                  संस्कार”
                </span>
              </div>

              <p className="text-lg leading-7 text-[#1c1c19] mb-8 leading-relaxed max-w-2xl font-normal">
                Fostering digital literacy for underprivileged girls, providing
                lifelong shelter and medical care for rescued cattle, and
                running continuous Annakshetra Bhandara at Prayagraj Triveni
                Sangam.
              </p>

              <div className="flex flex-wrap items-center gap-4 mb-10 w-full">
                <Link
                  className="inline-flex max-w-full items-center gap-2.5 px-5 sm:px-8 py-4 bg-[#ab3600] hover:bg-[#ff6e38] text-[#ffffff] rounded-[8px] text-sm leading-5 tracking-[0.02em] font-bold shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:scale-[0.98]"
                  href="#quick-donation"
                >
                  <Heart aria-hidden="true" className="shrink-0 size-[22px]" />
                  <span>Donate Now (80G Tax Exemption)</span>
                  <ArrowRight
                    aria-hidden="true"
                    className="shrink-0 size-[18px]"
                  />
                </Link>

                <Link
                  className="inline-flex items-center gap-2.5 px-7 py-4 bg-[#023727] hover:bg-[#1f4e3d] text-[#ffffff] rounded-[8px] text-sm leading-5 tracking-[0.02em] font-bold shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:scale-[0.98]"
                  href="#onboarding-hub"
                >
                  <IdCard aria-hidden="true" className="shrink-0 size-[22px]" />
                  <span>Register / Volunteer Login</span>
                </Link>
              </div>

              <HeroTrustPillars />
            </div>
            <HeroMissionCard />
          </div>
        </div>
      </section>
    </div>
  );
}
