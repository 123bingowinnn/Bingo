"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FileText, X } from "lucide-react";
import { useI18n } from "@/lib/i18n";

/**
 * Watermarked resume preview modal.
 *
 * Triggered by dispatching `window.dispatchEvent(new CustomEvent("bingo:resume:open"))`
 * from anywhere on the site. The PDF is rendered in an iframe with a
 * "仅供预览 / Preview only" watermark mesh layered over it so recruiters
 * who land here read the document, but copy/print isn't the default path.
 *
 * The actual locale-appropriate file (`/resume-en.pdf` or `/resume-zh.pdf`)
 * is resolved off the current site language. A "Download" affordance is
 * kept on the footer for people who really want the file.
 */
export function ResumePreview() {
  const { lang } = useI18n();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("bingo:resume:open", onOpen as EventListener);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener(
        "bingo:resume:open",
        onOpen as EventListener,
      );
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  // Lock body scroll while open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const file = lang === "en" ? "/resume-en.pdf" : "/resume-zh.pdf";
  const heading = lang === "en" ? "Resume preview" : "简历预览";
  const footnote =
    lang === "en"
      ? "Preview only. For more, please reach out."
      : "此预览仅供查看。如需更多信息，请直接联系我。";
  const downloadLabel = lang === "en" ? "Download" : "下载";
  const watermark = lang === "en" ? "Preview only" : "仅供预览";

  // Single-tile SVG repeated as a CSS background. Inline data URL avoids an
  // extra request and keeps the watermark legible at any zoom. The text
  // matches the active site language.
  const tileSvg = `<svg xmlns='http://www.w3.org/2000/svg' width='280' height='200'><text x='50%' y='50%' fill='rgba(27,27,27,0.12)' font-family='ui-monospace, SFMono-Regular, Menlo, monospace' font-size='17' letter-spacing='4' text-anchor='middle' dominant-baseline='middle'>${watermark}</text></svg>`;
  const tileUrl = `url("data:image/svg+xml;utf8,${encodeURIComponent(tileSvg)}")`;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="resume-preview"
          role="dialog"
          aria-modal="true"
          aria-label={heading}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <motion.div
            className="resume-preview__shell"
            initial={{ y: 18, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 12, opacity: 0 }}
            transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <header className="resume-preview__top">
              <span className="resume-preview__title">
                <FileText size={15} strokeWidth={1.7} aria-hidden />
                {heading}
              </span>
              <div className="resume-preview__actions">
                <a
                  className="resume-preview__download"
                  href={file}
                  download
                  data-bazil-cursor
                >
                  {downloadLabel}
                </a>
                <button
                  type="button"
                  className="resume-preview__close"
                  onClick={() => setOpen(false)}
                  aria-label={lang === "en" ? "Close" : "关闭"}
                >
                  <X size={16} strokeWidth={1.6} />
                </button>
              </div>
            </header>

            <div className="resume-preview__body">
              <iframe
                key={file}
                src={`${file}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`}
                title={heading}
                className="resume-preview__pdf"
              />
              {/* Tiled watermark — sits above the iframe via pointer-events:none
                  so the user can still scroll the PDF. */}
              <div className="resume-preview__watermark" aria-hidden>
                <div
                  className="resume-preview__watermark-tile"
                  style={{ backgroundImage: tileUrl }}
                />
              </div>
            </div>

            <footer className="resume-preview__foot">{footnote}</footer>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
