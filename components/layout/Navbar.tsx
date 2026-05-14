"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sunrise, Sun, Sunset, Moon, Command } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { getContent } from "@/lib/content";

const NAV_ITEMS = [
  { href: "/#about", en: "About", zh: "关于" },
  { href: "/#experience", en: "Internships", zh: "实习" },
  { href: "/#works", en: "Projects", zh: "项目" },
  { href: "/#contact", en: "Contact me", zh: "联系我" },
] as const;

/** Smooth-scroll the page to a same-page anchor. Same-page hashes get
    intercepted and scrolled via JS so the transition is smooth; cross-page
    links fall through to the normal Next.js Link behavior. */
function smoothScrollToHash(href: string): boolean {
  if (typeof window === "undefined") return false;
  const hashIndex = href.indexOf("#");
  if (hashIndex === -1) return false;
  // Only intercept if we're on the same path or the path is "/"
  const path = href.slice(0, hashIndex) || "/";
  if (path !== "/" && path !== window.location.pathname) return false;
  const id = href.slice(hashIndex + 1);
  const target = document.getElementById(id);
  if (!target) return false;
  target.scrollIntoView({ behavior: "smooth", block: "start" });
  // Update the URL hash without triggering a page jump
  history.pushState(null, "", `#${id}`);
  return true;
}

function BingoLogo() {
  return (
    <span className="bingo-logo" aria-label="Bingo">
      <span className="bingo-logo__char bingo-logo__b">B</span>
      <span className="bingo-logo__i" aria-hidden>
        <span className="bingo-logo__i-dot" />
      </span>
      <span className="bingo-logo__char bingo-logo__n">n</span>
      <span className="bingo-logo__char bingo-logo__g">g</span>
      <span className="bingo-logo__char bingo-logo__o">o</span>
      <span className="bingo-logo__pink" aria-hidden />
    </span>
  );
}

function TimePill() {
  const [time, setTime] = useState<{ hour: number; label: string } | null>(null);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const h = now.getHours();
      const m = now.getMinutes();
      const label = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      setTime({ hour: h, label });
    };
    update();
    const id = setInterval(update, 30_000);
    return () => clearInterval(id);
  }, []);

  if (!time) return null;
  const { hour, label } = time;
  let Icon = Sun;
  let theme = "day";
  if (hour >= 5 && hour < 11) { Icon = Sunrise; theme = "dawn"; }
  else if (hour >= 11 && hour < 17) { Icon = Sun; theme = "day"; }
  else if (hour >= 17 && hour < 22) { Icon = Sunset; theme = "dusk"; }
  else { Icon = Moon; theme = "night"; }

  return (
    <span className="bazil-time" data-theme={theme} aria-label={`Current time ${label}`} title={`Bingo's local time · ${label}`}>
      <Icon size={13} aria-hidden />
      <small>{label}</small>
    </span>
  );
}

function CommandHint() {
  const { lang } = useI18n();
  const fire = () => {
    const event = new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true });
    window.dispatchEvent(event);
  };
  return (
    <button
      type="button"
      className="bazil-command"
      onClick={fire}
      aria-label={lang === "en" ? "Open command palette (⌘K)" : "打开命令面板 (⌘K)"}
      title="⌘K"
    >
      <Command size={12} aria-hidden />
      <span>K</span>
    </button>
  );
}

export function Navbar() {
  const { lang, setLang } = useI18n();
  const content = getContent();
  const [mobileOpen, setMobileOpen] = useState(false);
  const logoPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Long-press LOGO to toggle Bingo OS mode (>=800ms)
  const handleLogoPressStart = (e: React.PointerEvent) => {
    if ((e as React.PointerEvent<HTMLAnchorElement>).pointerType === "mouse" && e.button !== 0) return;
    if (logoPressTimer.current) clearTimeout(logoPressTimer.current);
    logoPressTimer.current = setTimeout(() => {
      window.dispatchEvent(new CustomEvent("bingo-os:toggle"));
    }, 800);
  };
  const handleLogoPressEnd = () => {
    if (logoPressTimer.current) clearTimeout(logoPressTimer.current);
    logoPressTimer.current = null;
  };

  return (
    <header className="bazil-nav no-print">
      <nav className="bazil-nav__inner" aria-label="Primary navigation">
        <Link
          href="/"
          className="bazil-nav__logo"
          onClick={() => setMobileOpen(false)}
          onPointerDown={handleLogoPressStart}
          onPointerUp={handleLogoPressEnd}
          onPointerLeave={handleLogoPressEnd}
          onPointerCancel={handleLogoPressEnd}
          title="Long-press to enter Bingo OS"
        >
          <BingoLogo />
        </Link>

        <div className="bazil-nav__links">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="bazil-nav__link"
              onClick={(e) => {
                if (smoothScrollToHash(item.href)) e.preventDefault();
              }}
            >
              {item[lang]}
            </Link>
          ))}
        </div>

        <div className="bazil-nav__actions">
          <TimePill />
          <CommandHint />
          <div className="bazil-lang" aria-label="Language switcher">
            <button
              type="button"
              className={lang === "zh" ? "is-active" : undefined}
              aria-label="切换到中文"
              aria-pressed={lang === "zh"}
              onClick={() => setLang("zh")}
            >
              中
            </button>
            <button
              type="button"
              className={lang === "en" ? "is-active" : undefined}
              aria-label="Switch to English"
              aria-pressed={lang === "en"}
              onClick={() => setLang("en")}
            >
              EN
            </button>
          </div>
          <a href={`mailto:${content.contact.email}`} className="bazil-mail">
            {content.contact.email}
          </a>
        </div>

        <button
          type="button"
          className="bazil-menu"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((open) => !open)}
        >
          {mobileOpen ? <X className="h-7 w-7" /> : <Menu className="h-8 w-8" />}
        </button>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.22 }}
            className="bazil-mobile"
          >
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="bazil-mobile__link"
                onClick={(e) => {
                  if (smoothScrollToHash(item.href)) e.preventDefault();
                  setMobileOpen(false);
                }}
              >
                <span>{item[lang]}</span>
                <span aria-hidden>→</span>
              </Link>
            ))}
            <div className="bazil-mobile__footer">
              <button
                type="button"
                onClick={() => {
                  setLang(lang === "en" ? "zh" : "en");
                  setMobileOpen(false);
                }}
              >
                {lang === "en" ? "中文" : "English"}
              </button>
              <a href={`mailto:${content.contact.email}`}>{content.contact.email}</a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
