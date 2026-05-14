"use client";

import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

interface TagFilterProps {
  tags: string[];
  activeTag: string | null;
  onTagChange: (tag: string | null) => void;
}

export function TagFilter({ tags, activeTag, onTagChange }: TagFilterProps) {
  const { lang } = useI18n();

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by tag">
      <button
        onClick={() => onTagChange(null)}
        className={cn(
          "px-3 py-1.5 text-sm rounded-full border transition-colors",
          activeTag === null
            ? "bg-foreground text-background border-foreground"
            : "bg-transparent text-muted-foreground border-border hover:border-foreground/30 hover:text-foreground"
        )}
      >
        {lang === "en" ? "All" : "全部"}
      </button>
      {tags.map((tag) => (
        <button
          key={tag}
          onClick={() => onTagChange(activeTag === tag ? null : tag)}
          className={cn(
            "px-3 py-1.5 text-sm rounded-full border transition-colors",
            activeTag === tag
              ? "bg-foreground text-background border-foreground"
              : "bg-transparent text-muted-foreground border-border hover:border-foreground/30 hover:text-foreground"
          )}
        >
          {tag}
        </button>
      ))}
    </div>
  );
}
