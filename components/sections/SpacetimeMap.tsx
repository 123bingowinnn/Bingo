"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useI18n } from "@/lib/i18n";

type NodeType = "internship" | "paper" | "education" | "offer";

type NodeData = {
  id: string;
  year: number;
  month: number; // 1-12 to position more precisely on the X axis
  type: NodeType;
  href: string;
  /** vertical lift (-1 above the river, +1 below) */
  bias: -1 | 1;
  /** how prominent (1 = base, 2 = bigger) */
  weight: 1 | 1.4 | 1.8;
  en: { kicker: string; title: string; detail: string };
  zh: { kicker: string; title: string; detail: string };
};

const TYPE_COLOR: Record<NodeType, string> = {
  internship: "#8B7FFD",
  paper: "#FBBF24",
  education: "#F472B6",
  offer: "#4ADE80",
};

const TYPE_LABEL: Record<NodeType, { en: string; zh: string }> = {
  internship: { en: "internship", zh: "实习" },
  paper: { en: "publication", zh: "论文" },
  education: { en: "education", zh: "教育" },
  offer: { en: "milestone", zh: "里程碑" },
};

const NODES: NodeData[] = [
  {
    id: "wku-start",
    year: 2022,
    month: 9,
    type: "education",
    href: "/#education",
    bias: -1,
    weight: 1,
    en: { kicker: "Sept 2022", title: "Wenzhou-Kean", detail: "CS undergrad begins" },
    zh: { kicker: "2022.09", title: "温州肯恩", detail: "计算机本科入学" },
  },
  {
    id: "penghui",
    year: 2024,
    month: 6,
    type: "internship",
    href: "/experience/penghui-bigdata",
    bias: 1,
    weight: 1,
    en: { kicker: "Jun 2024", title: "Penghui", detail: "First LLM service shipped" },
    zh: { kicker: "2024.06", title: "朋辉科技", detail: "第一次把大模型上线" },
  },
  {
    id: "pathmnist",
    year: 2024,
    month: 9,
    type: "paper",
    href: "/research/pathmnist-paper",
    bias: -1,
    weight: 1,
    en: { kicker: "2024", title: "PathMNIST", detail: "Robust medical imaging" },
    zh: { kicker: "2024", title: "PathMNIST", detail: "鲁棒医学影像分类" },
  },
  {
    id: "octmnist",
    year: 2024,
    month: 11,
    type: "paper",
    href: "/research/octmnist-paper",
    bias: -1,
    weight: 1,
    en: { kicker: "2024", title: "OCTMNIST", detail: "Privacy-preserving distillation" },
    zh: { kicker: "2024", title: "OCTMNIST", detail: "隐私保护数据蒸馏" },
  },
  {
    id: "deloitte",
    year: 2025,
    month: 5,
    type: "internship",
    href: "/experience/deloitte-backend",
    bias: 1,
    weight: 1.4,
    en: { kicker: "Apr–Jul 2025", title: "Deloitte", detail: "Spring Boot · SAP project" },
    zh: { kicker: "2025.04–07", title: "德勤", detail: "Spring Boot · SAP 项目" },
  },
  {
    id: "alibaba",
    year: 2025,
    month: 8,
    type: "internship",
    href: "/experience/alibaba-cloud",
    bias: 1,
    weight: 1.4,
    en: { kicker: "Jul–Oct 2025", title: "Alibaba Cloud", detail: "Demo engine · global GTM" },
    zh: { kicker: "2025.07–10", title: "阿里云", detail: "Demo 矩阵 · 全球化" },
  },
  {
    id: "llm-rejection",
    year: 2025,
    month: 9,
    type: "paper",
    href: "/research/llm-negative-rejection",
    bias: -1,
    weight: 1,
    en: { kicker: "2025", title: "LLM Rejection", detail: "When AI should say no" },
    zh: { kicker: "2025", title: "LLM 拒识", detail: "AI 何时应该说不" },
  },
  {
    id: "zoom",
    year: 2025,
    month: 12,
    type: "internship",
    href: "/experience/zoom-pm",
    bias: 1,
    weight: 1.8,
    en: { kicker: "Dec 2025 –", title: "Zoom", detail: "AI PM · PRD-to-launch" },
    zh: { kicker: "2025.12 –", title: "Zoom", detail: "AI PM · PRD 到上线" },
  },
  {
    id: "yale",
    year: 2026,
    month: 8,
    type: "offer",
    href: "/#education",
    bias: -1,
    weight: 1.8,
    en: { kicker: "Fall 2026", title: "Yale '26", detail: "M.S. Computer Science" },
    zh: { kicker: "2026 秋", title: "耶鲁 '26", detail: "计算机科学硕士" },
  },
];

const YEAR_START = 2022;
const YEAR_END = 2026.6;

/** Map year+month to 0-1 X position */
function xPosition(year: number, month: number) {
  const t = year + (month - 1) / 12;
  return (t - YEAR_START) / (YEAR_END - YEAR_START);
}

export function SpacetimeMap() {
  const { lang } = useI18n();
  const reduce = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [trackWidth, setTrackWidth] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

  // Cursor for magnetic effect
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);

  // Drag/scroll offset
  const offsetX = useMotionValue(0);
  const smoothOffset = useSpring(offsetX, { stiffness: 140, damping: 28, mass: 0.6 });

  useEffect(() => {
    const measure = () => {
      if (trackRef.current) setTrackWidth(trackRef.current.scrollWidth);
      if (containerRef.current) setContainerWidth(containerRef.current.clientWidth);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const minOffset = Math.min(0, containerWidth - trackWidth);

  // Wheel pan
  useEffect(() => {
    const container = containerRef.current;
    if (!container || reduce) return;
    const onWheel = (e: WheelEvent) => {
      // Only hijack when horizontal scroll within container; on most trackpads deltaX is non-zero for horizontal
      // For vertical wheel, ignore (let page scroll)
      if (Math.abs(e.deltaX) < 6) return;
      e.preventDefault();
      const next = Math.max(minOffset, Math.min(0, offsetX.get() - e.deltaX));
      offsetX.set(next);
    };
    container.addEventListener("wheel", onWheel, { passive: false });
    return () => container.removeEventListener("wheel", onWheel);
  }, [minOffset, offsetX, reduce]);

  // Cursor tracking inside container
  useEffect(() => {
    const container = containerRef.current;
    if (!container || reduce) return;
    const handler = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      cursorX.set(e.clientX - rect.left);
      cursorY.set(e.clientY - rect.top);
    };
    container.addEventListener("mousemove", handler);
    return () => container.removeEventListener("mousemove", handler);
  }, [cursorX, cursorY, reduce]);

  // Year tick marks
  const years = useMemo(() => [2022, 2023, 2024, 2025, 2026], []);

  return (
    <section
      id="spacetime"
      className="spacetime-section"
      aria-labelledby="spacetime-title"
    >
      <div className="folio-section-label">SPACETIME / 02·5</div>

      <div className="spacetime-shell">
        <div className="spacetime-heading">
          <p>{lang === "en" ? "Four years, one timeline." : "四年，一条时间线。"}</p>
          <h2 id="spacetime-title" data-lang={lang}>
            {lang === "en" ? (
              <>
                Everything I&apos;ve done since 2022,<br />
                <em>as a river you can scrub.</em>
              </>
            ) : (
              <>
                从 2022 开始的全部经历，<br />
                <em>一条可以拖动的时间河。</em>
              </>
            )}
          </h2>
          <p className="spacetime-hint">
            {lang === "en"
              ? "Drag · scroll horizontally · hover any node · click to jump in"
              : "拖拽 · 横向滚动 · 悬停任意节点 · 点击直接跳转"}
          </p>
        </div>

        <div
          className="spacetime-canvas"
          ref={containerRef}
          role="region"
          aria-label={lang === "en" ? "Interactive timeline" : "交互式时空地图"}
        >
          <div className="spacetime-gradient spacetime-gradient--left" aria-hidden />
          <div className="spacetime-gradient spacetime-gradient--right" aria-hidden />

          <motion.div
            className="spacetime-track"
            ref={trackRef}
            drag={reduce ? false : "x"}
            dragConstraints={{ left: minOffset, right: 0 }}
            dragElastic={0.08}
            dragTransition={{ bounceStiffness: 240, bounceDamping: 28 }}
            style={reduce ? undefined : { x: smoothOffset }}
          >
            {/* Year ticks */}
            <div className="spacetime-years" aria-hidden>
              {years.map((y) => (
                <span
                  key={y}
                  className="spacetime-year"
                  style={{ left: `${xPosition(y, 1) * 100}%` }}
                >
                  {y}
                </span>
              ))}
            </div>

            {/* The time river — SVG with flowing dash */}
            <svg
              className="spacetime-river"
              viewBox="0 0 1000 240"
              preserveAspectRatio="none"
              aria-hidden
            >
              <defs>
                <linearGradient id="river-stroke" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#8B7FFD" stopOpacity="0.35" />
                  <stop offset="50%" stopColor="#FFB37C" stopOpacity="0.55" />
                  <stop offset="100%" stopColor="#4ADE80" stopOpacity="0.7" />
                </linearGradient>
                <linearGradient id="river-glow" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#8B7FFD" stopOpacity="0.08" />
                  <stop offset="50%" stopColor="#FFB37C" stopOpacity="0.14" />
                  <stop offset="100%" stopColor="#4ADE80" stopOpacity="0.16" />
                </linearGradient>
              </defs>
              {/* Wide glow band */}
              <path
                d="M 20 120 C 180 80, 320 160, 480 110 S 760 60, 980 130"
                stroke="url(#river-glow)"
                strokeWidth="40"
                fill="none"
                strokeLinecap="round"
              />
              {/* Stroke line */}
              <path
                d="M 20 120 C 180 80, 320 160, 480 110 S 760 60, 980 130"
                stroke="url(#river-stroke)"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
              />
              {/* Flowing dashed line over the stroke */}
              <path
                d="M 20 120 C 180 80, 320 160, 480 110 S 760 60, 980 130"
                stroke="#fff"
                strokeWidth="1.4"
                strokeOpacity="0.5"
                strokeDasharray="3 14"
                strokeLinecap="round"
                fill="none"
                className="spacetime-river__flow"
              />
            </svg>

            {/* Nodes */}
            <ul className="spacetime-nodes" role="list">
              {NODES.map((node) => (
                <SpacetimeNode
                  key={node.id}
                  node={node}
                  cursorX={cursorX}
                  cursorY={cursorY}
                  isActive={activeNode === node.id}
                  onActivate={() => setActiveNode(node.id)}
                  onDeactivate={() => setActiveNode((current) => (current === node.id ? null : current))}
                  lang={lang}
                  reduce={!!reduce}
                />
              ))}
            </ul>
          </motion.div>

          {/* Legend */}
          <div className="spacetime-legend" aria-hidden>
            {(["internship", "paper", "education", "offer"] as NodeType[]).map((t) => (
              <span key={t}>
                <i style={{ background: TYPE_COLOR[t] }} />
                {TYPE_LABEL[t][lang]}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function SpacetimeNode({
  node,
  cursorX,
  cursorY,
  isActive,
  onActivate,
  onDeactivate,
  lang,
  reduce,
}: {
  node: NodeData;
  cursorX: ReturnType<typeof useMotionValue<number>>;
  cursorY: ReturnType<typeof useMotionValue<number>>;
  isActive: boolean;
  onActivate: () => void;
  onDeactivate: () => void;
  lang: "en" | "zh";
  reduce: boolean;
}) {
  const color = TYPE_COLOR[node.type];
  const xPct = xPosition(node.year, node.month) * 100;
  // Approximate Y placement matching the SVG path heights at given xPct (linear-ish interpolation)
  // SVG path height around 110-130, bias up/down via node.bias
  const baseY = 50 + (node.bias < 0 ? -32 : 28) - (node.weight - 1) * 6;

  // Magnetic pull — based on cursor distance to node's screen position
  // Node X in container coords: trackOffsetX + nodePosInTrack
  // Since the track spans wider than container, we compute via the rendered nodeRef
  const nodeRef = useRef<HTMLLIElement>(null);
  const pullX = useMotionValue(0);
  const pullY = useMotionValue(0);
  const smoothPullX = useSpring(pullX, { stiffness: 280, damping: 22, mass: 0.4 });
  const smoothPullY = useSpring(pullY, { stiffness: 280, damping: 22, mass: 0.4 });

  useEffect(() => {
    if (reduce) return;
    const unsubscribeX = cursorX.on("change", () => {
      updatePull();
    });
    const unsubscribeY = cursorY.on("change", () => {
      updatePull();
    });
    return () => {
      unsubscribeX();
      unsubscribeY();
    };

    function updatePull() {
      if (!nodeRef.current) return;
      const rect = nodeRef.current.getBoundingClientRect();
      const containerRect = nodeRef.current
        .closest(".spacetime-canvas")
        ?.getBoundingClientRect();
      if (!containerRect) return;
      const nodeCX = rect.left + rect.width / 2 - containerRect.left;
      const nodeCY = rect.top + rect.height / 2 - containerRect.top;
      const dx = cursorX.get() - nodeCX;
      const dy = cursorY.get() - nodeCY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const radius = 110;
      if (dist < radius) {
        const strength = (1 - dist / radius) * 0.42; // 0..0.42
        pullX.set(dx * strength);
        pullY.set(dy * strength);
      } else {
        pullX.set(0);
        pullY.set(0);
      }
    }
  }, [cursorX, cursorY, pullX, pullY, reduce]);

  const dotScale = useTransform([smoothPullX, smoothPullY], (latest) => {
    const v = latest as number[];
    const distance = Math.sqrt(v[0] * v[0] + v[1] * v[1]);
    return 1 + Math.min(distance / 120, 0.6);
  });

  const size = 14 + (node.weight - 1) * 7;

  return (
    <motion.li
      ref={nodeRef}
      className="spacetime-node"
      data-type={node.type}
      data-active={isActive ? "true" : "false"}
      style={{
        left: `${xPct}%`,
        top: `${baseY}%`,
        x: reduce ? 0 : smoothPullX,
        y: reduce ? 0 : smoothPullY,
        ["--node-color" as string]: color,
      }}
      onPointerEnter={onActivate}
      onPointerLeave={onDeactivate}
      onFocus={onActivate}
      onBlur={onDeactivate}
    >
      <Link href={node.href} className="spacetime-node__link" aria-label={`${node[lang].title} — ${node[lang].detail}`} data-bazil-cursor>
        <motion.span
          className="spacetime-node__dot"
          style={{
            width: size,
            height: size,
            scale: reduce ? 1 : dotScale,
          }}
          aria-hidden
        />
        <motion.span
          className="spacetime-node__ping"
          aria-hidden
          animate={reduce ? {} : { scale: [1, 2.2], opacity: [0.36, 0] }}
          transition={reduce ? undefined : { duration: 2.6, repeat: Infinity, ease: "easeOut", delay: node.weight - 1 }}
          style={{ width: size, height: size }}
        />
        <span className="spacetime-node__label">
          <small>{node[lang].kicker}</small>
          <strong>{node[lang].title}</strong>
        </span>
      </Link>

      <AnimatePresence>
        {isActive && (
          <motion.div
            className="spacetime-card"
            initial={reduce ? { opacity: 1 } : { opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 4, scale: 0.97 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="spacetime-card__type" style={{ color }}>
              {TYPE_LABEL[node.type][lang]} · {node[lang].kicker}
            </span>
            <strong>{node[lang].title}</strong>
            <p>{node[lang].detail}</p>
            <span className="spacetime-card__cta">
              {lang === "en" ? "Open" : "进入"} <ArrowUpRight size={13} />
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.li>
  );
}
