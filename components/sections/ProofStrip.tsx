"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import {
  GraduationCap,
  Briefcase,
  FolderGit2,
  Languages,
  Trophy,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { getContent } from "@/lib/content";
import type { ProofItem } from "@/lib/types";

const iconMap: Record<string, React.ComponentType<{ size?: number; "aria-hidden"?: boolean }>> = {
  GraduationCap,
  Briefcase,
  FolderGit2,
  Languages,
  Trophy,
};

function AnimatedNumber({ value, inView }: { value: number; inView: boolean }) {
  const [display, setDisplay] = useState(0);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      const rafId = requestAnimationFrame(() => setDisplay(value));
      return () => cancelAnimationFrame(rafId);
    }
    const duration = 1300;
    const startTime = performance.now();
    let rafId = 0;
    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [value, inView, reduce]);

  return <span>{display}</span>;
}

function ProofCard({ item, index }: { item: ProofItem; index: number }) {
  const { lang } = useI18n();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const Icon = iconMap[item.icon];
  const localized = item[lang];
  const reduce = useReducedMotion();

  return (
    <motion.div
      ref={ref}
      initial={reduce ? { opacity: 1 } : { opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay: index * 0.09, ease: [0.16, 1, 0.3, 1] }}
      className="proof-card"
    >
      <div className="proof-card__head">
        <span className="proof-card__icon" aria-hidden>
          {Icon && <Icon size={16} />}
        </span>
        <span className="proof-card__index">/0{index + 1}</span>
      </div>

      <div className="proof-card__big">
        {item.numericValue != null ? (
          <AnimatedNumber value={item.numericValue} inView={inView} />
        ) : (
          <span>{localized.value}</span>
        )}
      </div>

      <div className="proof-card__meta">
        <strong>{localized.label}</strong>
        {item.numericValue != null && <small>{localized.value}</small>}
        {item.subtitle && <em>{item.subtitle[lang]}</em>}
      </div>
    </motion.div>
  );
}

export function ProofStrip() {
  const content = getContent();
  const { lang } = useI18n();

  return (
    <section id="proof" className="proof-strip-section">
      <div className="proof-strip-shell">
        <span className="proof-strip-label">
          {lang === "en" ? "/ by the numbers" : "/ 数据一览"}
        </span>
        <div className="proof-strip-grid">
          {content.proofStrip.map((item, i) => (
            <ProofCard key={i} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
