import Image from "next/image";
import Link from "next/link";
import { EB_Garamond, Manrope } from "next/font/google";
import {
  ArrowRight,
  CircleCheck,
  Landmark,
  Leaf,
  Monitor,
  PawPrint,
  Soup,
  Zap,
} from "lucide-react";
import styles from "./SacredPillarsSection.module.css";

const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-pillars-body",
});
const garamond = EB_Garamond({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-pillars-heading",
});

function DigitalPragyaPillar() {
  return (
    <div className="bg-[#ffffff] rounded-2xl shadow-sm p-5 sm:p-8 lg:p-12 relative overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#f0ede9] rounded-[2px] text-[11px] leading-[14px] tracking-[0.06em] font-bold text-[#023727] uppercase">
            <Monitor
              aria-hidden="true"
              className="shrink-0 size-[16px] text-[#ab3600]"
            />
            <span>Pillar One • Digital Pragya Vidyapeeth</span>
          </div>
          <h3 className="font-[family-name:var(--font-pillars-heading)] text-[26px] sm:text-4xl tracking-[-0.01em] font-medium text-[#023727] leading-tight">
            Kanya Shiksha: Bridging the Digital Divide with Self-Reliance &amp;
            Values
          </h3>
          <p className="text-base leading-6 text-[#414944] leading-relaxed">
            We empower daughters from marginalized rural families with
            accredited STEM training, modern Python coding, digital accounting,
            and conversational English — without losing touch with Indian
            ethical values (*Sanskriti*).
          </p>

          <div className="flex flex-wrap gap-2 pt-2">
            <span className="px-3 py-1 bg-[#ebe8e3] rounded-[2px] text-[#1c1c19] text-xs leading-4 tracking-[0.04em] font-semibold">
              Python &amp; AI Basics
            </span>
            <span className="px-3 py-1 bg-[#ebe8e3] rounded-[2px] text-[#1c1c19] text-xs leading-4 tracking-[0.04em] font-semibold">
              Web &amp; UI Essentials
            </span>
            <span className="px-3 py-1 bg-[#ebe8e3] rounded-[2px] text-[#1c1c19] text-xs leading-4 tracking-[0.04em] font-semibold">
              Tally &amp; Digital Finance
            </span>
            <span className="px-3 py-1 bg-[#ebe8e3] rounded-[2px] text-[#1c1c19] text-xs leading-4 tracking-[0.04em] font-semibold">
              Vedic Ethics &amp; Sanskar
            </span>
          </div>

          <div className="p-4 rounded-[8px] bg-[#f6f3ee] flex items-start gap-4">
            <Image
              className="w-14 h-14 rounded-[12px] object-cover shrink-0"
              alt="Close up portrait of a young Indian girl named Priya Kumari from a village near Varanasi, wearing a yellow dupatta, smiling with deep confidence holding her graduation certificate from the Nirashray Computer Academy."
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCwmG9lXN80_MPNZ0qd9VA95UH6bkQjXcgic_tw7P6P4Ag6z-4-cawnW7JB0FGS8fYzMdD1CEXSX44s_zj0wvlN3s7u2d1gWdQhstZGU5fOtT9OV8o61pvHDYfJ34wUtgfwiEn6wYACF5g6owsr0EczX42l0lpLv-cTWq8zESLPLI8sdiYxO1tKY3oeADXgcj39c_pObtD7eerVm4M1n7dS7POh7AgfL5wNdYUHFHbK"
              width={56}
              height={56}
              unoptimized
            />
            <div>
              <p className="text-sm leading-5 text-[#1c1c19] italic">
                “Before Nirashray opened the Vidyapeeth, I had never even
                touched a keyboard. Today, I build websites for local artisans
                and fund my younger brother’s school fees.”
              </p>
              <span className="text-[11px] leading-[14px] tracking-[0.06em] text-[#023727] font-semibold mt-1 block">
                — Priya Kumari (Batch of 2024, Sonbhadra Kendra)
              </span>
            </div>
          </div>

          <div className="pt-4 flex flex-wrap items-center gap-4">
            <div className="bg-[#f0ede9] px-4 py-2.5 rounded-[4px]">
              <span className="block text-[11px] leading-[14px] tracking-[0.06em] font-bold text-[#414944]">
                Sponsor A Digital Kit
              </span>
              <span className="font-[family-name:var(--font-pillars-heading)] text-[22px] leading-[30px] text-[#023727] font-bold">
                ₹1,500
                <span className="text-sm leading-5 text-[#717974] font-normal">
                  / month per student
                </span>
              </span>
            </div>
            <Link
              className="px-6 py-3 bg-[#ab3600] text-[#ffffff] rounded-[4px] text-sm leading-5 tracking-[0.02em] font-semibold shadow-sm hover:bg-[#983000] transition-all"
              href="/donate?purpose=Kanya%20Tech%20Kit&amount=1500"
            >
              Sponsor a Daughter&apos;s Kit
            </Link>
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="relative rounded-[8px] overflow-hidden shadow-sm">
            <Image
              className="w-full h-64 object-cover"
              alt="An organized classroom where female students in uniform are happily working on refurbished laptops under solar-powered bright lights, teacher demonstrating on a whiteboard in Hindi and English, clean joyful aesthetic."
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA4mFomMhL5hMmpJoFzFw4Tr9uEt-Wpl0WLx5ydG3tW2SaWCamVn_zkQ13SznjxHM6l_KN2ErNYImhBPc1BS0fMo-BbEJE69B0IBvI5AZSgKM4Z59UnpKY2KDD12LZ3QY28mA0HGdQgYQRkxcw32HD_0BIFzIHSWif9fhDjjVWxkEsICo9Gdi22P4J3XJ8WvcQdNDAmHr4C7w8-uz2wYGL1g_yxsfx6pTdkZtWQD4dp"
              width={800}
              height={600}
              unoptimized
            />
            <div className="absolute bottom-3 left-3 bg-[#ffffff]/95 backdrop-blur-md px-3.5 py-1.5 rounded-[2px] text-[11px] leading-[14px] tracking-[0.06em] font-bold text-[#023727] shadow-sm">
              42 Solar Powered Classrooms
            </div>
          </div>

          <div className="bg-[#f6f3ee] p-5 rounded-[8px] space-y-3">
            <div className="flex flex-wrap gap-2 items-center justify-between text-xs leading-4 tracking-[0.04em] font-semibold text-[#1c1c19]">
              <span>Laptop Target FY 2024-25</span>
              <span className="text-[#023727] font-bold">
                1,820 / 2,500 Distributed
              </span>
            </div>
            <div className="w-full bg-[#c0c8c3]/30 h-2.5 rounded-[12px] overflow-hidden">
              <div
                className="bg-[#023727] h-full rounded-[12px] transition-all duration-1000"
                style={{ width: "72.8%" }}
              ></div>
            </div>
            <p className="text-[11px] leading-[14px] tracking-[0.06em] font-bold text-[#414944]">
              680 refurbished and sponsored laptops required for upcoming winter
              batch.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SurabhiGausevaPillar() {
  return (
    <div className="bg-[#023727] rounded-2xl shadow-xl text-[#ffffff] p-5 sm:p-8 lg:p-12 relative overflow-hidden">
      <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-12 translate-y-12">
        <PawPrint aria-hidden="true" className="shrink-0 size-[280px]" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
        <div className="lg:col-span-5 order-2 lg:order-1 flex flex-col gap-4">
          <div className="relative rounded-[8px] overflow-hidden shadow-md">
            <Image
              className="w-full h-72 object-cover"
              alt="A dedicated mobile veterinary ambulance with the Nirashray Foundation logo parked in an open rural shelter, veterinarians bandaging a rescued white Indian indigenous calf tenderly, sunlight streaming through neem trees."
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA7W9aeg2iYmkwZQ_YQ7vcTF9FljWWWm8xtTB31aifKubMxBsr0B9aMEN4gWrt1kn7WBIbr-JadT8q1WND5aXzh5gV3vTIfMo0AuvJIPXYtrqFjuMogphkjuwvSkMFVngL9KcWTFSaqYUHgQbH8DQzQCd5ve-xt8OjBj-4oEgqBQ4WWcLI1cE8rPMj4s7WpQa1gzx7AUV7IwTKWkeOR6-pAaLTUdqs9hwM2nFm7XKf5"
              width={800}
              height={600}
              unoptimized
            />
            <div className="absolute top-3 left-3 bg-[#ab3600] px-3 py-1 rounded-[2px] text-[#ffffff] text-[11px] leading-[14px] tracking-[0.06em] font-bold flex items-center gap-1.5 shadow">
              <span className="w-2 h-2 rounded-[12px] bg-white motion-safe:animate-pulse"></span>
              <span>Active 24/7 Cattle Ambulance</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm leading-5">
            <div className="bg-[#1f4e3d] p-3.5 rounded-[4px]">
              <span className="text-[#a0d1bb] text-[11px] leading-[14px] tracking-[0.06em] font-bold block">
                Daily Green Fodder
              </span>
              <span className="font-[family-name:var(--font-pillars-heading)] text-[22px] leading-[30px] text-[#ffffff] font-bold">
                4,800 Kg
              </span>
              <span className="text-[12px] text-[#bbedd6] block mt-0.5">
                Procured from local farmers
              </span>
            </div>
            <div className="bg-[#1f4e3d] p-3.5 rounded-[4px]">
              <span className="text-[#a0d1bb] text-[11px] leading-[14px] tracking-[0.06em] font-bold block">
                Rescued in 2024
              </span>
              <span className="font-[family-name:var(--font-pillars-heading)] text-[22px] leading-[30px] text-[#ffffff] font-bold">
                342 Cows
              </span>
              <span className="text-[12px] text-[#bbedd6] block mt-0.5">
                Highway trauma rehab
              </span>
            </div>
          </div>
        </div>
        <div className="lg:col-span-7 order-1 lg:order-2 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#1f4e3d] rounded-[2px] text-[11px] leading-[14px] tracking-[0.06em] font-bold text-[#bbedd6] uppercase">
            <Leaf
              aria-hidden="true"
              className="shrink-0 size-[16px] text-[#ffdea6]"
            />
            <span>Pillar Two • Surabhi Sanctuary Care</span>
          </div>
          <h3 className="font-[family-name:var(--font-pillars-heading)] text-[26px] sm:text-4xl tracking-[-0.01em] font-medium text-[#ffffff] leading-tight">
            Surabhi Gauseva: Life-Long Asylum, Veterinary Treatment &amp;
            Organic Biogas
          </h3>
          <p className="text-base leading-6 text-[#bbedd6] leading-relaxed">
            We operate an uncompromising zero-slaughter natural sanctuary for
            aged, non-lactating, blind, and highway accident victim cattle.
            Equipped with on-site surgical suites, hydraulic cattle recovery
            lifts, and chemical-free panchagavya formulations.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="bg-[#1f4e3d]/80 p-4 rounded-[8px]">
              <div className="flex flex-wrap gap-2 items-center justify-between">
                <span className="font-[family-name:var(--font-pillars-heading)] text-[22px] leading-[30px] font-semibold text-[#ffffff]">
                  Gau Grasa Daily
                </span>
                <span className="font-[family-name:var(--font-pillars-heading)] text-[22px] leading-[30px] text-[#ffdea6] font-bold">
                  ₹11
                  <span className="text-[12px] text-[#a0d1bb] font-normal">
                    / day
                  </span>
                </span>
              </div>
              <p className="text-sm leading-5 text-[#bbedd6] mt-1">
                Pledge one meal daily for an injured calf.
              </p>
              <Link
                className="mt-3 text-[#ffdea6] text-[11px] leading-[14px] tracking-[0.06em] font-bold flex items-center gap-1 hover:underline"
                href="/donate?purpose=Gauseva%20Chara&amount=330"
              >
                <span>Take Monthly Sankalp (₹330)</span>
                <ArrowRight
                  aria-hidden="true"
                  className="shrink-0 size-[14px]"
                />
              </Link>
            </div>
            <div className="bg-[#1f4e3d]/80 p-4 rounded-[8px]">
              <div className="flex flex-wrap gap-2 items-center justify-between">
                <span className="font-[family-name:var(--font-pillars-heading)] text-[22px] leading-[30px] font-semibold text-[#ffffff]">
                  Monthly Chara Seva
                </span>
                <span className="font-[family-name:var(--font-pillars-heading)] text-[22px] leading-[30px] text-[#ffdbcf] font-bold">
                  ₹1,100
                  <span className="text-[12px] text-[#a0d1bb] font-normal">
                    / mo
                  </span>
                </span>
              </div>
              <p className="text-sm leading-5 text-[#bbedd6] mt-1">
                Provides fresh nutritious grass &amp; jaggery.
              </p>
              <Link
                className="mt-3 text-[#ffdbcf] text-[11px] leading-[14px] tracking-[0.06em] font-bold flex items-center gap-1 hover:underline"
                href="/donate?purpose=Gauseva%20Chara&amount=1100"
              >
                <span>Adopt a Rescued Cow</span>
                <ArrowRight
                  aria-hidden="true"
                  className="shrink-0 size-[14px]"
                />
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2 text-[#bbedd6] text-sm leading-5">
            <Zap
              aria-hidden="true"
              className="shrink-0 text-[#ffdea6] size-[20px]"
            />
            <span>
              Gaushala waste powers our 20kVA Biogas Generator, powering village
              streetlights cleanly.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function AnnakshetraPillar() {
  return (
    <div className="bg-[#ffffff] rounded-2xl shadow-sm p-5 sm:p-8 lg:p-12 relative overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#f0ede9] rounded-[2px] text-[11px] leading-[14px] tracking-[0.06em] font-bold text-[#ab3600] uppercase">
            <Landmark
              aria-hidden="true"
              className="shrink-0 size-[16px] text-[#ab3600]"
            />
            <span>Pillar Three • Teerth Kshetra &amp; Annakshetra</span>
          </div>
          <h3 className="font-[family-name:var(--font-pillars-heading)] text-[26px] sm:text-4xl tracking-[-0.01em] font-medium text-[#023727] leading-tight">
            Magh Mela 24/7 Maha-Bhandara &amp; Dharmik Vedic Revitalization
          </h3>
          <p className="text-base leading-6 text-[#414944] leading-relaxed">
            At the sacred Triveni Sangam during Magh Mela and Kumbh, no pilgrim,
            hermit, or destitute seeker returns hungry. We serve clean, sattvic
            Mahaprasad around the clock alongside Vedic havans, free medical
            dispensary stalls, and riverbank cleanliness drives.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 text-sm leading-5">
            <div className="flex items-start gap-2.5">
              <CircleCheck
                aria-hidden="true"
                className="shrink-0 text-[#ab3600] size-[20px] mt-0.5"
              />
              <span>
                <strong>24/7 Continuous Kitchen:</strong> Fresh khichdi, subji,
                roti, and kheer prepared with desi cow ghee.
              </span>
            </div>
            <div className="flex items-start gap-2.5">
              <CircleCheck
                aria-hidden="true"
                className="shrink-0 text-[#ab3600] size-[20px] mt-0.5"
              />
              <span>
                <strong>Sadhu &amp; Vridha Seva:</strong> Distribution of
                thermal blankets, walking sticks, and dry ration kits.
              </span>
            </div>
            <div className="flex items-start gap-2.5">
              <CircleCheck
                aria-hidden="true"
                className="shrink-0 text-[#ab3600] size-[20px] mt-0.5"
              />
              <span>
                <strong>Daily Triveni Ganga Aarti:</strong> Free evening lamp
                offerings and youth Vedic chant workshops.
              </span>
            </div>
            <div className="flex items-start gap-2.5">
              <CircleCheck
                aria-hidden="true"
                className="shrink-0 text-[#ab3600] size-[20px] mt-0.5"
              />
              <span>
                <strong>Eco-Teerth Seva:</strong> Riverbank biodegradable
                clean-up patrols maintaining river purity.
              </span>
            </div>
          </div>
          <div className="pt-4 flex flex-wrap items-center gap-4">
            <Link
              className="px-6 py-3.5 bg-[#ab3600] text-[#ffffff] rounded-[4px] text-sm leading-5 tracking-[0.02em] font-semibold shadow-sm hover:bg-[#983000] transition-all flex items-center gap-2"
              href="/donate?purpose=Magh%20Mela%20Bhandara&amount=2500"
            >
              <Soup aria-hidden="true" className="shrink-0 size-[18px]" />
              <span>Sponsor a Day&apos;s Bhandara (₹2,500)</span>
            </Link>
            <Link
              className="px-5 py-3.5 bg-[#f0ede9] text-[#1c1c19] rounded-[4px] text-sm leading-5 tracking-[0.02em] font-semibold hover:bg-[#ebe8e3] transition-all"
              href="/events"
            >
              Mela Volunteer Duty
            </Link>
          </div>
        </div>
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="rounded-[8px] overflow-hidden shadow-sm relative">
            <Image
              className="w-full h-80 object-cover"
              alt="Traditional Indian bhandara at Sangam, long rows of sadhus in saffron robes seated gracefully on clean woven floor mats eating consecrated vegetarian food from leaf platters, volunteers with folded hands serving with humility, dusk lamp glow."
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDlqL1IgNu2ldHcBUm_SGRqjj5Ejs0fpuDXnYDcq9NvRIKSx27CLRVPpFJ_avprE0hlkUCXoWEI0oONz8OdbIwBSLOtQL3B8HcyAnqars51xxfBErSHSGLQ3F1RuCyqopqey2PZYxArf5GrPh27l6OAJen1BIqFNKFEzOc8W27cCJK1HvRR7z09HmVIl3Ep91Z2Rx8CL6hQI39mAfW8Cm-ASfKLeD0ufwOK5rrIpqn5"
              width={800}
              height={600}
              unoptimized
            />
            <div className="absolute bottom-3 right-3 bg-[#ffffff]/90 backdrop-blur-md px-3 py-1.5 rounded-[2px] text-[11px] leading-[14px] tracking-[0.06em] font-bold text-[#ab3600]">
              Sangam Tent #44, Daraganj
            </div>
          </div>
          <div className="p-4 rounded-[8px] bg-[#f0ede9] text-center">
            <span className="font-[family-name:var(--font-pillars-heading)] text-[28px] leading-9 text-[#023727] font-bold">
              12,000+
            </span>
            <span className="text-sm leading-5 text-[#414944] block">
              Meals distributed every single Snan day
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SacredPillarsSection() {
  return (
    <section
      aria-labelledby="sacred-pillars-heading"
      className={`${styles.section} ${manrope.variable} ${garamond.variable} w-full py-20 bg-[#fcf9f4]`}
    >
      <div className="max-w-7xl mx-auto px-6 space-y-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <span className="text-[11px] leading-[14px] tracking-[0.06em] font-bold text-[#ab3600] uppercase tracking-wider">
              Foundation Charters
            </span>
            <h2
              id="sacred-pillars-heading"
              className="font-[family-name:var(--font-pillars-heading)] text-[32px] leading-10 sm:text-5xl sm:leading-[56px] tracking-[-0.015em] font-semibold text-[#023727] mt-2"
            >
              The Three Sacred Pillars of Nirashray
            </h2>
            <p className="text-base leading-6 text-[#414944] mt-3">
              Every rupee entrusted to us is earmarked to tangible, verifiable
              field initiatives that fuse modern socio-economic upliftment with
              timeworn spiritual heritage.
            </p>
          </div>
          <div className="flex items-center gap-2 text-[#023727] text-xs leading-4 tracking-[0.04em] font-semibold">
            <span className="w-3 h-3 rounded-[12px] bg-[#ab3600]"></span>
            <span>Live Field Telemetry UP &amp; Bihar</span>
          </div>
        </div>

        <DigitalPragyaPillar />
        <SurabhiGausevaPillar />
        <AnnakshetraPillar />
      </div>
    </section>
  );
}
