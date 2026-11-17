import { homeManrope, homeGaramond } from "./homeFonts";
import styles from "./HomeDesign.module.css";
import Link from "next/link";
import {
  ShieldUser,
  Check,
  ChevronRight,
  Handshake,
  UserCog,
  LogIn,
} from "lucide-react";

export function OnboardingSection() {
  return (
    <section
      className={`${styles.section} ${homeManrope.variable} ${homeGaramond.variable} w-full py-20 bg-[#f6f3ee]`}
      id="onboarding-hub"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-[11px] leading-[14px] tracking-[0.06em] font-bold text-[#ab3600] uppercase tracking-wider">
            Join The Brotherhood of Seva
          </span>
          <h2 className="font-[family-name:var(--font-home-heading)] text-[32px] leading-10 sm:text-5xl sm:leading-[56px] tracking-[-0.015em] font-semibold text-[#023727] mt-2">
            Become a Guardian of Our Sacred Mission
          </h2>
          <p className="text-base leading-6 text-[#414944] mt-3">
            Whether you offer your time on the ground, participate in trust
            governance, or manage your lifelong tax-exempt seva receipts.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-[#ffffff] rounded-2xl shadow-sm p-8 flex flex-col justify-between hover:shadow-md transition-all">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-[8px] bg-[#023727]/10 flex items-center justify-center">
                <ShieldUser
                  aria-hidden="true"
                  className="shrink-0 text-[#023727] size-[32px]"
                />
              </div>
              <h3 className="font-[family-name:var(--font-home-heading)] text-[28px] leading-9 font-medium text-[#023727]">
                Become a Registered Member
              </h3>
              <p className="text-sm leading-5 text-[#414944] leading-relaxed">
                Participate in Annual General Meetings (AGM), review ongoing
                financial audits, cast consultative votes on sanctuary
                expansion, and receive monthly spiritual publications.
              </p>
              <ul className="space-y-2 pt-2 text-xs leading-4 tracking-[0.04em] font-semibold text-[#1c1c19]">
                <li className="flex items-center gap-2">
                  <Check
                    aria-hidden="true"
                    className="shrink-0 text-[#ab3600] size-[16px]"
                  />
                  <span>Annual Trust voting rights</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check
                    aria-hidden="true"
                    className="shrink-0 text-[#ab3600] size-[16px]"
                  />
                  <span>Monthly Sankalp Patrika delivered</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check
                    aria-hidden="true"
                    className="shrink-0 text-[#ab3600] size-[16px]"
                  />
                  <span>Direct advisory board interaction</span>
                </li>
              </ul>
            </div>
            <div className="pt-8">
              <Link
                className="w-full inline-flex items-center justify-center gap-2 py-3 bg-[#023727] text-[#ffffff] rounded-[4px] text-sm leading-5 tracking-[0.02em] font-semibold hover:bg-[#1f4e3d] transition-all"
                href="/register"
              >
                <span>Register as Member</span>
                <ChevronRight
                  aria-hidden="true"
                  className="shrink-0 size-[16px]"
                />
              </Link>
            </div>
          </div>

          <div className="bg-[#ffffff] rounded-2xl shadow-md p-8 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-[#ab3600] text-[#ffffff] px-3 py-1 text-[11px] leading-[14px] tracking-[0.06em] font-bold uppercase rounded-bl-lg">
              High Need
            </div>
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-[8px] bg-[#ffdbcf]/50 flex items-center justify-center">
                <Handshake
                  aria-hidden="true"
                  className="shrink-0 text-[#ab3600] size-[32px]"
                />
              </div>
              <h3 className="font-[family-name:var(--font-home-heading)] text-[28px] leading-9 font-medium text-[#023727]">
                Serve as a Ground Volunteer
              </h3>
              <p className="text-sm leading-5 text-[#414944] leading-relaxed">
                Roll up your sleeves on weekends or festive seasons. Teach web
                coding to young village girls, serve hot khichdi at Magh Mela
                camps, or assist gaushala veterinarians.
              </p>
              <ul className="space-y-2 pt-2 text-xs leading-4 tracking-[0.04em] font-semibold text-[#1c1c19]">
                <li className="flex items-center gap-2">
                  <Check
                    aria-hidden="true"
                    className="shrink-0 text-[#ab3600] size-[16px]"
                  />
                  <span>Magh Mela Sangam duty shifts</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check
                    aria-hidden="true"
                    className="shrink-0 text-[#ab3600] size-[16px]"
                  />
                  <span>Weekend tech tutor mentorship</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check
                    aria-hidden="true"
                    className="shrink-0 text-[#ab3600] size-[16px]"
                  />
                  <span>Official Volunteer Seva Certificate</span>
                </li>
              </ul>
            </div>
            <div className="pt-8">
              <Link
                className="w-full inline-flex items-center justify-center gap-2 py-3 bg-[#ab3600] text-[#ffffff] rounded-[4px] text-sm leading-5 tracking-[0.02em] font-semibold hover:bg-[#ff6e38] transition-all shadow-sm"
                href="/register"
              >
                <span>Apply for Seva Volunteer</span>
                <ChevronRight
                  aria-hidden="true"
                  className="shrink-0 size-[16px]"
                />
              </Link>
            </div>
          </div>

          <div className="bg-[#ffffff] rounded-2xl shadow-sm p-8 flex flex-col justify-between hover:shadow-md transition-all">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-[8px] bg-[#f0ede9] flex items-center justify-center">
                <UserCog
                  aria-hidden="true"
                  className="shrink-0 text-[#023727] size-[32px]"
                />
              </div>
              <h3 className="font-[family-name:var(--font-home-heading)] text-[28px] leading-9 font-medium text-[#023727]">
                Seva &amp; Donor Self-Service
              </h3>
              <p className="text-sm leading-5 text-[#414944] leading-relaxed">
                Already a patron or registered sevadar? Access your historical
                contribution ledgers, instant 80G certificate downloads, and
                view scheduled volunteer duty timings.
              </p>
              <ul className="space-y-2 pt-2 text-xs leading-4 tracking-[0.04em] font-semibold text-[#1c1c19]">
                <li className="flex items-center gap-2">
                  <Check
                    aria-hidden="true"
                    className="shrink-0 text-[#023727] size-[16px]"
                  />
                  <span>Consolidated 80G tax summaries</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check
                    aria-hidden="true"
                    className="shrink-0 text-[#023727] size-[16px]"
                  />
                  <span>Gaushala telemetry live feeds</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check
                    aria-hidden="true"
                    className="shrink-0 text-[#023727] size-[16px]"
                  />
                  <span>Volunteer ID Badge generator</span>
                </li>
              </ul>
            </div>
            <div className="pt-8">
              <Link
                className="w-full inline-flex items-center justify-center gap-2 py-3 bg-[#f0ede9] text-[#1c1c19] rounded-[4px] text-sm leading-5 tracking-[0.02em] font-semibold hover:bg-[#ebe8e3] transition-all"
                href="/login"
              >
                <span>Seva Portal Login</span>
                <LogIn aria-hidden="true" className="shrink-0 size-[16px]" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
