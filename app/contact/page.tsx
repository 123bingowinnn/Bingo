"use client";

import { Mail, Linkedin, Github, Twitter, FileText, ExternalLink, Phone, MessageCircle } from "lucide-react";
import { getContent } from "@/lib/content";
import { useI18n } from "@/lib/i18n";
import { SectionWrapper } from "@/components/SectionWrapper";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Linkedin,
  Github,
  Twitter,
  FileText,
  Mail,
  ExternalLink,
};

export default function ContactPage() {
  const { lang } = useI18n();
  const content = getContent();
  const c = content.contact[lang];

  return (
    <div className="pt-24 pb-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <SectionWrapper>
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              {c.heading}
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto leading-relaxed">
              {c.description}
            </p>
          </div>
        </SectionWrapper>

        <SectionWrapper delay={0.1}>
          <div className="rounded-2xl border border-border bg-card/50 p-8 sm:p-10">
            {/* Contact details */}
            <div className="text-center mb-8 space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  {lang === "en" ? "Email" : "邮箱"}
                </p>
                <a
                  href={`mailto:${content.contact.email}`}
                  className="text-xl sm:text-2xl font-semibold hover:opacity-80 transition-opacity"
                >
                  {content.contact.email}
                </a>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
                {content.contact.phone && (
                  <span className="inline-flex items-center gap-1.5">
                    <Phone className="h-4 w-4" />
                    {content.contact.phone}
                  </span>
                )}
                {content.contact.wechat && (
                  <span className="inline-flex items-center gap-1.5">
                    <MessageCircle className="h-4 w-4" />
                    WeChat: {content.contact.wechat}
                  </span>
                )}
              </div>
            </div>

            {/* Social links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {content.contact.links.map((link) => {
                const Icon = iconMap[link.icon];
                return (
                  <a
                    key={link.label}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-xl border border-border p-4 hover:border-foreground/20 hover:bg-accent/50 transition-all group"
                  >
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      {Icon && <Icon className="h-5 w-5 text-muted-foreground" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{link.label}</p>
                      <p className="text-xs text-muted-foreground truncate">{link.url}</p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </a>
                );
              })}
            </div>
          </div>
        </SectionWrapper>
      </div>
    </div>
  );
}
