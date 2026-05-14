"use client";

import { Dumbbell, Timer, Video, Heart, Music, BookOpen, Camera, Gamepad2, Palette, Globe, Code } from "lucide-react";
import { SectionWrapper } from "@/components/SectionWrapper";
import { useI18n } from "@/lib/i18n";
import { getContent } from "@/lib/content";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Dumbbell,
  Timer,
  Video,
  Heart,
  Music,
  BookOpen,
  Camera,
  Gamepad2,
  Palette,
  Globe,
  Code,
};

export function Interests() {
  const { lang } = useI18n();
  const content = getContent();

  return (
    <SectionWrapper className="py-16 sm:py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-10">
          {lang === "en" ? "Interests" : "兴趣爱好"}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {content.interests.map((item, i) => {
            const Icon = iconMap[item.icon];
            const loc = item[lang];
            return (
              <div
                key={i}
                className="rounded-xl border border-border bg-card/50 p-5 flex items-start gap-4 hover:border-foreground/20 transition-colors"
              >
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  {Icon ? (
                    <Icon className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <Heart className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{loc.label}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    {loc.detail}
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
