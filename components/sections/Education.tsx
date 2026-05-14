"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { useI18n } from "@/lib/i18n";

/**
 * Minimal two-crest strip between About and Internships. No cards, no
 * highlights, no borders — just the two school crests with a one-line
 * degree caption, separated by an arrow showing chronological flow:
 * WKU (undergrad, 2022–2026) → Yale (grad, Fall 2026).
 * Designed to read as a quiet credentialing footer to About, never to
 * dominate the page.
 */
export function Education() {
  const { lang } = useI18n();

  return (
    <section
      id="education"
      className="education-strip"
      aria-label={lang === "en" ? "Education" : "教育"}
    >
      <div className="education-strip__inner">
        <a
          href="https://www.wku.edu.cn/"
          target="_blank"
          rel="noopener noreferrer"
          className="education-school"
          data-bazil-cursor
        >
          <span className="education-school__crest">
            <Image
              src="/images/crests/wku.png"
              alt={lang === "en" ? "Wenzhou-Kean University crest" : "温州肯恩大学校徽"}
              fill
              sizes="72px"
              className="education-school__crest-img"
            />
          </span>
          <span className="education-school__text">
            <span className="education-school__name" data-lang={lang}>
              {lang === "en" ? "Wenzhou-Kean University" : "温州肯恩大学"}
            </span>
            <span className="education-school__degree">
              {lang === "en"
                ? "BSc CS · 2022 — 2026"
                : "计算机科学学士 · 2022 — 2026"}
            </span>
          </span>
        </a>

        <span className="education-strip__arrow" aria-hidden>
          <ArrowRight size={22} strokeWidth={1.5} />
        </span>

        <a
          href="https://www.yale.edu/"
          target="_blank"
          rel="noopener noreferrer"
          className="education-school"
          data-state="next"
          data-bazil-cursor
        >
          <span className="education-school__crest">
            <Image
              src="/images/crests/yale.svg"
              alt={lang === "en" ? "Yale University shield" : "耶鲁大学校徽"}
              fill
              sizes="72px"
              className="education-school__crest-img"
            />
          </span>
          <span className="education-school__text">
            <span className="education-school__name" data-lang={lang}>
              {lang === "en" ? "Yale University" : "耶鲁大学"}
            </span>
            <span className="education-school__degree">
              {lang === "en"
                ? "MSc CS · Fall 2026"
                : "计算机科学硕士 · 2026 秋季"}
            </span>
          </span>
        </a>
      </div>
    </section>
  );
}
