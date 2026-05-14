"use client";

import { Users } from "lucide-react";
import { SectionWrapper } from "@/components/SectionWrapper";
import { useI18n } from "@/lib/i18n";
import { getContent } from "@/lib/content";

export function Leadership() {
  const { lang } = useI18n();
  const content = getContent();

  if (content.leadership.length === 0) return null;

  return (
    <SectionWrapper className="py-16 sm:py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-10">
          {lang === "en" ? "Leadership & Volunteering" : "领导力与志愿者"}
        </h2>

        <div className="space-y-4">
          {content.leadership.map((item, i) => {
            const l = item[lang];
            return (
              <div
                key={i}
                className="rounded-xl border border-border bg-card/50 p-5 flex gap-4"
              >
                <div className="shrink-0 mt-0.5">
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                    <Users className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-sm sm:text-base">{l.role}</h3>
                  <p className="text-sm text-muted-foreground">
                    {l.organization} · {l.period}
                  </p>
                  <p className="text-sm text-muted-foreground/80 mt-2 leading-relaxed">
                    {l.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </SectionWrapper>
  );
}
