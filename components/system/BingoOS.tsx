"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  motion,
  AnimatePresence,
  useDragControls,
  useMotionValue,
  useReducedMotion,
} from "framer-motion";
import { X, Minus, Square, Terminal as TerminalIcon, Folder, FileText, Briefcase, Image as ImageIcon } from "lucide-react";
import { useI18n } from "@/lib/i18n";

type WindowKey = "readme" | "experience" | "offers" | "projects";

const ICONS = {
  readme: FileText,
  experience: Briefcase,
  offers: ImageIcon,
  projects: Folder,
};

const WINDOW_TITLES: Record<WindowKey, { en: string; zh: string }> = {
  readme: { en: "README.txt", zh: "README.txt" },
  experience: { en: "Internships.app", zh: "实习经历.app" },
  offers: { en: "Offers.album", zh: "录取信.album" },
  projects: { en: "Projects.dir", zh: "项目集.dir" },
};

const README_EN = `Welcome to Bingo OS — a side door to Xubin Sun's portfolio.

You found this because you long-pressed the LOGO, typed \`bingoos\` in the terminal, or just like exploring.

Some commands worth knowing:
  • ⌘K              → command palette
  • backtick (\`)    → terminal
  • drag windows    → they remember where you put them
  • ESC             → exit Bingo OS

This is the geek mode. The main portfolio has the same content,
just dressed differently. Both are home.

— Xubin (Bingo) Sun
   Yale CS '26 · Hangzhou, China
`;

const README_ZH = `欢迎来到 Bingo OS —— 徐斌作品集的另一道入口。

你能进来，要么是长按了 LOGO，要么在终端里敲了 \`bingoos\`，
要么纯粹喜欢瞎逛。

这里有几个值得知道的指令：
  • ⌘K              → 命令面板
  • 反引号 (\`)     → 终端
  • 拖动窗口        → 它们会记住位置
  • ESC             → 退出 Bingo OS

这是极客模式。主站和这里内容一样，只是换了一件衣服。
两个都是家。

—— 孙徐斌 (Bingo)
   耶鲁 CS '26 · 中国杭州
`;

export function BingoOS() {
  const { lang } = useI18n();
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [windows, setWindows] = useState<Set<WindowKey>>(new Set(["readme"]));
  const [zIndex, setZIndex] = useState<Record<WindowKey, number>>({
    readme: 4,
    experience: 3,
    offers: 2,
    projects: 1,
  });
  const [time, setTime] = useState("");

  useEffect(() => {
    const handler = () => setOpen((cur) => !cur);
    window.addEventListener("bingo-os:toggle", handler);
    return () => window.removeEventListener("bingo-os:toggle", handler);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (open && e.key === "Escape") {
        const target = e.target as HTMLElement | null;
        if (target?.tagName === "INPUT" || target?.tagName === "TEXTAREA") return;
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const update = () => {
      const d = new Date();
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      setTime(`${days[d.getDay()]} ${months[d.getMonth()]} ${d.getDate()} · ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`);
    };
    update();
    const id = setInterval(update, 30_000);
    return () => clearInterval(id);
  }, [open]);

  const bringFront = (key: WindowKey) => {
    setZIndex((cur) => {
      const max = Math.max(...Object.values(cur));
      return { ...cur, [key]: max + 1 };
    });
  };

  const toggleWindow = (key: WindowKey) => {
    setWindows((cur) => {
      const next = new Set(cur);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      bringFront(key);
      return next;
    });
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="bingo-os no-print"
          initial={reduce ? { opacity: 1 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0 }}
          transition={{ duration: 0.32 }}
          role="dialog"
          aria-label="Bingo OS"
        >
          <div className="bingo-os__wallpaper" aria-hidden>
            <span className="bingo-os__star bingo-os__star--1" />
            <span className="bingo-os__star bingo-os__star--2" />
            <span className="bingo-os__star bingo-os__star--3" />
            <span className="bingo-os__star bingo-os__star--4" />
            <span className="bingo-os__star bingo-os__star--5" />
          </div>

          <div className="bingo-os__menubar">
            <span className="bingo-os__menu-logo">🍎 Bingo OS</span>
            <span className="bingo-os__menu-spacer">File · Edit · View · Window · Help</span>
            <span className="bingo-os__menu-time">{time}</span>
          </div>

          <div className="bingo-os__desktop">
            {/* Desktop icons */}
            <ul className="bingo-os__icons">
              {(Object.keys(WINDOW_TITLES) as WindowKey[]).map((key) => {
                const Icon = ICONS[key];
                return (
                  <li key={key}>
                    <button
                      type="button"
                      onClick={() => toggleWindow(key)}
                      aria-label={`Open ${WINDOW_TITLES[key][lang]}`}
                    >
                      <span className="bingo-os__icon-art" aria-hidden>
                        <Icon size={22} />
                      </span>
                      <small>{WINDOW_TITLES[key][lang]}</small>
                    </button>
                  </li>
                );
              })}
            </ul>

            {/* Floating windows */}
            <AnimatePresence>
              {(Array.from(windows) as WindowKey[]).map((key) => (
                <OSWindow
                  key={key}
                  windowKey={key}
                  zIndex={zIndex[key]}
                  onFront={() => bringFront(key)}
                  onClose={() => toggleWindow(key)}
                  lang={lang}
                  reduce={!!reduce}
                />
              ))}
            </AnimatePresence>
          </div>

          {/* Dock */}
          <div className="bingo-os__dock">
            {(Object.keys(WINDOW_TITLES) as WindowKey[]).map((key) => {
              const Icon = ICONS[key];
              const isOpen = windows.has(key);
              return (
                <button
                  key={key}
                  type="button"
                  className="bingo-os__dock-app"
                  data-active={isOpen ? "true" : "false"}
                  aria-label={`${isOpen ? "Hide" : "Open"} ${WINDOW_TITLES[key][lang]}`}
                  onClick={() => toggleWindow(key)}
                >
                  <Icon size={22} />
                </button>
              );
            })}
            <span className="bingo-os__dock-sep" aria-hidden />
            <button
              type="button"
              className="bingo-os__dock-app bingo-os__dock-app--term"
              aria-label="Open terminal"
              onClick={() => {
                window.dispatchEvent(new KeyboardEvent("keydown", { key: "`", bubbles: true }));
              }}
            >
              <TerminalIcon size={22} />
            </button>
            <button
              type="button"
              className="bingo-os__dock-exit"
              onClick={() => setOpen(false)}
              aria-label="Exit Bingo OS"
            >
              <X size={16} />
              <span>{lang === "en" ? "exit" : "退出"}</span>
            </button>
          </div>

          <div className="bingo-os__hint" aria-hidden>
            {lang === "en" ? "drag windows · double-click icon · esc to exit" : "拖动窗口 · 双击图标 · esc 退出"}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function OSWindow({
  windowKey,
  zIndex,
  onFront,
  onClose,
  lang,
  reduce,
}: {
  windowKey: WindowKey;
  zIndex: number;
  onFront: () => void;
  onClose: () => void;
  lang: "en" | "zh";
  reduce: boolean;
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const controls = useDragControls();
  const ref = useRef<HTMLDivElement>(null);

  const startPositions: Record<WindowKey, { x: number; y: number }> = {
    readme: { x: 80, y: 80 },
    experience: { x: 200, y: 140 },
    offers: { x: 320, y: 100 },
    projects: { x: 440, y: 60 },
  };

  useEffect(() => {
    x.set(startPositions[windowKey].x);
    y.set(startPositions[windowKey].y);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const title = WINDOW_TITLES[windowKey][lang];

  return (
    <motion.div
      ref={ref}
      className="bingo-os__window"
      style={{ x, y, zIndex }}
      drag={!reduce}
      dragControls={controls}
      dragListener={false}
      dragMomentum={false}
      onPointerDown={onFront}
      initial={reduce ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
    >
      <div
        className="bingo-os__window-chrome"
        onPointerDown={(e) => controls.start(e)}
      >
        <span className="bingo-os__window-dot" onClick={onClose} role="button" tabIndex={0} aria-label="Close">
          <X size={9} aria-hidden />
        </span>
        <span className="bingo-os__window-dot bingo-os__window-dot--min" aria-hidden>
          <Minus size={9} />
        </span>
        <span className="bingo-os__window-dot bingo-os__window-dot--max" aria-hidden>
          <Square size={8} />
        </span>
        <strong>{title}</strong>
      </div>
      <div className="bingo-os__window-body">
        <OSWindowContent windowKey={windowKey} lang={lang} />
      </div>
    </motion.div>
  );
}

function OSWindowContent({ windowKey, lang }: { windowKey: WindowKey; lang: "en" | "zh" }) {
  if (windowKey === "readme") {
    return <pre className="bingo-os__readme">{lang === "en" ? README_EN : README_ZH}</pre>;
  }
  if (windowKey === "experience") {
    return (
      <ul className="bingo-os__list">
        <li><Link href="/experience/zoom-pm">/experience/zoom-pm <span>AI PM · Zoom</span></Link></li>
        <li><Link href="/experience/alibaba-cloud">/experience/alibaba-cloud <span>Dataphin · Alibaba</span></Link></li>
        <li><Link href="/experience/deloitte-backend">/experience/deloitte-backend <span>SAP · Deloitte</span></Link></li>
        <li><Link href="/experience/penghui-tech">/experience/penghui-tech <span>LLM · Penghui</span></Link></li>
      </ul>
    );
  }
  if (windowKey === "offers") {
    return (
      <div className="bingo-os__offers-grid">
        {["yale", "cmu", "columbia", "cornell", "northwestern", "ucl"].map((name) => (
          <div key={name} className="bingo-os__offer-thumb">
            <span>{name.toUpperCase()}</span>
            <small>2026</small>
          </div>
        ))}
      </div>
    );
  }
  return (
    <ul className="bingo-os__list">
      <li><Link href="/projects/plant-disease-classification">plant-disease-classification <span>CV · Grad-CAM</span></Link></li>
      <li><Link href="/projects/digital-human-dementia">digital-human-dementia <span>LLM · UX</span></Link></li>
      <li><Link href="/projects/pathmnist-classification">pathmnist-classification <span>Medical</span></Link></li>
      <li><Link href="/projects">→ {lang === "en" ? "view all" : "查看全部"}</Link></li>
    </ul>
  );
}
