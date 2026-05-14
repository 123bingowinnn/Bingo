"use client";

import { ArrowUpRight, Mail, Phone, FileText } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { getContent } from "@/lib/content";
import { CircularTestimonials, type Facet } from "@/components/ui/circular-testimonials";

/** Official WeChat mark — simplified inline SVG. currentColor so it picks
    up the surrounding pill's text color (stays monochrome to match the
    Mail / Phone / FileText icons next to it). */
function WeChatIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      aria-hidden
    >
      <path d="M9.5,4C5.36,4 2,6.69 2,10c0,1.89 1.08,3.56 2.78,4.66L4,17l2.5-1.25C7.13,15.91 8.3,16 9.5,16C9.65,16 9.79,16 9.94,16C9.81,15.43 9.75,14.85 9.75,14.25C9.75,11.5 12.41,9.25 15.75,9.25C16.17,9.25 16.59,9.29 17,9.36C16.5,6.27 13.3,4 9.5,4M6.5,8.5A1,1 0 0,1 7.5,9.5A1,1 0 0,1 6.5,10.5A1,1 0 0,1 5.5,9.5A1,1 0 0,1 6.5,8.5M11.5,8.5A1,1 0 0,1 12.5,9.5A1,1 0 0,1 11.5,10.5A1,1 0 0,1 10.5,9.5A1,1 0 0,1 11.5,8.5M22,14.25C22,12.04 19.4,10.25 16.25,10.25C13,10.25 10.5,12.04 10.5,14.25C10.5,16.46 13,18.25 16.25,18.25C16.92,18.25 17.59,18.18 18.21,18L20,19L19.5,17.41C20.96,16.6 22,15.5 22,14.25M14.5,13.25A0.75,0.75 0 0,1 15.25,14A0.75,0.75 0 0,1 14.5,14.75A0.75,0.75 0 0,1 13.75,14A0.75,0.75 0 0,1 14.5,13.25M17.75,13.25A0.75,0.75 0 0,1 18.5,14A0.75,0.75 0 0,1 17.75,14.75A0.75,0.75 0 0,1 17,14A0.75,0.75 0 0,1 17.75,13.25Z" />
    </svg>
  );
}

const FACETS_EN: Facet[] = [
  {
    quote:
      "Good products get written into existence, not just designed. Each pass with the code, the user, and the model nudges the thing closer to what was in my head.",
    name: "AI Product",
    designation: "Crafting · Shipping",
    // TODO: user will replace with a new portrait
    src: "/images/portrait/xubin-hero.png",
  },
  {
    quote:
      "I keep changing cities, teams, and time zones. The next stop is always more interesting than the one I'm in — and the road is where most of the thinking actually happens.",
    name: "Traveler",
    designation: "Cities · Roads",
    src: "/images/portrait/bingo-recording.jpg",
  },
  {
    quote:
      "Product by day, papers by night. Research is where I get to slow down — the hard questions deserve longer hours than a sprint allows.",
    name: "Researcher",
    designation: "Papers · Models",
    // TODO: user will replace with a new portrait
    src: "/images/portrait/bingo-about-badge-angle.png",
  },
];

const FACETS_ZH: Facet[] = [
  {
    quote:
      "好的产品是写出来的、不是只画出来的。代码、用户、模型每多走一轮,它就更像我心里的样子。",
    name: "AI 产品",
    designation: "打磨 · 交付",
    src: "/images/portrait/xubin-hero.png",
  },
  {
    quote:
      "在城市之间、团队之间、时区之间换来换去。下一站永远比已经到的地方有意思 —— 真正的思考大多发生在路上。",
    name: "旅行者",
    designation: "城市 · 旅途",
    src: "/images/portrait/bingo-recording.jpg",
  },
  {
    quote:
      "白天写产品,夜里看 paper。研究让我可以慢下来 —— 复杂的问题值得用比冲刺更长的耐心去想。",
    name: "研究者",
    designation: "论文 · 模型",
    src: "/images/portrait/bingo-about-badge-angle.png",
  },
];

export function Contact() {
  const { lang } = useI18n();
  const content = getContent();
  const facets = lang === "en" ? FACETS_EN : FACETS_ZH;

  const phoneDigits = (content.contact.phone ?? "").replace(/\s/g, "");

  const contactPills = (
    <div className="contact-links">
      <a
        href={`mailto:${content.contact.email}`}
        className="contact-link"
        data-bazil-cursor
      >
        <Mail size={15} strokeWidth={1.8} />
        <span>{content.contact.email}</span>
        <ArrowUpRight size={13} strokeWidth={2} className="contact-link__out" />
      </a>
      <a
        href={`tel:${phoneDigits}`}
        className="contact-link"
        data-bazil-cursor
      >
        <Phone size={15} strokeWidth={1.8} />
        <span>{content.contact.phone}</span>
        <ArrowUpRight size={13} strokeWidth={2} className="contact-link__out" />
      </a>
      <span className="contact-link" data-static title="WeChat ID">
        <WeChatIcon size={15} />
        <span>{content.contact.wechat}</span>
      </span>
      <button
        type="button"
        onClick={() =>
          window.dispatchEvent(new CustomEvent("bingo:resume:open"))
        }
        className="contact-link"
        data-bazil-cursor
      >
        <FileText size={15} strokeWidth={1.8} />
        <span>{lang === "en" ? "Resume" : "简历"}</span>
        <ArrowUpRight size={13} strokeWidth={2} className="contact-link__out" />
      </button>
    </div>
  );

  return (
    <section
      id="contact"
      className="contact-section"
      aria-labelledby="contact-title"
    >
      <div className="contact-section__inner">
        <header className="contact-section__head">
          <p className="contact-section__eyebrow">
            {lang === "en" ? "/ CONTACT" : "/ 联系"}
          </p>
          <h2
            id="contact-title"
            className="contact-section__lede"
            data-lang={lang}
          >
            {lang === "en" ? "Let's talk." : "聊聊吧。"}
          </h2>
          <p className="contact-section__sub">
            {lang === "en" ? "Three sides of me." : "我的三面。"}
          </p>
        </header>

        <div className="contact-section__carousel">
          <CircularTestimonials
            testimonials={facets}
            autoplay
            intervalMs={6500}
            footerSlot={contactPills}
          />
        </div>
      </div>
    </section>
  );
}
