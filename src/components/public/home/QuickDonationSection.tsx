"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { homeManrope, homeGaramond } from "./homeFonts";
import styles from "./HomeDesign.module.css";
import {
  BadgeCheck,
  PawPrint,
  GraduationCap,
  Soup,
  HandHeart,
  LockKeyhole,
  ArrowRight,
  QrCode,
  CreditCard,
  Globe,
} from "lucide-react";

const causeDescriptions: Record<string, Record<number, string>> = {
  "Gauseva Chara": {
    501: "Feeds 4 cows fresh nutritious green grass for 1 day.",
    1100: "Feeds 10 cows fresh green chara & jaggery for two full days, and covers basic veterinary antiseptic sprays.",
    2500: "Sponsors full day balanced diet & supplements for an entire recovery ward of 15 cows.",
    5100: "Provides specialized post-surgery physiotherapy & fodder for 3 injured cows for a month.",
  },
  "Kanya Tech Kit": {
    501: "Provides high-speed broadband and online course certification vouchers for 1 student.",
    1100: "Sponsors STEM laboratory access and digital stationery for 2 female students for 1 month.",
    2500: "Sponsors a complete refurbished tablet with coding environments pre-loaded for offline study.",
    5100: "Sponsors a dedicated refurbished laptop for a village daughter entering higher tech studies.",
  },
  "Magh Mela Bhandara": {
    501: "Feeds 35 hungry pilgrims and sadhus hot sanctified khichdi and pickle.",
    1100: "Feeds 80 pilgrims fresh nutritious poori, subji, and sweet kheer.",
    2500: "Sponsors breakfast and tea prasad for an entire morning gathering of 250 pilgrims.",
    5100: "Sponsors 500 complete meals including desi ghee preparations during auspicious snan days.",
  },
  "General Seva Corpus": {
    501: "Deployed where urgency is greatest across healthcare, education, or animal rescue.",
    1100: "Supports day-to-day electricity, solar maintenance, and clean drinking water filtration.",
    2500: "Funds emergency medical dispatch and hospital triage kits for destitute patients.",
    5100: "Bolsters the permanent endowment fund for rural infrastructure development.",
  },
};
export function QuickDonationSection() {
  const router = useRouter();
  const [cause, setCause] = useState("Gauseva Chara");
  const [amount, setAmount] = useState("1100");
  const numericAmount = Number(amount);
  const formattedAmount = (
    Number.isFinite(numericAmount) ? numericAmount : 0
  ).toLocaleString("en-IN");
  const impactDescription =
    causeDescriptions[cause]?.[numericAmount] ||
    `Your sacred contribution of ₹${formattedAmount} empowers ${cause} directly. Full 80G tax receipt will be issued.`;
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (
      !Number.isFinite(numericAmount) ||
      numericAmount < 100 ||
      !Number.isInteger(numericAmount)
    )
      return;
    const data = new FormData(event.currentTarget);
    const donor = Object.fromEntries(
      ["donorName", "donorPhone", "donorEmail", "donorPAN"].map((key) => [
        key,
        String(data.get(key) || "").trim(),
      ]),
    );
    // Keep donor details out of URLs and clear them when the checkout consumes them.
    try {
      sessionStorage.setItem("nirashray-quick-donation", JSON.stringify(donor));
    } catch {
      /* Checkout can collect details if browser storage is disabled. */
    }
    router.push(`/donate?${new URLSearchParams({ purpose: cause, amount })}`);
  }
  return (
    <section
      className={`${styles.section} ${homeManrope.variable} ${homeGaramond.variable} w-full py-20 bg-[#fcf9f4]`}
      id="quick-donation"
    >
      <div className="max-w-5xl mx-auto px-6">
        <div className="bg-[#ffffff] rounded-2xl shadow-xl p-5 sm:p-8 lg:p-12 relative overflow-hidden">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[2px] bg-[#ffdbcf]/50 text-[#ab3600] text-xs leading-4 tracking-[0.04em] font-bold mb-3">
              <BadgeCheck aria-hidden="true" className="shrink-0 size-[16px]" />
              <span>
                All Indian Donations Eligible for 50% 80G Tax Exemption
              </span>
            </div>
            <h2 className="font-[family-name:var(--font-home-heading)] text-[32px] leading-10 sm:text-5xl sm:leading-[56px] tracking-[-0.015em] font-semibold text-[#023727]">
              Seva Sankalp Yajna
            </h2>
            <p className="text-sm leading-5 text-[#414944] mt-2">
              Your sacred offering directly funds feed, medicine, tuition kits,
              and hot meals. Instant 80G tax receipt dispatched to your WhatsApp
              &amp; Email.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
            <button
              className={`px-4 py-2.5 rounded-[4px] text-xs font-bold transition-all flex items-center gap-2 ${cause === "Gauseva Chara" ? "bg-[#023727] text-white shadow-sm" : "bg-[#f0ede9] text-[#1c1c19] hover:bg-[#ebe8e3]"}`}
              onClick={() => setCause("Gauseva Chara")}
              aria-pressed={cause === "Gauseva Chara"}
              type="button"
            >
              <PawPrint aria-hidden="true" className="shrink-0 size-[18px]" />
              <span>Surabhi Gauseva</span>
            </button>
            <button
              className={`px-4 py-2.5 rounded-[4px] text-xs font-bold transition-all flex items-center gap-2 ${cause === "Kanya Tech Kit" ? "bg-[#023727] text-white shadow-sm" : "bg-[#f0ede9] text-[#1c1c19] hover:bg-[#ebe8e3]"}`}
              onClick={() => setCause("Kanya Tech Kit")}
              aria-pressed={cause === "Kanya Tech Kit"}
              type="button"
            >
              <GraduationCap
                aria-hidden="true"
                className="shrink-0 size-[18px]"
              />
              <span>Kanya Tech Shiksha</span>
            </button>
            <button
              className={`px-4 py-2.5 rounded-[4px] text-xs font-bold transition-all flex items-center gap-2 ${cause === "Magh Mela Bhandara" ? "bg-[#023727] text-white shadow-sm" : "bg-[#f0ede9] text-[#1c1c19] hover:bg-[#ebe8e3]"}`}
              onClick={() => setCause("Magh Mela Bhandara")}
              aria-pressed={cause === "Magh Mela Bhandara"}
              type="button"
            >
              <Soup aria-hidden="true" className="shrink-0 size-[18px]" />
              <span>Mela Annakshetra</span>
            </button>
            <button
              className={`px-4 py-2.5 rounded-[4px] text-xs font-bold transition-all flex items-center gap-2 ${cause === "General Seva Corpus" ? "bg-[#023727] text-white shadow-sm" : "bg-[#f0ede9] text-[#1c1c19] hover:bg-[#ebe8e3]"}`}
              onClick={() => setCause("General Seva Corpus")}
              aria-pressed={cause === "General Seva Corpus"}
              type="button"
            >
              <HandHeart aria-hidden="true" className="shrink-0 size-[18px]" />
              <span>General Seva Corpus</span>
            </button>
          </div>

          <div className="space-y-6">
            <p
              id="offering-amount-label"
              className="block text-xs leading-4 tracking-[0.04em] text-[#414944] font-bold text-center uppercase tracking-wide"
            >
              Select Offering Amount
            </p>
            <div
              role="group"
              aria-labelledby="offering-amount-label"
              className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto"
            >
              <button
                className="amount-btn p-3.5 rounded-[8px] bg-[#f6f3ee] hover:bg-[#f0ede9] text-center transition-all"
                onClick={() => setAmount("501")}
                aria-pressed={amount === "501"}
                type="button"
              >
                <span className="font-[family-name:var(--font-home-heading)] text-[22px] leading-[30px] text-[#023727] font-bold block">
                  ₹501
                </span>
                <span className="text-[11px] leading-[14px] tracking-[0.06em] font-bold text-[#717974]">
                  Auspicious Offering
                </span>
              </button>
              <button
                className="amount-btn p-3.5 rounded-[8px] bg-[#f6f3ee] text-center transition-all"
                onClick={() => setAmount("1100")}
                aria-pressed={amount === "1100"}
                type="button"
              >
                <span className="font-[family-name:var(--font-home-heading)] text-[22px] leading-[30px] text-[#ab3600] font-bold block">
                  ₹1,100
                </span>
                <span className="text-[11px] leading-[14px] tracking-[0.06em] font-bold text-[#390c00]">
                  Monthly Chara Feed
                </span>
              </button>
              <button
                className="amount-btn p-3.5 rounded-[8px] bg-[#f6f3ee] hover:bg-[#f0ede9] text-center transition-all"
                onClick={() => setAmount("2500")}
                aria-pressed={amount === "2500"}
                type="button"
              >
                <span className="font-[family-name:var(--font-home-heading)] text-[22px] leading-[30px] text-[#023727] font-bold block">
                  ₹2,500
                </span>
                <span className="text-[11px] leading-[14px] tracking-[0.06em] font-bold text-[#717974]">
                  Bhandara Day Seva
                </span>
              </button>
              <button
                className="amount-btn p-3.5 rounded-[8px] bg-[#f6f3ee] hover:bg-[#f0ede9] text-center transition-all"
                onClick={() => setAmount("5100")}
                aria-pressed={amount === "5100"}
                type="button"
              >
                <span className="font-[family-name:var(--font-home-heading)] text-[22px] leading-[30px] text-[#023727] font-bold block">
                  ₹5,100
                </span>
                <span className="text-[11px] leading-[14px] tracking-[0.06em] font-bold text-[#717974]">
                  Full Laptop Sponsor
                </span>
              </button>
            </div>

            <div className="max-w-2xl mx-auto p-4 rounded-[8px] bg-[#f6f3ee] flex items-center gap-3">
              <HandHeart
                aria-hidden="true"
                className="shrink-0 size-[24px] text-[#ab3600]"
              />
              <p
                className="text-sm leading-5 text-[#1c1c19]"
                id="impact-text"
                aria-live="polite"
              >
                <strong className="font-semibold text-[#023727]">
                  Your ₹{formattedAmount} gift:
                </strong>{" "}
                {impactDescription}
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="max-w-2xl mx-auto space-y-4 pt-2"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    className="block text-[11px] leading-[14px] tracking-[0.06em] text-[#414944] mb-1 font-semibold"
                    htmlFor="quick-donorName"
                  >
                    Full Name (As per PAN card for 80G)
                  </label>
                  <input
                    className="w-full px-4 py-2.5 bg-[#ffffff] rounded-[4px] text-sm leading-5 text-[#1c1c19] placeholder:text-[#717974] focus:outline-none focus:bg-[#f6f3ee] shadow-sm"
                    placeholder="e.g. Rameshwar Sharma"
                    required
                    type="text"
                    id="quick-donorName"
                    name="donorName"
                  />
                </div>
                <div>
                  <label
                    className="block text-[11px] leading-[14px] tracking-[0.06em] text-[#414944] mb-1 font-semibold"
                    htmlFor="quick-donorPhone"
                  >
                    WhatsApp Number (For Instant Receipt)
                  </label>
                  <input
                    className="w-full px-4 py-2.5 bg-[#ffffff] rounded-[4px] text-sm leading-5 text-[#1c1c19] placeholder:text-[#717974] focus:outline-none focus:bg-[#f6f3ee] shadow-sm"
                    placeholder="+91 98XXX XXXXX"
                    required
                    type="tel"
                    id="quick-donorPhone"
                    name="donorPhone"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    className="block text-[11px] leading-[14px] tracking-[0.06em] text-[#414944] mb-1 font-semibold"
                    htmlFor="quick-donorEmail"
                  >
                    Email Address
                  </label>
                  <input
                    className="w-full px-4 py-2.5 bg-[#ffffff] rounded-[4px] text-sm leading-5 text-[#1c1c19] placeholder:text-[#717974] focus:outline-none focus:bg-[#f6f3ee] shadow-sm"
                    placeholder="rameshwar@domain.com"
                    required
                    type="email"
                    id="quick-donorEmail"
                    name="donorEmail"
                  />
                </div>
                <div>
                  <label
                    className="block text-[11px] leading-[14px] tracking-[0.06em] text-[#414944] mb-1 font-semibold"
                    htmlFor="quick-donorPAN"
                  >
                    PAN Number (Optional, for 80G filing)
                  </label>
                  <input
                    className="w-full px-4 py-2.5 bg-[#ffffff] rounded-[4px] text-sm leading-5 text-[#1c1c19] placeholder:text-[#717974] focus:outline-none focus:bg-[#f6f3ee] uppercase shadow-sm"
                    placeholder="ABCDE1234F"
                    type="text"
                    id="quick-donorPAN"
                    name="donorPAN"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <label
                  htmlFor="custom-amount-input"
                  className="text-xs leading-4 tracking-[0.04em] font-semibold text-[#414944]"
                >
                  Custom Amount (₹):
                </label>
                <input
                  className="w-36 px-3 py-2 bg-[#ffffff] rounded-[4px] font-[family-name:var(--font-home-heading)] text-[22px] leading-[30px] text-[#023727] font-bold focus:outline-none shadow-sm"
                  id="custom-amount-input"
                  min="100"
                  onChange={(event) => setAmount(event.target.value)}
                  type="number"
                  value={amount}
                  required
                  step="1"
                />
                <span className="text-[11px] leading-[14px] tracking-[0.06em] font-bold text-[#717974]">
                  Minimum ₹100
                </span>
              </div>

              <div className="pt-4">
                <button
                  className="w-full py-4 bg-[#ab3600] text-[#ffffff] rounded-[8px] text-sm leading-5 tracking-[0.02em] font-semibold shadow-lg hover:bg-[#983000] transition-all flex items-center justify-center gap-3 transform active:scale-[0.98]"
                  type="submit"
                >
                  <LockKeyhole
                    aria-hidden="true"
                    className="shrink-0 size-[22px]"
                  />
                  <span id="donate-btn-text">
                    Proceed to Sacred Offering (₹{formattedAmount})
                  </span>
                  <ArrowRight
                    aria-hidden="true"
                    className="shrink-0 size-[20px]"
                  />
                </button>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4 text-[#717974] text-[11px] leading-[14px] tracking-[0.06em] font-bold pt-2">
                <span className="flex items-center gap-1">
                  <QrCode
                    aria-hidden="true"
                    className="shrink-0 size-[16px] text-[#023727]"
                  />
                  Instant UPI (GPay, PhonePe, Paytm QR)
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <CreditCard
                    aria-hidden="true"
                    className="shrink-0 size-[16px] text-[#023727]"
                  />
                  All Debit/Credit Cards &amp; NetBanking
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Globe
                    aria-hidden="true"
                    className="shrink-0 size-[16px] text-[#023727]"
                  />
                  FCRA For Overseas Devotees
                </span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
