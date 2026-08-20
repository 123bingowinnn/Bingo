import { readFileSync } from "node:fs";
import { join } from "node:path";
import { faqReply } from "@/lib/pet-faq";

/**
 * Pet chat API.
 *
 * Provider precedence (first present wins):
 *   1. MOONSHOT_API_KEY     → Kimi (Moonshot) OpenAI-compatible /v1/chat/completions
 *   2. ANTHROPIC_API_KEY    → Claude Sonnet 4.6 via /v1/messages
 *   3. (none)               → static FAQ keyword router
 *
 * Request:  POST { messages: [{ role: 'user'|'assistant', content: string }, ...], lang: 'en'|'zh' }
 * Response: { reply: string, source: 'anthropic' | 'moonshot' | 'faq', model?: string }
 */

const SYSTEM_PROMPT = readFileSync(
  join(process.cwd(), "content", "agent.md"),
  "utf8",
);

type ChatRequest = {
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  lang?: "en" | "zh";
  stream?: boolean;
};

const DEFAULT_MOONSHOT_MODELS = [
  "kimi-k2.6",
] as const;

function moonshotModels(): string[] {
  const configured = process.env.MOONSHOT_MODEL?.trim();
  return Array.from(
    new Set([
      ...(configured ? [configured] : []),
      ...DEFAULT_MOONSHOT_MODELS,
    ]),
  );
}

async function fetchWithTimeout(
  input: string,
  init: RequestInit,
  timeoutMs = 5200,
) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function streamHeaders() {
  return {
    "content-type": "text/event-stream; charset=utf-8",
    "cache-control": "no-cache, no-transform",
    connection: "keep-alive",
  };
}

function sse(payload: unknown, event?: string) {
  const prefix = event ? `event: ${event}\n` : "";
  return `${prefix}data: ${JSON.stringify(payload)}\n\n`;
}

function streamTextReply(
  reply: string,
  source: "faq" | "moonshot" | "anthropic",
  model?: string,
) {
  const encoder = new TextEncoder();
  const chunks = reply.match(/[\s\S]{1,3}/g) ?? [reply];
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      controller.enqueue(encoder.encode(sse({ source, model }, "meta")));
      for (const delta of chunks) {
        await new Promise((resolve) => setTimeout(resolve, 22));
        controller.enqueue(encoder.encode(sse({ delta, source, model })));
      }
      controller.enqueue(encoder.encode(sse({}, "done")));
      controller.close();
    },
  });

  return new Response(stream, { headers: streamHeaders() });
}

function proxyMoonshotStream(resp: Response, model: string) {
  const upstream = resp.body?.getReader();
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  if (!upstream) return null;

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let buffer = "";
      controller.enqueue(encoder.encode(sse({ source: "moonshot", model }, "meta")));

      const flushEvent = (eventBlock: string) => {
        const lines = eventBlock.split(/\r?\n/);
        const data = lines
          .filter((line) => line.startsWith("data:"))
          .map((line) => line.slice(5).trim())
          .join("\n");

        if (!data || data === "[DONE]") return;

        try {
          const json = JSON.parse(data) as {
            choices?: Array<{ delta?: { content?: string } }>;
          };
          const delta = json.choices?.[0]?.delta?.content ?? "";
          if (delta) {
            controller.enqueue(encoder.encode(sse({ delta, source: "moonshot", model })));
          }
        } catch {
          /* Ignore upstream keep-alive or malformed partial lines. */
        }
      };

      try {
        while (true) {
          const { value, done } = await upstream.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split(/\r?\n\r?\n/);
          buffer = parts.pop() ?? "";
          parts.forEach(flushEvent);
        }

        if (buffer.trim()) flushEvent(buffer);
        controller.enqueue(encoder.encode(sse({}, "done")));
        controller.close();
      } catch {
        controller.enqueue(encoder.encode(sse({ message: "stream_error" }, "error")));
        controller.close();
      }
    },
    cancel() {
      upstream.cancel().catch(() => {});
    },
  });

  return new Response(stream, { headers: streamHeaders() });
}

export async function POST(req: Request) {
  let body: ChatRequest;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "bad_json" }), { status: 400 });
  }

  const messages = Array.isArray(body.messages) ? body.messages : [];
  const lang = body.lang === "zh" ? "zh" : "en";
  const wantsStream = body.stream === true;
  const lastUser = [...messages].reverse().find((m) => m.role === "user")?.content?.slice(0, 1200) ?? "";

  if (!lastUser.trim()) {
    return new Response(JSON.stringify({ error: "empty_input" }), { status: 400 });
  }

  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const moonshotKey = process.env.MOONSHOT_API_KEY;
  const moonshotBaseUrl =
    process.env.MOONSHOT_API_BASE_URL?.replace(/\/$/, "") ?? "https://api.moonshot.cn/v1";

  // 1) Moonshot / Kimi (OpenAI-compatible). Prefer fast models for the small pet chat.
  if (moonshotKey) {
    for (const model of moonshotModels()) {
      try {
        const requestBody = {
          model,
          max_tokens: 220,
          thinking: { type: "disabled" },
          stream: wantsStream ? true : undefined,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...messages.slice(-4).map((m) => ({
              role: m.role,
              content: m.content.slice(0, 850),
            })),
          ],
        };

        if (wantsStream) {
          const resp = await fetch(`${moonshotBaseUrl}/chat/completions`, {
            method: "POST",
            headers: {
              authorization: `Bearer ${moonshotKey}`,
              "content-type": "application/json",
            },
            body: JSON.stringify(requestBody),
          });
          if (resp.ok) {
            const proxied = proxyMoonshotStream(resp, model);
            if (proxied) return proxied;
          }
          continue;
        }

        const resp = await fetchWithTimeout(
          `${moonshotBaseUrl}/chat/completions`,
          {
            method: "POST",
            headers: {
              authorization: `Bearer ${moonshotKey}`,
              "content-type": "application/json",
            },
            body: JSON.stringify(requestBody),
          },
          5200,
        );
        if (resp.ok) {
          const json = (await resp.json()) as { choices?: Array<{ message?: { content?: string } }> };
          const text = json.choices?.[0]?.message?.content ?? "";
          if (text.trim()) {
            return new Response(
              JSON.stringify({ reply: text.trim(), source: "moonshot", model }),
              { headers: { "content-type": "application/json" } },
            );
          }
        }
      } catch {
        /* try the next configured Kimi model, then fall through */
      }
    }
  }

  if (wantsStream) {
    return streamTextReply(faqReply(lastUser, lang), "faq");
  }

  // 2) Anthropic
  if (anthropicKey) {
    try {
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": anthropicKey,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 360,
          system: SYSTEM_PROMPT,
          messages: messages.slice(-8).map((m) => ({
            role: m.role,
            content: m.content.slice(0, 1500),
          })),
        }),
      });
      if (resp.ok) {
        const json = (await resp.json()) as { content?: Array<{ text?: string }> };
        const text = json.content?.map((p) => p.text ?? "").join("") ?? "";
        if (text.trim()) {
          return new Response(
            JSON.stringify({ reply: text.trim(), source: "anthropic", model: "claude-sonnet-4-6" }),
            { headers: { "content-type": "application/json" } },
          );
        }
      }
    } catch {
      /* fall through */
    }
  }

  // 3) FAQ fallback
  return new Response(
    JSON.stringify({ reply: faqReply(lastUser, lang), source: "faq" }),
    { headers: { "content-type": "application/json" } },
  );
}
