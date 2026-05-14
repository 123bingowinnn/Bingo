"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { useI18n } from "@/lib/i18n";

const LOGOS = [
  { name: "Zoom", src: "/images/logos/zoom.svg", width: 120, height: 28 },
  { name: "Alibaba Cloud", src: "/images/logos/alibaba-cloud.svg", width: 168, height: 22 },
  { name: "Deloitte", src: "/images/logos/deloitte.svg", width: 124, height: 26 },
] as const;

const LABEL = {
  en: "Previously interned at",
  zh: "曾实习于",
} as const;

const ARIA_LABEL = {
  en: "Previously interned at Zoom, Alibaba Cloud, and Deloitte",
  zh: "曾实习于 Zoom、阿里云、德勤",
} as const;

export function HeroLogoStrip() {
  const { lang } = useI18n();
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={reduce ? { opacity: 1 } : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.95, ease: [0.16, 1, 0.3, 1] }}
      className="bazil-hero__logos"
      aria-label={ARIA_LABEL[lang]}
    >
      <span className="bazil-hero__logos-label" aria-hidden>
        {LABEL[lang]}
      </span>
      <ul className="bazil-hero__logos-row">
        {LOGOS.map((logo) => (
          <li key={logo.name} className="bazil-hero__logo" title={logo.name}>
            <Image
              src={logo.src}
              alt={logo.name}
              width={logo.width}
              height={logo.height}
              unoptimized
              className="bazil-hero__logo-img"
            />
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
