"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ArrowLeft, ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { getContent } from "@/lib/content";

type Kind = "project" | "paper" | "both";

type Work = {
  slug: string;
  kind: Kind;
  /** Display title — overlaid on the card */
  title: { en: string; zh: string };
  /** One-line subtitle below the title — tags for projects, venue for papers */
  subtitle: { en: string; zh: string };
  /** Cover image path. null = use the brand-color editorial poster fallback. */
  cover: string | null;
  /** 1–2 letter monogram used by the editorial poster fallback */
  monogram: string;
  /** Brand accent — also colors the poster background */
  brand: string;
  /** Where the card links to */
  href: string;
  /** Open in a new tab if href is external (e.g. a DOI link) */
  external?: boolean;
};

const ENTER = { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const };

export function Works() {
  const { lang } = useI18n();
  const reduce = useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const content = getContent();

  // Resolve the merged works list. PathMNIST + OCTMNIST each have a matching
  // paper, so they're represented as a single "both" card linking to the
  // project case study (the paper DOI lives in the case study).
  const projectBySlug = new Map(content.projects.map((p) => [p.slug, p]));
  const publicationBySlug = new Map(
    content.publications.map((p) => [p.slug, p]),
  );

  // Until real photo / paper-cover assets land, every card renders the editorial
  // poster fallback (brand color + monogram). When a cover lands, set `cover` and
  // it'll override the poster automatically.
  const WORKS: Work[] = [
    (() => {
      const p = projectBySlug.get("digital-human-dementia")!;
      return {
        slug: "digital-human-dementia",
        kind: "project",
        title: { en: p.en.title, zh: p.zh.title },
        subtitle: { en: p.tags.join(" · "), zh: p.tags.join(" · ") },
        cover: "/images/projects/digital-human.jpg",
        monogram: "DH",
        brand: "#8B7FFD",
        href: `/projects/${p.slug}`,
      };
    })(),
    (() => {
      const p = projectBySlug.get("plant-disease-classification")!;
      return {
        slug: "plant-disease-classification",
        kind: "project",
        title: { en: p.en.title, zh: p.zh.title },
        subtitle: { en: p.tags.join(" · "), zh: p.tags.join(" · ") },
        cover: "/images/projects/plant-disease.jpg",
        monogram: "PD",
        brand: "#4ADE80",
        href: `/projects/${p.slug}`,
      };
    })(),
    (() => {
      const p = projectBySlug.get("fridge-clear")!;
      return {
        slug: "fridge-clear",
        kind: "project",
        title: { en: p.en.title, zh: p.zh.title },
        subtitle: { en: "Vibe Coding", zh: "Vibe Coding" },
        cover: "/images/projects/fridge-clear.jpg",
        monogram: "FC",
        brand: "#FB923C",
        href: `/projects/${p.slug}`,
      };
    })(),
    (() => {
      const p = projectBySlug.get("pathmnist-classification")!;
      const paper = publicationBySlug.get("pathmnist-paper");
      return {
        slug: "pathmnist",
        kind: "both",
        title: { en: p.en.title, zh: p.zh.title },
        subtitle: {
          en: paper ? `Paper · ${paper.en.venue}` : p.tags.join(" · "),
          zh: paper ? `论文 · ${paper.zh.venue}` : p.tags.join(" · "),
        },
        cover: "/images/projects/pathmnist.jpg",
        monogram: "PM",
        brand: "#F472B6",
        href: `/projects/${p.slug}`,
      };
    })(),
    (() => {
      const p = projectBySlug.get("octmnist-distillation")!;
      const paper = publicationBySlug.get("octmnist-paper");
      return {
        slug: "octmnist",
        kind: "both",
        title: { en: p.en.title, zh: p.zh.title },
        subtitle: {
          en: paper ? `Paper · ${paper.en.venue}` : p.tags.join(" · "),
          zh: paper ? `论文 · ${paper.zh.venue}` : p.tags.join(" · "),
        },
        cover: "/images/projects/octmnist.jpg",
        monogram: "OM",
        brand: "#22D3EE",
        href: `/projects/${p.slug}`,
      };
    })(),
    (() => {
      const paper = publicationBySlug.get("llm-negative-rejection")!;
      return {
        slug: "llm-negative-rejection",
        kind: "paper",
        title: { en: paper.en.title, zh: paper.zh.title },
        subtitle: {
          en: `${paper.en.venue} · ${paper.en.date}`,
          zh: `${paper.zh.venue} · ${paper.zh.date}`,
        },
        cover: "/images/projects/llm-rejection.jpg",
        monogram: "LR",
        brand: "#60A5FA",
        href: paper.en.link,
        external: true,
      };
    })(),
  ];

  // Leftmost-visible-card detection — bazil's rule: the card aligned to the
  // left edge of the track is the "focal" card (auto-shows in color + CTA).
  // All other cards stay grayscale unless the user hovers them.
  const [activeIdx, setActiveIdx] = useState(0);
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let raf = 0;
    const update = () => {
      const trackRect = track.getBoundingClientRect();
      // Read the left scroll-padding so we measure from the same anchor the
      // snap-scroll uses (the visual "left rail" inside the padding).
      const cs = getComputedStyle(track);
      const padLeft = parseFloat(cs.paddingLeft) || 0;
      const anchorX = trackRect.left + padLeft;
      const cards = Array.from(
        track.querySelectorAll<HTMLElement>(".works-card"),
      );
      let bestIdx = 0;
      let bestDist = Infinity;
      cards.forEach((card, i) => {
        const r = card.getBoundingClientRect();
        // Distance from card's left edge to the track's left anchor.
        const d = Math.abs(r.left - anchorX);
        if (d < bestDist) {
          bestDist = d;
          bestIdx = i;
        }
      });
      setActiveIdx(bestIdx);
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
    return () => {
      track.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const scroll = (dir: -1 | 1) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.firstElementChild as HTMLElement | null;
    const step = (card?.offsetWidth ?? 320) + 24;
    track.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  return (
    <section
      id="works"
      className="works-stage"
      aria-labelledby="works-title"
    >
      <header className="works-stage__top">
        <div className="works-stage__head">
          <h2 id="works-title" className="works-stage__lede" data-lang={lang}>
            {lang === "en" ? "Research and Projects" : "研究与项目"}
          </h2>
        </div>
        <div className="works-stage__nav">
          <button
            type="button"
            onClick={() => scroll(-1)}
            aria-label={lang === "en" ? "Previous" : "上一个"}
            data-bazil-cursor
          >
            <ArrowLeft size={20} />
          </button>
          <button
            type="button"
            onClick={() => scroll(1)}
            aria-label={lang === "en" ? "Next" : "下一个"}
            data-bazil-cursor
          >
            <ArrowRight size={20} />
          </button>
        </div>
      </header>

      <div className="works-track" ref={trackRef} role="list">
        {WORKS.map((w, i) => {
          const card = (
            <>
              <div className="works-card__media">
                {w.cover ? (
                  <Image
                    src={w.cover}
                    alt={w.title[lang]}
                    fill
                    sizes="(max-width: 768px) 80vw, 420px"
                    className="works-card__img"
                    priority={i < 2}
                  />
                ) : (
                  <span className="works-card__poster" aria-hidden>
                    <span className="works-card__poster-monogram">
                      {w.monogram}
                    </span>
                    <span className="works-card__poster-grain" aria-hidden />
                  </span>
                )}
                <span className="works-card__scrim" aria-hidden />
                <span className="works-card__cta" aria-hidden>
                  <ArrowUpRight size={26} strokeWidth={2} />
                </span>
              </div>
              <div className="works-card__caption">
                <h3 className="works-card__title">{w.title[lang]}</h3>
                <p className="works-card__sub">{w.subtitle[lang]}</p>
              </div>
            </>
          );

          return (
            <motion.article
              key={w.slug}
              className="works-card"
              role="listitem"
              data-state={i === activeIdx ? "active" : "idle"}
              style={{ ["--brand" as string]: w.brand }}
              initial={reduce ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ ...ENTER, delay: 0.04 * i }}
            >
              {w.external ? (
                <a
                  href={w.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="works-card__link"
                  data-bazil-cursor
                  aria-label={w.title[lang]}
                >
                  {card}
                </a>
              ) : (
                <Link
                  href={w.href}
                  className="works-card__link"
                  data-bazil-cursor
                  aria-label={w.title[lang]}
                >
                  {card}
                </Link>
              )}
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}
