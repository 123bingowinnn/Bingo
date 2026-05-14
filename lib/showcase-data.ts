import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { getContent } from "@/lib/content";
import { EXPERIENCE_STORIES, RESEARCH_STORIES } from "@/lib/story-data";
import type { Lang } from "@/lib/types";

type Localized = Record<Lang, string>;

export type ShowcaseVariant = "experience" | "research" | "projects";

export type ShowcaseMedia = {
  id: string;
  label: Localized;
  note: Localized;
  src?: string;
  accent?: string;
  kind?: "photo" | "logo" | "paper" | "prototype" | "placeholder";
};

export type ShowcaseItem = {
  id: string;
  href: string;
  accent: string;
  logo?: string;
  image?: string;
  video?: string;
  kicker: Localized;
  title: Localized;
  subtitle: Localized;
  meta: Localized;
  summary: Localized;
  tags: string[];
};

export type ShowcasePageData = {
  variant: ShowcaseVariant;
  navLabel: Localized;
  eyebrow: Localized;
  title: Localized;
  intro: Localized;
  carouselLabel: Localized;
  tickerLabel: Localized;
  explainer: {
    label: Localized;
    title: Localized;
    body: Localized;
  };
  archiveLabel: Localized;
  items: ShowcaseItem[];
  ticker: ShowcaseMedia[];
  materials: ShowcaseMedia[];
};

const publicDir = path.join(process.cwd(), "public");

const LOGOS: Record<string, string> = {
  "zoom-pm": "/images/logos/zoom.svg",
  "alibaba-cloud": "/images/logos/alibaba-cloud.svg",
  "deloitte-backend": "/images/logos/deloitte.svg",
};

const EXPERIENCE_ACCENTS: Record<string, string> = {
  "zoom-pm": "#2f7df6",
  "alibaba-cloud": "#ff7a1a",
  "deloitte-backend": "#86bc25",
  "penghui-bigdata": "#8b7ffd",
  "wku-ta": "#1f7a8c",
  "wku-library": "#d8a21b",
};

function publicPathIfExists(relativePath: string) {
  const normalized = relativePath.startsWith("/") ? relativePath.slice(1) : relativePath;
  return existsSync(path.join(publicDir, normalized)) ? `/${normalized}` : undefined;
}

function firstExisting(paths: string[]) {
  return paths.map(publicPathIfExists).find(Boolean);
}

function internshipCover(slug: string) {
  return firstExisting([
    `images/internships/${slug}/cover.jpg`,
    `images/internships/${slug}/cover.jpeg`,
    `images/internships/${slug}/cover.png`,
    `images/internships/${slug}/cover.webp`,
  ]);
}

function internshipGallery(slug: string, fallbackAccent: string): ShowcaseMedia[] {
  const folder = path.join(publicDir, "images", "internships", slug);
  if (!existsSync(folder)) return [];

  return readdirSync(folder)
    .filter((file) => /^(0[1-9]|1[0-2])\.(jpg|jpeg|png|webp)$/i.test(file))
    .sort((a, b) => a.localeCompare(b))
    .slice(0, 8)
    .map((file, index) => ({
      id: `${slug}-${file}`,
      src: `/images/internships/${slug}/${file}`,
      accent: fallbackAccent,
      kind: "photo" as const,
      label: {
        en: `${slug.replaceAll("-", " ")} / ${String(index + 1).padStart(2, "0")}`,
        zh: `${slug.replaceAll("-", " ")} / ${String(index + 1).padStart(2, "0")}`,
      },
      note: {
        en: "real internship photo",
        zh: "真实实习照片",
      },
    }));
}

function experiencePhotoPlaceholders(): ShowcaseMedia[] {
  const slots = [
    ["zoom-pm", "Zoom desk", "工作台", "office day", "日常工作"],
    ["zoom-pm", "AI review", "AI 评测", "PRD / rubric / notes", "PRD / 评测表 / 笔记"],
    ["alibaba-cloud", "Demo room", "Demo 现场", "product flow screenshot", "产品流程截图"],
    ["alibaba-cloud", "Data ops", "数据运营", "dashboard crop", "数据看板局部"],
    ["deloitte-backend", "Build day", "开发现场", "backend / SAP notes", "后端 / SAP 笔记"],
    ["penghui-bigdata", "First pipeline", "第一条管线", "Spark / Hive / service notes", "Spark / Hive / 服务笔记"],
  ] as const;

  return slots.map(([slug, enLabel, zhLabel, enNote, zhNote], index) => ({
    id: `placeholder-${slug}-${index}`,
    accent: EXPERIENCE_ACCENTS[slug] ?? "#1b1b1b",
    kind: "placeholder" as const,
    label: { en: enLabel, zh: zhLabel },
    note: {
      en: `${enNote} · drop photo into /public/images/internships/${slug}/`,
      zh: `${zhNote} · 可放入 /public/images/internships/${slug}/`,
    },
  }));
}

function buildExperienceShowcase(): ShowcasePageData {
  const content = getContent();
  const items = content.experience.map((item, index) => {
    const story = EXPERIENCE_STORIES[item.slug];
    const accent = story?.accent ?? EXPERIENCE_ACCENTS[item.slug] ?? "#1b1b1b";
    const companyEn = story?.shortName ?? item.en.company.replace(/\s*\(.+\)/, "");
    const companyZh = item.zh.company.replace(/（.+）/, "");
    return {
      id: item.slug,
      href: `/experience/${story?.routeSlug ?? item.slug}`,
      accent,
      logo: LOGOS[item.slug],
      image: internshipCover(item.slug),
      kicker: {
        en: `/${String(index + 1).padStart(2, "0")} internship`,
        zh: `/${String(index + 1).padStart(2, "0")} 实习`,
      },
      title: { en: companyEn, zh: companyZh },
      subtitle: { en: item.en.role, zh: item.zh.role },
      meta: { en: `${item.en.period} · ${item.en.location}`, zh: `${item.zh.period} · ${item.zh.location}` },
      summary: { en: story?.marquee.en ?? item.en.summary, zh: story?.marquee.zh ?? item.zh.summary },
      tags: item.tags,
    } satisfies ShowcaseItem;
  });

  const gallery = content.experience.flatMap((item) =>
    internshipGallery(item.slug, EXPERIENCE_ACCENTS[item.slug] ?? "#1b1b1b"),
  );

  return {
    variant: "experience",
    navLabel: { en: "Experience", zh: "实习" },
    eyebrow: { en: "Internship archive", zh: "实习档案" },
    title: {
      en: "Real rooms, real products, real pressure.",
      zh: "真实现场，真实产品，真实压力。",
    },
    intro: {
      en: "A horizontal field note of the places where product thinking, engineering habits, and messy collaboration became real.",
      zh: "一条横向现场笔记：这些地方让我把产品判断、工程习惯和真实协作连在一起。",
    },
    carouselLabel: { en: "Internship belt", zh: "实习胶片带" },
    tickerLabel: { en: "Daily contact sheet", zh: "实习日常照片条" },
    explainer: {
      label: { en: "How to read this", zh: "怎么浏览" },
      title: {
        en: "The homepage gives the signal. These pages hold the texture.",
        zh: "首页给信号，这些页面放质感。",
      },
      body: {
        en: "Drop work photos, badges, masked dashboards, office corners, or notes into the internship folders. The strip above becomes a living contact sheet, while each company card links into a deeper story page.",
        zh: "你之后把工作照片、工牌、打码看板、办公室角落或笔记放进实习文件夹，上面的滚动条就会变成真实现场胶片；每家公司卡片也能进入更深的经历页面。",
      },
    },
    archiveLabel: { en: "Open the full file", zh: "打开完整档案" },
    items,
    ticker: gallery.length > 0 ? gallery : experiencePhotoPlaceholders(),
    materials: [
      { id: "mat-logo-zoom", src: "/images/logos/zoom.svg", kind: "logo", accent: "#2f7df6", label: { en: "Zoom", zh: "Zoom" }, note: { en: "AI product internship", zh: "AI 产品实习" } },
      { id: "mat-badge", src: "/images/portrait/bingo-badge-color.png", kind: "photo", accent: "#8b7ffd", label: { en: "Personal badge", zh: "个人工牌" }, note: { en: "identity object", zh: "身份物件" } },
      { id: "mat-desk", kind: "placeholder", accent: "#ff7a1a", label: { en: "Next: office photos", zh: "下一步：办公室照片" }, note: { en: "drop 01.jpg / 02.jpg", zh: "放入 01.jpg / 02.jpg" } },
    ],
  };
}

function buildResearchShowcase(): ShowcasePageData {
  const content = getContent();
  const items = content.publications.map((paper, index) => {
    const story = RESEARCH_STORIES[paper.slug];
    const accent = story?.accent ?? "#1b1b1b";
    return {
      id: paper.slug,
      href: `/research/${paper.slug}`,
      accent,
      kicker: { en: `/${String(index + 1).padStart(2, "0")} paper`, zh: `/${String(index + 1).padStart(2, "0")} 论文` },
      title: { en: story?.headline.en ?? paper.en.title, zh: story?.headline.zh ?? paper.zh.title },
      subtitle: { en: paper.en.venue, zh: paper.zh.venue },
      meta: { en: paper.en.date, zh: paper.zh.date },
      summary: { en: story?.note.en ?? paper.en.abstract, zh: story?.note.zh ?? paper.zh.abstract },
      tags: story?.methods.slice(0, 4) ?? [],
    } satisfies ShowcaseItem;
  });

  return {
    variant: "research",
    navLabel: { en: "Research", zh: "科研" },
    eyebrow: { en: "Research files", zh: "科研档案" },
    title: {
      en: "Questions I kept carrying around.",
      zh: "那些我一直带着走的问题。",
    },
    intro: {
      en: "Not a PDF dump. Each card opens the question, method, contribution, citation, and the part I still think about.",
      zh: "不是 PDF 堆叠。每张卡打开一个问题、方法、贡献、引用，以及我现在仍然在想的部分。",
    },
    carouselLabel: { en: "Paper belt", zh: "论文胶片带" },
    tickerLabel: { en: "Lab notes / method fragments", zh: "研究手记 / 方法碎片" },
    explainer: {
      label: { en: "Structure", zh: "结构" },
      title: {
        en: "Each research page reads like a lab file, not a resume line.",
        zh: "每个研究页面像一份实验档案，而不是简历上的一行。",
      },
      body: {
        en: "The index stays fast and visual. The detail page carries the abstract, methods, contribution notes, and BibTeX so readers can go deep without losing the portfolio rhythm.",
        zh: "索引页保持快速和视觉化；详情页承载摘要、方法、贡献笔记和 BibTeX，让读者可以深入，但不会打断作品集节奏。",
      },
    },
    archiveLabel: { en: "Read the research file", zh: "查看研究档案" },
    items,
    ticker: items.flatMap((item) =>
      item.tags.slice(0, 2).map((tag, index) => ({
        id: `${item.id}-${tag}-${index}`,
        kind: "paper" as const,
        accent: item.accent,
        label: { en: tag, zh: tag },
        note: { en: item.title.en, zh: item.title.zh },
      })),
    ),
    materials: [
      { id: "paper-1", kind: "paper", accent: "#8b7ffd", label: { en: "Refusal", zh: "拒识" }, note: { en: "LLM evaluation", zh: "大模型评测" } },
      { id: "paper-2", src: "/images/projects/pathmnist-cover.jpg", kind: "paper", accent: "#ffb37c", label: { en: "PATHMNIST", zh: "PATHMNIST" }, note: { en: "robust medical imaging", zh: "医学影像鲁棒性" } },
      { id: "paper-3", src: "/images/projects/octmnist-cover.jpg", kind: "paper", accent: "#579fe0", label: { en: "OCTMNIST", zh: "OCTMNIST" }, note: { en: "dataset distillation", zh: "数据集蒸馏" } },
    ],
  };
}

function buildProjectsShowcase(): ShowcasePageData {
  const content = getContent();
  const items = content.projects.map((project, index) => {
    const image = project.image ? publicPathIfExists(project.image) : undefined;
    const video = project.video ? publicPathIfExists(project.video) : undefined;

    return {
      id: project.slug,
      href: `/projects/${project.slug}`,
      accent: ["#8b7ffd", "#57b894", "#ffb37c", "#579fe0", "#fc4b78"][index % 5],
      image,
      video,
      kicker: { en: `/${String(index + 1).padStart(2, "0")} build`, zh: `/${String(index + 1).padStart(2, "0")} 项目` },
      title: { en: project.en.title, zh: project.zh.title },
      subtitle: { en: project.tags.join(" · "), zh: project.tags.join(" · ") },
      meta: { en: project.featured ? "Featured prototype" : "Side build", zh: project.featured ? "精选项目" : "个人项目" },
      summary: { en: project.en.summary, zh: project.zh.summary },
      tags: project.tags,
    } satisfies ShowcaseItem;
  });

  return {
    variant: "projects",
    navLabel: { en: "Projects", zh: "项目" },
    eyebrow: { en: "Prototype shelf", zh: "项目架" },
    title: {
      en: "Small systems with a pulse.",
      zh: "有脉搏的小系统。",
    },
    intro: {
      en: "AI demos, research tools, and product experiments. Hover the moving cards, then open the ones worth inspecting.",
      zh: "AI Demo、研究工具和产品实验。悬停会动，值得看的就点进去。",
    },
    carouselLabel: { en: "Prototype belt", zh: "项目胶片带" },
    tickerLabel: { en: "Preview reel", zh: "项目预览条" },
    explainer: {
      label: { en: "Interaction rule", zh: "交互规则" },
      title: {
        en: "The index should feel like touching prototypes, not browsing cards.",
        zh: "索引页应该像在触碰原型，而不是浏览卡片。",
      },
      body: {
        en: "Videos loop inside the strip when available, image cards tilt lightly, and detail pages hold the problem-action-result narrative without crowding the first page.",
        zh: "有视频的项目会在胶片里直接动起来，图片卡有轻微倾斜；详情页承载问题-行动-结果，不把首页挤满。",
      },
    },
    archiveLabel: { en: "Open case study", zh: "打开项目详情" },
    items,
    ticker: items.map((item) => ({
      id: `reel-${item.id}`,
      src: item.image,
      kind: "prototype" as const,
      accent: item.accent,
      label: item.title,
      note: item.subtitle,
    })),
    materials: [
      { id: "demo-human", src: "/images/projects/fridge-clear-cover.svg", kind: "prototype", accent: "#fc4b78", label: { en: "Product surface", zh: "产品界面" }, note: { en: "visual preview", zh: "视觉预览" } },
      { id: "demo-path", src: "/images/projects/pathmnist-cover.jpg", kind: "prototype", accent: "#ffb37c", label: { en: "Model behavior", zh: "模型行为" }, note: { en: "research demo", zh: "研究 Demo" } },
      { id: "demo-video", kind: "placeholder", accent: "#8b7ffd", label: { en: "Hover motion", zh: "悬停动效" }, note: { en: "video cards play in place", zh: "视频卡片原地播放" } },
    ],
  };
}

export function getShowcasePage(variant: ShowcaseVariant) {
  if (variant === "experience") return buildExperienceShowcase();
  if (variant === "research") return buildResearchShowcase();
  return buildProjectsShowcase();
}
