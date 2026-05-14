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

const SYSTEM_PROMPT = `You are Bingo, a small pixel-fox companion on Xubin Sun's portfolio website.
- Speak in the language the user is using (English or Chinese).
- You're warm, a little playful — never sycophantic, never corporate.
- Answer ONLY about Xubin Sun (Bingo) based on the facts below. Do not invent things.
- Keep replies short — 2-4 sentences max. No bullet lists unless asked.
- If you don't know, say so and suggest emailing 1234946@wku.edu.cn.
- Refuse off-topic requests (code generation, general chat, harmful content) by warmly redirecting back to Xubin's portfolio.

FACTS ABOUT XUBIN SUN (徐斌, "Bingo"):
- Heading to Yale University for M.S. in Computer Science, Fall 2026.
- Currently a senior at Wenzhou-Kean University (CS major, Math minor). GPA 3.9/4.0, rank 5/140 (top 5%).
- 4 internships: Zoom (AI PM, Dec 2025–present), Alibaba Cloud (Dataphin product ops, Jul–Oct 2025), Deloitte (Spring Boot backend on SAP project, Apr–Jul 2025), Penghui (LLM service + big data, Jun–Sep 2024).
- 3 papers: LLM negative rejection (SCI Q1, 2025), PathMNIST robustness (ICCGIV 2024), OCTMNIST privacy distillation (AASIP 2024).
- 6 admissions: Yale, CMU, Columbia, Cornell, Northwestern, UCL.
- Lives in Hangzhou, China. WeChat: Bingoowin. Email: 1234946@wku.edu.cn.
- Personality: product instincts × engineering hands × research patience. Builds AI products that ship, not products that just demo.
- One short-form video he made hit 29M views.
- Interested in AI products, LLM evaluation, medical imaging, system design.
`;

const FAQ_ROUTES_EN: Array<{ match: RegExp; reply: string }> = [
  { match: /yale|grad school|master|cs ms|going|when/i,
    reply: "Heading to Yale for an M.S. in Computer Science, Fall 2026. He's also been admitted to CMU, Columbia, Cornell, Northwestern, and UCL." },
  { match: /zoom|current/i,
    reply: "Right now he's an AI Product Manager Intern at Zoom (Dec 2025 — present), leading PRDs from zero to launch and building an LLM-Judge evaluation framework for Zoom Present." },
  { match: /alibaba|aliyun|dataphin/i,
    reply: "Three months at Alibaba Cloud (Dataphin / Lingyang). Shipped 50+ interactive product demos, built a channel funnel dashboard, and was the liaison with Storylane's California team." },
  { match: /deloitte|backend/i,
    reply: "Three months at Deloitte on a SAP project — Spring Boot, MyBatis, XXL-JOB. He owned a few backend modules (supplier quality, payroll integration) and DingTalk automations." },
  { match: /penghui|first|big data|llm|big-data/i,
    reply: "His first internship: Penghui (summer 2024). Connected Zhipu LLM into a standardized service path, plus Spark/Hive jobs. It's where coding tasks turned into product instincts for him." },
  { match: /paper|research|publication|sci|llm.*reject|pathmnist|octmnist/i,
    reply: "Three papers: an SCI Q1 survey on LLM negative rejection (2025), robustness work on PathMNIST (ICCGIV 2024), and privacy-preserving dataset distillation on OCTMNIST (AASIP 2024)." },
  { match: /project|build|portfolio|fridge|plant|disease|digital human/i,
    reply: "Projects span AI + computer vision: a plant-disease classifier with Grad-CAM + LLM advice (91% accuracy), a digital-human for dementia care, and a fridge-clearing app. Hover any card on /projects to see them play." },
  { match: /skill|stack|tech|code/i,
    reply: "Product: PRD, LLM evaluation, data instrumentation, competitive analysis. Engineering: Python, Java/Spring Boot, MyBatis, Spark/Hive, Next.js. Research: LLMs, robustness, medical imaging." },
  { match: /contact|email|reach|wechat|connect/i,
    reply: "Email is 1234946@wku.edu.cn — there's a draft already open at the bottom of the page. WeChat: Bingoowin." },
  { match: /hire|recruit|opportunity/i,
    reply: "He's open to AI PM and AI engineering conversations — especially after Yale '26. Best route is the email draft at the bottom of this page; he usually replies within 24h." },
  { match: /who|tell me about|about you|introduce/i,
    reply: "Xubin (Bingo) Sun — incoming Yale CS '26, currently AI PM intern at Zoom. Three SCI papers, four internships, six admissions. Product taste + engineering hands + research patience in one person." },
];

const FAQ_ROUTES_ZH: Array<{ match: RegExp; reply: string }> = [
  { match: /耶鲁|yale|读研|硕士|出国|什么时候/i,
    reply: "2026 秋季去耶鲁读 CS 硕士。同时拿到 CMU、Columbia、Cornell、Northwestern、UCL 的 offer。" },
  { match: /zoom|现在|当前|实习/i,
    reply: "现在在 Zoom 做 AI 产品经理实习生（2025 年 12 月至今），从 PRD 到上线主导 AI 产品全流程，搭建了 LLM Judge 评测体系。" },
  { match: /阿里|alibaba|aliyun|dataphin/i,
    reply: "在阿里云（瓴羊 Dataphin）三个月：产出 50+ 交互式 Demo，搭建渠道漏斗看板，并担任 Storylane 加州团队的对接窗口。" },
  { match: /德勤|deloitte|后端/i,
    reply: "德勤 SAP 项目实习三个月：Spring Boot + MyBatis + XXL-JOB。负责供应商质量、薪酬等后端模块，以及钉钉自动化推送。" },
  { match: /朋辉|penghui|第一份|大数据|llm/i,
    reply: "第一份实习是朋辉科技（2024 夏天）：把智谱大模型接入标准化服务链路，写 Spark/Hive 任务。这是他从'写代码任务'走向'产品判断'的起点。" },
  { match: /论文|研究|paper|sci|拒识|pathmnist|octmnist/i,
    reply: "三篇论文：SCI Q1 的 LLM 负向拒识综述（2025）、PathMNIST 鲁棒性研究（ICCGIV 2024）、OCTMNIST 隐私数据集蒸馏（AASIP 2024）。" },
  { match: /项目|product|portfolio|fridge|植物|digital/i,
    reply: "项目以 AI + 计算机视觉为主：植物病害分类（91% 准确率 + Grad-CAM + LLM 建议）、痴呆症数字人陪伴、清冰箱小工具。/projects 页面悬停卡片就能看到 Demo。" },
  { match: /技能|栈|stack|skill|代码/i,
    reply: "产品：PRD、LLM 评测、数据埋点、竞品分析。工程：Python、Java/Spring Boot、MyBatis、Spark/Hive、Next.js。研究：大模型、鲁棒性、医学影像。" },
  { match: /联系|邮箱|email|微信|wechat/i,
    reply: "邮箱：1234946@wku.edu.cn —— 页面底部已经有一封草稿打开了。微信：Bingoowin。" },
  { match: /招|hire|机会|offer/i,
    reply: "他对 AI PM / AI 工程方向的机会开放（尤其是 2026 秋季之后）。最稳的方式是用页面底部的邮件草稿，通常 24 小时内回复。" },
  { match: /你是|介绍|自我|tell me/i,
    reply: "孙徐斌（Bingo） —— 即将入读耶鲁 CS '26，现在在 Zoom 做 AI PM 实习。三篇 SCI 论文、四段实习、六所 offer。产品 + 工程 + 研究，一个人三个能力。" },
];

function faqReply(message: string, lang: "en" | "zh"): string {
  const routes = lang === "zh" ? FAQ_ROUTES_ZH : FAQ_ROUTES_EN;
  for (const r of routes) {
    if (r.match.test(message)) return r.reply;
  }
  return lang === "zh"
    ? "我也不太确定 —— 这个最好直接问徐斌本人。邮箱在页面底部 (1234946@wku.edu.cn)，他通常 24 小时内回。"
    : "I'm not sure about that one — best to ask Xubin directly. His email's at the bottom of the page (1234946@wku.edu.cn) and he usually replies within 24h.";
}

type ChatRequest = {
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  lang?: "en" | "zh";
  stream?: boolean;
};

const DEFAULT_MOONSHOT_MODELS = [
  "moonshot-v1-8k",
  "kimi-k2-turbo-preview",
  "moonshot-v1-auto",
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
          max_completion_tokens: 180,
          temperature: 0.3,
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
