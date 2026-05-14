"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Send, X } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { faqReply } from "@/lib/pet-faq";

type Msg = {
  role: "user" | "assistant";
  content: string;
  source?: string;
  model?: string;
};

const QUICK_QUESTIONS = {
  en: [
    "What is he most proud of at Zoom?",
    "Why Yale?",
    "Tell me about his research",
    "How can I reach him?",
  ],
  zh: [
    "他在 Zoom 最得意的事情是什么？",
    "为什么选耶鲁？",
    "聊聊他的研究",
    "怎么联系他？",
  ],
} as const;

function parseSseBlock(block: string) {
  const lines = block.split(/\r?\n/);
  const event = lines
    .find((line) => line.startsWith("event:"))
    ?.slice(6)
    .trim();
  const data = lines
    .filter((line) => line.startsWith("data:"))
    .map((line) => line.slice(5).trim())
    .join("\n");
  return { event, data };
}

type Anchor = { x: number; y: number; side: "left" | "right" } | null;

export function PetChat() {
  const { lang } = useI18n();
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<Anchor>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streamingActive, setStreamingActive] = useState(false);
  const [source, setSource] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      // Capture pet's position on toggle so the chat lands beside the pet.
      const detail = (e as CustomEvent).detail as Anchor;
      if (detail) setAnchor(detail);
      setOpen((cur) => !cur);
    };
    const openHandler = (e: Event) => {
      const detail = (e as CustomEvent).detail as Anchor;
      if (detail) setAnchor(detail);
      setOpen(true);
    };
    window.addEventListener("bingo-pet:chat:toggle", handler);
    window.addEventListener("bingo-pet:chat:open", openHandler);
    return () => {
      window.removeEventListener("bingo-pet:chat:toggle", handler);
      window.removeEventListener("bingo-pet:chat:open", openHandler);
    };
  }, []);

  // Compute inline style that anchors the chat panel next to the pet.
  // Pet on right half → chat opens to the LEFT of pet; pet on left half
  // → chat opens to the RIGHT. Vertically center the chat on the pet,
  // then clamp to keep it inside the viewport.
  const anchorStyle: React.CSSProperties | undefined = (() => {
    if (!anchor || typeof window === "undefined") return undefined;
    const CHAT_W = 320;
    const CHAT_H = 392;
    const PET_W = 48;
    const PET_H = 48;
    const GAP = 14;
    const vpW = window.innerWidth;
    const vpH = window.innerHeight;
    let left =
      anchor.side === "right"
        ? anchor.x - CHAT_W - GAP
        : anchor.x + PET_W + GAP;
    let top = anchor.y + PET_H / 2 - CHAT_H / 2;
    // Clamp to viewport with margin
    left = Math.max(12, Math.min(vpW - CHAT_W - 12, left));
    top = Math.max(90, Math.min(vpH - CHAT_H - 12, top));
    return {
      left: `${left}px`,
      top: `${top}px`,
      right: "auto",
      bottom: "auto",
    };
  })();

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("bingo-pet:chat:state", { detail: { open } }),
    );
  }, [open]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const ask = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;
      setInput("");
      const next: Msg[] = [...messages, { role: "user", content: trimmed }];
      setMessages(next);
      setLoading(true);
      setStreamingActive(false);

      const appendAssistantDelta = (
        delta: string,
        meta?: { source?: string; model?: string },
      ) => {
        setMessages((cur) => {
          const updated = [...cur];
          const last = updated[updated.length - 1];
          if (!last || last.role !== "assistant") {
            updated.push({
              role: "assistant",
              content: delta,
              source: meta?.source,
              model: meta?.model,
            });
            return updated;
          }
          updated[updated.length - 1] = {
            ...last,
            content: `${last.content}${delta}`,
            source: meta?.source ?? last.source,
            model: meta?.model ?? last.model,
          };
          return updated;
        });
      };

      const appendAssistantReply = (
        reply: string,
        meta?: { source?: string; model?: string },
      ) => {
        setMessages((cur) => [
          ...cur,
          {
            role: "assistant",
            content: reply,
            source: meta?.source,
            model: meta?.model,
          },
        ]);
      };

      try {
        // Try the API route first (works in server-mode deployments).
        // If it returns HTML or fails, fall back to client-side FAQ routing.
        const resp = await fetch("/api/chat", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ messages: next, lang, stream: true }),
        });
        const ct = resp.headers.get("content-type") ?? "";

        if (resp.ok && ct.includes("text/event-stream") && resp.body) {
          const reader = resp.body.getReader();
          const decoder = new TextDecoder();
          let buffer = "";
          let receivedDelta = false;

          const handleBlock = (block: string) => {
            const { event, data } = parseSseBlock(block);
            if (!data || event === "done") return;

            try {
              const json = JSON.parse(data) as {
                delta?: string;
                source?: string;
                model?: string;
              };
              if (json.source) setSource(json.source);
              if (json.delta) {
                receivedDelta = true;
                setStreamingActive(true);
                appendAssistantDelta(json.delta, {
                  source: json.source,
                  model: json.model,
                });
              }
            } catch {
              /* Ignore malformed SSE keep-alive chunks. */
            }
          };

          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const parts = buffer.split(/\r?\n\r?\n/);
            buffer = parts.pop() ?? "";
            parts.forEach(handleBlock);
          }

          if (buffer.trim()) handleBlock(buffer);
          if (!receivedDelta) throw new Error("empty_stream");
        } else if (resp.ok && ct.includes("application/json")) {
          const json = (await resp.json()) as { reply?: string; source?: string; model?: string };
          const reply = json.reply ?? faqReply(trimmed, lang);
          setSource(json.source ?? null);
          // Tiny delay so the typing dots feel real
          await new Promise((r) => setTimeout(r, 350));
          appendAssistantReply(reply, { source: json.source, model: json.model });
        } else {
          throw new Error("not_json");
        }
      } catch {
        // Static export / no API key — use the in-browser FAQ
        await new Promise((r) => setTimeout(r, 480));
        const reply = faqReply(trimmed, lang);
        setSource("faq");
        appendAssistantReply(reply, { source: "faq" });
      } finally {
        setLoading(false);
        setStreamingActive(false);
      }
    },
    [messages, lang, loading],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    ask(input);
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      ask(input);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="pet-chat no-print"
          style={anchorStyle}
          initial={reduce ? { opacity: 1 } : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
          transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
          role="dialog"
          aria-label={lang === "en" ? "Chat with Bingo" : "和 Bingo 聊聊"}
        >
          <header className="pet-chat__head">
            <span className="pet-chat__avatar" aria-hidden />
            <div>
              <strong>{lang === "en" ? "Ask Bingo" : "问问 Bingo"}</strong>
              <small>
                {source === "moonshot"
                  ? lang === "en"
                    ? "answers about Xubin"
                    : "关于徐斌的小问答"
                  : source === "anthropic"
                  ? lang === "en"
                    ? "answers about Xubin"
                    : "关于徐斌的小问答"
                  : source === "faq"
                  ? lang === "en"
                    ? "quick notes from this site"
                    : "来自本站的小资料"
                  : lang === "en"
                  ? "portfolio companion"
                  : "作品集里的小伙伴"}
              </small>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="pet-chat__close"
            >
              <X size={15} />
            </button>
          </header>

          <div className="pet-chat__messages" ref={scrollRef}>
            {messages.length === 0 && (
              <div className="pet-chat__empty">
                <p>
                  {lang === "en"
                    ? "Ask a small question about Xubin's work, research, or how to reach him."
                    : "可以问一个关于徐斌实习、研究、项目或联系方式的小问题。"}
                </p>
                <div className="pet-chat__quick">
                  {QUICK_QUESTIONS[lang].map((q) => (
                    <button key={q} type="button" onClick={() => ask(q)}>
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} className={`pet-chat__msg pet-chat__msg--${m.role}`}>
                <p>{m.content}</p>
              </div>
            ))}

            {loading && !streamingActive && (
              <div className="pet-chat__msg pet-chat__msg--assistant pet-chat__msg--loading">
                <p>
                  <span className="pet-chat__dot" />
                  <span className="pet-chat__dot" />
                  <span className="pet-chat__dot" />
                </p>
              </div>
            )}
          </div>

          <form className="pet-chat__form" onSubmit={handleSubmit}>
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder={
                lang === "en" ? "Ask me about Xubin…" : "问问关于徐斌的事…"
              }
              disabled={loading}
            />
            <button type="submit" disabled={loading || !input.trim()} aria-label="Send">
              <Send size={14} />
            </button>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
