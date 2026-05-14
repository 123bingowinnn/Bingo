import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Experience – Portfolio",
  description: "Professional journey across product management, software engineering, and data analytics.",
  openGraph: {
    title: "Experience – Portfolio",
    description: "Professional journey across product management, software engineering, and data analytics.",
  },
};

export default function ExperienceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
