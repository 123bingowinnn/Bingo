"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import gsap from "gsap";

export interface CardItem {
  imgUrl: string;
  alt?: string;
  linkUrl?: string;
}

interface CardFanCarouselProps {
  cards: CardItem[];
}

const MAX_VISIBLE = 7;
const HALF = 3;
const FAN_POSITIONS = [
  { rot: -21, scale: 0.7756, x: -30, y: 7.3, zIndex: 1 },
  { rot: -14, scale: 0.8498, x: -22, y: 4, zIndex: 2 },
  { rot: -7, scale: 0.9346, x: -11, y: 1.3, zIndex: 3 },
  { rot: 0, scale: 1, x: 0, y: 0, zIndex: 10 },
  { rot: 7, scale: 0.9346, x: 11, y: 1.3, zIndex: 3 },
  { rot: 14, scale: 0.8498, x: 22, y: 4, zIndex: 2 },
  { rot: 21, scale: 0.7756, x: 30, y: 7.3, zIndex: 1 },
];

function getResponsiveMultiplier(width: number) {
  if (width < 480) return 0.28;
  if (width < 640) return 0.38;
  if (width < 768) return 0.5;
  if (width < 1024) return 0.75;
  return 1;
}

function getHeightMultiplier(width: number) {
  let idealPx: number;
  if (width < 480) idealPx = 352;
  else if (width < 640) idealPx = 416;
  else if (width < 768) idealPx = 448;
  else if (width < 1024) idealPx = 544;
  else idealPx = 608;

  const available = window.innerHeight * 0.7;
  return available >= idealPx ? 1 : available / idealPx;
}

function getSlotConfig(totalCards: number, slot: number) {
  if (totalCards >= MAX_VISIBLE) return FAN_POSITIONS[slot];
  const center = (totalCards - 1) / 2;
  const distance = totalCards > 1 ? (slot - center) / center : 0;
  const absDistance = Math.abs(distance);
  return {
    rot: distance * 21,
    scale: 1 - 0.2244 * absDistance * absDistance,
    x: distance * 30,
    y: absDistance * absDistance * 7.3,
    zIndex: 10 - Math.abs(slot - center),
  };
}

export default function CardFanCarousel({ cards }: CardFanCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isAnimating = useRef(false);
  const hasEntered = useRef(false);
  const directionRef = useRef<"left" | "right" | null>(null);
  const prevVisible = useRef<Set<number>>(new Set());
  const totalCards = cards.length;
  const needsPagination = totalCards > MAX_VISIBLE;
  const [centerIndex, setCenterIndex] = useState(
    needsPagination ? HALF : totalCards >> 1,
  );

  const getVisibleMap = useCallback(
    (center: number) => {
      const map = new Map<number, number>();
      if (!needsPagination) {
        cards.forEach((_, index) => map.set(index, index));
        return map;
      }
      for (let slot = 0; slot < MAX_VISIBLE; slot += 1) {
        map.set(
          ((center + slot - HALF) % totalCards + totalCards) % totalCards,
          slot,
        );
      }
      return map;
    },
    [cards, needsPagination, totalCards],
  );

  const cycle = useCallback(
    (direction: "left" | "right") => {
      if (isAnimating.current || !needsPagination) return;
      isAnimating.current = true;
      directionRef.current = direction;
      setCenterIndex((previous) =>
        direction === "right"
          ? (previous + 1) % totalCards
          : (previous - 1 + totalCards) % totalCards,
      );
    },
    [needsPagination, totalCards],
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !totalCards) return;
    const cardElements = Array.from(
      container.querySelectorAll<HTMLElement>(".fan-card"),
    );
    if (!cardElements.length) return;

    const visibleMap = getVisibleMap(centerIndex);
    const previouslyVisible = prevVisible.current;
    const direction = directionRef.current;
    const isFirstMount = !hasEntered.current;
    const multiplier = getResponsiveMultiplier(window.innerWidth);
    const heightMultiplier = getHeightMultiplier(window.innerWidth);
    const slotCount = needsPagination ? MAX_VISIBLE : totalCards;
    const config = (slot: number) => getSlotConfig(slotCount, slot);
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (isFirstMount) isAnimating.current = true;
    let completedCount = 0;
    const onCardDone = () => {
      completedCount += 1;
      if (completedCount >= visibleMap.size) {
        isAnimating.current = false;
        if (isFirstMount) hasEntered.current = true;
      }
    };

    cardElements.forEach((card, cardIndex) => {
      const slot = visibleMap.get(cardIndex);
      const wasVisible = previouslyVisible.has(cardIndex);
      if (slot !== undefined) {
        const { x, y, rot, scale, zIndex } = config(slot);
        const target = {
          x: `${x * multiplier}rem`,
          y: `${y * heightMultiplier}rem`,
          rotation: rot,
          scale,
          opacity: 1,
          zIndex,
        };
        if (reduceMotion) {
          gsap.set(card, target);
          onCardDone();
        } else if (isFirstMount) {
          gsap.set(card, {
            x: 0,
            y: `${12 * heightMultiplier}rem`,
            rotation: 0,
            scale: 0.5,
            opacity: 0,
          });
          gsap.to(card, {
            ...target,
            duration: 1.2,
            ease: "elastic.out(1.05,.78)",
            delay: 0.2 + slot * 0.06,
            onComplete: onCardDone,
          });
        } else if (!wasVisible) {
          const enterX = direction === "right" ? 40 : -40;
          gsap.set(card, {
            x: `${enterX}rem`,
            y: `${y * heightMultiplier}rem`,
            rotation: direction === "right" ? 30 : -30,
            scale: 0.5,
            opacity: 0,
          });
          gsap.to(card, {
            ...target,
            duration: 0.6,
            ease: "power2.out",
            onComplete: onCardDone,
          });
        } else {
          gsap.to(card, {
            ...target,
            duration: 0.5,
            ease: "power2.out",
            onComplete: onCardDone,
          });
        }
      } else if (wasVisible) {
        const exitX = direction === "right" ? -40 : 40;
        gsap.to(card, {
          x: `${exitX}rem`,
          opacity: 0,
          scale: 0.5,
          rotation: direction === "right" ? -30 : 30,
          duration: 0.4,
          ease: "power2.in",
          zIndex: 0,
        });
      }
    });

    prevVisible.current = new Set(visibleMap.keys());
    const visibleEntries = cardElements
      .map((element, index) => ({
        element,
        slot: visibleMap.get(index),
      }))
      .filter(
        (entry): entry is { element: HTMLElement; slot: number } =>
          entry.slot !== undefined,
      )
      .sort((a, b) => a.slot - b.slot);

    let activeSlot: number | null = null;
    let leaveTimer: ReturnType<typeof setTimeout> | null = null;
    const centerSlot = visibleEntries.length >> 1;

    const updateHoverLayout = (hoveredSlot: number | null) => {
      const widthMultiplier = getResponsiveMultiplier(window.innerWidth);
      const responsiveHeight = getHeightMultiplier(window.innerWidth);
      visibleEntries.forEach(({ element, slot }) => {
        const base = config(slot);
        let targetX = base.x * widthMultiplier;
        let targetY = base.y * responsiveHeight;
        let targetRotation = base.rot;
        let targetScale = base.scale;
        let delay = 0;

        if (hoveredSlot !== null) {
          const distance = Math.abs(slot - hoveredSlot);
          delay = distance * 0.02;
          if (slot === hoveredSlot) {
            targetY -= 2.5 * responsiveHeight;
            targetScale *= 1.08;
          } else {
            const normalized =
              centerSlot > 0 ? (slot - centerSlot) / centerSlot : 0;
            const pushStrength =
              8 *
              (1 - Math.abs(normalized)) *
              (1 + 0.2 * Math.max(0, 3 - distance));
            if (slot < hoveredSlot) {
              targetX -= pushStrength * widthMultiplier;
              targetRotation -= 3 / (distance + 1);
            } else {
              targetX += pushStrength * widthMultiplier;
              targetRotation += 3 / (distance + 1);
            }
          }
        }

        gsap.to(element, {
          x: `${targetX}rem`,
          y: `${targetY}rem`,
          rotation: targetRotation,
          scale: targetScale,
          duration: reduceMotion ? 0 : 0.5,
          delay: reduceMotion ? 0 : delay,
          ease: "elastic.out(1,.75)",
          overwrite: "auto",
        });
        gsap.set(element, { zIndex: base.zIndex });
      });
    };

    const enterHandlers = visibleEntries.map(({ element, slot }) => {
      const handler = () => {
        if (isAnimating.current) return;
        if (leaveTimer) clearTimeout(leaveTimer);
        activeSlot = slot;
        updateHoverLayout(slot);
      };
      element.addEventListener("mouseenter", handler);
      return { element, handler };
    });
    const onMouseLeave = () => {
      if (isAnimating.current) return;
      if (leaveTimer) clearTimeout(leaveTimer);
      leaveTimer = setTimeout(() => {
        activeSlot = null;
        updateHoverLayout(null);
      }, 50);
    };
    const onResize = () => {
      if (!isAnimating.current) updateHoverLayout(activeSlot);
    };
    container.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("resize", onResize);

    return () => {
      enterHandlers.forEach(({ element, handler }) =>
        element.removeEventListener("mouseenter", handler),
      );
      container.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("resize", onResize);
      if (leaveTimer) clearTimeout(leaveTimer);
      gsap.killTweensOf(cardElements);
    };
  }, [centerIndex, getVisibleMap, needsPagination, totalCards]);

  if (!totalCards) return null;

  return (
    <section className="card-fan-carousel" aria-label="Hackathon photo gallery">
      <div ref={containerRef} className="fan-layout">
        {cards.map((card, index) => {
          const image = (
            <img
              src={card.imgUrl}
              loading="lazy"
              alt={card.alt || `Gallery image ${index + 1}`}
            />
          );
          return card.linkUrl ? (
            <a
              key={card.imgUrl}
              href={card.linkUrl}
              target={card.linkUrl.startsWith("http") ? "_blank" : "_self"}
              rel="noopener noreferrer"
              className="fan-card"
            >
              {image}
            </a>
          ) : (
            <div key={card.imgUrl} className="fan-card">
              {image}
            </div>
          );
        })}
      </div>

      {needsPagination && (
        <div className="card-fan-carousel__controls">
          <button type="button" onClick={() => cycle("left")} aria-label="Previous photo">
            <ChevronLeft aria-hidden />
          </button>
          <div className="card-fan-carousel__dots" aria-hidden>
            {cards.map((card, index) => (
              <span key={card.imgUrl} data-active={index === centerIndex} />
            ))}
          </div>
          <button type="button" onClick={() => cycle("right")} aria-label="Next photo">
            <ChevronRight aria-hidden />
          </button>
        </div>
      )}
    </section>
  );
}
