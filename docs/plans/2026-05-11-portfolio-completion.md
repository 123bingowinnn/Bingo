# Portfolio Completion Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Complete the portfolio homepage after the Bazil-inspired hero with a quieter About section, dedicated Internships and Research sections, and an original lightweight Bingo companion.

**Architecture:** Keep the existing Next.js App Router, bilingual `content/content.json`, Framer Motion, Lenis, and CSS-driven visual system. Avoid adding Three.js for this pass; use CSS 3D and Framer Motion for the badge interaction to preserve performance and keep the site easy to tune.

**Tech Stack:** Next.js 16, React 19, TypeScript, Framer Motion, Lenis, custom CSS in `app/globals.css`.

---

### Task 1: Refine About

**Files:**
- Modify: `components/sections/About.tsx`
- Modify: `app/globals.css`

**Steps:**
1. Remove the large About headline block.
2. Keep the existing bilingual personal descriptions from `content/content.json`.
3. Replace numbered paragraphs with a continuous editorial text block plus compact proof chips.
4. Resize and restyle the badge so it feels like a premium identity object rather than a poster.
5. Add accessible card interaction: pointer tilt on desktop, focusable flip/reveal, reduced-motion fallback.
6. Verify Chinese and English desktop/mobile layouts.

### Task 2: Build Internships Section

**Files:**
- Create: `components/sections/Internships.tsx`
- Modify: `app/globals.css`
- Modify: `app/page.tsx`

**Steps:**
1. Use `content.experience` as data.
2. Create a company index for Zoom, Alibaba Cloud, Deloitte, and Penghui.
3. Show selected role, period, summary, top bullets, and tags.
4. Add a subtle artifact panel per company.
5. Support keyboard selection and mobile stacked layout.

### Task 3: Build Research Section

**Files:**
- Create: `components/sections/ResearchDesk.tsx`
- Modify: `app/globals.css`
- Modify: `app/page.tsx`

**Steps:**
1. Use `content.publications` as data.
2. Create a PDF-desk style selector and detail panel.
3. Show title, venue, date, authors, abstract, and DOI link.
4. Add copy citation action if it stays simple and accessible.
5. Verify English title wrapping and Chinese density.

### Task 4: Add Original Bingo Companion

**Files:**
- Create: `components/system/BingoCompanion.tsx`
- Modify: `app/layout.tsx`
- Modify: `app/globals.css`

**Steps:**
1. Create an original lightweight SVG/CSS assistant, not copied from Codex pet assets.
2. Add idle, section-aware, and clicked states.
3. Offer quick actions for resume, contact, internships, and research.
4. Respect reduced motion and keep it away from core content.

### Task 5: Complete Homepage Flow

**Files:**
- Modify: `app/page.tsx`
- Review: `components/sections/FeaturedProjects.tsx`
- Review: `components/sections/Education.tsx`
- Review: `components/sections/ContactCTA.tsx`

**Steps:**
1. Assemble `Hero`, `About`, `Internships`, `ResearchDesk`, and a final contact path.
2. Reuse existing sections only if their visual language does not break the new homepage.
3. Run lint and production build.
4. Verify in browser at desktop and mobile widths with screenshots.
