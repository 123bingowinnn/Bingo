"use client";

import type {
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
} from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useI18n } from "@/lib/i18n";

type PetState =
  | "idle"
  | "blink"
  | "look"
  | "curious"
  | "talk"
  | "yawn"
  | "sleep"
  | "excited"
  // New affect states — gentle joy, warm-hearted, melancholic.
  // Triggered randomly during roaming or by specific interactions.
  | "happy"
  | "love"
  | "sad";
type PetPosition = { x: number; y: number };
type PetSide = "left" | "right";

const PET_SIZE = { width: 110, height: 112 };
const PET_MARGIN = 18;

function clampPetPosition(position: PetPosition): PetPosition {
  if (typeof window === "undefined") return position;
  const maxX = Math.max(PET_MARGIN, window.innerWidth - PET_SIZE.width - PET_MARGIN);
  const maxY = Math.max(PET_MARGIN, window.innerHeight - PET_SIZE.height - PET_MARGIN);
  const minY = window.innerWidth < 720 ? PET_MARGIN : 82;
  return {
    x: Math.min(maxX, Math.max(PET_MARGIN, position.x)),
    y: Math.min(maxY, Math.max(minY, position.y)),
  };
}

function bottomRightSpot(): PetPosition {
  if (typeof window === "undefined") return { x: 0, y: 0 };
  return clampPetPosition({
    x: window.innerWidth - PET_SIZE.width - PET_MARGIN,
    y: window.innerHeight - PET_SIZE.height - PET_MARGIN,
  });
}

function sectionPetSpot(section: keyof (typeof SECTION_LINES)["en"]): PetPosition {
  if (typeof window === "undefined") return { x: 0, y: 0 };
  const w = window.innerWidth;
  const h = window.innerHeight;
  if (w < 720) return bottomRightSpot();
  const spots: Record<keyof (typeof SECTION_LINES)["en"], PetPosition> = {
    hero: { x: w - PET_SIZE.width - PET_MARGIN, y: h - PET_SIZE.height - PET_MARGIN },
    about: { x: w - PET_SIZE.width - 28, y: h - PET_SIZE.height - 30 },
    experience: { x: 26, y: h - PET_SIZE.height - 28 },
    research: { x: w - PET_SIZE.width - 34, y: h * 0.55 },
    contact: { x: Math.round(w / 2 - PET_SIZE.width / 2), y: h - PET_SIZE.height - 30 },
  };
  return clampPetPosition(spots[section]);
}

function nearbyPetSpot(from: PetPosition): PetPosition {
  if (typeof window === "undefined") return from;
  const w = window.innerWidth;
  const h = window.innerHeight;
  if (w < 720) return bottomRightSpot();
  const maxX = Math.max(PET_MARGIN, w - PET_SIZE.width - PET_MARGIN);
  const maxY = Math.max(PET_MARGIN, h - PET_SIZE.height - PET_MARGIN);
  const onLeft = from.x < w / 2;
  const sideX = onLeft ? PET_MARGIN : maxX;
  const oppositeX = onLeft ? maxX : PET_MARGIN;
  const candidates: PetPosition[] = [
    { x: sideX, y: maxY },
    { x: sideX, y: Math.round(h * 0.66) },
    { x: onLeft ? PET_MARGIN + 8 : maxX - 8, y: Math.round(h * 0.76) },
  ];

  if (Math.random() < 0.16) {
    candidates.push({ x: oppositeX, y: maxY });
  }

  return clampPetPosition(candidates[Math.floor(Math.random() * candidates.length)]);
}

function petEdgeRoute(from: PetPosition, to: PetPosition): PetPosition[] {
  if (typeof window === "undefined") return [to];
  const minX = PET_MARGIN;
  const maxX = Math.max(PET_MARGIN, window.innerWidth - PET_SIZE.width - PET_MARGIN);
  const maxY = Math.max(PET_MARGIN, window.innerHeight - PET_SIZE.height - PET_MARGIN);
  const midX = window.innerWidth / 2;
  const fromSideX = from.x < midX ? minX : maxX;
  const toSideX = to.x < midX ? minX : maxX;
  const nearBottom = Math.abs(to.y - maxY) < 16;
  const route: PetPosition[] = [];

  const push = (point: PetPosition) => {
    const clamped = clampPetPosition(point);
    const last = route[route.length - 1] ?? from;
    if (Math.abs(last.x - clamped.x) < 2 && Math.abs(last.y - clamped.y) < 2) return;
    route.push(clamped);
  };

  if (Math.abs(from.y - maxY) > 14) {
    push({ x: fromSideX, y: maxY });
  }

  if (nearBottom) {
    push(to);
    return route;
  }

  if (fromSideX !== toSideX) {
    push({ x: toSideX, y: maxY });
  }

  push({ x: toSideX, y: to.y });
  push(to);
  return route;
}

const SECTION_LINES = {
  en: {
    hero: "hey there ✦ scroll on",
    about: "the real Bingo lives here",
    experience: "four internships in one rectangle",
    research: "papers — slow + careful",
    contact: "send him a note ↓",
  },
  zh: {
    hero: "嗨 ✦ 往下滑就好",
    about: "真正的 Bingo 住在这里",
    experience: "四段实习挤在一个矩形里",
    research: "论文 — 慢慢看",
    contact: "在这里给他留个言 ↓",
  },
} as const;

const ROAM_LINES = {
  en: [
    "(taking a nap...)",
    "back to scrolling?",
    "pixel grade — extra crunchy.",
    "i blink, therefore i exist.",
    "shhh — he's debugging.",
    "running on caffeine and pixels.",
    "currently 84% Bingo, 16% fox.",
    "scroll twice and i'll do a flip ✦",
    "i pair-program but mostly nap.",
    "last person who stayed this long got hired.",
    "Yale '26 — that's where he's heading next.",
    "scroll a little more, there's good stuff.",
    "i was born in a 16×16 canvas.",
    "pet me — it improves my hot takes.",
    "8-bit and proud of it.",
    "ask me about Xubin ✦",
    "(pretending to read his PRD)",
    "this site has 4 hidden eggs ✦",
  ],
  zh: [
    "(打个盹...)",
    "继续往下看?",
    "像素级 — 嘎嘣脆。",
    "我眨眼,故我在。",
    "嘘 — 他在 debug。",
    "靠咖啡和像素续命。",
    "84% 是 Bingo,16% 是狐狸。",
    "你再滚一次,我给你翻个跟头 ✦",
    "我会结对编程,但大多数时候在睡觉。",
    "上一个看我看这么久的人,后来都被录用了。",
    "Yale '26 — 是他下一站。",
    "再往下滚滚,下面有好东西。",
    "我出生在 16×16 的画布里。",
    "摸摸我,我会更会吐槽。",
    "8-bit 是我的骄傲。",
    "可以问我关于徐斌的事 ✦",
    "(假装在看他的 PRD)",
    "这个网站藏了 4 个彩蛋 ✦",
  ],
} as const;

/** State-specific quips — fired when the pet shifts into a mood. */
const HAPPY_LINES = {
  en: ["hehe ✦", "tail wag detected.", "good vibes only.", "wheee ✦"],
  zh: ["嘿嘿 ✦", "尾巴在摇。", "今天心情好。", "嗖 ✦"],
} as const;

const LOVE_LINES = {
  en: [
    "♥",
    "warm fuzzies ♡",
    "okay you're growing on me.",
    "you're cute ✦",
  ],
  zh: [
    "♥",
    "暖暖的 ♡",
    "好吧,我开始喜欢你了。",
    "你也好可爱 ✦",
  ],
} as const;

const SAD_LINES = {
  en: [
    "where'd everybody go...",
    "(lonely pixel hours)",
    "talk to me?",
    "the gpu sighs.",
  ],
  zh: [
    "人呢...",
    "(寂寞的像素时刻)",
    "理我一下?",
    "GPU 都在叹气。",
  ],
} as const;

/**
 * Pixel-art creature. Original sprite — small fox-like puff.
 * 14×14 grid with named color anchors. Drawn as SVG <rect>s for
 * crisp scaling. Two body frames + per-state eye/mouth overlays.
 */

// Color palette
const C = {
  body: "#FFB37C", // warm orange
  bodyDark: "#E58B57",
  belly: "#FFE9D6",
  outline: "#1F1B18",
  eye: "#1F1B18",
  cheek: "#FFA0B4",
  tongue: "#FF6F8A",
  hi: "#FFF6EB",
};

type Pixel = [x: number, y: number, color: string];

// Body — frame A (idle)
const BODY_A: Pixel[] = [
  // ears
  [3, 1, C.outline], [4, 1, C.outline],
  [9, 1, C.outline], [10, 1, C.outline],
  [3, 2, C.body], [4, 2, C.body],
  [9, 2, C.body], [10, 2, C.body],
  [4, 3, C.bodyDark], [9, 3, C.bodyDark],
  // head outline
  [2, 2, C.outline], [11, 2, C.outline],
  [2, 3, C.outline], [11, 3, C.outline],
  [1, 4, C.outline], [12, 4, C.outline],
  [1, 5, C.outline], [12, 5, C.outline],
  [1, 6, C.outline], [12, 6, C.outline],
  [2, 7, C.outline], [11, 7, C.outline],
  // head fill
  [3, 3, C.body], [5, 3, C.body], [6, 3, C.body], [7, 3, C.body], [8, 3, C.body], [10, 3, C.body],
  [2, 4, C.body], [3, 4, C.body], [4, 4, C.body], [5, 4, C.body], [6, 4, C.body], [7, 4, C.body], [8, 4, C.body], [9, 4, C.body], [10, 4, C.body], [11, 4, C.body],
  [2, 5, C.body], [3, 5, C.body], [4, 5, C.body], [5, 5, C.body], [6, 5, C.body], [7, 5, C.body], [8, 5, C.body], [9, 5, C.body], [10, 5, C.body], [11, 5, C.body],
  [2, 6, C.body], [3, 6, C.body], [4, 6, C.body], [5, 6, C.body], [6, 6, C.body], [7, 6, C.body], [8, 6, C.body], [9, 6, C.body], [10, 6, C.body], [11, 6, C.body],
  [3, 7, C.body], [4, 7, C.belly], [5, 7, C.belly], [6, 7, C.belly], [7, 7, C.belly], [8, 7, C.belly], [9, 7, C.belly], [10, 7, C.body],
  // body
  [3, 8, C.outline], [10, 8, C.outline],
  [4, 8, C.body], [5, 8, C.belly], [6, 8, C.belly], [7, 8, C.belly], [8, 8, C.belly], [9, 8, C.body],
  [3, 9, C.outline], [10, 9, C.outline],
  [4, 9, C.body], [5, 9, C.belly], [6, 9, C.belly], [7, 9, C.belly], [8, 9, C.belly], [9, 9, C.body],
  // feet
  [3, 10, C.outline], [4, 10, C.outline], [5, 10, C.outline],
  [8, 10, C.outline], [9, 10, C.outline], [10, 10, C.outline],
  // tail
  [11, 8, C.outline], [12, 8, C.body], [13, 8, C.outline],
  [11, 9, C.outline], [12, 9, C.bodyDark], [13, 9, C.outline],
  [12, 10, C.outline],
  // highlight
  [4, 4, C.hi], [3, 5, C.hi],
];

// Body frame B — slight bob (everything down 0 px, slight ear wiggle)
const BODY_B: Pixel[] = BODY_A.map(([x, y, c]) => [x, y, c] as Pixel);

// Eye/mouth overlays per state
const EYES_OPEN: Pixel[] = [
  [4, 5, C.eye], [9, 5, C.eye],
  [4, 6, C.eye], [9, 6, C.eye],
];

const EYES_BLINK: Pixel[] = [
  [4, 6, C.eye], [9, 6, C.eye],
];

const EYES_LOOK_RIGHT: Pixel[] = [
  [5, 5, C.eye], [10, 5, C.eye],
  [5, 6, C.eye], [10, 6, C.eye],
];

const EYES_LOOK_LEFT: Pixel[] = [
  [3, 5, C.eye], [8, 5, C.eye],
  [3, 6, C.eye], [8, 6, C.eye],
];

const EYES_CLOSED: Pixel[] = [
  [4, 6, C.eye], [9, 6, C.eye],
  [3, 6, C.eye], [10, 6, C.eye],
];

const EYES_HAPPY: Pixel[] = [
  [3, 6, C.eye], [4, 5, C.eye], [5, 6, C.eye],
  [8, 6, C.eye], [9, 5, C.eye], [10, 6, C.eye],
];

/** Heart-shaped eyes — two pink pixels per eye, top brighter than bottom.
    Used by the "love" state to telegraph fondness. */
const EYES_LOVE: Pixel[] = [
  [4, 5, C.tongue], [5, 5, C.tongue], [4, 6, C.cheek],
  [9, 5, C.tongue], [10, 5, C.tongue], [9, 6, C.cheek],
];

/** Droopy half-closed eyes — used by the "sad" state. Single-row eyes
    sit lower than the open ones to suggest gentle dejection. */
const EYES_SAD: Pixel[] = [
  [3, 7, C.eye], [4, 7, C.eye],
  [9, 7, C.eye], [10, 7, C.eye],
];

const CHEEKS: Pixel[] = [
  [3, 7, C.cheek], [10, 7, C.cheek],
];

const MOUTH_NEUTRAL: Pixel[] = [[6, 7, C.eye], [7, 7, C.eye]];
const MOUTH_OPEN: Pixel[] = [
  [6, 7, C.eye], [7, 7, C.eye],
  [6, 8, C.tongue], [7, 8, C.tongue],
];
const MOUTH_YAWN: Pixel[] = [
  [5, 7, C.eye], [6, 7, C.eye], [7, 7, C.eye], [8, 7, C.eye],
  [6, 8, C.tongue], [7, 8, C.tongue],
];
/** Wide soft smile — used by "happy" + "love". */
const MOUTH_SMILE: Pixel[] = [
  [5, 8, C.eye], [6, 8, C.eye], [7, 8, C.eye], [8, 8, C.eye],
];
/** Downturned mouth — used by "sad". */
const MOUTH_SAD: Pixel[] = [
  [6, 9, C.eye], [7, 9, C.eye],
];

function pixelsForState(
  state: PetState,
  bob: boolean,
  cursorDir: -1 | 0 | 1,
): Pixel[] {
  const body = bob ? BODY_B : BODY_A;
  let eyes: Pixel[] = EYES_OPEN;
  let mouth: Pixel[] = MOUTH_NEUTRAL;

  switch (state) {
    case "blink":
      eyes = EYES_BLINK;
      break;
    case "sleep":
      eyes = EYES_CLOSED;
      mouth = [];
      break;
    case "yawn":
      eyes = EYES_BLINK;
      mouth = MOUTH_YAWN;
      break;
    case "talk":
      eyes = EYES_OPEN;
      mouth = MOUTH_OPEN;
      break;
    case "excited":
      eyes = EYES_HAPPY;
      mouth = MOUTH_OPEN;
      break;
    case "happy":
      eyes = EYES_HAPPY;
      mouth = MOUTH_SMILE;
      break;
    case "love":
      eyes = EYES_LOVE;
      mouth = MOUTH_SMILE;
      break;
    case "sad":
      eyes = EYES_SAD;
      mouth = MOUTH_SAD;
      break;
    case "look":
      eyes =
        cursorDir > 0 ? EYES_LOOK_RIGHT : cursorDir < 0 ? EYES_LOOK_LEFT : EYES_OPEN;
      break;
    case "curious":
      eyes = cursorDir < 0 ? EYES_LOOK_LEFT : EYES_LOOK_RIGHT;
      mouth = MOUTH_NEUTRAL;
      break;
    default:
      eyes = EYES_OPEN;
      mouth = MOUTH_NEUTRAL;
  }

  // Overlay rules: cheeks always, eyes/mouth replace body pixels at same coords
  const replaced = new Map<string, string>();
  [...CHEEKS, ...eyes, ...mouth].forEach(([x, y, c]) => {
    replaced.set(`${x}:${y}`, c);
  });
  return body.map(([x, y, c]): Pixel => {
    const k = `${x}:${y}`;
    return replaced.has(k) ? [x, y, replaced.get(k)!] : [x, y, c];
  }).concat(
    // add any overlay pixel that wasn't on a body cell
    [...CHEEKS, ...eyes, ...mouth].filter(([x, y]) => {
      const k = `${x}:${y}`;
      return !body.some(([bx, by]) => `${bx}:${by}` === k);
    }),
  );
}

function PixelSprite({ pixels, scale = 1 }: { pixels: Pixel[]; scale?: number }) {
  return (
    <svg
      viewBox="0 0 14 12"
      width={14 * 6 * scale}
      height={12 * 6 * scale}
      shapeRendering="crispEdges"
      style={{ display: "block" }}
    >
      {pixels.map(([x, y, c], i) => (
        <rect key={`${x}-${y}-${i}`} x={x} y={y} width={1} height={1} fill={c} />
      ))}
    </svg>
  );
}

export function PixelPet() {
  const { lang } = useI18n();
  const pathname = usePathname();
  const reduce = useReducedMotion();

  const [state, setState] = useState<PetState>("idle");
  const [bob, setBob] = useState(false);
  const [section, setSection] = useState<keyof (typeof SECTION_LINES)["en"] | null>(null);
  const [bubble, setBubble] = useState<string | null>(null);
  const [cursorDir, setCursorDir] = useState<-1 | 0 | 1>(0);
  const [position, setPosition] = useState<PetPosition>(() => ({ x: 0, y: 0 }));
  const [ready, setReady] = useState(false);
  const [moving, setMoving] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [side, setSide] = useState<PetSide>("right");
  const lastInteraction = useRef<number>(0);
  const bubbleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const moveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const routeTimers = useRef<Array<ReturnType<typeof setTimeout>>>([]);
  const sleepStartTime = useRef<number | null>(null);
  const stateRef = useRef<PetState>("idle");
  const positionRef = useRef<PetPosition>({ x: 0, y: 0 });
  const chatOpenRef = useRef(false);
  // Stroke interaction — counts pointer moves while over the pet so we
  // can fire a "love" reaction after a few strokes. Cooldown ref prevents
  // re-fires within 4s.
  const strokeCountRef = useRef(0);
  const lastStrokeFireRef = useRef(0);
  const draggingRef = useRef(false);
  const petMovedRef = useRef(false);
  const lastPointerRef = useRef<{ x: number; y: number } | null>(null);

  const isHome = pathname === "/";

  const showBubble = useCallback((text: string, ms = 3000) => {
    setBubble(text);
    if (bubbleTimer.current) clearTimeout(bubbleTimer.current);
    bubbleTimer.current = setTimeout(() => setBubble(null), ms);
  }, []);

  const movePet = useCallback(
    (nextPosition: PetPosition, options?: { immediate?: boolean }) => {
      const clamped = clampPetPosition(nextPosition);
      routeTimers.current.forEach((timer) => clearTimeout(timer));
      routeTimers.current = [];

      setReady(true);
      if (reduce || options?.immediate) {
        positionRef.current = clamped;
        setPosition(clamped);
        setSide(clamped.x < (typeof window === "undefined" ? 0 : window.innerWidth / 2) ? "left" : "right");
        return;
      }

      const route = petEdgeRoute(positionRef.current, clamped);
      setMoving(true);
      route.forEach((point, index) => {
        const timer = setTimeout(() => {
          positionRef.current = point;
          setPosition(point);
          setSide(point.x < window.innerWidth / 2 ? "left" : "right");
        }, index * 920);
        routeTimers.current.push(timer);
      });
      if (moveTimer.current) clearTimeout(moveTimer.current);
      moveTimer.current = setTimeout(() => setMoving(false), route.length * 920 + 680);
    },
    [reduce],
  );

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    positionRef.current = position;
  }, [position]);

  useEffect(() => {
    lastInteraction.current = Date.now();
    const frame = requestAnimationFrame(() => {
      movePet(bottomRightSpot(), { immediate: true });
    });

    const handleResize = () => {
      movePet(clampPetPosition(positionRef.current), { immediate: true });
    };

    window.addEventListener("resize", handleResize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", handleResize);
    };
  }, [movePet]);

  useEffect(() => {
    const handleChatState = (event: Event) => {
      const custom = event as CustomEvent<{ open?: boolean }>;
      chatOpenRef.current = Boolean(custom.detail?.open);
    };
    window.addEventListener("bingo-pet:chat:state", handleChatState);
    return () => window.removeEventListener("bingo-pet:chat:state", handleChatState);
  }, []);

  // Heartbeat: blink/bob/yawn/sleep state machine
  useEffect(() => {
    if (reduce) return;
    let alive = true;
    const tick = () => {
      if (!alive) return;
      const now = Date.now();
      const sinceInteraction = now - lastInteraction.current;
      // Don't override talk/excited transient states
      setState((prev) => {
        if (prev === "talk" || prev === "excited") return prev;
        if (sinceInteraction > 35000) return "sleep";
        if (sinceInteraction > 16000) return "yawn";
        if (Math.random() < 0.08) return "curious";
        // Random blink
        if (Math.random() < 0.18) return "blink";
        return "idle";
      });
    };
    const interval = setInterval(tick, 1400);
    return () => {
      alive = false;
      clearInterval(interval);
    };
  }, [reduce]);

  // Sleep bubble (shows zzz periodically when sleeping)
  useEffect(() => {
    if (state === "sleep" && sleepStartTime.current === null) {
      sleepStartTime.current = Date.now();
    } else if (state !== "sleep") {
      sleepStartTime.current = null;
    }
  }, [state]);

  // Body bob — runs at 600ms when idle, faster when excited
  useEffect(() => {
    if (reduce) return;
    const period =
      state === "excited" ? 220 : state === "sleep" ? 1600 : state === "yawn" ? 900 : 600;
    const id = setInterval(() => setBob((b) => !b), period);
    return () => clearInterval(id);
  }, [state, reduce]);

  // Cursor tracking for eye direction
  useEffect(() => {
    if (reduce) return;
    const handler = (e: globalThis.PointerEvent) => {
      if (draggingRef.current && lastPointerRef.current) {
        const dx = e.clientX - lastPointerRef.current.x;
        const dy = e.clientY - lastPointerRef.current.y;
        if (Math.abs(dx) + Math.abs(dy) > 5) petMovedRef.current = true;
        const next = clampPetPosition({
          x: positionRef.current.x + dx,
          y: positionRef.current.y + dy,
        });
        positionRef.current = next;
        setPosition(next);
        setSide(next.x < window.innerWidth / 2 ? "left" : "right");
        setMoving(true);
        setState((prev) => (prev === "sleep" ? "excited" : "look"));
        lastPointerRef.current = { x: e.clientX, y: e.clientY };
        lastInteraction.current = Date.now();
        return;
      }

      const pet = positionRef.current;
      const anchorX = pet.x + PET_SIZE.width / 2;
      const dx = e.clientX - anchorX;
      const newDir: -1 | 0 | 1 = dx > 80 ? 1 : dx < -80 ? -1 : 0;
      setCursorDir(newDir);
      lastInteraction.current = Date.now();
      // Snap pet awake if it was sleeping
      setState((prev) =>
        prev === "sleep" || prev === "yawn" ? "look" : prev === "idle" ? "look" : prev,
      );
    };
    const handleUp = () => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      lastPointerRef.current = null;
      setDragging(false);
      if (moveTimer.current) clearTimeout(moveTimer.current);
      moveTimer.current = setTimeout(() => setMoving(false), 420);
    };
    window.addEventListener("pointermove", handler);
    window.addEventListener("pointerup", handleUp);
    window.addEventListener("pointercancel", handleUp);
    return () => {
      window.removeEventListener("pointermove", handler);
      window.removeEventListener("pointerup", handleUp);
      window.removeEventListener("pointercancel", handleUp);
    };
  }, [reduce]);

  // Section observer — narration on entering a section
  useEffect(() => {
    if (!isHome) return;
    const ids: Array<keyof (typeof SECTION_LINES)["en"]> = [
      "hero",
      "about",
      "experience",
      "research",
      "contact",
    ];
    const nodes = ids
      .map((id) => document.getElementById(id))
      .filter((node): node is HTMLElement => Boolean(node));
    if (!nodes.length) return;

    const seen = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const id = visible.target.id as keyof (typeof SECTION_LINES)["en"];
        if (seen.has(id)) {
          setSection(id);
          return;
        }
        seen.add(id);
        setSection(id);
        // Excite + show bubble on first entry
        setState("excited");
        const line = SECTION_LINES[lang][id];
        showBubble(line, 3400);
        movePet(sectionPetSpot(id));
        lastInteraction.current = Date.now();
        setTimeout(() => {
          setState((prev) => (prev === "excited" ? "idle" : prev));
        }, 1200);
      },
      { threshold: [0.3, 0.5, 0.7] },
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [isHome, lang, movePet, showBubble]);

  // Update narration when language changes
  useEffect(() => {
    if (!section) return;
    const rafId = requestAnimationFrame(() => {
      showBubble(SECTION_LINES[lang][section], 3400);
    });
    return () => cancelAnimationFrame(rafId);
  }, [lang, section, showBubble]);

  // Gentle roaming: if the user pauses, the pet finds a nearby perch by
  // itself. ~25% of those moments now flip into a mood state (happy, in
  // love, or briefly sad) for personality. A mood state auto-decays back
  // to idle after ~2.2s. The bubble line matches the mood when fired.
  useEffect(() => {
    if (reduce || !ready) return;
    const id = window.setInterval(() => {
      if (document.hidden) return;
      const sinceInteraction = Date.now() - lastInteraction.current;
      if (sinceInteraction < 18000) return;
      if (chatOpenRef.current) return;
      if (stateRef.current === "sleep" || draggingRef.current) return;
      movePet(nearbyPetSpot(positionRef.current));

      // 70% chance: ordinary look/curious. 30% chance: a mood.
      const moodRoll = Math.random();
      let pickedMood: "happy" | "love" | "sad" | null = null;
      if (moodRoll < 0.12) pickedMood = "happy";
      else if (moodRoll < 0.2) pickedMood = "love";
      else if (moodRoll < 0.3 && sinceInteraction > 45000) pickedMood = "sad";

      if (pickedMood) {
        setState(pickedMood);
        const linesByMood = {
          happy: HAPPY_LINES[lang],
          love: LOVE_LINES[lang],
          sad: SAD_LINES[lang],
        } as const;
        const lines = linesByMood[pickedMood];
        showBubble(lines[Math.floor(Math.random() * lines.length)], 2600);
        // Decay back to idle after a couple of seconds so the mood is a
        // moment, not a permanent face.
        setTimeout(() => {
          setState((prev) => (prev === pickedMood ? "idle" : prev));
        }, 2200);
      } else {
        setState(Math.random() < 0.42 ? "curious" : "look");
        if (Math.random() < 0.45) {
          const lines = ROAM_LINES[lang];
          showBubble(lines[Math.floor(Math.random() * lines.length)], 2400);
        }
      }
    }, 22000);
    return () => window.clearInterval(id);
  }, [lang, movePet, ready, reduce, showBubble]);

  function handlePetPointerDown(event: ReactPointerEvent<HTMLButtonElement>) {
    if (reduce) return;
    draggingRef.current = true;
    petMovedRef.current = false;
    lastPointerRef.current = { x: event.clientX, y: event.clientY };
    setDragging(true);
    lastInteraction.current = Date.now();
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePetClick(event: ReactMouseEvent<HTMLButtonElement>) {
    if (petMovedRef.current) {
      event.preventDefault();
      petMovedRef.current = false;
      showBubble(lang === "en" ? "new spot saved ✦" : "新位置已占领 ✦", 1800);
      setTimeout(() => setState("idle"), 700);
      return;
    }
    lastInteraction.current = Date.now();
    if (state === "sleep" || state === "yawn") {
      setState("excited");
      showBubble(lang === "en" ? "ah! you're back ✦" : "啊! 你回来了 ✦", 2400);
      setTimeout(() => setState("idle"), 1200);
      return;
    }
    // Random fun line. Briefly flash "love" before settling into "talk" —
    // small reward for the user clicking the pet.
    const lines = ROAM_LINES[lang];
    const line = lines[Math.floor(Math.random() * lines.length)];
    setState("love");
    showBubble(lang === "en" ? "ask me about Xubin ✦" : "可以问我关于徐斌的事 ✦", 2400);
    setTimeout(() => {
      setState((prev) => (prev === "love" ? "talk" : prev));
    }, 700);
    chatOpenRef.current = true;
    // Send the pet's current position with the open event so PetChat can
    // anchor itself adjacent to the pet (chat box now follows the pet's
    // location instead of being hard-fixed at the bottom-right).
    window.dispatchEvent(
      new CustomEvent("bingo-pet:chat:open", {
        detail: {
          x: positionRef.current.x,
          y: positionRef.current.y,
          side,
        },
      }),
    );
    window.setTimeout(() => showBubble(line, 1800), 280);
    setTimeout(() => setState("idle"), 1400);
  }

  // Auto-idle reset when nothing interacts
  useEffect(() => {
    return () => {
      if (bubbleTimer.current) clearTimeout(bubbleTimer.current);
      if (moveTimer.current) clearTimeout(moveTimer.current);
      routeTimers.current.forEach((timer) => clearTimeout(timer));
      routeTimers.current = [];
    };
  }, []);

  const pixels = useMemo(
    () => pixelsForState(state, bob, cursorDir),
    [state, bob, cursorDir],
  );

  return (
    <motion.div
      className="pixel-pet no-print"
      data-dragging={dragging ? "true" : "false"}
      data-moving={moving ? "true" : "false"}
      data-ready={ready ? "true" : "false"}
      data-side={side}
      data-state={state}
      animate={{ x: position.x, y: position.y, opacity: ready ? 1 : 0 }}
      initial={false}
      transition={
        reduce
          ? { duration: 0 }
          : moving
          ? { type: "tween", duration: 0.9, ease: [0.22, 1, 0.36, 1] }
          : { type: "spring", stiffness: 70, damping: 18, mass: 0.8 }
      }
    >
      <AnimatePresence>
        {bubble && (
          <motion.div
            key={bubble}
            className="pixel-pet__bubble"
            initial={reduce ? { opacity: 1 } : { opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 6, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            {bubble}
            <span className="pixel-pet__bubble-tail" aria-hidden />
          </motion.div>
        )}
      </AnimatePresence>

      {state === "sleep" && (
        <span className="pixel-pet__zzz" aria-hidden>
          z<span>z</span>
          <span>z</span>
        </span>
      )}

      <button
        type="button"
        className="pixel-pet__btn"
        aria-label={lang === "en" ? "Wake up Bingo (pet)" : "戳一下 Bingo 宠物"}
        onPointerDown={handlePetPointerDown}
        onClick={handlePetClick}
        onMouseEnter={() => {
          lastInteraction.current = Date.now();
          setState((prev) => (prev === "sleep" ? "yawn" : "look"));
        }}
        onPointerMove={(e) => {
          // "Stroking" — count pointer moves while over the pet. After ~5
          // moves the pet swoons (love state + heart line). Cooldown 4s.
          if (e.pointerType !== "mouse" && e.pointerType !== "pen") return;
          const now = Date.now();
          if (now - lastStrokeFireRef.current < 4000) return;
          strokeCountRef.current += 1;
          if (strokeCountRef.current >= 5) {
            strokeCountRef.current = 0;
            lastStrokeFireRef.current = now;
            lastInteraction.current = now;
            setState("love");
            const lines = LOVE_LINES[lang];
            showBubble(
              lines[Math.floor(Math.random() * lines.length)],
              2400,
            );
            setTimeout(() => {
              setState((prev) => (prev === "love" ? "idle" : prev));
            }, 1900);
          }
        }}
        onPointerLeave={() => {
          strokeCountRef.current = 0;
        }}
      >
        <span className="pixel-pet__trail" aria-hidden>
          <span />
          <span />
          <span />
        </span>
        <span className="pixel-pet__shadow" aria-hidden />
        <span className="pixel-pet__sprite-wrap">
          <PixelSprite pixels={pixels} />
        </span>
      </button>

    </motion.div>
  );
}
