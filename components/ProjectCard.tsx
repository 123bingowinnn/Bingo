"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n";
import type { ProjectItem } from "@/lib/types";

export function ProjectCard({ project }: { project: ProjectItem }) {
  const { lang } = useI18n();
  const p = project[lang];
  const ref = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [6, -6]), {
    stiffness: 300,
    damping: 30,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-6, 6]), {
    stiffness: 300,
    damping: 30,
  });

  const handleMouse = (e: React.MouseEvent) => {
    if (shouldReduceMotion || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <Link href={`/projects/${project.slug}`}>
      <motion.div
        ref={ref}
        onMouseMove={handleMouse}
        onMouseLeave={handleLeave}
        style={{
          rotateX: shouldReduceMotion ? 0 : rotateX,
          rotateY: shouldReduceMotion ? 0 : rotateY,
          transformPerspective: 800,
        }}
        className="h-full group cursor-pointer relative"
      >
        {/* Glow effect */}
        <div className="absolute -inset-px rounded-xl bg-gradient-to-b from-foreground/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />
        
        <div className="h-full rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm text-card-foreground shadow-sm hover:shadow-xl dark:hover:shadow-2xl hover:border-foreground/20 transition-all duration-300 relative overflow-hidden">
          {/* Media area: video > image > hidden */}
          {(project.image || project.video) && (
            <div className="relative h-40 overflow-hidden rounded-t-xl bg-muted">
              {project.video ? (
                <video
                  src={project.video}
                  muted
                  loop
                  playsInline
                  autoPlay
                  className="absolute inset-0 h-full w-full object-cover opacity-80 group-hover:opacity-100 dark:opacity-60 dark:group-hover:opacity-80 transition-opacity duration-500"
                />
              ) : project.image ? (
                <Image
                  src={project.image}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover"
                />
              ) : null}
              {/* Shine effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/[0.03] to-transparent dark:via-white/5 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            </div>
          )}

          <div className={`flex flex-col p-6 ${project.image ? "pt-4" : ""}`}>
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="text-base font-semibold group-hover:text-foreground/80 transition-colors leading-snug">
                {p.title}
              </h3>
              <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5" />
            </div>

            <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
              {p.summary}
            </p>

            <div className="flex flex-wrap gap-1.5 mb-3">
              {p.techStack.slice(0, 4).map((tech) => (
                <Badge key={tech} variant="outline" className="text-xs font-normal">
                  {tech}
                </Badge>
              ))}
              {p.techStack.length > 4 && (
                <Badge variant="outline" className="text-xs font-normal">
                  +{p.techStack.length - 4}
                </Badge>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5">
              {project.tags.map((tag) => (
                <Badge key={tag} variant="accent" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
