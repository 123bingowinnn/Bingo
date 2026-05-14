import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resume – Portfolio",
  description: "Online resume – printable and downloadable.",
  openGraph: {
    title: "Resume – Portfolio",
    description: "Online resume – printable and downloadable.",
  },
};

export default function ResumeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
