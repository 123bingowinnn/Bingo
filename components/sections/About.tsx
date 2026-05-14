"use client";

import type { PointerEvent } from "react";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { Education } from "@/components/sections/Education";
import { getContent } from "@/lib/content";

const BADGE_TRAITS = ["explorer", "prototyper", "storyteller", "vibe coder"];

function AboutBadge() {
  const { lang } = useI18n();
  const reduce = useReducedMotion();
  const [flipped, setFlipped] = useState(false);
  const [dragging, setDragging] = useState(false);
  const sceneRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const lastPointerRef = useRef<{ x: number; y: number } | null>(null);
  const movedRef = useRef(false);

  // Cursor-driven sway (when not dragging)
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);

  // Drag offsets (when dragging)
  const dragX = useMotionValue(0);
  const dragY = useMotionValue(0);

  // Combined target — these are smoothed
  const swayX = useSpring(cursorX, { stiffness: 90, damping: 16, mass: 0.5 });
  const swayY = useSpring(cursorY, { stiffness: 90, damping: 16, mass: 0.5 });
  const draggedX = useSpring(dragX, { stiffness: 220, damping: 22, mass: 0.6 });
  const draggedY = useSpring(dragY, { stiffness: 220, damping: 22, mass: 0.6 });

  // One connected rig: lanyard, clip, and card move together so the attachment stays believable.
  const rigRotateZ = useTransform<number, number>(
    [swayX, draggedX],
    ([s, d]) => s * 7 + d * 0.075,
  );
  const badgeOffsetX = useTransform<number, number>(
    [swayX, draggedX],
    ([s, d]) => s * 28 + d,
  );
  const badgeOffsetY = useTransform<number, number>(
    [swayY, draggedY],
    ([s, d]) => s * 12 + d,
  );
  const badgeRotateY = useTransform(swayX, [-1, 1], [-9, 9]);
  const badgeRotateX = useTransform(swayY, [-1, 1], [6, -6]);

  // Shine
  const shineX = useTransform(swayX, [-1, 1], [10, 90]);
  const shineY = useTransform(swayY, [-1, 1], [10, 90]);
  const shine = useMotionTemplate`radial-gradient(circle at ${shineX}% ${shineY}%, rgb(255 255 255 / 0.24), rgb(255 255 255 / 0.05) 30%, transparent 60%)`;

  useEffect(() => {
    const handleMove = (e: globalThis.PointerEvent) => {
      const scene = sceneRef.current;
      if (!scene) return;
      if (draggingRef.current && lastPointerRef.current) {
        const dx = e.clientX - lastPointerRef.current.x;
        const dy = e.clientY - lastPointerRef.current.y;
        if (Math.abs(dx) + Math.abs(dy) > 4) movedRef.current = true;
        const next = {
          x: Math.max(-160, Math.min(160, dragX.get() + dx)),
          y: Math.max(-60, Math.min(160, dragY.get() + dy)),
        };
        dragX.set(next.x);
        dragY.set(next.y);
        lastPointerRef.current = { x: e.clientX, y: e.clientY };
      } else {
        const rect = scene.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        if (
          e.clientX > rect.left - 240 &&
          e.clientX < rect.right + 240 &&
          e.clientY > rect.top - 100 &&
          e.clientY < rect.bottom + 200
        ) {
          cursorX.set(Math.max(-1, Math.min(1, x * 1.4)));
          cursorY.set(Math.max(-1, Math.min(1, y * 1.4)));
        } else {
          cursorX.set(0);
          cursorY.set(0);
        }
      }
    };

    const handleUp = () => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      setDragging(false);
      lastPointerRef.current = null;
      // Snap back — spring will overshoot a bit, gives the "swing" feel
      dragX.set(0);
      dragY.set(0);
    };

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    window.addEventListener("pointercancel", handleUp);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
      window.removeEventListener("pointercancel", handleUp);
    };
  }, [cursorX, cursorY, dragX, dragY]);

  const handlePointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    if (reduce) return;
    lastPointerRef.current = { x: event.clientX, y: event.clientY };
    movedRef.current = false;
    draggingRef.current = true;
    setDragging(true);
  };

  const handleClickFlip = (event: React.MouseEvent) => {
    if (movedRef.current) {
      event.preventDefault();
      return;
    }
    setFlipped((v) => !v);
  };

  return (
    <div className="about-badge-scene" ref={sceneRef}>
      <motion.div
        className="about-badge-rig"
        style={
          reduce
            ? undefined
            : {
                x: badgeOffsetX,
                y: badgeOffsetY,
                rotateZ: rigRotateZ,
                rotateX: badgeRotateX,
                rotateY: badgeRotateY,
              }
        }
      >
        <div className="about-badge-anchor" aria-hidden />
        <div className="about-badge-lanyard" aria-hidden>
          <span>BINGO · SUN</span>
          <div className="about-badge-lanyard-tip" aria-hidden />
        </div>

        <button
          type="button"
          className="about-badge"
          aria-pressed={flipped}
          aria-label={lang === "en" ? "Flip Bingo profile badge" : "翻转 Bingo 工牌"}
          data-flipped={flipped ? "true" : "false"}
          data-dragging={dragging ? "true" : "false"}
          onPointerDown={handlePointerDown}
          onClick={handleClickFlip}
        >
          <span className="about-badge-clip" aria-hidden />
          <motion.span className="about-badge-shine" style={{ background: shine }} aria-hidden />

          <div className="about-badge-inner">
            <div className="about-badge-face about-badge-face--front">
              <div className="about-badge-photo-wrap">
                <div className="about-badge-photo">
                  <Image
                    src="/images/portrait/bingo-badge-color.png"
                    alt="Bingo portrait"
                    fill
                    loading="eager"
                    sizes="(max-width: 767px) 64vw, 18vw"
                    className="about-badge-img"
                  />
                  <div className="about-badge-photo-glow" aria-hidden />
                </div>
              </div>
              <div className="about-badge-info">
                <div className="about-badge-info-head">
                  <span className="about-badge-kicker">/ ID · 2026</span>
                  <span className="about-badge-pulse" aria-hidden />
                </div>
                <h3>孙徐斌</h3>
                <p className="about-badge-name-en">Xubin &ldquo;Bingo&rdquo; Sun</p>
                <p className="about-badge-role">
                  {lang === "en"
                    ? "Product · Engineering · Research"
                    : "产品 · 工程 · 研究"}
                </p>
                <div className="about-badge-traits">
                  {BADGE_TRAITS.map((trait) => (
                    <span key={trait}>{trait}</span>
                  ))}
                </div>
                <div className="about-badge-barcode" aria-hidden>
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            </div>

            <div className="about-badge-face about-badge-face--back" aria-hidden={!flipped}>
              <div className="about-badge-back-top">
                <span className="about-badge-kicker">/ PROFILE · REVERSE</span>
                <span>2026</span>
              </div>
              <p className="about-badge-back-title">
                {lang === "en"
                  ? "Make useful things from real questions."
                  : "把真实问题，做成可用的东西。"}
              </p>
              <div className="about-badge-back-grid" aria-hidden>
                <span>
                  <small>01</small>
                  Product
                </span>
                <span>
                  <small>02</small>
                  Engineering
                </span>
                <span>
                  <small>03</small>
                  Research
                </span>
                <span>
                  <small>04</small>
                  Yale CS
                </span>
              </div>
              <div className="about-badge-back-note">
                <span>{lang === "en" ? "Heading to" : "即将入读"}</span>
                <strong>Yale CS</strong>
              </div>
              <div className="about-badge-back-stripe" aria-hidden />
            </div>
          </div>
        </button>
      </motion.div>
    </div>
  );
}

export function About() {
  const { lang } = useI18n();
  const content = getContent();
  const about = content.about[lang];

  return (
    <section id="about" className="about-section" aria-labelledby="about-title">
      <div className="about-shell">
        <motion.div
          className="about-badge-column"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
        >
          <AboutBadge />
        </motion.div>

        <motion.div
          className="about-copy"
          data-lang={lang}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.65, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="about-copy__eyebrow">{lang === "en" ? "/ ABOUT ME" : "/ 关于我"}</p>
          <h2 id="about-title" className="about-copy__headline" data-lang={lang}>
            <span>{about.headline}</span>
            <span className="about-copy__headline-accent">{about.headlineAccent}</span>
          </h2>
          <div className="about-copy__paragraphs">
            {about.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          {/* Education crest strip — nested inside the copy column so the
              two crests sit right under "今年秋天去耶鲁大学读硕士", reading
              as the visual signature of the paragraph above. */}
          <Education />
        </motion.div>
      </div>
    </section>
  );
}
