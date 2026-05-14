"use client";

import Link from "next/link";
import { ArrowRight, Building2 } from "lucide-react";
import { SectionWrapper } from "@/components/SectionWrapper";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { getContent } from "@/lib/content";

export function ExperiencePreview() {
  const { lang } = useI18n();
  const content = getContent();
  const experiences = content.experience.slice(0, 4);

  return (
    <SectionWrapper id="experience" className="py-16 sm:py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="flex items-end justify-between mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {lang === "en" ? "Internships" : "实习经历"}
          </h2>
          <Link href="/experience" className="hidden sm:block">
            <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
              {lang === "en" ? "View all" : "查看全部"}
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        <div className="space-y-6">
          {experiences.map((exp) => {
            const e = exp[lang];
            return (
              <div
                key={exp.slug}
                className="group relative pl-8 border-l border-border/50 hover:border-primary/30 transition-all duration-300"
              >
                {/* Timeline dot with glow on hover */}
                <div className="timeline-dot absolute -left-[5px] top-2 h-2.5 w-2.5 rounded-full border-2 border-border bg-background" />

                <div className="card-premium p-5 rounded-xl">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 mb-3">
                    <div>
                      <h3 className="text-lg font-semibold tracking-tight">{e.role}</h3>
                      <p className="text-muted-foreground flex items-center gap-1.5 text-sm">
                        <Building2 className="h-3.5 w-3.5" />
                        {e.company}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground/80 whitespace-nowrap font-medium">
                      {e.period}
                    </span>
                  </div>

                  <p className="text-sm text-muted-foreground/90 mb-4 leading-relaxed">
                    {e.summary}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1.5">
                      {exp.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs font-medium">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <Link href={`/experience#${exp.slug}`} className="text-xs text-primary/70 hover:text-primary transition-colors flex items-center gap-1 group/link">
                      {lang === "en" ? "Details" : "详情"}
                      <ArrowRight className="h-3 w-3 transition-transform group-hover/link:translate-x-0.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 sm:hidden text-center">
          <Link href="/experience">
            <Button variant="outline" size="sm" className="gap-1">
              {lang === "en" ? "View all internships" : "查看所有实习"}
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </SectionWrapper>
  );
}
