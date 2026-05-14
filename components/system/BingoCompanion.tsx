"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { MessageCircle, Minus, Sparkles } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const SECTION_COPY = {
  en: {
    hero: "Start with the big picture.",
    about: "A little more human than a resume.",
    experience: "Zoom is the densest story here.",
    research: "Three papers, mostly AI and medical imaging.",
    contact: "Good place to say hi.",
  },
  zh: {
    hero: "先看整体气质。",
    about: "这里比简历更像一个人。",
    experience: "Zoom 这段信息量最大。",
    research: "三篇论文，主要是 AI 和医学影像。",
    contact: "这里可以直接联系我。",
  },
} as const;

const ACTIONS = {
  en: [
    { label: "Resume", href: "/resume" },
    { label: "Internships", href: "#experience" },
    { label: "Research", href: "#research" },
    { label: "Contact", href: "/contact" },
  ],
  zh: [
    { label: "简历", href: "/resume" },
    { label: "实习", href: "#experience" },
    { label: "研究", href: "#research" },
    { label: "联系", href: "/contact" },
  ],
} as const;

export function BingoCompanion() {
  const { lang } = useI18n();
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [section, setSection] = useState<keyof (typeof SECTION_COPY)["en"]>("hero");
  const actions = ACTIONS[lang];
  const message = useMemo(() => SECTION_COPY[lang][section], [lang, section]);
  const isHome = pathname === "/";

  useEffect(() => {
    if (!isHome) return;

    const ids = ["hero", "about", "experience", "research", "contact"];
    const nodes = ids
      .map((id) => document.getElementById(id))
      .filter((node): node is HTMLElement => Boolean(node));

    if (!nodes.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) {
          setSection(visible.target.id as keyof (typeof SECTION_COPY)["en"]);
        }
      },
      { threshold: [0.28, 0.45, 0.62] },
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [isHome]);

  if (!isHome) return null;

  return (
    <div className="bingo-companion no-print" data-open={open ? "true" : "false"}>
      <AnimatePresence>
        {(open || section !== "hero") && (
          <motion.div
            className="bingo-companion__bubble"
            initial={reduce ? { opacity: 1 } : { opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            className="bingo-companion__panel"
            initial={reduce ? { opacity: 1 } : { opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="bingo-companion__panel-head">
              <span>{lang === "en" ? "Bingo guide" : "Bingo 导航"}</span>
              <button type="button" onClick={() => setOpen(false)} aria-label={lang === "en" ? "Close guide" : "关闭导航"}>
                <Minus size={15} aria-hidden />
              </button>
            </div>
            <div className="bingo-companion__actions">
              {actions.map((action) => (
                <a key={action.href} href={action.href}>
                  {action.label}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        className="bingo-companion__avatar"
        aria-expanded={open}
        aria-label={lang === "en" ? "Open Bingo guide" : "打开 Bingo 导航"}
        onClick={() => setOpen((value) => !value)}
        data-bazil-cursor
      >
        <span className="bingo-companion__mark" aria-hidden>
          <span />
        </span>
        {open ? <MessageCircle size={18} aria-hidden /> : <Sparkles size={18} aria-hidden />}
      </button>
    </div>
  );
}
