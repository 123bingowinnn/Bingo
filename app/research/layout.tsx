import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Research & Publications – Portfolio",
  description: "Academic papers, research contributions, and scholarly work.",
  openGraph: {
    title: "Research & Publications – Portfolio",
    description: "Academic papers, research contributions, and scholarly work.",
  },
};

export default function ResearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
