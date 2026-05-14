"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Copy, ExternalLink, FileText } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import type { PublicationItem } from "@/lib/types";
import type { ResearchStory } from "@/lib/story-data";

function makeBibtex(publication: PublicationItem["en"], key: string) {
  return `@article{${key},
  title={${publication.title}},
  author={${publication.authors}},
  journal={${publication.venue}},
  year={${publication.date}}
}`;
}

export function ResearchStoryClient({
  publication,
  story,
}: {
  publication: PublicationItem;
  story?: ResearchStory;
}) {
  const { lang } = useI18n();
  const reduce = useReducedMotion();
  const [copied, setCopied] = useState(false);
  const paper = publication[lang];
  const accent = story?.accent ?? "#1b1b1b";
  const bibtex = makeBibtex(publication.en, story?.citationKey ?? publication.slug);

  const copyBibtex = async () => {
    try {
      await navigator.clipboard.writeText(bibtex);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  };

  return (
    <main className="research-story-page" data-lang={lang} style={{ ["--accent" as string]: accent }}>
      <section className="research-story-hero">
        <Link href="/#research" className="research-story-back">
          <ArrowLeft size={16} aria-hidden />
          {lang === "en" ? "Back to research" : "返回研究"}
        </Link>

        <motion.div
          className="research-story-hero__grid"
          initial={reduce ? { opacity: 1 } : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.48, ease: [0.16, 1, 0.3, 1] }}
        >
          <div>
            <span className="research-story-kicker">RESEARCH / PAPER</span>
            <h1>{story?.headline[lang] ?? paper.title}</h1>
            <p>{story?.question[lang] ?? paper.abstract}</p>
          </div>

          <aside className="research-story-file">
            <div className="research-story-file__chrome">
              <span />
              <span />
              <span />
            </div>
            <div className="research-story-file__paper">
              <FileText size={22} aria-hidden />
              <span>{paper.date}</span>
              <strong>{paper.venue}</strong>
            </div>
          </aside>
        </motion.div>
      </section>

      <section className="research-story-body">
        <article className="research-story-note">
          <span>{lang === "en" ? "Lab note" : "研究手记"}</span>
          <p>{story?.note[lang] ?? paper.abstract}</p>
        </article>

        <article className="research-story-panel">
          <span className="research-story-section-label">{lang === "en" ? "Abstract" : "摘要"}</span>
          <p>{paper.abstract}</p>
        </article>

        <article className="research-story-panel">
          <span className="research-story-section-label">{lang === "en" ? "My contribution" : "我的贡献"}</span>
          <ul>
            {(story?.contribution ?? []).map((item) => (
              <li key={item.en}>{item[lang]}</li>
            ))}
          </ul>
        </article>

        <article className="research-story-panel research-story-methods">
          <span className="research-story-section-label">{lang === "en" ? "Methods" : "方法关键词"}</span>
          <div>
            {(story?.methods ?? []).map((method) => (
              <span key={method}>{method}</span>
            ))}
          </div>
        </article>

        <article className="research-story-citation">
          <span className="research-story-section-label">BibTeX</span>
          <pre>{bibtex}</pre>
          <div>
            <button type="button" onClick={copyBibtex} data-bazil-cursor>
              {copied ? <Check size={16} aria-hidden /> : <Copy size={16} aria-hidden />}
              {copied ? (lang === "en" ? "Copied" : "已复制") : lang === "en" ? "Copy BibTeX" : "复制 BibTeX"}
            </button>
            {paper.link && (
              <a href={paper.link} target="_blank" rel="noopener noreferrer" data-bazil-cursor>
                DOI
                <ExternalLink size={16} aria-hidden />
              </a>
            )}
          </div>
        </article>
      </section>
    </main>
  );
}
