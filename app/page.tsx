import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Internships } from "@/components/sections/Internships";
import { Works } from "@/components/sections/Works";
import { Contact } from "@/components/sections/Contact";

export default function HomePage() {
  return (
    <>
      <Hero />
      <About />
      <Internships />
      <Works />
      <Contact />
    </>
  );
}
