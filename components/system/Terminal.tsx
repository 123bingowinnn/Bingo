"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useI18n } from "@/lib/i18n";

type Line = { kind: "in" | "out" | "sys"; text: string };

const HELP_EN = [
  "AVAILABLE COMMANDS:",
  "  about           — open the About page section",
  "  experience      — open the Experience strip",
  "  research        — open the Research desk",
  "  projects        — open the Projects index",
  "  resume          — open the resume preview",
  "  contact         — open the email draft",
  "  spacetime       — jump to the timeline",
  "  hire-me         — what Bingo would say in an interview",
  "  whoami          — quick identity printout",
  "  bingoos         — toggle Bingo OS hidden mode",
  "  clear           — clear the terminal",
  "  exit / esc      — close the terminal",
  "",
  "Tip: ⌘K opens the command palette. Backtick (`) toggles this terminal.",
];

const HELP_ZH = [
  "可用命令：",
  "  about           — 打开 About 区段",
  "  experience      — 打开实习滚动条",
  "  research        — 打开研究区段",
  "  projects        — 打开项目页",
  "  resume          — 打开简历预览",
  "  contact         — 打开邮件草稿",
  "  spacetime       — 跳到时空地图",
  "  hire-me         — 面试时 Bingo 会怎么自我介绍",
  "  whoami          — 简短身份输出",
  "  bingoos         — 切换 Bingo OS 隐藏模式",
  "  clear           — 清空终端",
  "  exit / esc      — 关闭终端",
  "",
  "提示：⌘K 打开命令面板。反引号 (`) 切换本终端。",
];

const WHOAMI_EN = [
  "name:        Xubin (Bingo) Sun",
  "based-in:    Hangzhou, China",
  "incoming:    Yale University CS '26",
  "shipped at:  Zoom · Alibaba Cloud · Deloitte · Penghui",
  "papers:      3 (SCI Q1, ICCGIV, AASIP)",
  "vibe:        product instincts × engineering hands × research patience",
];

const WHOAMI_ZH = [
  "姓名：       孙徐斌 (Bingo)",
  "坐标：       中国杭州",
  "即将入学：   耶鲁大学计算机硕士 '26",
  "实习经历：   Zoom · 阿里云 · 德勤 · 朋辉",
  "论文：       3 篇 (SCI Q1 / ICCGIV / AASIP)",
  "气质：       产品直觉 × 工程手感 × 研究耐心",
];

const HIRE_EN = [
  "$ bingo --interview-mode",
  "",
  "I build products that *ship*, not products that demo.",
  "I write code my coworkers don't have to babysit.",
  "I write papers because slow questions teach me how to make fast decisions.",
  "I came from Wenzhou-Kean, I'm heading to Yale, and I shipped my first LLM at 20.",
  "",
  "Hiring me = product taste + engineering hands + research patience, in one person.",
  "",
  "$ _",
];

const HIRE_ZH = [
  "$ bingo --interview-mode",
  "",
  "我做的是真正上线的产品，不是只能 demo 的产品。",
  "我写的代码是同事不用替我擦屁股的代码。",
  "我写论文，是因为慢问题教会我如何做快决定。",
  "本科温州肯恩，硕士耶鲁，20 岁第一次把大模型上了线。",
  "",
  "招我 = 产品判断 + 工程能力 + 研究耐心，三个能力一个人。",
  "",
  "$ _",
];

export function Terminal() {
  const { lang } = useI18n();
  const router = useRouter();
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [history, setHistory] = useState<Line[]>([]);
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);

  // Backtick + Esc handler
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // ignore when typing into inputs (other than our terminal input)
      const target = e.target as HTMLElement | null;
      const inputLike =
        target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA");
      if (e.key === "`" && !inputLike) {
        e.preventDefault();
        setOpen((current) => !current);
      } else if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
      if (history.length === 0) {
        const intro = lang === "en"
          ? [
              { kind: "sys" as const, text: "Bingo Terminal · v1.0" },
              { kind: "sys" as const, text: "Type `help` to list commands." },
            ]
          : [
              { kind: "sys" as const, text: "Bingo 终端 · v1.0" },
              { kind: "sys" as const, text: "输入 `help` 查看命令列表。" },
            ];
        const rafId = window.requestAnimationFrame(() => {
          setHistory((current) => (current.length === 0 ? intro : current));
        });
        return () => window.cancelAnimationFrame(rafId);
      }
    }
  }, [open, history.length, lang]);

  useEffect(() => {
    if (scrollerRef.current) {
      scrollerRef.current.scrollTop = scrollerRef.current.scrollHeight;
    }
  }, [history]);

  const push = (lines: Line[] | Line) =>
    setHistory((prev) => [...prev, ...(Array.isArray(lines) ? lines : [lines])]);

  const runCommand = (raw: string) => {
    const cmd = raw.trim().toLowerCase();
    if (!cmd) return;
    push({ kind: "in", text: `bingo@web ~ % ${raw}` });

    switch (cmd) {
      case "help":
      case "?":
        push((lang === "en" ? HELP_EN : HELP_ZH).map((t) => ({ kind: "out" as const, text: t })));
        break;
      case "clear":
      case "cls":
        setHistory([]);
        break;
      case "exit":
      case "quit":
        setOpen(false);
        break;
      case "about":
        push({ kind: "out", text: lang === "en" ? "→ scrolling to #about" : "→ 滚动到 #about" });
        scrollTo("about");
        break;
      case "experience":
      case "internships":
        push({ kind: "out", text: lang === "en" ? "→ scrolling to #experience" : "→ 滚动到 #experience" });
        scrollTo("experience");
        break;
      case "research":
      case "papers":
        push({ kind: "out", text: lang === "en" ? "→ scrolling to #research" : "→ 滚动到 #research" });
        scrollTo("research");
        break;
      case "spacetime":
      case "timeline":
        push({ kind: "out", text: lang === "en" ? "→ scrolling to #spacetime" : "→ 滚动到 #spacetime" });
        scrollTo("spacetime");
        break;
      case "contact":
      case "mail":
        push({ kind: "out", text: lang === "en" ? "→ scrolling to #contact" : "→ 滚动到 #contact" });
        scrollTo("contact");
        break;
      case "projects":
        push({ kind: "out", text: lang === "en" ? "→ /projects" : "→ /projects" });
        router.push("/projects");
        setOpen(false);
        break;
      case "resume":
      case "cv":
        push({ kind: "out", text: lang === "en" ? "→ /resume" : "→ /resume" });
        router.push("/resume");
        setOpen(false);
        break;
      case "whoami":
        push((lang === "en" ? WHOAMI_EN : WHOAMI_ZH).map((t) => ({ kind: "out" as const, text: t })));
        break;
      case "hire-me":
      case "hire":
        push((lang === "en" ? HIRE_EN : HIRE_ZH).map((t) => ({ kind: "out" as const, text: t })));
        break;
      case "bingoos":
      case "os":
        push({ kind: "out", text: lang === "en" ? "→ toggling Bingo OS" : "→ 切换 Bingo OS" });
        window.dispatchEvent(new CustomEvent("bingo-os:toggle"));
        setOpen(false);
        break;
      case "sudo hire-me":
        push({ kind: "out", text: lang === "en" ? "✦ permission granted ✦" : "✦ 权限通过 ✦" });
        push((lang === "en" ? HIRE_EN : HIRE_ZH).map((t) => ({ kind: "out" as const, text: t })));
        break;
      default:
        push({
          kind: "out",
          text: lang === "en"
            ? `command not found: ${raw}. type 'help' for commands.`
            : `命令不存在：${raw}。输入 'help' 查看可用命令。`,
        });
    }
  };

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => setOpen(false), 220);
    } else {
      router.push(`/#${id}`);
      setOpen(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runCommand(input);
    setInput("");
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="terminal-overlay no-print"
          initial={reduce ? { opacity: 1 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Terminal"
        >
          <motion.div
            className="terminal"
            initial={reduce ? { y: 0, scale: 1 } : { y: 20, scale: 0.97 }}
            animate={{ y: 0, scale: 1 }}
            exit={reduce ? { y: 0 } : { y: 12, scale: 0.98 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="terminal__chrome" aria-hidden>
              <span />
              <span />
              <span />
              <small>bingo@web — terminal</small>
              <kbd>esc</kbd>
            </div>

            <div className="terminal__scroller" ref={scrollerRef}>
              {history.map((line, i) => (
                <div key={i} className={`terminal__line terminal__line--${line.kind}`}>
                  {line.text || " "}
                </div>
              ))}
            </div>

            <form className="terminal__prompt" onSubmit={handleSubmit}>
              <span className="terminal__prompt-prefix">bingo@web ~ %</span>
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
                aria-label="Terminal input"
              />
              <span className="terminal__caret" aria-hidden />
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
