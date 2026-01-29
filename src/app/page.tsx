"use client";

import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { ExperienceSection } from "@/components/sections/Experience";
import { ServicesSection } from "@/components/sections/Services";
import { AcademicSection } from "@/components/sections/Academic";
import { AchievementsSection } from "@/components/sections/Achievements";
import { Projects } from "@/components/sections/Projects";
import { Friends } from "@/components/sections/Friends";
import { Footer } from "@/components/layout/Footer";
import { useSiteConfig } from "@/context/SiteConfigContext";

export default function Home() {
  const { config } = useSiteConfig();
  const { socialLinks, contact, layout, hero } = config;

  // Map section IDs to components
  const sectionMap: Record<string, React.ReactNode> = {
    hero: <Hero key="hero" />,
    about: <About key="about" />,
    experience: <ExperienceSection key="experience" config={config.experience} />,
    services: <ServicesSection key="services" config={config.services} />,
    academic: <AcademicSection key="academic" config={config.academic} />,
    achievements: <AchievementsSection key="achievements" config={config.achievements} />,
    projects: <Projects key="projects" />,
    friends: <Friends key="friends" />,
  };

  // Get ordered sections from config and filter hidden ones
  const hiddenSections = layout?.hiddenSections || [];
  const sectionOrder = (layout?.sectionOrder || ['hero', 'about', 'experience', 'academic', 'achievements', 'projects', 'friends'])
    .filter(id => !hiddenSections.includes(id));

  return (
    <div className="flex flex-col gap-0">
      {sectionOrder.map(sectionId => sectionMap[sectionId])}
    </div>
  );
}
