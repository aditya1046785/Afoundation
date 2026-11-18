import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
} from "lucide-react";
import { getInitials } from "@/lib/utils";
import { homeManrope, homeGaramond } from "./homeFonts";
import styles from "./HomeDesign.module.css";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  photo: string;
  category: string;
  instagramUrl?: string | null;
  facebookUrl?: string | null;
  twitterUrl?: string | null;
  linkedinUrl?: string | null;
}

interface TeamPreviewProps {
  settings: Record<string, string>;
  members: TeamMember[];
}

const socialLinks = [
  { key: "instagramUrl", label: "Instagram", Icon: Instagram },
  { key: "facebookUrl", label: "Facebook", Icon: Facebook },
  { key: "twitterUrl", label: "Twitter", Icon: Twitter },
  { key: "linkedinUrl", label: "LinkedIn", Icon: Linkedin },
] as const;

export function TeamPreview({ settings, members }: TeamPreviewProps) {
  const heading = settings.team_section_heading || "Meet Our Team";
  const subtext =
    settings.team_section_subtext || "The passionate people behind our mission";

  return (
    <section
      aria-labelledby="home-team-heading"
      className={`${styles.section} ${homeManrope.variable} ${homeGaramond.variable} bg-[#f6f3ee] py-20`}
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="text-[11px] font-bold uppercase leading-[14px] tracking-[0.06em] text-[#ab3600]">
            Our People
          </p>
          <h2
            id="home-team-heading"
            className="mt-2 font-[family-name:var(--font-home-heading)] text-[32px] font-semibold leading-10 tracking-[-0.015em] text-[#023727] sm:text-5xl sm:leading-[56px]"
          >
            {heading}
          </h2>
          <p className="mt-3 text-base leading-6 text-[#414944]">{subtext}</p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {members.map((member, index) => (
            <article
              key={member.id}
              className={`group overflow-hidden rounded-2xl border border-[#c0c8c3]/40 bg-white shadow-sm transition-shadow hover:shadow-md ${index >= 3 ? "hidden md:flex" : "flex"} flex-col`}
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-[#e5e2dd]">
                {member.photo ? (
                  <Image
                    src={member.photo}
                    alt={member.name}
                    fill
                    className="object-cover transition-transform duration-500 motion-safe:group-hover:scale-105"
                    sizes="(max-width: 767px) calc(100vw - 48px), (max-width: 1023px) calc((100vw - 72px) / 2), (max-width: 1280px) calc((100vw - 120px) / 4), 290px"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-[#023727]/10">
                    <span className="font-[family-name:var(--font-home-heading)] text-6xl font-semibold text-[#023727]">
                      {getInitials(member.name)}
                    </span>
                  </div>
                )}
                {member.category && (
                  <span className="absolute bottom-4 left-4 right-4 w-fit max-w-[calc(100%-2rem)] rounded-[4px] border border-[#c0c8c3]/40 bg-[#fcf9f4]/95 px-3 py-1.5 text-[11px] font-semibold leading-4 tracking-wide text-[#023727] backdrop-blur-sm">
                    {member.category}
                  </span>
                )}
              </div>

              <div className="flex flex-1 flex-col p-5">
                <h3 className="font-[family-name:var(--font-home-heading)] text-[22px] font-semibold leading-[30px] text-[#023727]">
                  {member.name}
                </h3>
                <p className="mt-1 text-xs font-semibold leading-5 tracking-wide text-[#ab3600]">
                  {member.role}
                </p>
                {socialLinks.some(({ key }) => member[key]) && (
                  <div className="mt-auto pt-5">
                    <div className="flex flex-wrap gap-2 border-t border-[#c0c8c3]/40 pt-4">
                      {socialLinks.map(({ key, label, Icon }) =>
                        member[key] ? (
                          <a
                            key={key}
                            href={member[key]!}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`${member.name} on ${label}`}
                            className="flex size-10 items-center justify-center rounded-[8px] bg-[#f6f3ee] text-[#023727] transition-colors hover:bg-[#023727] hover:text-white"
                          >
                            <Icon aria-hidden="true" className="size-4" />
                          </a>
                        ) : null,
                      )}
                    </div>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/team"
            className="inline-flex items-center justify-center gap-2.5 rounded-[8px] bg-[#023727] px-7 py-4 text-sm font-bold leading-5 tracking-[0.02em] text-white shadow-sm transition-all hover:bg-[#1f4e3d] hover:shadow-md"
          >
            Meet The Full Team
            <ArrowRight aria-hidden="true" className="size-[18px]" />
          </Link>
        </div>
      </div>
    </section>
  );
}
