# Internship photos

Drop photos into each company's folder. The site looks for:

```
zoom-pm/
  cover.jpg          # 16:10 — hero cover for /experience/zoom-pm and the marquee card
  01.jpg, 02.jpg…    # 4:3 — gallery photos in the detail page

alibaba-cloud/
deloitte-backend/
penghui-bigdata/
wku-ta/
wku-library/
  (same convention)
```

**If `cover.jpg` is missing**, the showcase renders a branded fallback with the company logo or initials.
**If numbered photos are missing**, the rolling contact sheet uses refined placeholder frames until real photos exist.

Supported extensions: `.jpg`, `.jpeg`, `.png`, `.webp`.
The index page scans `01` through `12` automatically, so `01.jpg`, `02.webp`, etc. work without code changes.

Recommended sizes:
- cover: 1600×1000 (≈ 1.6 MB max, jpg or webp)
- gallery: 1200×900 (≈ 600KB max each)
