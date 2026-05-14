"use client";

import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";

export function LanguageToggle() {
  const { lang, setLang } = useI18n();

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={lang === "en" ? "切换到中文" : "Switch to English"}
      className="h-9 w-9"
      onClick={() => setLang(lang === "en" ? "zh" : "en")}
    >
      <span className="text-xs font-semibold">
        {lang === "en" ? "中" : "EN"}
      </span>
    </Button>
  );
}
