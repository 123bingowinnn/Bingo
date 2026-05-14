"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ArrowLeft, ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { getContent } from "@/lib/content";

const ENTER = { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const };

export function Projects() {
  const { lang } = useI18n();
  const reduce = useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const projects = getContent().projects;

  const scroll = (dir: -1 | 1) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.firstElementChild as HTMLElement | null;
    const step = (card?.offsetWidth ?? 360) + 24;
    track.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  return (
    <section id="projects" className="showcase-stage" aria-labelledby="projects-title">
      <header className="showcase-stage__top">
        <div className="showcase-stage__head">
          <p className="showcase-stage__eyebrow">/ 03 · PROJECTS</p>
          <h2 id="projects-title" className="showcase-stage__lede" data-lang={lang}>
            {lang === "en" ? "Things I've built." : "我做过的东西。"}
          </h2>
          <p className="showcase-stage__sub">
            {lang === "en"
              ? "Prototypes, AI demos, research systems — five builds where the idea actually shipped."
              : "原型、AI demo、研究系统 — 五个真正交付的东西。"}
          </p>
        </div>
        <div className="showcase-stage__nav">
          <button
            type="button"
            onClick={() => scroll(-1)}
            aria-label={lang === "en" ? "Previous project" : "上一个项目"}
            data-bazil-cursor
          >
            <ArrowLeft size={20} />
          </button>
          <button
            type="button"
            onClick={() => scroll(1)}
            aria-label={lang === "en" ? "Next project" : "下一个项目"}
            data-bazil-cursor
          >
            <ArrowRight size={20} />
          </button>
        </div>
      </header>

      <div className="showcase-track" ref={trackRef} role="list">
        {projects.map((p, i) => {
          const data = p[lang];
          const accent = ["#8B7FFD", "#FF6A00", "#0B5CFF", "#86BC25", "#F472B6"][i % 5];
          return (
            <motion.article
              key={p.slug}
              className="showcase-card"
              style={{ ["--brand" as string]: accent }}
              initial={reduce ? false : { opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={reduce ? undefined : { y: -10 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ ...ENTER, delay: 0.04 * i }}
              role="listitem"
            >
              <Link href={`/projects/${p.slug}`} className="showcase-card__link" data-bazil-cursor>
                <div className="showcase-card__media">
                  {p.image ? (
                    <Image
                      src={p.image}
                      alt={data.title}
                      fill
                      sizes="(max-width: 768px) 80vw, 420px"
                      className="showcase-card__img"
                    />
                  ) : (
                    <span className="showcase-card__placeholder">{data.title}</span>
                  )}
                  {p.featured && (
                    <span className="showcase-card__tag">
                      {lang === "en" ? "Featured" : "精选"}
                    </span>
                  )}
                  <span className="showcase-card__cta" aria-hidden>
                    <ArrowUpRight size={18} />
                  </span>
                </div>
                <div className="showcase-card__caption">
                  <span className="showcase-card__meta">{p.tags.join(" · ")}</span>
                  <h3>{data.title}</h3>
                  <p>{data.summary}</p>
                </div>
              </Link>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}
