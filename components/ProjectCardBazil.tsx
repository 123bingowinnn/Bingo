"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import type { ProjectItem } from "@/lib/types";

export function ProjectCardBazil({
  project,
  index = 0,
}: {
  project: ProjectItem;
  index?: number;
}) {
  const { lang } = useI18n();
  const p = project[lang];
  const ref = useRef<HTMLAnchorElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduce = useReducedMotion();
  const [hovered, setHovered] = useState(false);

  // 3D tilt
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [4, -4]), { stiffness: 220, damping: 22 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-4, 4]), { stiffness: 220, damping: 22 });

  // Video play on hover
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (hovered) {
      v.currentTime = 0;
      v.play().catch(() => {});
    } else {
      v.pause();
    }
  }, [hovered]);

  const handleMouse = (e: React.MouseEvent) => {
    if (reduce || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    mx.set((e.clientX - rect.left) / rect.width - 0.5);
    my.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleLeave = () => {
    mx.set(0);
    my.set(0);
    setHovered(false);
  };

  return (
    <Link
      href={`/projects/${project.slug}`}
      className="project-bazil-card-wrap"
      ref={ref}
      onMouseMove={handleMouse}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleLeave}
      data-bazil-cursor
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <motion.div
        className="project-bazil-card"
        style={{
          rotateX: reduce ? 0 : rx,
          rotateY: reduce ? 0 : ry,
          transformPerspective: 900,
        }}
      >
        <div className="project-bazil-card__media">
          {project.video ? (
            <video
              ref={videoRef}
              src={project.video}
              muted
              loop
              playsInline
              preload="metadata"
              poster={project.image}
              className="project-bazil-card__video"
            />
          ) : project.image ? (
            <Image
              src={project.image}
              alt=""
              fill
              sizes="(max-width: 991px) 90vw, 33vw"
              className="project-bazil-card__img"
            />
          ) : (
            <div className="project-bazil-card__media-fallback" aria-hidden>
              <span>{p.title.split(" ")[0]}</span>
            </div>
          )}

          {!hovered && project.video && (
            <span className="project-bazil-card__playhint" aria-hidden>
              ▶ {lang === "en" ? "hover to play" : "悬停播放"}
            </span>
          )}

          <span className="project-bazil-card__arrow" aria-hidden>
            <ArrowUpRight size={18} />
          </span>
        </div>

        <div className="project-bazil-card__body">
          <span className="project-bazil-card__index">
            /{String(index + 1).padStart(2, "0")}
          </span>
          <h3>{p.title}</h3>
          <p>{p.summary}</p>
          <div className="project-bazil-card__tags">
            {project.tags.slice(0, 3).map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
