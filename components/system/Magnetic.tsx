"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";

/**
 * Wraps a single interactive element to give it magnetic cursor pull
 * within `radius` px. The visual child translates toward the cursor while
 * its bounding box stays put — preserves click target.
 */
export function Magnetic({
  children,
  radius = 80,
  strength = 0.34,
  className,
}: {
  children: ReactNode;
  radius?: number;
  strength?: number;
  className?: string;
}) {
  const wrapRef = useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 220, damping: 18, mass: 0.4 });
  const sy = useSpring(my, { stiffness: 220, damping: 18, mass: 0.4 });

  useEffect(() => {
    if (reduce) return;
    const el = wrapRef.current;
    if (!el) return;
    const handler = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < radius) {
        const k = (1 - dist / radius) * strength;
        mx.set(dx * k);
        my.set(dy * k);
      } else {
        mx.set(0);
        my.set(0);
      }
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, [mx, my, radius, strength, reduce]);

  if (reduce) {
    return <span className={className}>{children}</span>;
  }

  return (
    <span ref={wrapRef} className={className} style={{ display: "inline-block" }}>
      <motion.span style={{ x: sx, y: sy, display: "inline-block" }}>
        {children}
      </motion.span>
    </span>
  );
}
