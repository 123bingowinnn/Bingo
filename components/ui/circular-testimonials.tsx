"use client";

import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
} from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface Facet {
  /** The quote/statement displayed as the main paragraph */
  quote: string;
  /** Headline above the quote (e.g. the person's name, or a label) */
  name: string;
  /** Small caption under the name (e.g. designation / role) */
  designation: string;
  /** Path to the photo shown in the rotating stack */
  src: string;
}

interface CircularTestimonialsProps {
  testimonials: Facet[];
  autoplay?: boolean;
  /** Override the default autoplay interval (ms) */
  intervalMs?: number;
  /** Optional slot rendered inside the right-hand column, directly under
      the prev/next arrows. Used by the Contact section to keep the
      contact-method pills tightly anchored to the carousel controls. */
  footerSlot?: React.ReactNode;
}

/** Splits a mixed CJK/Latin string at script boundaries and wraps the
    Latin runs in a span so CSS can downsize them to match Chinese-character
    height. Without this, "AI 产品" renders Latin "AI" in the serif's tall
    caps and Chinese "产品" in NSC's CJK height — they don't share a
    baseline and the line looks broken. */
function renderMixedScript(text: string) {
  if (!text) return null;
  const parts = text.split(
    /(?<=[　-鿿])(?=[A-Za-z])|(?<=[A-Za-z])(?=[　-鿿])/,
  );
  return parts.map((part, i) => {
    const isLatin = /^[A-Za-z]/.test(part);
    return isLatin ? (
      <span key={i} className="latin-inline">
        {part}
      </span>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    );
  });
}

function calculateGap(width: number) {
  const minWidth = 1024;
  const maxWidth = 1456;
  const minGap = 60;
  const maxGap = 86;
  if (width <= minWidth) return minGap;
  if (width >= maxWidth)
    return Math.max(minGap, maxGap + 0.06018 * (width - maxWidth));
  return (
    minGap + (maxGap - minGap) * ((width - minWidth) / (maxWidth - minWidth))
  );
}

export function CircularTestimonials({
  testimonials,
  autoplay = true,
  intervalMs = 6000,
  footerSlot,
}: CircularTestimonialsProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [containerWidth, setContainerWidth] = useState(1200);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const autoplayIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );

  const testimonialsLength = useMemo(
    () => testimonials.length,
    [testimonials],
  );
  const activeTestimonial = useMemo(
    () => testimonials[activeIndex],
    [activeIndex, testimonials],
  );

  // Responsive gap calc for the 3D fan-out
  useEffect(() => {
    function handleResize() {
      if (imageContainerRef.current) {
        setContainerWidth(imageContainerRef.current.offsetWidth);
      }
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Autoplay
  useEffect(() => {
    if (!autoplay) return;
    autoplayIntervalRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonialsLength);
    }, intervalMs);
    return () => {
      if (autoplayIntervalRef.current)
        clearInterval(autoplayIntervalRef.current);
    };
  }, [autoplay, intervalMs, testimonialsLength]);

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % testimonialsLength);
    if (autoplayIntervalRef.current) clearInterval(autoplayIntervalRef.current);
  }, [testimonialsLength]);

  const handlePrev = useCallback(() => {
    setActiveIndex(
      (prev) => (prev - 1 + testimonialsLength) % testimonialsLength,
    );
    if (autoplayIntervalRef.current) clearInterval(autoplayIntervalRef.current);
  }, [testimonialsLength]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handlePrev, handleNext]);

  // Compute 3D transforms for each card in the fan-out
  function getImageStyle(index: number): React.CSSProperties {
    const gap = calculateGap(containerWidth);
    const stickUp = gap * 0.8;
    const isActive = index === activeIndex;
    const isLeft =
      (activeIndex - 1 + testimonialsLength) % testimonialsLength === index;
    const isRight = (activeIndex + 1) % testimonialsLength === index;

    if (isActive) {
      return {
        zIndex: 3,
        opacity: 1,
        pointerEvents: "auto",
        transform: `translate3d(0, 0, 0) scale(1) rotateY(0deg)`,
        transition: "all 0.8s cubic-bezier(.4,2,.3,1)",
      };
    }
    if (isLeft) {
      return {
        zIndex: 2,
        opacity: 1,
        pointerEvents: "auto",
        transform: `translate3d(-${gap}px, -${stickUp}px, 0) scale(0.85) rotateY(14deg)`,
        transition: "all 0.8s cubic-bezier(.4,2,.3,1)",
      };
    }
    if (isRight) {
      return {
        zIndex: 2,
        opacity: 1,
        pointerEvents: "auto",
        transform: `translate3d(${gap}px, -${stickUp}px, 0) scale(0.85) rotateY(-14deg)`,
        transition: "all 0.8s cubic-bezier(.4,2,.3,1)",
      };
    }
    return {
      zIndex: 1,
      opacity: 0,
      pointerEvents: "none",
      transition: "all 0.8s cubic-bezier(.4,2,.3,1)",
    };
  }

  const quoteVariants = {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -12 },
  };

  return (
    <div className="circular-testimonials">
      <div className="circular-testimonials__grid">
        {/* Rotating image stack */}
        <div className="circular-testimonials__images" ref={imageContainerRef}>
          {testimonials.map((t, index) => (
            <div
              key={t.src}
              className="circular-testimonials__image"
              data-index={index}
              style={getImageStyle(index)}
              aria-hidden={index !== activeIndex}
            >
              <Image
                src={t.src}
                alt={t.name}
                fill
                sizes="(max-width: 768px) 80vw, 360px"
                className="circular-testimonials__img"
                priority={index < 2}
              />
            </div>
          ))}
        </div>

        {/* Text + nav */}
        <div className="circular-testimonials__content">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              variants={quoteVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            >
              <h3 className="circular-testimonials__name">
                {renderMixedScript(activeTestimonial.name)}
              </h3>
              <p className="circular-testimonials__designation">
                {activeTestimonial.designation}
              </p>
              <p className="circular-testimonials__quote">
                {activeTestimonial.quote.split(" ").map((word, i) => (
                  <motion.span
                    key={`${activeIndex}-${i}`}
                    initial={{ filter: "blur(8px)", opacity: 0, y: 4 }}
                    animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.22,
                      ease: "easeOut",
                      delay: 0.02 * i,
                    }}
                    style={{ display: "inline-block" }}
                  >
                    {word}&nbsp;
                  </motion.span>
                ))}
              </p>
            </motion.div>
          </AnimatePresence>

          <div className="circular-testimonials__arrows">
            <button
              type="button"
              onClick={handlePrev}
              className="circular-testimonials__arrow"
              aria-label="Previous"
              data-bazil-cursor
            >
              <ArrowLeft size={20} strokeWidth={2} />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="circular-testimonials__arrow"
              aria-label="Next"
              data-bazil-cursor
            >
              <ArrowRight size={20} strokeWidth={2} />
            </button>
          </div>

          {footerSlot ? (
            <div className="circular-testimonials__footer">{footerSlot}</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default CircularTestimonials;
