"use client";

import type { MouseEvent } from "react";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { HeroLogoStrip } from "@/components/sections/HeroLogoStrip";

const HERO_COPY = {
  en: {
    intro: "👋 Hi, I'm Bingo, an aspiring",
    primary: "AI Product",
    secondary: "Manager",
    locationLabel: "Currently",
    location: "Yale CS M.S. · AI-native product builder",
    destination: "",
    ctaPrimary: "View résumé",
    ctaSecondary: "Contact me",
    mobilePrimary: "Résumé",
    mobileSecondary: "Contact",
  },
  zh: {
    intro: "👋 你好，我是 Bingo，期望成为",
    primary: "AI 原生",
    secondary: "产品经理",
    locationLabel: "目前",
    location: "耶鲁计算机硕士 · 用 AI 做产品",
    destination: "",
    ctaPrimary: "查看简历",
    ctaSecondary: "联系我",
    mobilePrimary: "简历",
    mobileSecondary: "联系",
  },
} as const;

type HeroMode = "idle" | "product" | "systems" | "portrait" | "resume" | "contact";

const POSE: Record<HeroMode, { scale: number; y: number }> = {
  idle: { scale: 1, y: 0 },
  product: { scale: 1.012, y: -7 },
  systems: { scale: 1.018, y: -11 },
  portrait: { scale: 1.024, y: -14 },
  resume: { scale: 1.018, y: -9 },
  contact: { scale: 1.012, y: -5 },
};

function MotionWord({ text, delay = 0 }: { text: string; delay?: number }) {
  const reduce = useReducedMotion();

  if (reduce) return <>{text}</>;

  return (
    <>
      {Array.from(text).map((letter, index) => (
        <motion.span
          key={`${letter}-${index}`}
          className={letter === " " ? "motion-word-space inline-block" : "inline-block"}
          initial={{ y: "105%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            delay: delay + index * 0.012,
            duration: 0.72,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          {letter === " " ? " " : letter}
        </motion.span>
      ))}
    </>
  );
}

export function Hero() {
  const { lang } = useI18n();
  const copy = HERO_COPY[lang];
  const reduce = useReducedMotion();
  const [mode, setMode] = useState<HeroMode>("idle");

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const smoothX = useSpring(mouseX, { stiffness: 120, damping: 28, mass: 0.4 });
  const smoothY = useSpring(mouseY, { stiffness: 120, damping: 28, mass: 0.4 });

  const portraitX = useTransform(smoothX, [-0.5, 0.5], [-14, 14]);
  const portraitY = useTransform(smoothY, [-0.5, 0.5], [7, -10]);
  const portraitRotate = useTransform(smoothX, [-0.5, 0.5], [-0.75, 0.75]);

  const fadeUp = {
    initial: reduce ? { opacity: 1 } : { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
  };

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    if (reduce) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const target = event.target as HTMLElement | null;
    const hoveredMode = target
      ?.closest<HTMLElement>("[data-hero-hover]")
      ?.dataset.heroHover as HeroMode | undefined;
    const portrait = event.currentTarget.querySelector<HTMLElement>(".bazil-hero__portrait");
    const portraitRect = portrait?.getBoundingClientRect();
    const isOverPortrait =
      !!portraitRect &&
      event.clientX > portraitRect.left + portraitRect.width * 0.22 &&
      event.clientX < portraitRect.right - portraitRect.width * 0.18 &&
      event.clientY > portraitRect.top + portraitRect.height * 0.08 &&
      event.clientY < portraitRect.bottom - portraitRect.height * 0.06;

    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    mouseX.set(px - 0.5);
    mouseY.set(py - 0.5);
    setMode(hoveredMode ?? (isOverPortrait ? "portrait" : "idle"));
  };

  const resetHero = () => {
    mouseX.set(0);
    mouseY.set(0);
    setMode("idle");
  };

  const interactiveState = (nextMode: HeroMode) => ({
    "data-hero-hover": nextMode,
    onMouseEnter: () => setMode(nextMode),
    onMouseLeave: () => setMode("idle"),
    onFocus: () => setMode(nextMode),
    onBlur: () => setMode("idle"),
  });

  const pose = POSE[mode];

  return (
    <section id="hero" className="bazil-hero" aria-label="Bingo identity hero">
      <div
        className="bazil-hero__stage"
        data-hero-mode={mode}
        data-lang={lang}
        onMouseMove={handleMouseMove}
        onMouseLeave={resetHero}
      >
        <p className="bazil-hero__intro">{copy.intro}</p>

        <div className="bazil-hero__headline" aria-label={`${copy.primary} ${copy.secondary}`}>
          <Link
            className="bazil-hero__line bazil-hero__line--solid"
            href="/projects"
            {...interactiveState("product")}
          >
            <MotionWord text={copy.primary} delay={0.22} />
          </Link>

          <Link
            className="bazil-hero__line bazil-hero__line--outline"
            href="/experience"
            {...interactiveState("systems")}
          >
            <MotionWord text={copy.secondary} delay={0.34} />
          </Link>
        </div>

        <div className="bazil-hero__headline-ghost" aria-hidden>
          <span className="bazil-hero__ghost-line bazil-hero__ghost-line--solid">
            <MotionWord text={copy.primary} delay={0.22} />
          </span>
          <span className="bazil-hero__ghost-line bazil-hero__ghost-line--outline">
            <MotionWord text={copy.secondary} delay={0.34} />
          </span>
        </div>

        <motion.div
          initial={reduce ? { opacity: 1 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          style={
            reduce
              ? undefined
              : {
                  x: portraitX,
                  y: portraitY,
                  rotate: portraitRotate,
                }
          }
          transition={{ duration: 0.7, delay: 0.36, ease: [0.16, 1, 0.3, 1] }}
          className="bazil-hero__portrait"
          data-hero-portrait={mode}
          aria-hidden
        >
          <motion.div
            initial={reduce ? { scale: 1, y: 0, opacity: 1 } : { scale: 0.96, y: 34, opacity: 0 }}
            animate={{ scale: pose.scale, y: pose.y, opacity: 1 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="bazil-hero__portrait-pose"
          >
            <div className="bazil-hero__portrait-frame">
              <Image
                src="/images/portrait/bingo-bazil-portrait.png"
                alt=""
                fill
                priority
                sizes="(max-width: 767px) 88vw, 42vw"
                className="bazil-hero__portrait-img"
              />
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          {...fadeUp}
          transition={{ duration: 0.7, delay: 0.62, ease: [0.16, 1, 0.3, 1] }}
          className="bazil-hero__bottom"
        >
          <div className="bazil-hero__location">
            <span className="bazil-hero__meta-label">{copy.locationLabel}</span>
            <span className="bazil-hero__meta-value">{copy.location}</span>
          </div>
          <HeroLogoStrip />
        </motion.div>

        <motion.div
          {...fadeUp}
          transition={{ duration: 0.7, delay: 0.78, ease: [0.16, 1, 0.3, 1] }}
          className="bazil-hero__buttons"
        >
          <button
            type="button"
            className="bazil-cta bazil-cta--dark"
            onClick={() =>
              window.dispatchEvent(new CustomEvent("bingo:resume:open"))
            }
            {...interactiveState("resume")}
          >
            <span className="hidden sm:inline">{copy.ctaPrimary}</span>
            <span className="sm:hidden">{copy.mobilePrimary}</span>
          </button>
          <Link
            className="bazil-cta bazil-cta--ghost"
            href="/#contact"
            {...interactiveState("contact")}
            onClick={(e) => {
              // Hero contact button → smooth-scroll down to the Contact
              // section on the homepage instead of routing to /contact.
              const target = document.getElementById("contact");
              if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: "smooth", block: "start" });
                history.pushState(null, "", "#contact");
              }
            }}
          >
            <span className="hidden sm:inline">{copy.ctaSecondary}</span>
            <span className="sm:hidden">{copy.mobileSecondary}</span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
