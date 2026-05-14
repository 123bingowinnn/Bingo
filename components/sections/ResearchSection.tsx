"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, ExternalLink, FileText } from "lucide-react";
import { SectionWrapper } from "@/components/SectionWrapper";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { getContent } from "@/lib/content";

export function ResearchSection() {
  const { lang } = useI18n();
  const content = getContent();
  const publications = content.publications;
  const [expanded, setExpanded] = useState<string | null>(null);

  if (publications.length === 0) return null;

  return (
    <SectionWrapper id="research" className="py-16 sm:py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-10">
          {lang === "en" ? "Research & Publications" : "研究与论文"}
        </h2>

        <div className="space-y-4">
          {publications.map((pub) => {
            const p = pub[lang];
            const isExpanded = expanded === pub.slug;
            return (
              <div
                key={pub.slug}
                className="rounded-xl border border-border bg-card/50 p-5 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                      <h3 className="font-semibold text-sm sm:text-base">{p.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {p.venue} · {p.date}
                    </p>
                    <p className="text-xs text-muted-foreground/70 mt-0.5">{p.authors}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {p.link && (
                      <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                        <a href={p.link} target="_blank" rel="noopener noreferrer" aria-label="Open paper">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setExpanded(isExpanded ? null : pub.slug)}
                      aria-label={isExpanded ? "Collapse" : "Expand"}
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>
                </div>
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {p.abstract}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </SectionWrapper>
  );
}
