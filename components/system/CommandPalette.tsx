"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  FileText,
  FolderOpen,
  Home,
  Mail,
  Search,
  Sparkles,
  User,
} from "lucide-react";
import { getContent } from "@/lib/content";
import { useI18n } from "@/lib/i18n";

/** What an entry in the palette can do. Most jump to a route; a small set
 *  fire a window event (resume preview, contact). */
type CommandAction = {
  id: string;
  title: string;
  eyebrow: string;
  icon: ReactNode;
} & ({ kind: "route"; href: string } | { kind: "event"; event: string });

/** Slugs that have a `/projects/${slug}` detail page (everything in Works
 *  except the externally-hosted LLM rejection survey). Kept in sync with
 *  components/sections/Works.tsx. */
const PROJECT_SLUGS = new Set([
  "digital-human-dementia",
  "plant-disease-classification",
  "fridge-clear",
  "pathmnist-classification",
  "octmnist-distillation",
]);

export function CommandPalette() {
  const { lang } = useI18n();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const content = getContent();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((current) => !current);
      } else if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const actions = useMemo(() => {
    // Homepage section anchors — match Navbar + the actual sections on /
    const sections: CommandAction[] = [
      {
        id: "sec-hero",
        kind: "route",
        href: "/#hero",
        title: lang === "en" ? "Home" : "首页",
        eyebrow: lang === "en" ? "Hero / opening frame" : "首屏",
        icon: <Home className="h-4 w-4" />,
      },
      {
        id: "sec-about",
        kind: "route",
        href: "/#about",
        title: lang === "en" ? "About" : "关于我",
        eyebrow: lang === "en" ? "Who I am" : "我是谁",
        icon: <User className="h-4 w-4" />,
      },
      {
        id: "sec-experience",
        kind: "route",
        href: "/#experience",
        title: lang === "en" ? "Internships" : "实习",
        eyebrow: lang === "en" ? "Experience map" : "实习地图",
        icon: <BriefcaseBusiness className="h-4 w-4" />,
      },
      {
        id: "sec-works",
        kind: "route",
        href: "/#works",
        title: lang === "en" ? "Projects" : "项目",
        eyebrow: lang === "en" ? "Research and builds" : "研究与项目",
        icon: <FolderOpen className="h-4 w-4" />,
      },
      {
        id: "sec-contact",
        kind: "route",
        href: "/#contact",
        title: lang === "en" ? "Contact" : "联系我",
        eyebrow: lang === "en" ? "Three sides of me" : "我的三面",
        icon: <Mail className="h-4 w-4" />,
      },
    ];

    // The four internships — link to the consolidated /experience page with
    // an in-page anchor so the card scrolls into view.
    const internships: CommandAction[] = content.experience
      .filter((e) => !e.slug.startsWith("wku-"))
      .map((experience) => {
        const copy = experience[lang];
        return {
          id: `int-${experience.slug}`,
          kind: "route",
          href: `/experience#${experience.slug}`,
          title: copy.company,
          eyebrow: `${copy.role} · ${copy.period}`,
          icon: <BriefcaseBusiness className="h-4 w-4" />,
        } as CommandAction;
      });

    // Project + paper deep links. Most go to /projects/${slug}; the
    // LLM-rejection survey is hosted externally and links straight to the
    // venue. Cards from Works.tsx are the source of truth.
    const projects: CommandAction[] = content.projects
      .filter((p) => PROJECT_SLUGS.has(p.slug))
      .map((p) => {
        const copy = p[lang];
        return {
          id: `proj-${p.slug}`,
          kind: "route",
          href: `/projects/${p.slug}`,
          title: copy.title,
          eyebrow: p.tags.slice(0, 3).join(" · "),
          icon: <FolderOpen className="h-4 w-4" />,
        } as CommandAction;
      });

    const papers: CommandAction[] = content.publications.map((paper) => {
      const copy = paper[lang];
      return {
        id: `pap-${paper.slug}`,
        kind: "route",
        href: copy.link || `/research/${paper.slug}`,
        title: copy.title,
        eyebrow: `${copy.venue} · ${copy.date}`,
        icon: <FileText className="h-4 w-4" />,
      };
    });

    // Quick actions — short list of high-utility shortcuts.
    const quick: CommandAction[] = [
      {
        id: "quick-resume",
        kind: "event",
        event: "bingo:resume:open",
        title: lang === "en" ? "Open resume" : "查看简历",
        eyebrow: lang === "en" ? "Preview only · downloadable" : "仅供预览 · 可下载",
        icon: <FileText className="h-4 w-4" />,
      },
      {
        id: "quick-experience-page",
        kind: "route",
        href: "/experience",
        title: lang === "en" ? "Full experience page" : "完整实习经历",
        eyebrow: lang === "en" ? "All four internships, stacked" : "四段实习汇总",
        icon: <BriefcaseBusiness className="h-4 w-4" />,
      },
      {
        id: "quick-email",
        kind: "route",
        href: `mailto:${content.contact.email}`,
        title: lang === "en" ? "Email me" : "发邮件",
        eyebrow: content.contact.email,
        icon: <Mail className="h-4 w-4" />,
      },
      {
        id: "quick-pet",
        kind: "event",
        event: "bingo-pet:chat:open",
        title: lang === "en" ? "Ask the pet" : "问问宠物",
        eyebrow: lang === "en" ? "Site Q&A in your sidebar" : "侧边的网站问答",
        icon: <Sparkles className="h-4 w-4" />,
      },
    ];

    return { sections, internships, projects, papers, quick };
  }, [content, lang]);

  const run = (action: CommandAction) => {
    setOpen(false);
    if (action.kind === "event") {
      // Allow the palette close transition a tick so focus returns before
      // the next modal mounts.
      window.setTimeout(() => {
        window.dispatchEvent(new CustomEvent(action.event));
      }, 60);
      return;
    }
    if (action.href.startsWith("mailto:") || action.href.startsWith("http")) {
      window.location.href = action.href;
      return;
    }
    router.push(action.href);
  };

  return (
    open && (
      <div
        className="command-palette__overlay"
        role="presentation"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) setOpen(false);
        }}
      >
        <div className="command-palette__shell" role="dialog" aria-modal="true">
          <Command
            label={lang === "en" ? "Bingo command palette" : "Bingo 快速跳转"}
            className="command-palette"
          >
            <div className="command-palette__top">
              <Search className="h-4 w-4" />
              <Command.Input
                autoFocus
                placeholder={
                  lang === "en"
                    ? "Jump to a section, internship, project, or paper…"
                    : "跳转到任意区块、实习、项目或论文…"
                }
              />
              <kbd>ESC</kbd>
            </div>
            <Command.List className="command-palette__list">
              <Command.Empty className="command-palette__empty">
                {lang === "en" ? "No match." : "没有匹配项。"}
              </Command.Empty>

              <Command.Group
                heading={lang === "en" ? "Quick actions" : "快捷动作"}
              >
                {actions.quick.map((action) => (
                  <CommandItem key={action.id} action={action} onSelect={run} />
                ))}
              </Command.Group>

              <Command.Group
                heading={lang === "en" ? "Homepage" : "首页区块"}
              >
                {actions.sections.map((action) => (
                  <CommandItem key={action.id} action={action} onSelect={run} />
                ))}
              </Command.Group>

              <Command.Group
                heading={lang === "en" ? "Internships" : "实习经历"}
              >
                {actions.internships.map((action) => (
                  <CommandItem key={action.id} action={action} onSelect={run} />
                ))}
              </Command.Group>

              <Command.Group
                heading={lang === "en" ? "Projects" : "项目"}
              >
                {actions.projects.map((action) => (
                  <CommandItem key={action.id} action={action} onSelect={run} />
                ))}
              </Command.Group>

              <Command.Group
                heading={lang === "en" ? "Papers" : "论文"}
              >
                {actions.papers.map((action) => (
                  <CommandItem key={action.id} action={action} onSelect={run} />
                ))}
              </Command.Group>
            </Command.List>
          </Command>
        </div>
      </div>
    )
  );
}

function CommandItem({
  action,
  onSelect,
}: {
  action: CommandAction;
  onSelect: (action: CommandAction) => void;
}) {
  return (
    <Command.Item
      value={`${action.title} ${action.eyebrow}`}
      onSelect={() => onSelect(action)}
      className="command-palette__item"
    >
      <span className="command-palette__item-icon">{action.icon}</span>
      <span className="command-palette__item-copy">
        <strong>{action.title}</strong>
        <small>{action.eyebrow}</small>
      </span>
      <ArrowUpRight className="h-3.5 w-3.5 command-palette__item-arrow" />
    </Command.Item>
  );
}
