"use client";

import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { useI18n } from "@/lib/i18n";

type School = {
  key: string;
  en: { name: string; program: string; date: string; city: string };
  zh: { name: string; program: string; date: string; city: string };
  logo: string | null;
  initials?: string;
  accent: string;
  enrolled?: boolean;
  stats?: ReadonlyArray<{ en: string; zh: string }>;
};

const SCHOOLS: ReadonlyArray<School> = [
  {
    key: "yale",
    en: { name: "Yale University", program: "M.S. in Computer Science", date: "Fall 2026", city: "New Haven, CT" },
    zh: { name: "耶鲁大学", program: "计算机科学硕士", date: "2026 秋季入学", city: "康涅狄格州纽黑文" },
    logo: "/images/offers/yale-logo.png",
    initials: "Y",
    accent: "#0F4D92",
    enrolled: true,
  },
  {
    key: "wku",
    en: { name: "Wenzhou-Kean University", program: "B.S. in Computer Science · Minor in Math", date: "2022 – 2026", city: "Wenzhou, China" },
    zh: { name: "温州肯恩大学", program: "计算机科学学士 · 数学辅修", date: "2022 – 2026", city: "中国温州" },
    logo: null,
    initials: "WKU",
    accent: "#9b1b30",
    stats: [
      { en: "GPA 3.9 / 4.0", zh: "GPA 3.9 / 4.0" },
      { en: "Top 5 % · Rank 5 / 140", zh: "前 5% · 5 / 140" },
      { en: "Dean's Scholarship (2nd Prize)", zh: "院长奖学金（二等）" },
    ],
  },
] as const;

const OFFERS = [
  { key: "yale", name: "Yale", cover: "/images/offers/yale-offer.png", color: "#0F4D92" },
  { key: "cmu", name: "Carnegie Mellon", cover: "/images/offers/cmu-offer.png", color: "#C41230" },
  { key: "columbia", name: "Columbia", cover: "/images/offers/columbia-offer.png", color: "#1F2A75" },
  { key: "cornell", name: "Cornell", cover: "/images/offers/cornell-offer.png", color: "#B31B1B" },
  { key: "northwestern", name: "Northwestern", cover: "/images/offers/northwestern-offer.png", color: "#4E2A84" },
  { key: "ucl", name: "UCL", cover: "/images/offers/ucl-offer.png", color: "#003D6A" },
];

export function EducationOffers() {
  const { lang } = useI18n();
  const reduce = useReducedMotion();
  const [activeOffer, setActiveOffer] = useState<string | null>(null);
  const active = OFFERS.find((o) => o.key === activeOffer);

  return (
    <section id="education" className="education-section" aria-labelledby="education-title">
      <div className="folio-section-label">EDUCATION / 05</div>

      <div className="education-shell">
        <div className="education-heading">
          <p>{lang === "en" ? "The road that led here." : "走到这里的路。"}</p>
          <h2 id="education-title" data-lang={lang}>
            {lang === "en" ? (
              <>
                Heading to <em>Yale</em>,<br />
                via Wenzhou-Kean.
              </>
            ) : (
              <>
                即将奔赴 <em>耶鲁</em>，<br />
                出发地 温州肯恩。
              </>
            )}
          </h2>
        </div>

        <div className="education-cards">
          {SCHOOLS.map((school) => {
            const data = school[lang];
            return (
              <article
                key={school.key}
                className="education-card"
                data-enrolled={school.enrolled ? "true" : "false"}
                style={{ ["--accent" as string]: school.accent }}
              >
                <div className="education-card__head">
                  <div className="education-card__logo">
                    {school.logo ? (
                      <Image src={school.logo} alt="" fill sizes="64px" style={{ objectFit: "contain" }} />
                    ) : (
                      <span className="education-card__initials">{school.initials}</span>
                    )}
                  </div>
                  {school.enrolled && (
                    <span className="education-card__pill">
                      {lang === "en" ? "INCOMING · 2026" : "即将入学 · 2026"}
                    </span>
                  )}
                </div>
                <h3>{data.name}</h3>
                <p className="education-card__program">{data.program}</p>
                <p className="education-card__meta">
                  <span>{data.date}</span>
                  <span aria-hidden>·</span>
                  <span>{data.city}</span>
                </p>
                {school.stats && (
                  <ul className="education-card__stats">
                    {school.stats.map((stat) => (
                      <li key={stat.en}>{stat[lang]}</li>
                    ))}
                  </ul>
                )}
              </article>
            );
          })}
        </div>

        <div className="offer-wall">
          <div className="offer-wall__heading">
            <span>{lang === "en" ? "Offer wall · 6 admissions" : "录取墙 · 6 所 Offer"}</span>
            <p>{lang === "en" ? "Click any letter to enlarge" : "点击任意一封展开"}</p>
          </div>
          <ul className="offer-wall__grid">
            {OFFERS.map((offer, i) => (
              <li key={offer.key}>
                <button
                  type="button"
                  className="offer-wall__card"
                  onClick={() => setActiveOffer(offer.key)}
                  style={{ ["--card-accent" as string]: offer.color }}
                  data-bazil-cursor
                  aria-label={`View ${offer.name} admission letter`}
                >
                  <span className="offer-wall__number">/0{i + 1}</span>
                  <span className="offer-wall__name">{offer.name}</span>
                  <span className="offer-wall__cover">
                    <Image
                      src={offer.cover}
                      alt={`${offer.name} admission letter`}
                      fill
                      sizes="(max-width: 767px) 44vw, 16vw"
                      style={{ objectFit: "cover" }}
                    />
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <AnimatePresence>
        {active && (
          <motion.div
            className="offer-wall__lightbox"
            initial={reduce ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0 }}
            transition={{ duration: 0.22 }}
            role="dialog"
            aria-modal="true"
            onClick={() => setActiveOffer(null)}
          >
            <motion.div
              className="offer-wall__lightbox-frame"
              initial={reduce ? { scale: 1 } : { scale: 0.95, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={reduce ? { scale: 1 } : { scale: 0.95, y: 12 }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              style={{ ["--card-accent" as string]: active.color }}
            >
              <button
                type="button"
                className="offer-wall__lightbox-close"
                onClick={() => setActiveOffer(null)}
                aria-label="Close"
              >
                <X size={18} aria-hidden />
              </button>
              <Image
                src={active.cover}
                alt={`${active.name} admission letter`}
                width={1400}
                height={1800}
                style={{ width: "100%", height: "auto", borderRadius: "0.6rem" }}
                priority
              />
              <p className="offer-wall__lightbox-caption">
                {active.name} · {lang === "en" ? "Admission Letter" : "录取通知书"}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
