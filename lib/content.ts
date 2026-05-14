import type { SiteContent, Lang } from "./types";
import contentData from "@/content/content.json";

const content = contentData as unknown as SiteContent;

export function getContent(): SiteContent {
  return content;
}

export function getLocalizedField<T extends Record<string, unknown>>(
  obj: { en: T; zh: T },
  lang: Lang
): T {
  return obj[lang];
}

export function getExperienceBySlug(slug: string) {
  return content.experience.find((e) => e.slug === slug);
}

export function getAllExperienceSlugs() {
  return content.experience.map((e) => e.slug);
}

export function getProjectBySlug(slug: string) {
  return content.projects.find((p) => p.slug === slug);
}

export function getFeaturedProjects() {
  return content.projects.filter((p) => p.featured);
}

export function getAllProjectSlugs() {
  return content.projects.map((p) => p.slug);
}

export function getPublicationBySlug(slug: string) {
  return content.publications.find((p) => p.slug === slug);
}

export function getAllPublicationSlugs() {
  return content.publications.map((p) => p.slug);
}

export function getAllTags(items: { tags: string[] }[]): string[] {
  const tagSet = new Set<string>();
  items.forEach((item) => item.tags.forEach((tag) => tagSet.add(tag)));
  return Array.from(tagSet).sort();
}
