import type { Lang } from "@/lib/types";

export type StoryPhoto = {
  label: { en: string; zh: string };
  note: { en: string; zh: string };
  src?: string;
};

export type ExperienceStory = {
  accent: string;
  shortName: string;
  routeSlug?: string;
  marquee: { en: string; zh: string };
  opening: { en: string; zh: string };
  artifacts: Array<{
    tag: string;
    title: { en: string; zh: string };
    detail: { en: string; zh: string };
  }>;
  learnings: Array<{ en: string; zh: string }>;
  photos: StoryPhoto[];
};

export type ResearchStory = {
  accent: string;
  headline: { en: string; zh: string };
  note: { en: string; zh: string };
  question: { en: string; zh: string };
  contribution: Array<{ en: string; zh: string }>;
  methods: string[];
  citationKey: string;
};

export const EXPERIENCE_STORIES: Record<string, ExperienceStory> = {
  "zoom-pm": {
    accent: "#0b5cff",
    shortName: "Zoom",
    marquee: {
      en: "From PRD to AI evaluation loops.",
      zh: "从 PRD 到 AI 评测闭环。",
    },
    opening: {
      en: "This is the internship where product taste became operational: requirements, AI quality, mobile flows, and a lot of cross-functional translation.",
      zh: "这是我把产品判断落到执行里的实习：需求、AI 质量、移动端流程，以及大量跨职能沟通。",
    },
    artifacts: [
      {
        tag: "PRD",
        title: { en: "AI editing flows", zh: "AI 编辑流程" },
        detail: {
          en: "Scoped mobile AI editing experiences from user intent to launch checklist.",
          zh: "从用户意图到上线清单，梳理移动端 AI 编辑体验。",
        },
      },
      {
        tag: "EVAL",
        title: { en: "LLM Judge rubric", zh: "LLM Judge 评测体系" },
        detail: {
          en: "Designed criteria for content quality, visual structure, and narrative coherence.",
          zh: "设计内容质量、视觉结构、叙事连贯性的评测维度。",
        },
      },
      {
        tag: "BENCH",
        title: { en: "AI slides benchmark", zh: "AI Slides 竞品评测" },
        detail: {
          en: "Compared end-to-end generation quality across multiple AI presentation tools.",
          zh: "横向比较多个 AI 演示文稿工具的端到端生成质量。",
        },
      },
    ],
    learnings: [
      { en: "Good AI products need judgment loops, not only model calls.", zh: "好的 AI 产品需要判断闭环，不只是模型调用。" },
      { en: "A PRD is most useful when it reduces ambiguity for every function.", zh: "PRD 最有价值的地方，是帮每个职能减少歧义。" },
      { en: "Mobile flows punish vague product thinking very quickly.", zh: "移动端流程会很快惩罚模糊的产品思考。" },
    ],
    photos: [
      {
        label: { en: "Workspace", zh: "工作现场" },
        note: { en: "Drop an office or badge photo here.", zh: "这里可以放办公室或工牌照片。" },
      },
      {
        label: { en: "PRD sketch", zh: "PRD 草图" },
        note: { en: "Sensitive text can be blurred.", zh: "敏感文字可以打码。" },
      },
      {
        label: { en: "Evaluation board", zh: "评测看板" },
        note: { en: "A cropped screenshot works well.", zh: "局部截图会很合适。" },
      },
    ],
  },
  "alibaba-cloud": {
    accent: "#ff6a00",
    shortName: "Alibaba Cloud",
    marquee: {
      en: "Data products, demos, and GTM details.",
      zh: "数据产品、Demo 与 GTM 细节。",
    },
    opening: {
      en: "Alibaba Cloud gave me a closer look at how enterprise data products are explained, packaged, measured, and shipped to real customers.",
      zh: "阿里云让我更近地看到企业级数据产品如何被解释、包装、度量，并真正交付给客户。",
    },
    artifacts: [
      {
        tag: "DEMO",
        title: { en: "Interactive product demos", zh: "交互式产品 Demo" },
        detail: { en: "Produced and localized demo flows for global product storytelling.", zh: "制作并本地化面向全球的产品演示流程。" },
      },
      {
        tag: "DATA",
        title: { en: "Channel dashboard", zh: "渠道数据看板" },
        detail: { en: "Tracked traffic, leads, engagement, and content conversion.", zh: "跟踪流量、线索、互动与内容转化。" },
      },
      {
        tag: "OPS",
        title: { en: "Storylane HQ collaboration", zh: "Storylane 总部协作" },
        detail: { en: "Coordinated with the vendor to improve demo delivery quality.", zh: "与供应商协同提升 Demo 交付质量。" },
      },
    ],
    learnings: [
      { en: "Enterprise products need translation between technical depth and buyer clarity.", zh: "企业产品需要在技术深度和采购者理解之间做翻译。" },
      { en: "A demo is not decoration. It is a measurable funnel asset.", zh: "Demo 不是装饰，而是可度量的漏斗资产。" },
      { en: "Operations is product work when it changes what users understand.", zh: "当运营改变用户理解时，它就是产品工作。" },
    ],
    photos: [
      {
        label: { en: "Demo flow", zh: "Demo 流程" },
        note: { en: "Place a product demo screenshot here.", zh: "这里可以放产品 Demo 截图。" },
      },
      {
        label: { en: "Dashboard", zh: "数据看板" },
        note: { en: "A masked analytics view fits best.", zh: "适合放打码后的数据看板。" },
      },
      {
        label: { en: "Work note", zh: "工作笔记" },
        note: { en: "Notes, city, or event photos can work.", zh: "笔记、城市或活动照片都可以。" },
      },
    ],
  },
  "deloitte-backend": {
    accent: "#86bc25",
    shortName: "Deloitte",
    marquee: {
      en: "Backend systems inside a SAP project.",
      zh: "SAP 项目里的后端系统。",
    },
    opening: {
      en: "At Deloitte, I saw how large consulting projects turn business rules into backend services, scheduled jobs, and integrations that must not break.",
      zh: "在德勤，我看到大型咨询项目如何把业务规则变成后端服务、定时任务和不能出错的系统集成。",
    },
    artifacts: [
      {
        tag: "API",
        title: { en: "Spring Boot services", zh: "Spring Boot 服务" },
        detail: { en: "Built backend modules around payroll and supplier workflows.", zh: "围绕薪酬与供应商流程开发后端模块。" },
      },
      {
        tag: "JOB",
        title: { en: "XXL-JOB automations", zh: "XXL-JOB 自动化" },
        detail: { en: "Created scheduled jobs and DingTalk notifications for operational workflows.", zh: "开发定时任务与钉钉通知，支撑业务流程。" },
      },
      {
        tag: "SAP",
        title: { en: "System integration", zh: "系统集成" },
        detail: { en: "Worked through data models, edge cases, and enterprise constraints.", zh: "处理数据模型、边界条件与企业系统约束。" },
      },
    ],
    learnings: [
      { en: "Backend quality is mostly about respecting messy real-world constraints.", zh: "后端质量很大程度上是尊重真实世界的复杂约束。" },
      { en: "Enterprise code rewards boring reliability.", zh: "企业代码奖励的是朴素但稳定的可靠性。" },
      { en: "Consulting taught me to ask for context before touching implementation.", zh: "咨询项目教会我在动手前先问清上下文。" },
    ],
    photos: [
      {
        label: { en: "Architecture", zh: "架构图" },
        note: { en: "A simplified architecture diagram works here.", zh: "这里适合放简化后的架构图。" },
      },
      {
        label: { en: "Code day", zh: "开发现场" },
        note: { en: "Use a safe cropped photo.", zh: "可以放安全裁切后的开发现场。" },
      },
      {
        label: { en: "Delivery note", zh: "交付记录" },
        note: { en: "Blur client-sensitive details.", zh: "客户敏感信息需要打码。" },
      },
    ],
  },
  "penghui-bigdata": {
    accent: "#8b7ffd",
    shortName: "Penghui",
    routeSlug: "penghui-tech",
    marquee: {
      en: "Big-data pipelines and AI service refactors.",
      zh: "大数据管线与 AI 服务重构。",
    },
    opening: {
      en: "This internship was the first place where I had to turn scripts, model calls, and data pipelines into something people could repeatedly use.",
      zh: "这是我第一次把脚本、模型调用和数据管线变成别人可以反复使用的系统。",
    },
    artifacts: [
      {
        tag: "AI",
        title: { en: "LLM reply pipeline", zh: "大模型回复管线" },
        detail: { en: "Connected Zhipu LLM calls into a standardized service path.", zh: "把智谱大模型调用接入标准化服务链路。" },
      },
      {
        tag: "DATA",
        title: { en: "Spark / Hive jobs", zh: "Spark / Hive 任务" },
        detail: { en: "Worked across data extraction, processing, and API-facing output.", zh: "覆盖数据抽取、处理与 API 输出。" },
      },
      {
        tag: "REFACTOR",
        title: { en: "Script to service", zh: "脚本服务化" },
        detail: { en: "Moved repeated manual work toward reusable backend services.", zh: "把重复手工流程向可复用后端服务迁移。" },
      },
    ],
    learnings: [
      { en: "A useful system starts where repeated manual work becomes painful.", zh: "有用的系统往往从重复手工工作变痛开始。" },
      { en: "Data products need boring plumbing before they can feel magical.", zh: "数据产品要先有扎实管道，才可能显得神奇。" },
      { en: "This was my bridge from coding tasks to product instincts.", zh: "这是我从写代码任务走向产品直觉的一座桥。" },
    ],
    photos: [
      {
        label: { en: "Pipeline", zh: "管线" },
        note: { en: "A masked data flow diagram fits.", zh: "适合放打码后的数据流程图。" },
      },
      {
        label: { en: "Service", zh: "服务" },
        note: { en: "Put API or service screenshots here.", zh: "这里可以放 API 或服务截图。" },
      },
      {
        label: { en: "First system", zh: "第一套系统" },
        note: { en: "A work photo or note gives it life.", zh: "工作照片或笔记会更有生活感。" },
      },
    ],
  },
};

export const EXPERIENCE_ALIASES: Record<string, string> = {
  "penghui-tech": "penghui-bigdata",
};

export const RESEARCH_STORIES: Record<string, ResearchStory> = {
  "llm-negative-rejection": {
    accent: "#8b7ffd",
    citationKey: "sun2025negative",
    headline: {
      en: "Teaching models when to say no.",
      zh: "让模型知道，什么时候该拒绝。",
    },
    note: {
      en: "I cared about the moment when an AI system should refuse instead of confidently improvise.",
      zh: "我关心的是：AI 系统什么时候应该拒绝，而不是自信地胡编。",
    },
    question: {
      en: "How can language models become better at saying no when the task asks for something impossible, unsafe, or unsupported?",
      zh: "当任务不可能、不安全或证据不足时，大语言模型怎样才能更好地说“不”？",
    },
    contribution: [
      { en: "Compared fine-tuning, RAG, and RAFT as negative rejection strategies.", zh: "比较 Fine-tuning、RAG 与 RAFT 在负向拒识中的作用。" },
      { en: "Organized failure modes around hallucination, unsupported claims, and retrieval gaps.", zh: "围绕幻觉、无依据断言和检索缺口整理失败模式。" },
      { en: "Connected model behavior to evaluation design rather than treating refusal as a single score.", zh: "把模型行为和评测设计连起来，而不是只看单一拒绝分数。" },
    ],
    methods: ["Fine-tuning", "RAG", "RAFT", "LLM Evaluation", "Trustworthy AI"],
  },
  "pathmnist-paper": {
    accent: "#ffb37c",
    citationKey: "sun2024pathmnist",
    headline: {
      en: "Reading medical images through curvature.",
      zh: "用曲率读懂医学影像。",
    },
    note: {
      en: "Medical imaging is high stakes; robustness is not a nice-to-have.",
      zh: "医学影像是高风险场景，鲁棒性不是锦上添花。",
    },
    question: {
      en: "Can curvature regularization make medical image classifiers less fragile on pathology image data?",
      zh: "曲率正则能不能让病理图像分类模型更不脆弱？",
    },
    contribution: [
      { en: "Tested robustness-oriented regularization on PATHMNIST classification.", zh: "在 PATHMNIST 分类任务上测试面向鲁棒性的正则方法。" },
      { en: "Studied how model behavior changes under perturbation.", zh: "研究扰动条件下模型行为如何变化。" },
      { en: "Framed robustness as a safety requirement for clinical-adjacent systems.", zh: "把鲁棒性作为临床相关系统的安全要求来讨论。" },
    ],
    methods: ["PATHMNIST", "Curvature Regularization", "CNN", "Robustness", "Medical Imaging"],
  },
  "octmnist-paper": {
    accent: "#579fe0",
    citationKey: "sun2024octmnist",
    headline: {
      en: "Helping smaller models see more clearly.",
      zh: "让小模型看得更清楚。",
    },
    note: {
      en: "I wanted to understand the tradeoff between small datasets, privacy, and utility.",
      zh: "我想理解小数据集、隐私和可用性之间的取舍。",
    },
    question: {
      en: "Can dataset distillation preserve useful signal in medical imaging without exposing the original training data?",
      zh: "数据集蒸馏能否在不暴露原始训练数据的情况下保留医学影像的有效信号？",
    },
    contribution: [
      { en: "Used class centralization and covariance matching for distilled OCTMNIST data.", zh: "使用类中心化与协方差匹配蒸馏 OCTMNIST 数据。" },
      { en: "Evaluated utility preservation in a privacy-sensitive medical setting.", zh: "在隐私敏感的医学场景里评估效用保留。" },
      { en: "Connected dataset compression to practical research reproducibility.", zh: "把数据集压缩与实际研究复现联系起来。" },
    ],
    methods: ["OCTMNIST", "Dataset Distillation", "Covariance Matching", "Privacy", "Medical Imaging"],
  },
};

export function resolveExperienceSlug(slug: string) {
  return EXPERIENCE_ALIASES[slug] ?? slug;
}

export function localized<T extends Record<Lang, string>>(value: T, lang: Lang) {
  return value[lang];
}
