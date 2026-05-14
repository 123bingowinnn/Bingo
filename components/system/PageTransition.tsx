"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Bazil-style page transition.
 *
 * THE TIMING PROBLEM: doing this purely off `usePathname()` changes means
 * the new page has already mounted before the wipe even starts — the user
 * sees a flash of the new content before the panel slides in. Wrong order.
 *
 * THE FIX: intercept internal-link clicks at the document level *before*
 * navigation happens, so the order is:
 *   t=0      user clicks an internal link
 *   t=0      preventDefault + dispatch wipe-in (panel slides up from
 *            bottom, covers the screen)
 *   t=~360ms panel fully covers — only now call router.push(href)
 *   t=~360+  pathname changes, new page mounts behind the cover
 *   t=hold   small hold so the new page can settle
 *   t=exit   panel slides off the top, revealing the new page
 *
 * Same-page anchors (#about etc.) and external links are NOT intercepted —
 * those should fall through to the existing smooth-scroll / new-tab paths.
 */

type Phase = "idle" | "in" | "hold" | "out";

const COVER_MS = 360;
const HOLD_MS = 120;
const OUT_MS = 420;

export function PageTransition() {
  const router = useRouter();
  const pathname = usePathname();
  const [phase, setPhase] = useState<Phase>("idle");
  // Track which path we're navigating to so the pathname-change effect
  // knows when the new page has actually arrived.
  const pendingPathRef = useRef<string | null>(null);

  // 1) Intercept internal-link clicks → start the wipe BEFORE navigating.
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      // Respect modifier-clicks (open-in-new-tab, etc.)
      if (e.defaultPrevented) return;
      if (e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const target = e.target as HTMLElement | null;
      const anchor = target?.closest<HTMLAnchorElement>("a[href]");
      if (!anchor) return;
      // Skip non-default targets / explicit downloads
      if (anchor.target && anchor.target !== "" && anchor.target !== "_self")
        return;
      if (anchor.hasAttribute("download")) return;

      const rawHref = anchor.getAttribute("href") || "";
      // Skip non-http(s) protocols
      if (
        rawHref.startsWith("mailto:") ||
        rawHref.startsWith("tel:") ||
        rawHref.startsWith("javascript:")
      )
        return;

      let url: URL;
      try {
        url = new URL(rawHref, window.location.href);
      } catch {
        return;
      }
      // Skip cross-origin
      if (url.origin !== window.location.origin) return;

      // Skip pure same-page anchor clicks (let smooth-scroll handlers run)
      const samePath = url.pathname === window.location.pathname;
      if (samePath && url.hash) return;
      if (samePath && !url.hash) return; // re-clicking current page

      // Start the wipe; navigate when the panel has fully covered the screen.
      e.preventDefault();
      pendingPathRef.current = url.pathname + url.search + url.hash;
      setPhase("in");
      window.setTimeout(() => {
        if (pendingPathRef.current) {
          router.push(pendingPathRef.current);
        }
      }, COVER_MS);
    };

    // CAPTURE phase — runs BEFORE Next.js Link's internal click handler
    // and any element-level onClick. Without `true`, Next's router would
    // preventDefault first and our handler would see defaultPrevented and
    // skip, so the wipe never fires.
    document.addEventListener("click", handler, true);
    return () => document.removeEventListener("click", handler, true);
  }, [router]);

  // 2) When the pathname matches our pending target, transition to "hold".
  //
  // BUG-PRONE: do NOT also schedule the hold→out and out→idle timers in this
  // same effect. setPhase("hold") triggers a re-render, this effect runs
  // again, and React fires the cleanup from the previous run BEFORE the next
  // run — which clears the timers we just set, freezing the wipe panel
  // forever. Each phase transition lives in its own effect so the timers
  // outlive the state change that schedules them.
  useEffect(() => {
    if (phase !== "in") return;
    if (!pendingPathRef.current) return;
    const targetPath = new URL(
      pendingPathRef.current,
      window.location.origin,
    ).pathname;
    if (targetPath !== pathname) return;
    setPhase("hold");
  }, [pathname, phase]);

  // 3) hold → out
  useEffect(() => {
    if (phase !== "hold") return;
    const t = window.setTimeout(() => setPhase("out"), HOLD_MS);
    return () => window.clearTimeout(t);
  }, [phase]);

  // 4) out → idle (and clear the pending target)
  useEffect(() => {
    if (phase !== "out") return;
    const t = window.setTimeout(() => {
      setPhase("idle");
      pendingPathRef.current = null;
    }, OUT_MS);
    return () => window.clearTimeout(t);
  }, [phase]);

  return (
    <AnimatePresence>
      {phase !== "idle" ? (
        <motion.div
          key="route-wipe"
          className="page-wipe"
          aria-hidden
          initial={{ y: "100%" }}
          animate={
            phase === "in" || phase === "hold"
              ? { y: "0%" }
              : { y: "-100%" }
          }
          exit={{ y: "-100%" }}
          transition={{
            duration: phase === "out" ? OUT_MS / 1000 : COVER_MS / 1000,
            ease: [0.76, 0, 0.24, 1],
          }}
        >
          <span className="page-wipe__mark" aria-hidden>
            Bingo<i>.</i>
          </span>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
