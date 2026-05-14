"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";
import { ArrowUpRight } from "lucide-react";

const INTERACTIVE_SELECTOR = "a, button, [role='button'], [data-bazil-cursor]";

function hasFinePointer() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

export function Cursor() {
  const reduce = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [large, setLarge] = useState(false);
  const [pressed, setPressed] = useState(false);
  /** Track current "large" state in a ref so we only call setLarge when it
      actually changes. Previously setLarge was fired on every mousemove
      (60+/sec) which forced a full React re-render of this component per
      frame — measurable lag on top of everything else on the page. */
  const largeRef = useRef(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const cursorX = useSpring(x, { damping: 24, stiffness: 380, mass: 0.4 });
  const cursorY = useSpring(y, { damping: 24, stiffness: 380, mass: 0.4 });
  const active = mounted && enabled && !reduce;

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    let id: number | undefined;
    const mountCursor = () => {
      id = window.setTimeout(() => {
        setMounted(true);
        setEnabled(hasFinePointer());
      }, 250);
    };
    const onChange = (e: MediaQueryListEvent) => setEnabled(e.matches);
    if (document.readyState === "complete") {
      mountCursor();
    } else {
      window.addEventListener("load", mountCursor, { once: true });
    }
    mq.addEventListener("change", onChange);
    return () => {
      if (id) window.clearTimeout(id);
      window.removeEventListener("load", mountCursor);
      mq.removeEventListener("change", onChange);
    };
  }, []);

  useEffect(() => {
    if (!enabled || reduce) return;

    const onMove = (event: MouseEvent) => {
      x.set(event.clientX);
      y.set(event.clientY);
      // Cheap check; React re-render only when state actually flips.
      const target = event.target as HTMLElement | null;
      const next = Boolean(target?.closest("[data-bazil-cursor]"));
      if (next !== largeRef.current) {
        largeRef.current = next;
        setLarge(next);
      }
    };
    const onOver = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      document.documentElement.dataset.cursorInteractive = target?.closest(INTERACTIVE_SELECTOR)
        ? "true"
        : "false";
    };
    const onDown = () => setPressed(true);
    const onUp = () => setPressed(false);

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseover", onOver, { passive: true });
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      delete document.documentElement.dataset.cursorInteractive;
    };
  }, [enabled, reduce, x, y]);

  return (
    <motion.div
      aria-hidden
      suppressHydrationWarning
      className="bazil-cursor"
      style={{
        x: cursorX,
        y: cursorY,
        translateX: "-50%",
        translateY: "-50%",
        display: active ? "flex" : "none",
      }}
      animate={{
        width: active && large ? 68 : active && pressed ? 9 : 7,
        height: active && large ? 68 : active && pressed ? 9 : 7,
        backgroundColor: active && large ? "#ffffff" : "#1b1b1b",
        borderWidth: active && large ? 4 : 0,
        scale: active && pressed && large ? 0.92 : 1,
      }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.span animate={{ opacity: active && large ? 1 : 0, scale: active && large ? 1 : 0.4 }}>
        <ArrowUpRight className="h-7 w-7" strokeWidth={2.4} />
      </motion.span>
    </motion.div>
  );
}
