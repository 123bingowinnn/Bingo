"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MoveHorizontal } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import type { ExperienceItem, Lang } from "@/lib/types";
import { EXPERIENCE_STORIES } from "@/lib/story-data";

export type InternshipPhoto = {
  id: string;
  slug: string;
  src?: string;
  label: Record<Lang, string>;
  note: Record<Lang, string>;
};

type CompanyMeta = {
  short: string;
  logo?: string;
  accent: string;
  dark: string;
  artifact: Record<Lang, string>;
  visual: "prd" | "demo" | "api" | "pipeline";
};

const COMPANY_META: Record<string, CompanyMeta> = {
  "zoom-pm": {
    short: "Zoom",
    logo: "/images/logos/zoom.svg",
    accent: "#0b5cff",
    dark: "#07162f",
    artifact: { en: "AI PRD / Eval Rubric", zh: "AI PRD / 评测表" },
    visual: "prd",
  },
  "alibaba-cloud": {
    short: "Alibaba Cloud",
    logo: "/images/logos/alibaba-cloud.svg",
    accent: "#ff6a00",
    dark: "#2b1507",
    artifact: { en: "Demo Library / GTM", zh: "Demo 库 / GTM" },
    visual: "demo",
  },
  "deloitte-backend": {
    short: "Deloitte",
    logo: "/images/logos/deloitte.svg",
    accent: "#86bc25",
    dark: "#10190c",
    artifact: { en: "SAP API / Jobs", zh: "SAP API / 定时任务" },
    visual: "api",
  },
  "penghui-bigdata": {
    short: "Penghui",
    accent: "#8b7ffd",
    dark: "#181526",
    artifact: { en: "LLM Service / Pipeline", zh: "LLM 服务 / 数据管线" },
    visual: "pipeline",
  },
};

const PLACEHOLDER_PHOTOS: InternshipPhoto[] = [
  {
    id: "zoom-workspace",
    slug: "zoom-pm",
    label: { en: "Workspace", zh: "工作现场" },
    note: { en: "drop Zoom office / badge photo", zh: "可放 Zoom 办公室 / 工牌照片" },
  },
  {
    id: "zoom-prd",
    slug: "zoom-pm",
    label: { en: "PRD corner", zh: "PRD 角落" },
    note: { en: "safe crop, sensitive text blurred", zh: "安全裁切，敏感文字打码" },
  },
  {
    id: "alibaba-demo",
    slug: "alibaba-cloud",
    label: { en: "Demo room", zh: "Demo 现场" },
    note: { en: "Storylane / product flow", zh: "Storylane / 产品流程" },
  },
  {
    id: "alibaba-dashboard",
    slug: "alibaba-cloud",
    label: { en: "Dashboard", zh: "数据看板" },
    note: { en: "masked metrics screenshot", zh: "打码数据截图" },
  },
  {
    id: "deloitte-build",
    slug: "deloitte-backend",
    label: { en: "Build day", zh: "开发现场" },
    note: { en: "API notes / SAP sketch", zh: "API 笔记 / SAP 草图" },
  },
  {
    id: "penghui-pipeline",
    slug: "penghui-bigdata",
    label: { en: "First pipeline", zh: "第一条管线" },
    note: { en: "Spark / Hive / service note", zh: "Spark / Hive / 服务笔记" },
  },
];

function routeFor(item: ExperienceItem) {
  const story = EXPERIENCE_STORIES[item.slug];
  return `/experience/${story?.routeSlug ?? item.slug}`;
}

function copyFor(item: ExperienceItem, lang: Lang) {
  return item[lang];
}

function metaFor(slug: string) {
  return COMPANY_META[slug] ?? {
    short: slug.replaceAll("-", " "),
    accent: "#1b1b1b",
    dark: "#141414",
    artifact: { en: "Field note", zh: "现场笔记" },
    visual: "prd" as const,
  };
}

function LogoMark({ item }: { item: ExperienceItem }) {
  const meta = metaFor(item.slug);
  if (!meta.logo) {
    return <span className="internship-logo-fallback">{meta.short.slice(0, 2)}</span>;
  }

  return (
    <Image
      src={meta.logo}
      alt=""
      width={150}
      height={48}
      sizes="150px"
      className="internship-logo-img"
    />
  );
}

function CompanyRibbon({ items }: { items: ExperienceItem[] }) {
  const { lang } = useI18n();
  const repeated = [...items, ...items, ...items];

  return (
    <div className="internship-company-runner" aria-label={lang === "en" ? "Internship companies" : "实习公司滚动条"}>
      <div className="internship-company-runner__viewport">
        <div className="internship-company-runner__track">
          {repeated.map((item, index) => {
            const copy = copyFor(item, lang);
            const meta = metaFor(item.slug);
            return (
              <Link
                key={`${item.slug}-${index}`}
                href={routeFor(item)}
                className="internship-company-pill"
                style={{ ["--accent" as string]: meta.accent }}
                data-bazil-cursor
              >
                <LogoMark item={item} />
                <span>{meta.short}</span>
                <em>{copy.role}</em>
              </Link>
            );
          })}
        </div>
      </div>
      <span className="internship-company-runner__hint">
        <MoveHorizontal size={16} aria-hidden />
        {lang === "en" ? "hover to pause · click to open" : "悬停暂停 · 点击打开"}
      </span>
    </div>
  );
}

function ArtifactVisual({ item, index }: { item: ExperienceItem; index: number }) {
  const { lang } = useI18n();
  const meta = metaFor(item.slug);
  const story = EXPERIENCE_STORIES[item.slug];
  const copy = copyFor(item, lang);
  const firstStack = copy.techStack?.slice(0, 4) ?? item.tags;

  return (
    <div
      className="internship-artifact"
      data-visual={meta.visual}
      style={{ ["--accent" as string]: meta.accent, ["--dark" as string]: meta.dark }}
    >
      <div className="internship-artifact__screen">
        <div className="internship-artifact__top">
          <span>{String(index + 1).padStart(2, "0")}</span>
          <LogoMark item={item} />
        </div>
        <div className="internship-artifact__title">
          <strong>{meta.artifact[lang]}</strong>
          <span>{story?.marquee[lang] ?? copy.summary}</span>
        </div>
        <div className="internship-artifact__lines" aria-hidden>
          <i />
          <i />
          <i />
          <i />
        </div>
        <div className="internship-artifact__chips">
          {firstStack.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      </div>
      <div className="internship-artifact__floating internship-artifact__floating--one">
        {lang === "en" ? "field note" : "现场笔记"}
      </div>
      <div className="internship-artifact__floating internship-artifact__floating--two">
        {lang === "en" ? "artifact" : "产出物"}
      </div>
    </div>
  );
}

function PhotoFrame({ photo, index }: { photo: InternshipPhoto; index: number }) {
  const { lang } = useI18n();
  const meta = metaFor(photo.slug);

  return (
    <figure
      className="internship-photo-frame"
      style={{ ["--accent" as string]: meta.accent, ["--i" as string]: index }}
      data-has-image={photo.src ? "true" : "false"}
    >
      <div className="internship-photo-frame__media">
        {photo.src ? (
          <Image src={photo.src} alt="" fill sizes="(max-width: 767px) 70vw, 260px" />
        ) : (
          <div className="internship-photo-frame__placeholder" aria-hidden>
            <span>{meta.short}</span>
            <strong>{photo.label[lang]}</strong>
          </div>
        )}
      </div>
      <figcaption>
        <strong>{photo.label[lang]}</strong>
        <span>{photo.note[lang]}</span>
      </figcaption>
    </figure>
  );
}

function HeroCollage({ items }: { items: ExperienceItem[] }) {
  const { lang } = useI18n();

  return (
    <div className="internship-hero-collage" aria-hidden>
      {items.map((item, index) => {
        const meta = metaFor(item.slug);
        const copy = copyFor(item, lang);
        return (
          <div
            key={item.slug}
            className="internship-hero-collage__card"
            style={{ ["--accent" as string]: meta.accent, ["--i" as string]: index }}
          >
            <LogoMark item={item} />
            <span>{copy.period}</span>
          </div>
        );
      })}
    </div>
  );
}

export function InternshipDesignPage({
  items,
  photos,
}: {
  items: ExperienceItem[];
  photos: InternshipPhoto[];
}) {
  const { lang } = useI18n();
  const reduce = useReducedMotion();
  const photoList = photos.length > 0 ? photos : PLACEHOLDER_PHOTOS;
  const repeatedPhotos = [...photoList, ...photoList];

  return (
    <main className="internship-design-page">
      <section className="internship-design-hero" aria-labelledby="internship-design-title">
        <div className="internship-design-hero__eyebrow">
          {lang === "en" ? "Product · Engineering · Real teams" : "产品 · 工程 · 真实团队"}
        </div>
        <motion.h1
          id="internship-design-title"
          data-lang={lang}
          initial={reduce ? { opacity: 1 } : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.62, ease: [0.16, 1, 0.3, 1] }}
        >
          {lang === "en"
            ? "Internships where product sense met real systems."
            : "在真实系统里，长出产品判断。"}
        </motion.h1>
        <p>
          {lang === "en"
            ? "Four field notes from AI product, data products, enterprise backend, and the first data pipeline that made engineering feel useful."
            : "四段现场笔记：AI 产品、数据产品、企业后端，以及第一条让我感到工程真正有用的数据管线。"}
        </p>

        <CompanyRibbon items={items} />
        <HeroCollage items={items} />
      </section>

      <section className="internship-photo-river" aria-label={lang === "en" ? "Internship photo contact sheet" : "实习照片滚动条"}>
        <div className="internship-photo-river__header">
          <span>{lang === "en" ? "Daily contact sheet" : "实习日常胶片"}</span>
          <p>
            {lang === "en"
              ? "Later, drop office photos, badges, demo screenshots, or masked notes here. The strip is designed to become more alive as real images arrive."
              : "之后把办公室照片、工牌、Demo 截图或打码笔记放进来，这条滚动胶片会随着真实素材变得更有生活感。"}
          </p>
        </div>
        <div className="internship-photo-river__viewport">
          <div className="internship-photo-river__track">
            {repeatedPhotos.map((photo, index) => (
              <PhotoFrame key={`${photo.id}-${index}`} photo={photo} index={index} />
            ))}
          </div>
        </div>
      </section>

      <section className="internship-manifesto">
        <div className="internship-manifesto__label">
          {lang === "en" ? "What internships changed" : "实习真正改变了什么"}
        </div>
        <h2 data-lang={lang}>
          {lang === "en"
            ? "Real work is less about titles, more about surviving constraints."
            : "真正的工作，不是头衔，而是在约束里把事做成。"}
        </h2>
        <p>
          {lang === "en"
            ? "Every internship pushed the same question from a different angle: can I turn ambiguity into a product decision, a reliable interface, or a system someone else can use without me standing beside it?"
            : "每段实习都在用不同方式问同一个问题：我能不能把模糊的需求变成产品判断、可靠接口，或者一个别人不用我解释也能持续使用的系统？"}
        </p>
      </section>

      <section className="internship-case-list" aria-label={lang === "en" ? "Internship stories" : "实习故事"}>
        {items.map((item, index) => {
          const copy = copyFor(item, lang);
          const story = EXPERIENCE_STORIES[item.slug];
          const meta = metaFor(item.slug);
          const highlights = copy.bullets.slice(0, 3);
          return (
            <motion.article
              key={item.slug}
              className="internship-case"
              data-flip={index % 2 === 1 ? "true" : "false"}
              style={{ ["--accent" as string]: meta.accent }}
              initial={reduce ? { opacity: 1 } : { opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.58, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="internship-case__copy">
                <span className="internship-case__eyebrow">{meta.short} / {copy.period}</span>
                <h2 data-lang={lang}>{copy.role}</h2>
                <p>{story?.opening[lang] ?? copy.summary}</p>
                <ul>
                  {highlights.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
                <Link href={routeFor(item)} className="internship-case__link" data-bazil-cursor>
                  {lang === "en" ? "Open full internship file" : "打开完整实习档案"}
                  <ArrowUpRight size={18} aria-hidden />
                </Link>
              </div>
              <ArtifactVisual item={item} index={index} />
            </motion.article>
          );
        })}
      </section>
    </main>
  );
}
