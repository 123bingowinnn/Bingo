import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Projects – Portfolio",
  description: "A collection of projects spanning AI, computer vision, full-stack development, and product design.",
  openGraph: {
    title: "Projects – Portfolio",
    description: "A collection of projects spanning AI, computer vision, full-stack development, and product design.",
  },
};

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
