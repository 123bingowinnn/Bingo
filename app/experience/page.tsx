import { ExperienceListClient } from "@/components/ExperienceListClient";
import { getContent } from "@/lib/content";

export default function ExperiencePage() {
  const content = getContent();
  return <ExperienceListClient experiences={content.experience} />;
}
