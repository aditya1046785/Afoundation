import { homeManrope, homeGaramond } from "./homeFonts";
import styles from "./HomeDesign.module.css";
import Link from "next/link";
import {
  BadgeCheck,
  FileText,
  Download,
  Shield,
  Newspaper,
  Gavel,
} from "lucide-react";

export function EventsComplianceSection() {
  return (
    <section
      className={`${styles.section} ${homeManrope.variable} ${homeGaramond.variable} w-full py-20 bg-[#fcf9f4]`}
      id="events"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7 space-y-8">
            <div>
              <span className="text-[11px] leading-[14px] tracking-[0.06em] font-bold text-[#ab3600] uppercase tracking-wider">
                Teerth Calendar
              </span>
              <h2 className="font-[family-name:var(--font-home-heading)] text-[26px] sm:text-4xl tracking-[-0.01em] font-medium text-[#023727] mt-1">
                Upcoming Seva Mahotsavs &amp; Camps
              </h2>
            </div>
            <div className="space-y-4">
              <div className="bg-[#ffffff] rounded-[8px] p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-5 hover:bg-[#f6f3ee] transition-colors">
                <div className="bg-[#023727] text-[#ffffff] rounded-[4px] p-3 text-center shrink-0 w-16">
                  <span className="font-[family-name:var(--font-home-heading)] text-[22px] leading-[30px] block font-bold leading-none">
                    14
                  </span>
                  <span className="text-[11px] leading-[14px] tracking-[0.06em] font-bold uppercase tracking-wide">
                    Jan 2026
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="px-2.5 py-0.5 rounded-[2px] bg-[#ffdbcf]/50 text-[#ab3600] text-[11px] leading-[14px] tracking-[0.06em] font-semibold">
                    Magh Mela Main Camp
                  </span>
                  <h4 className="font-[family-name:var(--font-home-heading)] text-[22px] leading-[30px] font-semibold text-[#023727] mt-1">
                    Makar Sankranti Mahabhandara Preparation Camp
                  </h4>
                  <p className="text-sm leading-5 text-[#414944] mt-0.5">
                    Triveni Sangam Parisar, Daraganj • 50 Volunteer Sevadaars
                    required for prasad dispatch.
                  </p>
                </div>
                <Link
                  className="shrink-0 px-4 py-2 bg-[#f0ede9] rounded-[2px] text-xs leading-4 tracking-[0.04em] font-semibold text-[#023727] hover:bg-[#023727] hover:text-[#ffffff] transition-all"
                  href="/register"
                >
                  Join Shift
                </Link>
              </div>

              <div className="bg-[#ffffff] rounded-[8px] p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-5 hover:bg-[#f6f3ee] transition-colors">
                <div className="bg-[#ab3600] text-[#ffffff] rounded-[4px] p-3 text-center shrink-0 w-16">
                  <span className="font-[family-name:var(--font-home-heading)] text-[22px] leading-[30px] block font-bold leading-none">
                    28
                  </span>
                  <span className="text-[11px] leading-[14px] tracking-[0.06em] font-bold uppercase tracking-wide">
                    Jan 2026
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="px-2.5 py-0.5 rounded-[2px] bg-[#f0ede9] text-[#1c1c19] text-[11px] leading-[14px] tracking-[0.06em] font-semibold">
                    Kanya Vidyapeeth
                  </span>
                  <h4 className="font-[family-name:var(--font-home-heading)] text-[22px] leading-[30px] font-semibold text-[#023727] mt-1">
                    Annual Tech Convocation &amp; 200 Laptop Distribution
                  </h4>
                  <p className="text-sm leading-5 text-[#414944] mt-0.5">
                    Kashi Vishwanath Parisar Auditorium • Chief Guest: Ministry
                    of IT &amp; Education.
                  </p>
                </div>
                <Link
                  className="shrink-0 px-4 py-2 bg-[#f0ede9] rounded-[2px] text-xs leading-4 tracking-[0.04em] font-semibold text-[#023727] hover:bg-[#023727] hover:text-[#ffffff] transition-all"
                  href="/events"
                >
                  Attend
                </Link>
              </div>

              <div className="bg-[#ffffff] rounded-[8px] p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-5 hover:bg-[#f6f3ee] transition-colors">
                <div className="bg-[#5c4100] text-[#e2ab36] rounded-[4px] p-3 text-center shrink-0 w-16">
                  <span className="font-[family-name:var(--font-home-heading)] text-[22px] leading-[30px] block font-bold leading-none">
                    12
                  </span>
                  <span className="text-[11px] leading-[14px] tracking-[0.06em] font-bold uppercase tracking-wide">
                    Feb 2026
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="px-2.5 py-0.5 rounded-[2px] bg-[#f0ede9] text-[#1c1c19] text-[11px] leading-[14px] tracking-[0.06em] font-semibold">
                    Surabhi Gaushala
                  </span>
                  <h4 className="font-[family-name:var(--font-home-heading)] text-[22px] leading-[30px] font-semibold text-[#023727] mt-1">
                    Gopashtami Maha Yajna &amp; Special Veterinary Camp
                  </h4>
                  <p className="text-sm leading-5 text-[#414944] mt-0.5">
                    Seva Dham Gaushala, Prayagraj • Traditional cow worship,
                    free cattle medicine drive.
                  </p>
                </div>
                <Link
                  className="shrink-0 px-4 py-2 bg-[#f0ede9] rounded-[2px] text-xs leading-4 tracking-[0.04em] font-semibold text-[#023727] hover:bg-[#023727] hover:text-[#ffffff] transition-all"
                  href="/donate?purpose=Gopashtami%20Maha%20Yajna"
                >
                  Sponsor Havan
                </Link>
              </div>
            </div>

            <div className="p-6 rounded-[8px] bg-gradient-to-r from-[#023727] to-[#1f4e3d] text-[#ffffff] flex flex-wrap gap-2 items-center justify-between gap-4 shadow-sm">
              <div className="space-y-1">
                <span className="text-[11px] leading-[14px] tracking-[0.06em] font-bold text-[#ffdea6] uppercase tracking-wider">
                  24/7 Cattle Emergency &amp; Bhandara Helpline
                </span>
                <p className="font-[family-name:var(--font-home-heading)] text-[22px] leading-[30px] font-semibold">
                  Want to get involved or  need Mela assistance?
                </p>
              </div>
              <Link
                className="px-5 py-2.5 bg-[#ffffff] text-[#023727] rounded-[4px] text-xs leading-4 tracking-[0.04em] font-bold shrink-0 hover:bg-[#f0ede9] transition-colors shadow"
                href="tel:+919820100000"
              >
                Call Helpline
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div>
              <span className="text-[11px] leading-[14px] tracking-[0.06em] font-bold text-[#ab3600] uppercase tracking-wider">
                Uncompromising Governance
              </span>
              <h2 className="font-[family-name:var(--font-home-heading)] text-[26px] sm:text-4xl tracking-[-0.01em] font-medium text-[#023727] mt-1">
                Statutory &amp; Audit Transparency
              </h2>
              <p className="text-sm leading-5 text-[#414944] mt-2">
                We uphold highest standards of civic accountability. Every
                ledger, expenditure invoice, and tax certification is available
                for public download.
              </p>
            </div>
            <div className="bg-[#ffffff] rounded-[8px] shadow-sm p-6 space-y-4">
              <Link
                className="flex flex-wrap gap-2 items-center justify-between p-3.5 rounded-[4px] bg-[#f6f3ee] hover:bg-[#f0ede9] transition-colors group"
                href="/downloads"
              >
                <div className="flex items-center gap-3">
                  <FileText
                    aria-hidden="true"
                    className="shrink-0 text-[#ab3600] size-[24px]"
                  />
                  <div>
                    <span className="text-xs leading-4 tracking-[0.04em] font-semibold text-[#1c1c19] block group-hover:text-[#023727] transition-colors">
                      Annual Financial Audit Report FY 2023-24
                    </span>
                    <span className="text-[11px] leading-[14px] tracking-[0.06em] font-bold text-[#717974]">
                      Audited by M/s R.K. Agrawal &amp; Co., Chartered
                      Accountants
                    </span>
                  </div>
                </div>
                <Download
                  aria-hidden="true"
                  className="shrink-0 text-[#717974] group-hover:text-[#023727] size-[20px]"
                />
              </Link>
              <Link
                className="flex flex-wrap gap-2 items-center justify-between p-3.5 rounded-[4px] bg-[#f6f3ee] hover:bg-[#f0ede9] transition-colors group"
                href="/downloads"
              >
                <div className="flex items-center gap-3">
                  <BadgeCheck
                    aria-hidden="true"
                    className="shrink-0 text-[#023727] size-[24px]"
                  />
                  <div>
                    <span className="text-xs leading-4 tracking-[0.04em] font-semibold text-[#1c1c19] block group-hover:text-[#023727] transition-colors">
                      Income Tax Form 10AC (80G Approval)
                    </span>
                    <span className="text-[11px] leading-[14px] tracking-[0.06em] font-bold text-[#717974]">
                      Perpetual Validity U/S 80G(5) of Income Tax Act 1961
                    </span>
                  </div>
                </div>
                <Download
                  aria-hidden="true"
                  className="shrink-0 text-[#717974] group-hover:text-[#023727] size-[20px]"
                />
              </Link>
              <Link
                className="flex flex-wrap gap-2 items-center justify-between p-3.5 rounded-[4px] bg-[#f6f3ee] hover:bg-[#f0ede9] transition-colors group"
                href="/downloads"
              >
                <div className="flex items-center gap-3">
                  <Shield
                    aria-hidden="true"
                    className="shrink-0 text-[#023727] size-[24px]"
                  />
                  <div>
                    <span className="text-xs leading-4 tracking-[0.04em] font-semibold text-[#1c1c19] block group-hover:text-[#023727] transition-colors">
                      DARPAN NITI Aayog Certificate
                    </span>
                    <span className="text-[11px] leading-[14px] tracking-[0.06em] font-bold text-[#717974]">
                      Unique Reg ID: UP/2025/0559454 Active Certification
                    </span>
                  </div>
                </div>
                <Download
                  aria-hidden="true"
                  className="shrink-0 text-[#717974] group-hover:text-[#023727] size-[20px]"
                />
              </Link>
              <Link
                className="flex flex-wrap gap-2 items-center justify-between p-3.5 rounded-[4px] bg-[#f6f3ee] hover:bg-[#f0ede9] transition-colors group"
                href="/downloads"
              >
                <div className="flex items-center gap-3">
                  <Newspaper
                    aria-hidden="true"
                    className="shrink-0 text-[#ab3600] size-[24px]"
                  />
                  <div>
                    <span className="text-xs leading-4 tracking-[0.04em] font-semibold text-[#1c1c19] block group-hover:text-[#023727] transition-colors">
                      CSR-1 Registration Document
                    </span>
                    <span className="text-[11px] leading-[14px] tracking-[0.06em] font-bold text-[#717974]">
                      Ministry of Corporate Affairs Govt of India (Eligible)
                    </span>
                  </div>
                </div>
                <Download
                  aria-hidden="true"
                  className="shrink-0 text-[#717974] group-hover:text-[#023727] size-[20px]"
                />
              </Link>
            </div>

            <div className="p-4 rounded-[8px] bg-[#f0ede9] flex items-center gap-4">
              <Gavel
                aria-hidden="true"
                className="shrink-0 size-[36px] text-[#023727]"
              />
              <p className="text-sm leading-5 text-[#414944]">
                Registered under Indian Trusts Act, 1882. Sub-Registrar Office,
                Prayagraj. 
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
