"use client";

import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { ExperienceSection } from "@/components/sections/Experience";
import { ServicesSection } from "@/components/sections/Services";
import { AcademicSection } from "@/components/sections/Academic";
import { AchievementsSection } from "@/components/sections/Achievements";
import { Projects } from "@/components/sections/Projects";
import { Friends } from "@/components/sections/Friends";
import { Mail, Linkedin, Github, Instagram } from "lucide-react";
import Link from "next/link";
import { useSiteConfig } from "@/context/SiteConfigContext";

export default function Home() {
  const { config } = useSiteConfig();
  const { socialLinks, contact, layout } = config;

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
    contact: (
      <section id="contact" key="contact" className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />

        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h2 className="text-4xl font-bold mb-12">{contact.title}</h2>
          <div className="flex flex-wrap justify-center gap-12">
            {socialLinks.email && (
              <Link href={`mailto:${socialLinks.email}`} className="group flex flex-col items-center gap-4 text-slate-400 hover:text-white transition-colors">
                <div className="p-6 rounded-full bg-white/5 border border-white/10 group-hover:bg-primary/20 group-hover:border-primary/50 group-hover:shadow-[0_0_30px_rgba(139,92,246,0.3)] transition-all duration-300">
                  <Mail size={32} />
                </div>
                <span className="text-sm tracking-widest uppercase">Email</span>
              </Link>
            )}
            {socialLinks.linkedin && (
              <Link href={socialLinks.linkedin} target="_blank" className="group flex flex-col items-center gap-4 text-slate-400 hover:text-white transition-colors">
                <div className="p-6 rounded-full bg-white/5 border border-white/10 group-hover:bg-[#0077b5]/20 group-hover:border-[#0077b5]/50 group-hover:shadow-[0_0_30px_rgba(0,119,181,0.3)] transition-all duration-300">
                  <Linkedin size={32} />
                </div>
                <span className="text-sm tracking-widest uppercase">LinkedIn</span>
              </Link>
            )}
            {socialLinks.github && (
              <Link href={socialLinks.github} target="_blank" className="group flex flex-col items-center gap-4 text-slate-400 hover:text-white transition-colors">
                <div className="p-6 rounded-full bg-white/5 border border-white/10 group-hover:bg-white/20 group-hover:border-white/50 group-hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all duration-300">
                  <Github size={32} />
                </div>
                <span className="text-sm tracking-widest uppercase">GitHub</span>
              </Link>
            )}
            {socialLinks.instagram && (
              <Link href={socialLinks.instagram} target="_blank" className="group flex flex-col items-center gap-4 text-slate-400 hover:text-white transition-colors">
                <div className="p-6 rounded-full bg-white/5 border border-white/10 group-hover:bg-[#E4405F]/20 group-hover:border-[#E4405F]/50 group-hover:shadow-[0_0_30px_rgba(228,64,95,0.3)] transition-all duration-300">
                  <Instagram size={32} />
                </div>
                <span className="text-sm tracking-widest uppercase">Instagram</span>
              </Link>
            )}
          </div>
        </div>
      </section>
    ),
  };

  // Get ordered sections from config and filter hidden ones
  const hiddenSections = layout?.hiddenSections || [];
  const sectionOrder = (layout?.sectionOrder || ['hero', 'about', 'experience', 'academic', 'achievements', 'projects', 'contact'])
    .filter(id => !hiddenSections.includes(id));

  return (
    <div className="flex flex-col gap-0">
      {sectionOrder.map(sectionId => sectionMap[sectionId])}
    </div>
  );
}
