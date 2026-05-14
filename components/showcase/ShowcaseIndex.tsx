"use client";

import { useEffect, useRef, useState, type MouseEvent, type PointerEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Camera, FileText, MoveHorizontal, Sparkles } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import type { ShowcaseItem, ShowcaseMedia, ShowcasePageData } from "@/lib/showcase-data";

function MediaFrame({
  media,
  priority = false,
}: {
  media: ShowcaseMedia;
  priority?: boolean;
}) {
  const { lang } = useI18n();
  const [failed, setFailed] = useState(!media.src);
  const isPaper = media.kind === "paper";

  return (
    <figure
      className="showcase-media-frame"
      data-kind={media.kind}
      style={{ ["--accent" as string]: media.accent ?? "#1b1b1b" }}
    >
      <div className="showcase-media-frame__surface">
        {!failed && media.src ? (
          <Image
            src={media.src}
            alt=""
            fill
            priority={priority}
            sizes="(max-width: 767px) 72vw, 360px"
            className="showcase-media-frame__img"
            onError={() => setFailed(true)}
          />
        ) : (
          <div className="showcase-media-frame__fallback" aria-hidden>
            {isPaper ? <FileText size={22} /> : <Camera size={22} />}
            <span>{media.label[lang]}</span>
          </div>
        )}
      </div>
      <figcaption>
        <strong>{media.label[lang]}</strong>
        <span>{media.note[lang]}</span>
      </figcaption>
    </figure>
  );
}

function ShowcaseCard({
  item,
  index,
  archiveLabel,
}: {
  item: ShowcaseItem;
  index: number;
  archiveLabel: string;
}) {
  const { lang } = useI18n();
  const [imageFailed, setImageFailed] = useState(!item.image);
  const [videoActive, setVideoActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (videoActive) {
      video.currentTime = 0;
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [videoActive]);

  return (
    <motion.article
      className="showcase-card"
      style={{ ["--accent" as string]: item.accent, animationDelay: `${index * 90}ms` }}
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: index * 0.04 }}
      onMouseEnter={() => setVideoActive(true)}
      onMouseLeave={() => setVideoActive(false)}
    >
      <Link href={item.href} className="showcase-card__link" data-bazil-cursor>
        <div className="showcase-card__media">
          {item.video ? (
            <video
              ref={videoRef}
              src={item.video}
              muted
              loop
              playsInline
              preload="metadata"
              poster={item.image}
              className="showcase-card__video"
            />
          ) : !imageFailed && item.image ? (
            <Image
              src={item.image}
              alt=""
              fill
              sizes="(max-width: 767px) 86vw, 38vw"
              className="showcase-card__img"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <div className="showcase-card__fallback" aria-hidden>
              {item.logo ? (
                <Image src={item.logo} alt="" fill sizes="120px" className="showcase-card__logo" />
              ) : (
                <span>{item.title[lang].slice(0, 2)}</span>
              )}
            </div>
          )}
          <span className="showcase-card__shine" aria-hidden />
        </div>

        <div className="showcase-card__body">
          <span className="showcase-card__kicker">{item.kicker[lang]}</span>
          <h2>{item.title[lang]}</h2>
          <p className="showcase-card__subtitle">{item.subtitle[lang]}</p>
          <p className="showcase-card__summary">{item.summary[lang]}</p>
          <div className="showcase-card__footer">
            <span>{archiveLabel}</span>
            <ArrowUpRight size={18} aria-hidden />
          </div>
        </div>
      </Link>
    </motion.article>
  );
}

export function ShowcaseIndex({ data }: { data: ShowcasePageData }) {
  const { lang } = useI18n();
  const reduce = useReducedMotion();
  const railRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ down: false, startX: 0, startLeft: 0, moved: false });
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail || reduce) return;

    const timer = window.setInterval(() => {
      if (paused || dragRef.current.down) return;
      if (rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 12) {
        rail.scrollTo({ left: 0, behavior: "smooth" });
        return;
      }
      rail.scrollLeft += data.variant === "experience" ? 0.72 : 0.58;
    }, 18);

    return () => window.clearInterval(timer);
  }, [data.variant, paused, reduce]);

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    const rail = railRef.current;
    if (!rail) return;
    dragRef.current = {
      down: true,
      startX: event.clientX,
      startLeft: rail.scrollLeft,
      moved: false,
    };
    rail.setPointerCapture(event.pointerId);
    setPaused(true);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const rail = railRef.current;
    if (!rail || !dragRef.current.down) return;
    const delta = event.clientX - dragRef.current.startX;
    if (Math.abs(delta) > 4) dragRef.current.moved = true;
    rail.scrollLeft = dragRef.current.startLeft - delta;
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const rail = railRef.current;
    if (rail?.hasPointerCapture(event.pointerId)) rail.releasePointerCapture(event.pointerId);
    dragRef.current.down = false;
    window.setTimeout(() => setPaused(false), 900);
  };

  const handleClickCapture = (event: MouseEvent<HTMLDivElement>) => {
    if (!dragRef.current.moved) return;
    event.preventDefault();
    event.stopPropagation();
    dragRef.current.moved = false;
  };

  const archiveLabel = data.archiveLabel[lang];
  const ticker = data.ticker.length > 0 ? data.ticker : data.materials;

  return (
    <main className={`showcase-page showcase-page--${data.variant}`}>
      <section className="showcase-hero" aria-labelledby={`${data.variant}-showcase-title`}>
        <div className="showcase-hero__inner">
          <div className="showcase-hero__eyebrow">
            <span>{data.eyebrow[lang]}</span>
            <Sparkles size={15} aria-hidden />
          </div>
          <motion.h1
            id={`${data.variant}-showcase-title`}
            initial={reduce ? { opacity: 1 } : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.58, ease: [0.16, 1, 0.3, 1] }}
            data-lang={lang}
          >
            {data.title[lang]}
          </motion.h1>
          <motion.p
            initial={reduce ? { opacity: 1 } : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.58, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          >
            {data.intro[lang]}
          </motion.p>
        </div>
      </section>

      <section className="showcase-belt" aria-label={data.carouselLabel[lang]}>
        <div className="showcase-belt__top">
          <span>{data.carouselLabel[lang]}</span>
          <MoveHorizontal size={18} aria-hidden />
        </div>
        <div
          ref={railRef}
          className="showcase-belt__rail"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onClickCapture={handleClickCapture}
        >
          {data.items.map((item, index) => (
            <ShowcaseCard key={item.id} item={item} index={index} archiveLabel={archiveLabel} />
          ))}
        </div>
      </section>

      <section className="showcase-ticker" aria-label={data.tickerLabel[lang]}>
        <div className="showcase-ticker__label">{data.tickerLabel[lang]}</div>
        <div className="showcase-ticker__viewport">
          <div className="showcase-ticker__track">
            {[...ticker, ...ticker].map((media, index) => (
              <MediaFrame key={`${media.id}-${index}`} media={media} priority={index < 2} />
            ))}
          </div>
        </div>
      </section>

      <section className="showcase-explainer">
        <div className="showcase-explainer__copy">
          <span>{data.explainer.label[lang]}</span>
          <h2 data-lang={lang}>{data.explainer.title[lang]}</h2>
          <p>{data.explainer.body[lang]}</p>
        </div>
        <div className="showcase-explainer__materials" aria-hidden>
          {data.materials.map((media, index) => (
            <div key={media.id} className="showcase-material" style={{ ["--i" as string]: index }}>
              <MediaFrame media={media} />
            </div>
          ))}
        </div>
      </section>

      <section className="showcase-archive" aria-label={data.archiveLabel[lang]}>
        {data.items.map((item, index) => (
          <Link
            key={item.id}
            href={item.href}
            className="showcase-archive-row"
            style={{ ["--accent" as string]: item.accent }}
            data-bazil-cursor
          >
            <span className="showcase-archive-row__index">/{String(index + 1).padStart(2, "0")}</span>
            <span className="showcase-archive-row__title">{item.title[lang]}</span>
            <span className="showcase-archive-row__meta">{item.meta[lang]}</span>
            <span className="showcase-archive-row__tags">
              {item.tags.slice(0, 3).map((tag) => (
                <em key={tag}>{tag}</em>
              ))}
            </span>
            <ArrowUpRight size={17} aria-hidden />
          </Link>
        ))}
      </section>
    </main>
  );
}
