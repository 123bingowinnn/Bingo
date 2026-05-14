"use client";

import { useI18n } from "@/lib/i18n";
import { getContent } from "@/lib/content";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Printer, Download } from "lucide-react";

export default function ResumePage() {
  const { lang } = useI18n();
  const content = getContent();
  const hero = content.hero[lang];

  return (
    <div className="pt-24 pb-16">
      {/* Print controls */}
      <div className="mx-auto max-w-3xl px-4 sm:px-6 mb-8 no-print">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            {lang === "en" ? "Resume" : "简历"}
          </h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <a href="/resume.pdf" target="_blank" rel="noopener noreferrer">
                <Download className="h-3.5 w-3.5" />
                PDF
              </a>
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer className="h-3.5 w-3.5" />
              {lang === "en" ? "Print" : "打印"}
            </Button>
          </div>
        </div>
      </div>

      {/* Resume content */}
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <article className="space-y-8 print:space-y-4">
          {/* Header */}
          <header className="text-center border-b border-border pb-6 print:pb-3">
            <h1 className="text-2xl sm:text-3xl font-bold print:text-2xl">{hero.name}</h1>
            <p className="text-muted-foreground mt-1 print:text-sm">{hero.title}</p>
            <div className="flex flex-wrap items-center justify-center gap-3 mt-3 text-sm text-muted-foreground print:text-xs">
              <span>{content.contact.email}</span>
              {content.contact.links.map((link, index) => {
                const localizedLink = link as unknown as {
                  en?: { label: string };
                  zh?: { label: string };
                  label?: string;
                  url?: string;
                  action?: string;
                };
                const label =
                  (lang === "en" ? localizedLink.en?.label : localizedLink.zh?.label) ??
                  localizedLink.label ??
                  `Link ${index + 1}`;
                const href =
                  localizedLink.url ?? (localizedLink.action === "resume-preview" ? "/resume.pdf" : "#");

                return (
                  <a key={`${label}-${index}`} href={href} className="hover:text-foreground transition-colors">
                    {label}
                  </a>
                );
              })}
            </div>
          </header>

          {/* Education */}
          <section>
            <h2 className="text-lg font-semibold border-b border-border pb-1 mb-3 print:text-base">
              {lang === "en" ? "Education" : "教育经历"}
            </h2>
            {content.education.map((edu, i) => {
              const e = edu[lang];
              return (
                <div key={i} className="mb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-sm print:text-xs">{e.school}</p>
                      <p className="text-sm text-muted-foreground print:text-xs">{e.degree}</p>
                    </div>
                    <div className="text-sm text-muted-foreground text-right print:text-xs">
                      <p>{e.period}</p>
                      <p>{e.location}</p>
                    </div>
                  </div>
                  <ul className="mt-1 space-y-0.5">
                    {e.highlights.map((h, j) => (
                      <li key={j} className="text-sm text-muted-foreground pl-3 relative before:content-['•'] before:absolute before:left-0 before:text-muted-foreground/50 print:text-xs">
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </section>

          {/* Experience */}
          <section>
            <h2 className="text-lg font-semibold border-b border-border pb-1 mb-3 print:text-base">
              {lang === "en" ? "Internships" : "实习经历"}
            </h2>
            {content.experience.map((exp) => {
              const e = exp[lang];
              return (
                <div key={exp.slug} className="mb-4 print:mb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-sm print:text-xs">{e.role}</p>
                      <p className="text-sm text-muted-foreground print:text-xs">{e.company} · {e.location}</p>
                    </div>
                    <span className="text-sm text-muted-foreground whitespace-nowrap print:text-xs">
                      {e.period}
                    </span>
                  </div>
                  <ul className="mt-1.5 space-y-0.5">
                    {e.bullets.map((bullet, i) => (
                      <li key={i} className="text-sm text-muted-foreground pl-3 relative before:content-['•'] before:absolute before:left-0 before:text-muted-foreground/50 print:text-xs">
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </section>

          {/* Projects */}
          <section>
            <h2 className="text-lg font-semibold border-b border-border pb-1 mb-3 print:text-base">
              {lang === "en" ? "Projects" : "项目"}
            </h2>
            {content.projects.filter((p) => p.featured).map((project) => {
              const p = project[lang];
              return (
                <div key={project.slug} className="mb-3 print:mb-2">
                  <div className="flex justify-between items-start">
                    <p className="font-medium text-sm print:text-xs">{p.title}</p>
                    <div className="flex gap-1 shrink-0">
                      {project.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs print:text-[9px] print:px-1">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5 print:text-xs">{p.summary}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {p.techStack.map((tech) => (
                      <span key={tech} className="text-xs text-muted-foreground/70 print:text-[9px]">
                        {tech}
                        {p.techStack.indexOf(tech) < p.techStack.length - 1 ? " ·" : ""}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </section>

          {/* Skills / Interests */}
          <section>
            <h2 className="text-lg font-semibold border-b border-border pb-1 mb-3 print:text-base">
              {lang === "en" ? "Interests" : "兴趣爱好"}
            </h2>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground print:text-xs">
              {content.interests.map((item, i) => (
                <span key={i}>
                  <span className="font-medium text-foreground">{item[lang].label}</span>:{" "}
                  {item[lang].detail}
                </span>
              ))}
            </div>
          </section>
        </article>
      </div>
    </div>
  );
}
