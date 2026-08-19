"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "@/lib/i18n";

type Stop = {
  slug: string;
  /** Position in the loop as a ratio of total duration (0..1). 0 = Stop 01 boat-at-Pearl-Tower. */
  timeRatio: number;
  /** Hint marker position on the 16:9 canvas, in percent (0–100) */
  pos: { x: number; y: number };
  /** Where the popcard appears relative to the hint */
  popDir: "below" | "above";
  brand: string;
  city: { en: string; zh: string };
  company: { en: string; zh: string };
  period: { en: string; zh: string };
  tagline: { en: string; zh: string };
  mainPhoto: string;
  mainAlt: { en: string; zh: string };
  /** Extra photos used as layered glass cards peeking behind the main one on hover.
      Empty array = single-card popcard with a brand-tinted back plate. */
  extraPhotos: string[];
  /** Role title shown as a small caption under the photo in the popcard */
  role: { en: string; zh: string };
  /** Path to a logo file rendered inside the hint pill. Null = use shortName text only. */
  logo: string | null;
  /** Short, brand-safe name for the hint pill label */
  shortName: { en: string; zh: string };
};

const STOPS: Stop[] = [
  {
    slug: "penghui-bigdata",
    timeRatio: 0,
    pos: { x: 15, y: 31 },
    popDir: "below",
    brand: "#3F7CAC",
    city: { en: "Shanghai", zh: "上海" },
    company: { en: "Penghui", zh: "朋辉科技" },
    period: { en: "Jun — Sep 2024", zh: "2024.06 — 09" },
    tagline: { en: "Big Data · first AI build", zh: "大数据 · 第一次做 AI" },
    mainPhoto: "/images/internships/penghui-bigdata/01-feishu.jpg",
    mainAlt: {
      en: "Bingo's Feishu profile at Shoulu Hotel Group, Shanghai 2024",
      zh: "孙徐斌 · 首旅酒店集团 · 飞书,上海 2024",
    },
    extraPhotos: ["/images/internships/penghui-bigdata/02-bellanapoli.jpg"],
    role: { en: "Big Data Intern", zh: "大数据实习生" },
    logo: null,
    shortName: { en: "Penghui", zh: "朋辉" },
  },
  {
    slug: "deloitte-backend",
    timeRatio: 0.2,
    pos: { x: 34, y: 77 },
    popDir: "above",
    brand: "#86BC25",
    city: { en: "Hangzhou", zh: "杭州" },
    company: { en: "Deloitte", zh: "德勤" },
    period: { en: "Apr — Jul 2025", zh: "2025.04 — 07" },
    tagline: { en: "Backend with a product hat", zh: "戴产品帽的后端" },
    mainPhoto: "/images/internships/deloitte-backend/cover.jpg",
    mainAlt: {
      en: "Deloitte Hangzhou meeting room overlooking the Qiantang River",
      zh: "德勤杭州办公室,会议室望向钱塘江",
    },
    extraPhotos: [
      "/images/internships/deloitte-backend/01.jpg",
      "/images/internships/deloitte-backend/02.jpg",
    ],
    role: {
      en: "Backend Engineer · SAP Project",
      zh: "Java 后端开发 · SAP 项目",
    },
    logo: "/images/logos/deloitte.svg",
    shortName: { en: "Deloitte", zh: "德勤" },
  },
  {
    slug: "alibaba-cloud",
    timeRatio: 0.4,
    pos: { x: 67, y: 76 },
    popDir: "above",
    brand: "#FF6A00",
    city: { en: "Hangzhou", zh: "杭州" },
    company: { en: "Alibaba Cloud", zh: "阿里云" },
    period: { en: "Jul — Oct 2025", zh: "2025.07 — 10" },
    tagline: { en: "Dataphin · 50+ demos shipped", zh: "Dataphin · 50+ 演示走出海" },
    mainPhoto: "/images/internships/alibaba-cloud/cover.jpg",
    mainAlt: {
      en: "Alibaba campus at night, Xixi Hangzhou",
      zh: "阿里巴巴西溪园区夜景",
    },
    extraPhotos: [
      "/images/internships/alibaba-cloud/01.jpg",
      "/images/internships/alibaba-cloud/02-desk.jpg",
    ],
    role: {
      en: "Product Operations Intern · Dataphin",
      zh: "Dataphin 产品运营实习生",
    },
    logo: "/images/logos/alibaba-cloud.svg",
    shortName: { en: "Alibaba", zh: "阿里云" },
  },
  {
    slug: "zoom-pm",
    timeRatio: 0.6,
    pos: { x: 87, y: 31 },
    popDir: "below",
    brand: "#0B5CFF",
    city: { en: "Hangzhou", zh: "杭州" },
    company: { en: "Zoom", zh: "Zoom" },
    period: { en: "Dec 2025 — May 2026", zh: "2025.12 — 2026.05" },
    tagline: { en: "AI Product · from zero to one", zh: "AI 产品 · 从 0 到 1" },
    mainPhoto: "/images/internships/zoom-pm/cover.jpg",
    mainAlt: {
      en: "Workstation with Zoom Present AI on screen",
      zh: "工位,屏幕上是 Zoom Present AI",
    },
    extraPhotos: [
      "/images/internships/zoom-pm/01.jpg",
      "/images/internships/zoom-pm/02.jpg",
    ],
    role: {
      en: "AI Product Manager Intern",
      zh: "AI 产品经理实习生",
    },
    logo: "/images/logos/zoom.svg",
    shortName: { en: "Zoom", zh: "Zoom" },
  },
  {
    slug: "ant-group-ai-pm",
    timeRatio: 0.8,
    pos: { x: 55, y: 24 },
    popDir: "below",
    brand: "#1677FF",
    city: { en: "Hangzhou", zh: "杭州" },
    company: { en: "Ant Group", zh: "蚂蚁集团" },
    period: { en: "Jun 2026 — Present", zh: "2026.06 — 至今" },
    tagline: { en: "AI Product · in progress", zh: "AI 产品 · 进行中" },
    mainPhoto: "/images/internships/ant-group-ai-pm/badge.jpg",
    mainAlt: {
      en: "Bingo's Ant Group intern badge",
      zh: "孙徐斌的蚂蚁集团实习工牌",
    },
    extraPhotos: [
      "/images/internships/ant-group-ai-pm/team-cake.jpg",
      "/images/internships/ant-group-ai-pm/desk-calendar.jpg",
    ],
    role: { en: "AI Product Intern", zh: "AI 产品实习生" },
    logo: "/images/logos/ant-group.png",
    shortName: { en: "Ant", zh: "蚂蚁" },
  },
];

/** Tolerance (s) for "reached target — pause here" detection */
const TARGET_TOLERANCE = 0.12;
/** Forward playback rate via native play() */
const PLAYBACK_RATE = 1.5;
/** Reverse pseudo-rate (seconds of video per real second) for currentTime tweening */
const REVERSE_RATE = 1.5;

export function Internships() {
  const { lang } = useI18n();
  const videoRef = useRef<HTMLVideoElement>(null);
  const targetTimeRef = useRef(0);
  const [hovered, setHovered] = useState<string | null>(null);

  // Preload back-layer photos on mount so the first hover doesn't pay
  // the decode cost — that was the residual "switch stutter" the user saw.
  useEffect(() => {
    STOPS.forEach((stop) => {
      stop.extraPhotos.forEach((src) => {
        const img = new window.Image();
        img.src = src;
      });
      const main = new window.Image();
      main.src = stop.mainPhoto;
    });
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.playbackRate = PLAYBACK_RATE;

    // Seek to frame 0 once metadata is ready, then pause (we're at Stop 01).
    const seekStart = () => {
      try {
        video.currentTime = 0;
      } catch {}
      video.pause();
    };
    if (video.readyState >= 1) seekStart();
    else video.addEventListener("loadedmetadata", seekStart, { once: true });

    let rafId = 0;
    let inReverse = false;
    let lastReverseWrite = 0;
    /** Writing `video.currentTime` triggers a decoder seek and is one of the
        most expensive things you can do in a tight loop. Throttle to ~33ms
        (≈30fps) instead of every rAF (~60fps) — visually still smooth,
        cuts the main-thread cost in half. */
    const REVERSE_WRITE_INTERVAL_MS = 33;

    const tick = (now: number) => {
      if (
        video.duration &&
        !isNaN(video.duration) &&
        video.readyState >= 2
      ) {
        const duration = video.duration;
        const current = video.currentTime;
        const target = targetTimeRef.current;

        // Shortest signed path on the loop: [-duration/2, +duration/2]
        let delta = target - current;
        if (delta > duration / 2) delta -= duration;
        if (delta < -duration / 2) delta += duration;

        if (Math.abs(delta) < TARGET_TOLERANCE) {
          // At target — pause and snap.
          inReverse = false;
          if (!video.paused) {
            video.pause();
            try {
              video.currentTime = target;
            } catch {}
          }
        } else if (delta > 0) {
          // Forward is shorter — let the native decoder do the work.
          inReverse = false;
          if (video.paused) {
            video.play().catch(() => {});
          }
        } else {
          // Backward — pause native play and tween currentTime, throttled.
          if (!video.paused) video.pause();
          if (!inReverse) {
            inReverse = true;
            lastReverseWrite = now; // fresh start; no stale elapsed jump
          }
          const elapsed = now - lastReverseWrite;
          if (elapsed >= REVERSE_WRITE_INTERVAL_MS) {
            let next = current - REVERSE_RATE * (elapsed / 1000);
            if (next < 0) next += duration;
            try {
              video.currentTime = next;
            } catch {}
            lastReverseWrite = now;
          }
        }
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      video.pause();
    };
  }, []);

  const onHintEnter = (stop: Stop) => {
    setHovered(stop.slug);
    const video = videoRef.current;
    const duration = video?.duration && !isNaN(video.duration) ? video.duration : 20;
    targetTimeRef.current = stop.timeRatio * duration;
  };

  const onHintLeave = () => {
    setHovered(null);
    // Don't change targetTime — boat stays where it is until next hover.
  };

  return (
    <section
      id="experience"
      className="trail-stage"
      aria-labelledby="internships-title"
    >
      <header className="trail-stage__head">
        <p className="trail-stage__eyebrow">
          {lang === "en" ? "/ INTERNSHIPS" : "/ 实习"}
        </p>
        <h2
          id="internships-title"
          className="trail-stage__lede"
          data-lang={lang}
        >
          {lang === "en" ? "The trail." : "实习地图。"}
        </h2>
        <p className="trail-stage__sub">
          {lang === "en"
            ? "Five teams. Two cities."
            : "五家公司,两座城市。"}
        </p>
      </header>

      <div className="trail-window">
        {/* Mac-style window chrome */}
        <header className="trail-window__chrome" aria-hidden>
          <span className="trail-window__dots">
            <span className="trail-window__dot trail-window__dot--close" />
            <span className="trail-window__dot trail-window__dot--min" />
            <span className="trail-window__dot trail-window__dot--max" />
          </span>
          <span className="trail-window__title">
            internship-trail · 2024 — 2026
          </span>
          <span className="trail-window__spacer" />
        </header>

        <div className="trail-window__body">
          <video
            ref={videoRef}
            className="trail-video"
            src="/videos/internship-trail/full-loop-v2.mp4"
            muted
            playsInline
            preload="auto"
            aria-hidden
          />

          {STOPS.map((stop, index) => {
            const isActive = hovered === stop.slug;
            // Photo pops to the opposite side of the canvas the card sits on
            const side: "left" | "right" = stop.pos.x < 50 ? "right" : "left";
            const slideFrom = side === "right" ? -16 : 16;
            // Stack of layered glass cards behind the main photo. Cap at 2 extras
            // so the burst stays readable. Stops without extra photos render
            // a brand-tinted glass plate instead so every card has the same depth.
            const backLayers = stop.extraPhotos.slice(0, 2);
            const stackDirection = side === "right" ? 1 : -1; // back cards peek toward the far side
            return (
              <div
                key={stop.slug}
                className="trail-stop"
                data-state={isActive ? "active" : "idle"}
                style={{
                  left: `${stop.pos.x}%`,
                  top: `${stop.pos.y}%`,
                  ["--brand" as string]: stop.brand,
                }}
                onPointerEnter={() => onHintEnter(stop)}
                onPointerLeave={onHintLeave}
              >
                {/* Glass title card — always visible, holds company identity */}
                <button
                  type="button"
                  className="trail-card"
                  aria-label={`${stop.company[lang]} — ${stop.period[lang]}`}
                  data-bazil-cursor
                >
                  <span className="trail-card__logo" aria-hidden>
                    {stop.logo ? (
                      <Image
                        src={stop.logo}
                        alt=""
                        fill
                        sizes="34px"
                        className="trail-card__logo-img"
                      />
                    ) : (
                      <span className="trail-card__initial">
                        {stop.shortName[lang].charAt(0)}
                      </span>
                    )}
                  </span>
                  <span className="trail-card__body">
                    <span className="trail-card__name">
                      {stop.company[lang]}
                    </span>
                    <span className="trail-card__city">{stop.city[lang]}</span>
                  </span>
                </button>

                {/* Glass photo card — pops out to left/right on hover */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      className="trail-popcard"
                      data-side={side}
                      initial={{ opacity: 0, x: slideFrom, y: "-50%", scale: 0.97 }}
                      animate={{ opacity: 1, x: 0, y: "-50%", scale: 1 }}
                      exit={{ opacity: 0, x: slideFrom * 0.5, y: "-50%", scale: 0.97 }}
                      transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <Link
                        href={`/experience#${stop.slug}`}
                        className="trail-popcard__link"
                        aria-label={`${stop.company[lang]} — ${stop.period[lang]}`}
                      >
                        <div
                          className="trail-popcard__stack"
                          style={{ ["--stack-dir" as string]: stackDirection }}
                        >
                          {/* Back layers — extra photos peek out behind the main card.
                              If there are no extras we render an empty glass plate so
                              every popcard has the same layered depth. */}
                          {backLayers.length === 0 ? (
                            <span
                              className="trail-popcard__back"
                              data-depth="1"
                              data-empty="true"
                              aria-hidden
                            />
                          ) : (
                            backLayers.map((src, i) => (
                              <span
                                key={src}
                                className="trail-popcard__back"
                                data-depth={i + 1}
                                aria-hidden
                              >
                                <Image
                                  src={src}
                                  alt=""
                                  fill
                                  sizes="200px"
                                  className="trail-popcard__back-img"
                                />
                              </span>
                            ))
                          )}
                          <div className="trail-popcard__photo">
                            <Image
                              src={stop.mainPhoto}
                              alt={stop.mainAlt[lang]}
                              fill
                              sizes="280px"
                              className="trail-popcard__img"
                              priority={index < 2}
                            />
                            <span className="trail-popcard__ring" aria-hidden />
                          </div>
                        </div>
                        <span className="trail-popcard__role">
                          {stop.role[lang]}
                        </span>
                        <span className="trail-popcard__period">
                          {stop.period[lang]}
                        </span>
                        <span className="trail-popcard__cta">
                          <span className="trail-popcard__cta-label">
                            {lang === "en" ? "View details" : "查看详情"}
                          </span>
                          <ArrowUpRight size={13} strokeWidth={2.4} />
                        </span>
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
