# Personal Portfolio / Resume Website

A premium, bilingual (EN/ZH) portfolio and resume website built with Next.js 14+, TypeScript, TailwindCSS, and Framer Motion. Designed for graduate school applications, internship, and full-time job hunting.

## Features

- **One-page home overview** with scroll spy navigation
- **Bilingual** (English / Chinese) — toggle with one click
- **Dark / Light mode** with system preference detection
- **Tag filtering** on Projects and Experience pages
- **Case study detail pages** for each project (Problem / Action / Result / Learnings)
- **Printable resume** page with `@media print` optimization
- **Framer Motion animations** — fade-in, slide-up, animated counters
- **Fully data-driven** — all content lives in a single `content.json` file
- **SEO optimized** — OpenGraph, Twitter cards, sitemap, robots.txt, per-page metadata
- **Accessible** — keyboard navigation, focus states, `prefers-reduced-motion` support
- **Responsive** — mobile-first design, works on all screen sizes

## Tech Stack

| Tech | Purpose |
|------|---------|
| [Next.js 16](https://nextjs.org/) | App Router, SSR/SSG, image optimization |
| TypeScript | Type safety |
| [TailwindCSS 4](https://tailwindcss.com/) | Utility-first styling |
| [Framer Motion](https://www.framer.com/motion/) | Scroll animations, transitions |
| [lucide-react](https://lucide.dev/) | Icons |
| [next-themes](https://github.com/pacocoursey/next-themes) | Dark/light mode |
| Radix UI | Accessible dialog, collapsible primitives |

## Getting Started

### Prerequisites

- Node.js 18+ (recommended: 20+)
- npm

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## How to Update Content

**All website content is driven by a single file:** `content/content.json`

You never need to edit component files to update your resume/portfolio content. Just edit the JSON.

### Content Structure

```
content/content.json
├── meta          — Site title, description, URL (en + zh)
├── nav           — Navigation items
├── hero          — Name, title, tagline, CTA button labels
├── proofStrip    — Achievement badges (offers, internships, GPA, etc.)
├── about         — About me paragraphs
├── experience[]  — Work experiences with company, role, bullets, tags
├── projects[]    — Projects with case study fields and tech stack
├── publications[]— Research papers with abstract
├── education[]   — Schools with degree and highlights
├── leadership[]  — Volunteer/club/leadership roles
├── interests[]   — Hobbies with icon and description
└── contact       — Email, social links
```

### Key Fields Explained

#### Experience / Projects

Each item has:
- `slug` — URL-safe identifier (used in routing)
- `tags` — Array of filter tags (e.g., `["PM", "AI", "Backend"]`)
- `en` / `zh` — Localized content objects

#### Projects (Case Study)

Each project has these case study fields:
- `problem` — What problem were you solving?
- `action` — What did you do?
- `result` — What was the outcome? (quantify!)
- `learnings` — What did you learn?

#### Proof Strip

- `icon` — Lucide icon name (e.g., `"GraduationCap"`, `"Briefcase"`)
- `numericValue` — If set, triggers animated counter on the home page

### Adding a New Experience

Add an object to the `experience` array:

```json
{
  "slug": "my-new-role",
  "tags": ["PM", "AI"],
  "logo": "/images/company.svg",
  "en": {
    "company": "Company Name",
    "role": "Your Role",
    "period": "Jan 2025 – Present",
    "location": "City, Country",
    "summary": "One-line summary of your impact.",
    "bullets": [
      "Led X resulting in Y% improvement",
      "Built Z serving N users"
    ],
    "techStack": ["Tool1", "Tool2"]
  },
  "zh": {
    "company": "公司名称",
    "role": "你的职位",
    "period": "2025年1月 – 至今",
    "location": "城市，国家",
    "summary": "一行总结你的影响。",
    "bullets": [
      "主导了 X，实现了 Y% 提升",
      "构建了 Z，服务 N 名用户"
    ],
    "techStack": ["工具1", "工具2"]
  }
}
```

### Adding a New Project

Add an object to the `projects` array:

```json
{
  "slug": "my-project",
  "tags": ["AI", "Full-Stack"],
  "featured": true,
  "image": "/images/projects/my-project.jpg",
  "links": [
    { "label": "GitHub", "url": "https://github.com/..." },
    { "label": "Demo", "url": "https://..." }
  ],
  "en": {
    "title": "Project Title",
    "summary": "Brief description.",
    "problem": "What problem...",
    "action": "What you did...",
    "result": "Outcome with metrics...",
    "learnings": "What you learned...",
    "techStack": ["React", "Python", "..."]
  },
  "zh": { ... }
}
```

Set `"featured": true` to show it on the home page.

### Replacing Placeholder Content

Search for `TODO` in `content.json` to find all fields that need your real data:

```bash
grep -n "TODO" content/content.json
```

### Adding Images

Place images in `public/images/` and reference them as `/images/filename.ext` in `content.json`.

### Resume PDF

Replace `public/resume.pdf` with your actual resume file.

## File Structure

```
app/
  layout.tsx              Root layout (theme, i18n, nav, footer)
  page.tsx                Home page (all sections)
  globals.css             Design tokens + print styles
  sitemap.ts              Auto-generated sitemap
  robots.ts               Robots config
  projects/
    page.tsx              Filterable project grid
    [slug]/page.tsx       Project case study detail
    layout.tsx            SEO metadata
  experience/
    page.tsx              Full experience timeline
    layout.tsx            SEO metadata
  research/page.tsx       Publications list
  resume/page.tsx         Printable resume
  contact/page.tsx        Contact page

components/
  layout/Navbar.tsx       Responsive nav with scroll spy
  layout/Footer.tsx       Footer
  sections/               Home page section components
  ui/                     Reusable UI primitives (button, card, badge, dialog)
  ProjectCard.tsx         Project card component
  TagFilter.tsx           Tag filter pills
  SectionWrapper.tsx      Framer Motion scroll animation wrapper
  ThemeToggle.tsx         Dark/light mode toggle
  LanguageToggle.tsx      EN/ZH language switcher

content/
  content.json            THE single source of truth

lib/
  types.ts                TypeScript interfaces
  i18n.tsx                Internationalization context
  content.ts              Content loader utilities
  utils.ts                Utility functions (cn, etc.)
```

## Deploy to Vercel

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) and import the repository
3. Vercel auto-detects Next.js — click **Deploy**
4. (Optional) Add a custom domain in Vercel dashboard

That's it. Every push to `main` triggers a new deployment.

## Customization Guide

| What | Where |
|------|-------|
| All text content | `content/content.json` |
| Color theme | `app/globals.css` (CSS custom properties) |
| Font | `app/layout.tsx` (next/font imports) |
| Site metadata | `app/layout.tsx` + sub-page `layout.tsx` files |
| Favicon | `app/favicon.ico` |
| OG image | `public/og-image.png` |
| Resume PDF | `public/resume.pdf` |

## License

MIT
