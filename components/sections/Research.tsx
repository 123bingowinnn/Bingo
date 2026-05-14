"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ArrowLeft, ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { getContent } from "@/lib/content";

const ENTER = { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const };

const PAPER_COVERS: Record<string, string | undefined> = {
  "pathmnist-paper": "/images/projects/pathmnist-cover.jpg",
  "octmnist-paper": "/images/projects/octmnist-cover.jpg",
};

export function Research() {
  const { lang } = useI18n();
  const reduce = useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const papers = getContent().publications;

  const scroll = (dir: -1 | 1) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.firstElementChild as HTMLElement | null;
    const step = (card?.offsetWidth ?? 360) + 24;
    track.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  return (
    <section id="research" className="showcase-stage" aria-labelledby="research-title">
      <header className="showcase-stage__top">
        <div className="showcase-stage__head">
          <p className="showcase-stage__eyebrow">/ 04 · RESEARCH</p>
          <h2 id="research-title" className="showcase-stage__lede" data-lang={lang}>
            {lang === "en" ? "Papers I've published." : "已发表的论文。"}
          </h2>
          <p className="showcase-stage__sub">
            {lang === "en"
              ? "Three Q1 papers on LLM evaluation, medical imaging, and dataset distillation. Each is the long answer to a question I couldn't drop."
              : "三篇 Q1 论文 — LLM 评测、医学影像、数据集蒸馏。每一篇都是放不下的一个问题的长答案。"}
          </p>
        </div>
        <div className="showcase-stage__nav">
          <button
            type="button"
            onClick={() => scroll(-1)}
            aria-label={lang === "en" ? "Previous paper" : "上一篇"}
            data-bazil-cursor
          >
            <ArrowLeft size={20} />
          </button>
          <button
            type="button"
            onClick={() => scroll(1)}
            aria-label={lang === "en" ? "Next paper" : "下一篇"}
            data-bazil-cursor
          >
            <ArrowRight size={20} />
          </button>
        </div>
      </header>

      <div className="showcase-track" ref={trackRef} role="list">
        {papers.map((p, i) => {
          const data = p[lang];
          const accent = ["#FBBF24", "#A78BFA", "#4ADE80"][i % 3];
          const cover = PAPER_COVERS[p.slug];
          return (
            <motion.article
              key={p.slug}
              className="showcase-card showcase-card--paper"
              style={{ ["--brand" as string]: accent }}
              initial={reduce ? false : { opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={reduce ? undefined : { y: -10 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ ...ENTER, delay: 0.06 * i }}
              role="listitem"
            >
              <Link href={`/research/${p.slug}`} className="showcase-card__link" data-bazil-cursor>
                <div className="showcase-card__media showcase-card__media--paper">
                  {cover ? (
                    <Image
                      src={cover}
                      alt={data.title}
                      fill
                      sizes="(max-width: 768px) 80vw, 420px"
                      className="showcase-card__img"
                    />
                  ) : null}
                  <div className="showcase-card__paper-cover">
                    <span className="showcase-card__paper-venue">{data.venue}</span>
                    <span className="showcase-card__paper-date">{data.date}</span>
                  </div>
                  <span className="showcase-card__cta" aria-hidden>
                    <ArrowUpRight size={18} />
                  </span>
                </div>
                <div className="showcase-card__caption">
                  <span className="showcase-card__meta">
                    {lang === "en" ? "RESEARCH · Q1" : "研究 · Q1"}
                  </span>
                  <h3>{data.title}</h3>
                  <p>{data.abstract}</p>
                </div>
              </Link>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}
