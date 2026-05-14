"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const STORAGE_KEY = "bingo:intro-seen:v6";

const LOADER_WORDS = [
  "Hi",
  "Hello",
  "Bonjour",
  "你好",
  "Hola",
  "Ciao",
  "Salut",
  "Build",
  "Product",
  "Research",
  "Explore",
  "Welcome",
] as const;

function LoaderLogo() {
  return (
    <span className="intro-loader__logo" aria-label="Bingo">
      <span>B</span>
      <span className="intro-loader__logo-i" aria-hidden>
        <span />
      </span>
      <span>ngo</span>
      <span className="intro-loader__logo-dot" aria-hidden />
    </span>
  );
}

export function IntroLoader() {
  const reduce = useReducedMotion();
  const [visible, setVisible] = useState(false);
  const [shouldRun, setShouldRun] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (reduce || typeof window === "undefined") {
      delete document.documentElement.dataset.intro;
      return;
    }

    let seen = false;
    try {
      seen = window.sessionStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      seen = false;
    }

    if (seen) {
      delete document.documentElement.dataset.intro;
      return;
    }

    document.documentElement.dataset.intro = "running";
    // CRITICAL: do NOT set data-intro-mounted here. The body::before
    // pre-paint cover MUST stay in place until the React loader is
    // actually painted on screen — otherwise there is a one-frame gap
    // (cover removed → loader hasn't rendered yet → page content flashes
    // white). Mounting the loader synchronously, and only handing the
    // cover off when `exiting` flips, keeps that gap closed.
    setShouldRun(true);
    setVisible(true);
    return () => {
      delete document.documentElement.dataset.intro;
      delete document.documentElement.dataset.introMounted;
    };
  }, [reduce]);

  // Hand the body::before cover off to the React loader once the curtain
  // begins to retract. Setting introMounted earlier would expose a white
  // gap; setting it later would mean the curtain split reveals the cover
  // (flat black) instead of the actual page content underneath.
  useEffect(() => {
    if (!exiting) return;
    document.documentElement.dataset.introMounted = "true";
  }, [exiting]);

  useEffect(() => {
    if (!shouldRun || typeof window === "undefined") return;

    const startExit = window.setTimeout(() => setExiting(true), 3350);
    const remove = window.setTimeout(() => {
      try {
        window.sessionStorage.setItem(STORAGE_KEY, "1");
      } catch {
        /* Storage can be unavailable in private contexts; the intro still exits normally. */
      }
      setVisible(false);
      setShouldRun(false);
      delete document.documentElement.dataset.intro;
    }, 4850);

    return () => {
      window.clearTimeout(startExit);
      window.clearTimeout(remove);
      delete document.documentElement.dataset.intro;
    };
  }, [shouldRun]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          aria-hidden
          className="intro-loader"
          data-exiting={exiting ? "true" : "false"}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, delay: 0.08 }}
        >
          <span className="intro-loader__curtain" />
          <span className="intro-loader__panel intro-loader__panel--left" />
          <span className="intro-loader__panel intro-loader__panel--right" />
          <span className="intro-loader__blade" />

          <motion.div
            className="intro-loader__brand"
            initial={false}
            animate={
              exiting
                ? { opacity: 0, y: -10, scale: 0.985 }
                : { opacity: 1, y: 0, scale: 1 }
            }
            transition={
              exiting
                ? { duration: 0.24, ease: [0.76, 0, 0.24, 1] }
                : { duration: 0.36, delay: 0.18, ease: [0.16, 1, 0.3, 1] }
            }
          >
            <div className="intro-loader__word-drum" aria-hidden>
              <div className="intro-loader__word-track">
                {LOADER_WORDS.map((word) => (
                  <span key={word}>{word}</span>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            className="intro-loader__corner"
            initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
            animate={
              exiting
                ? { opacity: 0, x: 36, y: 28, scale: 0.94 }
                : { opacity: 1, x: 0, y: 0, scale: 1 }
            }
            transition={
              exiting
                ? { duration: 0.42, delay: 0.56, ease: [0.76, 0, 0.24, 1] }
                : { duration: 0.18, ease: [0.16, 1, 0.3, 1] }
            }
          >
            <LoaderLogo />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
