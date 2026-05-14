"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Send, Mail, FileText, Github, Linkedin, MessageCircle, QrCode } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { getContent } from "@/lib/content";
import { Magnetic } from "@/components/system/Magnetic";

const SUBJECT_TEMPLATES = {
  en: [
    { id: "opportunity", label: "About a role / opportunity", subject: "Hi Xubin — about a role", opener: "Hey Xubin,\n\nI saw your portfolio and wanted to reach out about " },
    { id: "collab", label: "Collaboration / project", subject: "Collaboration idea", opener: "Hi Xubin,\n\nI have a project idea I think could fit your skills — " },
    { id: "casual", label: "Just saying hi", subject: "Just a hello", opener: "Hey Xubin,\n\nNo agenda — just liked your portfolio and wanted to say " },
  ],
  zh: [
    { id: "opportunity", label: "聊聊机会", subject: "你好 Xubin —— 聊聊一个机会", opener: "嗨 Xubin，\n\n看了你的作品集，想和你聊一下 " },
    { id: "collab", label: "项目合作", subject: "合作想法", opener: "你好 Xubin，\n\n我有一个项目想法可能很适合你 —— " },
    { id: "casual", label: "随便聊聊", subject: "打个招呼", opener: "嗨 Xubin，\n\n没什么特别的事，只是看了你的作品集想和你说 " },
  ],
} as const;

export function ContactDraft() {
  const { lang } = useI18n();
  const reduce = useReducedMotion();
  const content = getContent();
  const email = content.contact.email;
  const wechat = content.contact.wechat;
  const phone = content.contact.phone;

  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sent, setSent] = useState(false);
  const [activeQR, setActiveQR] = useState<"wechat" | "oa" | null>(null);

  const templates = SUBJECT_TEMPLATES[lang];

  const applyTemplate = (id: string) => {
    const t = templates.find((x) => x.id === id);
    if (!t) return;
    setSubject(t.subject);
    setBody(t.opener);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject || (lang === "en" ? "Hello Xubin" : "你好 徐斌"))}&body=${encodeURIComponent(body || (lang === "en" ? "Hi Xubin," : "你好 徐斌，"))}`;
    setSent(true);
    setTimeout(() => {
      window.location.href = mailtoUrl;
    }, 850);
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <section id="contact" className="contact-draft-section" aria-labelledby="contact-title">
      <div className="folio-section-label">CONTACT / 06</div>

      <div className="contact-draft-shell">
        <div className="contact-draft-heading">
          <p>{lang === "en" ? "If you'd like to send something —" : "想发点什么过来 ——"}</p>
          <h2 id="contact-title" data-lang={lang}>
            {lang === "en" ? (
              <>
                The draft is <em>already open</em>.<br />
                Just type.
              </>
            ) : (
              <>
                邮件草稿 <em>已经为你打开</em>，<br />
                直接写就好。
              </>
            )}
          </h2>
        </div>

        <div className="contact-draft-grid">
          <form className="mail-app" onSubmit={handleSend}>
            <div className="mail-app__chrome" aria-hidden>
              <span className="mail-app__dot" />
              <span className="mail-app__dot" />
              <span className="mail-app__dot" />
              <span className="mail-app__title">
                {lang === "en" ? "New message — to Xubin" : "新建邮件 —— 收件人 徐斌"}
              </span>
            </div>

            <div className="mail-app__row mail-app__row--locked">
              <label>{lang === "en" ? "To" : "收件人"}</label>
              <div className="mail-app__locked">
                <span className="mail-app__chip">
                  Xubin Sun &lt;{email}&gt;
                </span>
              </div>
            </div>

            <div className="mail-app__templates">
              <span>{lang === "en" ? "Quick start:" : "快速开头："}</span>
              {templates.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className="mail-app__template"
                  onClick={() => applyTemplate(t.id)}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="mail-app__row">
              <label htmlFor="mail-subject">{lang === "en" ? "Subject" : "主题"}</label>
              <input
                id="mail-subject"
                type="text"
                placeholder={lang === "en" ? "What's on your mind?" : "想聊点什么？"}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                autoComplete="off"
              />
            </div>

            <div className="mail-app__row mail-app__row--body">
              <textarea
                rows={9}
                placeholder={lang === "en"
                  ? "Hi Xubin,\n\nI saw your portfolio and..."
                  : "嗨 徐斌，\n\n看了你的作品集，..."}
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />
            </div>

            <div className="mail-app__foot">
              <small>{lang === "en" ? "Sends via your mail app — usually replies within 24h" : "通过你的邮件客户端发送 · 通常 24 小时内回复"}</small>
              <Magnetic radius={70} strength={0.32}>
                <button
                  type="submit"
                  className="mail-app__send"
                  data-bazil-cursor
                  disabled={sent}
                >
                  <motion.span
                    className="mail-app__send-icon"
                    animate={sent ? { x: 80, y: -40, rotate: 12, opacity: 0 } : { x: 0, y: 0, rotate: 0, opacity: 1 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <Send size={15} />
                  </motion.span>
                  {sent
                    ? lang === "en"
                      ? "Sent ✦"
                      : "已发送 ✦"
                    : lang === "en"
                    ? "Send"
                    : "发送"}
                </button>
              </Magnetic>
            </div>
          </form>

          <aside className="contact-draft-side">
            <div className="contact-draft-side__card">
              <span className="contact-draft-side__label">{lang === "en" ? "/ other ways" : "/ 其他方式"}</span>

              <a href={`mailto:${email}`} className="contact-draft-side__item">
                <Mail size={16} aria-hidden />
                <span>
                  <strong>Email</strong>
                  <small>{email}</small>
                </span>
              </a>

              <a href={`tel:${phone?.replace(/\s/g, "") ?? ""}`} className="contact-draft-side__item">
                <MessageCircle size={16} aria-hidden />
                <span>
                  <strong>{lang === "en" ? "Phone / WhatsApp" : "电话 / WhatsApp"}</strong>
                  <small>{phone}</small>
                </span>
              </a>

              <button
                type="button"
                className="contact-draft-side__item contact-draft-side__item--button"
                onClick={() => setActiveQR("wechat")}
              >
                <QrCode size={16} aria-hidden />
                <span>
                  <strong>WeChat</strong>
                  <small>{wechat ? `@ ${wechat}` : lang === "en" ? "scan to add" : "扫码添加"}</small>
                </span>
              </button>

              <button
                type="button"
                className="contact-draft-side__item contact-draft-side__item--button"
                onClick={() => setActiveQR("oa")}
              >
                <QrCode size={16} aria-hidden />
                <span>
                  <strong>{lang === "en" ? "WeChat OA" : "微信公众号"}</strong>
                  <small>{lang === "en" ? "scan to follow" : "扫码关注"}</small>
                </span>
              </button>
            </div>

            <div className="contact-draft-side__card contact-draft-side__card--dark">
              <span className="contact-draft-side__label">{lang === "en" ? "/ files & socials" : "/ 文件与社交"}</span>

              <Link href="/resume" className="contact-draft-side__item contact-draft-side__item--dark">
                <FileText size={16} aria-hidden />
                <span>
                  <strong>{lang === "en" ? "Resume PDF" : "简历 PDF"}</strong>
                  <small>{lang === "en" ? "view or download" : "查看或下载"}</small>
                </span>
              </Link>

              <a
                href="#"
                aria-disabled="true"
                className="contact-draft-side__item contact-draft-side__item--dark contact-draft-side__item--placeholder"
                title={lang === "en" ? "Link not provided yet" : "链接待补充"}
              >
                <Github size={16} aria-hidden />
                <span>
                  <strong>GitHub</strong>
                  <small>{lang === "en" ? "link to add" : "链接待补充"}</small>
                </span>
              </a>

              <a
                href="#"
                aria-disabled="true"
                className="contact-draft-side__item contact-draft-side__item--dark contact-draft-side__item--placeholder"
                title={lang === "en" ? "Link not provided yet" : "链接待补充"}
              >
                <Linkedin size={16} aria-hidden />
                <span>
                  <strong>LinkedIn</strong>
                  <small>{lang === "en" ? "link to add" : "链接待补充"}</small>
                </span>
              </a>
            </div>
          </aside>
        </div>
      </div>

      <AnimatePresence>
        {activeQR && (
          <motion.div
            className="qr-lightbox"
            initial={reduce ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0 }}
            onClick={() => setActiveQR(null)}
            role="dialog"
            aria-modal="true"
          >
            <motion.div
              className="qr-lightbox__frame"
              initial={reduce ? { scale: 1 } : { scale: 0.94, y: 14 }}
              animate={{ scale: 1, y: 0 }}
              exit={reduce ? { scale: 1 } : { scale: 0.96, y: 8 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="qr-lightbox__placeholder">
                <QrCode size={64} aria-hidden />
                <p>
                  {activeQR === "wechat"
                    ? lang === "en"
                      ? "WeChat QR code"
                      : "微信二维码"
                    : lang === "en"
                    ? "WeChat OA QR code"
                    : "微信公众号二维码"}
                </p>
                <small>
                  {lang === "en"
                    ? "(drop the image into /public/images/qr/ to enable)"
                    : "(把二维码图片放到 /public/images/qr/ 即可)"}
                </small>
              </div>
              <p className="qr-lightbox__caption">
                {activeQR === "wechat"
                  ? wechat ? `@ ${wechat}` : lang === "en" ? "WeChat" : "微信"
                  : lang === "en" ? "WeChat OA" : "微信公众号"}
              </p>
              <button
                type="button"
                onClick={() => setActiveQR(null)}
                className="qr-lightbox__close"
                aria-label="Close"
              >
                ✕
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
