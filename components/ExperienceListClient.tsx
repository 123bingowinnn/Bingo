"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowUpRight, MapPin, Building2 } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import type { ExperienceItem } from "@/lib/types";

/** Map slug → real logo path. content.json points to broken paths
    (/images/zoom.svg etc.); the actual files live under /images/logos/.
    Penghui has no logo — those cards fall back to the generic icon. */
const LOGO_MAP: Record<string, string> = {
  "zoom-pm": "/images/logos/zoom.svg",
  "alibaba-cloud": "/images/logos/alibaba-cloud.svg",
  "deloitte-backend": "/images/logos/deloitte.svg",
  "wku-ta": "/images/crests/wku.png",
  "wku-library": "/images/crests/wku.png",
};

/** Smooth-scroll back to the Internships map on the landing page. */
function backToTrail(e: React.MouseEvent<HTMLAnchorElement>) {
  if (typeof window === "undefined") return;
  if (window.location.pathname === "/") {
    e.preventDefault();
    document
      .getElementById("experience")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
    history.pushState(null, "", "#experience");
  }
}

const ENTER = { duration: 0.55, ease: [0.16, 1, 0.3, 1] as const };

export function ExperienceListClient({
  experiences,
}: {
  experiences: ExperienceItem[];
}) {
  const { lang } = useI18n();
  const reduce = useReducedMotion();

  const backLabel = lang === "en" ? "Back to internship map" : "返回实习地图";
  const allHeading = lang === "en" ? "Internships" : "实习经历";
  const allSub =
    lang === "en"
      ? "Internships across product management, software engineering, and data."
      : "涵盖产品管理、软件工程和数据方向的实习经历。";

  // Only the four real internships — keep WKU TA / IT Assistant for a
  // separate page if needed. The title says "Internships", so we filter.
  const internships = experiences.filter(
    (e) => !e.slug.startsWith("wku-"),
  );

  return (
    <main className="exp-list">
      {/* Top bar */}
      <header className="exp-list__top">
        <Link
          href="/#experience"
          className="exp-list__back"
          onClick={backToTrail}
          data-bazil-cursor
        >
          <ArrowLeft size={15} strokeWidth={1.8} />
          <span>{backLabel}</span>
        </Link>
      </header>

      {/* Hero */}
      <motion.section
        className="exp-list__hero"
        initial={reduce ? false : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={ENTER}
      >
        <p className="exp-list__eyebrow">
          / {lang === "en" ? "EXPERIENCE" : "经历"}
        </p>
        <h1 className="exp-list__title" data-lang={lang}>
          {allHeading}
        </h1>
        <p className="exp-list__sub">{allSub}</p>
      </motion.section>

      {/* Stacked cards with a timeline rail on the left */}
      <section className="exp-list__cards">
        <span className="exp-list__rail" aria-hidden />
        {internships.map((exp, i) => {
          const data = exp[lang];
          return (
            <motion.article
              key={exp.slug}
              id={exp.slug}
              className="exp-card"
              initial={reduce ? false : { opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ ...ENTER, delay: 0.04 * i }}
            >
              <div className="exp-card__head">
                <div className="exp-card__title-row">
                  <h2 className="exp-card__title">{data.role}</h2>
                  <span className="exp-card__period">{data.period}</span>
                </div>
                <p className="exp-card__meta">
                  {LOGO_MAP[exp.slug] ? (
                    <span className="exp-card__logo" aria-hidden>
                      <Image
                        src={LOGO_MAP[exp.slug]}
                        alt=""
                        fill
                        sizes="22px"
                        className="exp-card__logo-img"
                      />
                    </span>
                  ) : (
                    <Building2 size={13} strokeWidth={1.8} aria-hidden />
                  )}
                  <span>{data.company}</span>
                  <span className="exp-card__meta-dot" aria-hidden>·</span>
                  <MapPin size={13} strokeWidth={1.8} aria-hidden />
                  <span>{data.location}</span>
                </p>
              </div>

              <p className="exp-card__summary">{data.summary}</p>

              <ul className="exp-card__bullets">
                {data.bullets.map((bullet, j) => (
                  <li key={j}>{bullet}</li>
                ))}
              </ul>

              {data.techStack && data.techStack.length > 0 ? (
                <div className="exp-card__chips">
                  {data.techStack.slice(0, 2).map((tech) => (
                    <span key={tech} className="exp-card__chip exp-card__chip--dark">
                      {tech}
                    </span>
                  ))}
                  {data.techStack.slice(2).map((tech) => (
                    <span key={tech} className="exp-card__chip">
                      {tech}
                    </span>
                  ))}
                </div>
              ) : null}
            </motion.article>
          );
        })}
      </section>

      {/* Footer */}
      <footer className="exp-list__footer">
        <Link
          href="/#experience"
          className="exp-list__back-big"
          onClick={backToTrail}
          data-bazil-cursor
        >
          <ArrowLeft size={18} strokeWidth={1.8} />
          <span>{backLabel}</span>
          <ArrowUpRight size={14} strokeWidth={2} className="exp-list__back-arr" />
        </Link>
      </footer>
    </main>
  );
}
