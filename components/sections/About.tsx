"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { Education } from "@/components/sections/Education";
import { getContent } from "@/lib/content";

const Lanyard = dynamic(() => import("@/components/ui/lanyard/Lanyard"), { ssr: false });

export function About() {
  const { lang } = useI18n();
  const content = getContent();
  const about = content.about[lang];

  return (
    <section id="about" className="about-section" aria-labelledby="about-title">
      <div className="about-shell">
        <motion.div
          className="about-badge-column"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="about-lanyard-scene">
            <Lanyard
              position={[0, 0, 14]}
              gravity={[0, -40, 0]}
              frontImage="/images/lanyard/badge-front.png"
              backImage="/images/lanyard/badge-back.png"
              lanyardImage="/images/lanyard/bingo-band.png"
              imageFit="cover"
              lanyardWidth={1}
            />
          </div>
        </motion.div>

        <motion.div
          className="about-copy"
          data-lang={lang}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.65, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="about-copy__eyebrow">{lang === "en" ? "/ ABOUT ME" : "/ 关于我"}</p>
          <h2 id="about-title" className="about-copy__headline" data-lang={lang}>
            <span>{about.headline}</span>
            <span className="about-copy__headline-accent">{about.headlineAccent}</span>
          </h2>
          <div className="about-copy__paragraphs">
            {about.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          {/* Education crest strip — nested inside the copy column so the
              two crests sit right under "今年秋天去耶鲁大学读硕士", reading
              as the visual signature of the paragraph above. */}
          <Education />
        </motion.div>
      </div>
    </section>
  );
}
