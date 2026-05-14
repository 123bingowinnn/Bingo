"use client";

import { useState } from "react";
import { Mail, Linkedin, Github, Twitter, FileText, ExternalLink, Phone, MessageCircle } from "lucide-react";
import { SectionWrapper } from "@/components/SectionWrapper";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { getContent } from "@/lib/content";
import { ResumePreview } from "@/components/ResumePreview";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Linkedin,
  Github,
  Twitter,
  FileText,
  Mail,
  ExternalLink,
};

type ContactLink = {
  action?: string;
  icon: string;
  label: string;
  url?: string;
  en?: { label: string };
  zh?: { label: string };
};

export function ContactCTA() {
  const { lang } = useI18n();
  const content = getContent();
  const c = content.contact[lang];
  const [resumePreviewOpen, setResumePreviewOpen] = useState(false);

  return (
    <SectionWrapper id="contact" className="py-16 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4">
          {c.heading}
        </h2>
        <p className="text-muted-foreground text-base sm:text-lg mb-8 max-w-xl mx-auto leading-relaxed">
          {c.description}
        </p>

        {/* Quick info badges */}
        {(content.contact.email || content.contact.phone || content.contact.wechat) && (
          <div className="flex flex-wrap items-center justify-center gap-4 mb-6 text-sm text-muted-foreground">
            {content.contact.email && (
              <span className="inline-flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" />
                {content.contact.email}
              </span>
            )}
            {content.contact.phone && (
              <span className="inline-flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" />
                {content.contact.phone}
              </span>
            )}
            {content.contact.wechat && (
              <span className="inline-flex items-center gap-1.5">
                <MessageCircle className="h-3.5 w-3.5" />
                WeChat: {content.contact.wechat}
              </span>
            )}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button size="lg" asChild>
            <a href={`mailto:${content.contact.email}`}>
              <Mail className="h-4 w-4" />
              {lang === "en" ? "Send Email" : "发送邮件"}
            </a>
          </Button>

          {content.contact.links.map((link: ContactLink, index: number) => {
            const Icon = iconMap[link.icon];
            const label = link[lang]?.label || link.label;

            // Handle resume preview action
            if (link.action === "resume-preview") {
              return (
                <Button
                  key={index}
                  variant="outline"
                  size="lg"
                  onClick={() => setResumePreviewOpen(true)}
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  {label}
                </Button>
              );
            }

            // Regular link
            if (!link.url) return null;

            return (
              <Button key={index} variant="outline" size="lg" asChild>
                <a href={link.url} target="_blank" rel="noopener noreferrer">
                  {Icon && <Icon className="h-4 w-4" />}
                  {label}
                </a>
              </Button>
            );
          })}
        </div>
      </div>

      <ResumePreview open={resumePreviewOpen} onOpenChange={setResumePreviewOpen} />
    </SectionWrapper>
  );
}
