"use client";

import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { getContent } from "@/lib/content";
import { Heart } from "lucide-react";

export function Footer() {
  const { lang } = useI18n();
  const content = getContent();
  const pathname = usePathname();

  if (pathname === "/") return null;

  return (
    <footer className="border-t border-border py-8 no-print">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} {content.hero[lang].name}.{" "}
            {lang === "en" ? "All rights reserved." : "保留所有权利。"}
          </p>
          <p className="flex items-center gap-1">
            {lang === "en" ? "Built with" : "用"}{" "}
            <Heart className="h-3.5 w-3.5 text-red-500 fill-red-500" />{" "}
            {lang === "en" ? "and Next.js" : "和 Next.js 构建"}
          </p>
        </div>
      </div>
    </footer>
  );
}
