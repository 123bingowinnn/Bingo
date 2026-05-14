"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Check, Copy, ExternalLink, FileText } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { getContent } from "@/lib/content";

function makeCitation(authors: string, date: string, title: string, venue: string) {
  return `${authors} (${date}). ${title}. ${venue}.`;
}

// Hand-written "why I did this" notes per paper
const WHY_NOTES: Record<string, { en: string; zh: string }> = {
  "llm-negative-rejection": {
    en: "Started this because I wanted to know when LLMs *should* say 'I don't know.'",
    zh: "起因是想知道大模型在什么时候 *应该* 说\"我不知道\"。",
  },
  "pathmnist-paper": {
    en: "Cancer pathology slides are easy to attack — and that scared me.",
    zh: "病理切片太容易被对抗攻击 — 这点让我害怕。",
  },
  "octmnist-paper": {
    en: "How small can a medical dataset get and still be useful — without leaking patient identity?",
    zh: "医学数据集能多小还有用 — 又不泄露病人身份?",
  },
};

export function ResearchDesk() {
  const { lang } = useI18n();
  const reduce = useReducedMotion();
  const content = getContent();
  const publications = useMemo(() => content.publications, [content.publications]);
  const [activeSlug, setActiveSlug] = useState(publications[0]?.slug ?? "");
  const [copied, setCopied] = useState(false);
  const active = publications.find((paper) => paper.slug === activeSlug) ?? publications[0];

  if (!active) return null;

  const paper = active[lang];
  const note = WHY_NOTES[active.slug]?.[lang];
  const citation = makeCitation(paper.authors, paper.date, paper.title, paper.venue);

  const copyCitation = async () => {
    try {
      await navigator.clipboard.writeText(citation);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section id="research" className="research-desk-section" aria-labelledby="research-title">
      <div className="folio-section-label">RESEARCH / 04</div>
      <div className="research-desk-shell">
        <div className="research-desk-heading">
          <p>{lang === "en" ? "Papers are where I slow down." : "研究，是我把问题想慢一点的地方。"}</p>
          <h2 id="research-title" data-lang={lang}>
            {lang === "en" ? (
              <>
                Language models,<br />
                medical imaging, <em>and trust.</em>
              </>
            ) : (
              <>
                大语言模型、医学影像，<br />
                以及 <em>值得被信任的系统</em>。
              </>
            )}
          </h2>
        </div>

        <div className="research-desk">
          <div
            className="research-stack"
            role="tablist"
            aria-label={lang === "en" ? "Research papers" : "研究论文"}
          >
            <span className="research-stack__eyebrow">
              {lang === "en" ? `${publications.length} papers` : `共 ${publications.length} 篇`}
            </span>
            {publications.map((publication, index) => {
              const item = publication[lang];
              const selected = publication.slug === active.slug;
              return (
                <button
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  className="research-paper-tab"
                  data-active={selected ? "true" : "false"}
                  key={publication.slug}
                  onClick={() => setActiveSlug(publication.slug)}
                >
                  <span className="research-paper-tab__page" aria-hidden>
                    <span className="research-paper-tab__corner" />
                    <FileText size={16} />
                  </span>
                  <span className="research-paper-tab__meta">
                    <small>
                      {String(index + 1).padStart(2, "0")} · {item.date}
                    </small>
                    <strong>{item.title}</strong>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="research-preview">
            <div className="research-preview__chrome" aria-hidden>
              <span className="research-preview__chrome-dot" />
              <span className="research-preview__chrome-dot" />
              <span className="research-preview__chrome-dot" />
              <span className="research-preview__chrome-title">
                {paper.title.length > 60 ? `${paper.title.slice(0, 58)}…` : paper.title}
              </span>
            </div>
            <AnimatePresence mode="wait">
              <motion.article
                key={active.slug}
                initial={reduce ? { opacity: 1 } : { opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, y: -12 }}
                transition={{ duration: 0.36, ease: [0.16, 1, 0.3, 1] }}
                className="research-preview__inner"
              >
                <div className="research-preview__paper">
                  <span className="research-preview__date">{paper.date}</span>
                  <h3>{paper.title}</h3>
                  <p className="research-preview__venue">{paper.venue}</p>
                  <p className="research-preview__authors">{paper.authors}</p>
                </div>

                {note && (
                  <div className="research-preview__note" aria-label="Why I did this">
                    <span>{lang === "en" ? "Why I did this" : "为什么我做这个"}</span>
                    <p>{note}</p>
                  </div>
                )}

                <div className="research-preview__abstract">
                  <span className="research-preview__abstract-label">
                    {lang === "en" ? "Abstract" : "摘要"}
                  </span>
                  <p>{paper.abstract}</p>
                </div>

                <div className="research-preview__actions">
                  <Link href={`/research/${active.slug}`} data-bazil-cursor>
                    {lang === "en" ? "Open research file" : "打开研究档案"}
                    <ExternalLink size={16} aria-hidden />
                  </Link>
                  <button type="button" onClick={copyCitation} data-bazil-cursor>
                    {copied ? <Check size={16} aria-hidden /> : <Copy size={16} aria-hidden />}
                    {copied
                      ? lang === "en"
                        ? "Copied"
                        : "已复制"
                      : lang === "en"
                      ? "Copy citation"
                      : "复制引用"}
                  </button>
                  {paper.link && (
                    <a href={paper.link} target="_blank" rel="noopener noreferrer" data-bazil-cursor>
                      DOI
                      <ExternalLink size={16} aria-hidden />
                    </a>
                  )}
                </div>
              </motion.article>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
