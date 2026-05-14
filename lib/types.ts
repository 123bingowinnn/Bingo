export type Lang = "en" | "zh";

export interface LocalizedText {
  en: string;
  zh: string;
}

export interface SiteMeta {
  en: { siteTitle: string; description: string; url: string };
  zh: { siteTitle: string; description: string; url: string };
}

export interface NavItem {
  id: string;
  en: string;
  zh: string;
  href: string;
}

export interface HeroContent {
  en: {
    name: string;
    title: string;
    tagline: string;
    resumeLabel: string;
    contactLabel: string;
  };
  zh: {
    name: string;
    title: string;
    tagline: string;
    resumeLabel: string;
    contactLabel: string;
  };
}

export interface ProofItem {
  icon: string;
  numericValue?: number;
  en: { label: string; value: string };
  zh: { label: string; value: string };
  subtitle?: LocalizedText;
}

export interface AboutContent {
  en: { heading: string; headline: string; headlineAccent: string; paragraphs: string[] };
  zh: { heading: string; headline: string; headlineAccent: string; paragraphs: string[] };
}

export interface ExperienceItem {
  slug: string;
  tags: string[];
  logo?: string;
  en: {
    company: string;
    role: string;
    period: string;
    location: string;
    summary: string;
    bullets: string[];
    techStack?: string[];
  };
  zh: {
    company: string;
    role: string;
    period: string;
    location: string;
    summary: string;
    bullets: string[];
    techStack?: string[];
  };
}

export interface ProjectItem {
  slug: string;
  tags: string[];
  featured: boolean;
  image?: string;
  video?: string;
  links?: { label: string; url: string }[];
  en: {
    title: string;
    summary: string;
    problem: string;
    action: string;
    result: string;
    learnings: string;
    techStack: string[];
  };
  zh: {
    title: string;
    summary: string;
    problem: string;
    action: string;
    result: string;
    learnings: string;
    techStack: string[];
  };
}

export interface PublicationItem {
  slug: string;
  en: {
    title: string;
    venue: string;
    date: string;
    authors: string;
    abstract: string;
    link?: string;
  };
  zh: {
    title: string;
    venue: string;
    date: string;
    authors: string;
    abstract: string;
    link?: string;
  };
}

export interface EducationItem {
  logo?: string;
  en: {
    school: string;
    degree: string;
    period: string;
    location: string;
    highlights: string[];
  };
  zh: {
    school: string;
    degree: string;
    period: string;
    location: string;
    highlights: string[];
  };
}

export interface LeadershipItem {
  en: {
    role: string;
    organization: string;
    period: string;
    description: string;
  };
  zh: {
    role: string;
    organization: string;
    period: string;
    description: string;
  };
}

export interface InterestItem {
  icon: string;
  en: { label: string; detail: string };
  zh: { label: string; detail: string };
}

export interface ContactContent {
  en: { heading: string; description: string };
  zh: { heading: string; description: string };
  email: string;
  phone?: string;
  wechat?: string;
  links: { icon: string; label: string; url: string }[];
}

export interface SiteContent {
  meta: SiteMeta;
  nav: NavItem[];
  hero: HeroContent;
  proofStrip: ProofItem[];
  about: AboutContent;
  experience: ExperienceItem[];
  projects: ProjectItem[];
  publications: PublicationItem[];
  education: EducationItem[];
  leadership: LeadershipItem[];
  interests: InterestItem[];
  contact: ContactContent;
}
