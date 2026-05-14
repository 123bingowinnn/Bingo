import { notFound } from "next/navigation";
import { getAllPublicationSlugs, getPublicationBySlug } from "@/lib/content";
import { RESEARCH_STORIES } from "@/lib/story-data";
import { ResearchStoryClient } from "@/components/ResearchStoryClient";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllPublicationSlugs().map((slug) => ({ slug }));
}

export default async function ResearchStoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const publication = getPublicationBySlug(slug);

  if (!publication) {
    notFound();
  }

  return <ResearchStoryClient publication={publication} story={RESEARCH_STORIES[slug]} />;
}
