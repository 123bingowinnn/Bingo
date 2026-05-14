"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { SectionWrapper } from "@/components/SectionWrapper";
import { Button } from "@/components/ui/button";
import { ProjectCard } from "@/components/ProjectCard";
import { useI18n } from "@/lib/i18n";
import { getFeaturedProjects } from "@/lib/content";

export function FeaturedProjects() {
  const { lang } = useI18n();
  const featured = getFeaturedProjects();
  const gridRef = useRef(null);
  const inView = useInView(gridRef, { once: true, margin: "-60px" });
  const shouldReduceMotion = useReducedMotion();

  return (
    <SectionWrapper id="projects" className="py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex items-end justify-between mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {lang === "en" ? "Featured Projects" : "精选项目"}
          </h2>
          <Link href="/projects" className="hidden sm:block">
            <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
              {lang === "en" ? "View all" : "查看全部"}
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {featured.map((project, i) => (
            <motion.div
              key={project.slug}
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.5,
                delay: shouldReduceMotion ? 0 : i * 0.1,
                ease: [0.21, 0.47, 0.32, 0.98],
              }}
            >
              <ProjectCard project={project} />
            </motion.div>
          ))}
        </div>

        <div className="mt-8 sm:hidden text-center">
          <Link href="/projects">
            <Button variant="outline" size="sm" className="gap-1">
              {lang === "en" ? "View all projects" : "查看所有项目"}
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </SectionWrapper>
  );
}
