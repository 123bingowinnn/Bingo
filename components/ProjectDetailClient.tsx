"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, ChevronDown, ChevronUp, ExternalLink, Play } from "lucide-react";
import type { ProjectItem } from "@/lib/types";
import { useI18n } from "@/lib/i18n";
import { Badge } from "@/components/ui/badge";
import { SectionWrapper } from "@/components/SectionWrapper";

function ProjectVideo({ video, lang }: { video: string; lang: "en" | "zh" }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <SectionWrapper delay={0.08}>
      <div className="mb-10">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
        >
          <Play className="h-3.5 w-3.5" />
          <span>{lang === "en" ? "Demo Video" : "演示视频"}</span>
          {expanded ? (
            <ChevronUp className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )}
        </button>
        {expanded && (
          <div className="mt-4 rounded-xl overflow-hidden border border-border bg-muted/30">
            <video
              src={video}
              controls
              playsInline
              preload="metadata"
              className="w-full max-h-[420px] object-contain bg-black/5 dark:bg-white/5"
            />
          </div>
        )}
      </div>
    </SectionWrapper>
  );
}

export default function ProjectDetailClient({ project }: { project: ProjectItem }) {
  const { lang } = useI18n();
  const p = project[lang];

  return (
    <div className="pt-24 pb-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <Link
          href="/#works"
          onClick={(e) => {
            // Same-page anchor → smooth-scroll back to the Works carousel
            // on the landing page instead of routing to /projects.
            if (typeof window !== "undefined" && window.location.pathname === "/") {
              e.preventDefault();
              document
                .getElementById("works")
                ?.scrollIntoView({ behavior: "smooth", block: "start" });
              history.pushState(null, "", "#works");
            }
          }}
          style={{
            color: "#1b1b1b",
            border: "1px solid rgba(27,27,27,0.15)",
          }}
          className="inline-flex items-center gap-2 text-sm font-medium px-3.5 py-2 rounded-full mb-10 group hover:bg-[#1b1b1b] hover:text-white hover:border-[#1b1b1b] transition-all duration-300"
        >
          <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5" />
          {lang === "en" ? "Back to Projects" : "返回项目列表"}
        </Link>

        <SectionWrapper>
          <div className="mb-10">
            <div className="flex flex-wrap gap-1.5 mb-4">
              {project.tags.map((tag) => (
                <Badge key={tag} variant="accent" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              {p.title}
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {p.summary}
            </p>

            {project.links && project.links.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-8">
                {project.links.map((link, i) => {
                  // First link = primary action (dark filled pill).
                  // Subsequent links = secondary (ghost outlined pill).
                  // Both have a leading external-link icon and a trailing
                  // arrow that slides on hover — unmistakably clickable.
                  const primary = i === 0;
                  return (
                    <a
                      key={link.label}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-bazil-cursor
                      style={
                        primary
                          ? {
                              background: "#1b1b1b",
                              color: "#ffffff",
                              boxShadow:
                                "0 6px 16px -8px rgba(27,27,27,0.4), 0 2px 4px -2px rgba(27,27,27,0.2)",
                            }
                          : {
                              background: "transparent",
                              color: "#1b1b1b",
                              border: "2px solid #1b1b1b",
                            }
                      }
                      className="group inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full text-sm font-semibold hover:-translate-y-0.5 transition-all duration-300"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span>{link.label}</span>
                      <ArrowUpRight className="h-4 w-4 opacity-0 -translate-x-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0" />
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </SectionWrapper>

        {project.video && <ProjectVideo video={project.video} lang={lang} />}

        <div className="space-y-10">
          <SectionWrapper delay={0.1}>
            <div>
              <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <span className="h-6 w-1 bg-red-500 rounded-full" />
                {lang === "en" ? "Problem" : "问题"}
              </h2>
              <p className="text-muted-foreground leading-relaxed">{p.problem}</p>
            </div>
          </SectionWrapper>

          <SectionWrapper delay={0.15}>
            <div>
              <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <span className="h-6 w-1 bg-blue-500 rounded-full" />
                {lang === "en" ? "Action" : "行动"}
              </h2>
              <p className="text-muted-foreground leading-relaxed">{p.action}</p>
            </div>
          </SectionWrapper>

          <SectionWrapper delay={0.2}>
            <div>
              <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <span className="h-6 w-1 bg-green-500 rounded-full" />
                {lang === "en" ? "Result" : "结果"}
              </h2>
              <p className="text-muted-foreground leading-relaxed">{p.result}</p>
            </div>
          </SectionWrapper>

          <SectionWrapper delay={0.25}>
            <div>
              <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <span className="h-6 w-1 bg-purple-500 rounded-full" />
                {lang === "en" ? "Learnings" : "收获"}
              </h2>
              <p className="text-muted-foreground leading-relaxed">{p.learnings}</p>
            </div>
          </SectionWrapper>

          <SectionWrapper delay={0.3}>
            <div>
              <h2 className="text-xl font-semibold mb-3">
                {lang === "en" ? "Tech Stack" : "技术栈"}
              </h2>
              <div className="flex flex-wrap gap-2">
                {p.techStack.map((tech) => (
                  <Badge key={tech} variant="outline" className="text-sm">
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>
          </SectionWrapper>
        </div>
      </div>
    </div>
  );
}
