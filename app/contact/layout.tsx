import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact – Portfolio",
  description: "Get in touch – email, LinkedIn, GitHub, and more.",
  openGraph: {
    title: "Contact – Portfolio",
    description: "Get in touch – email, LinkedIn, GitHub, and more.",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
