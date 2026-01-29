"use client";

import { Mail, Linkedin, Github, Instagram, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useSiteConfig } from "@/context/SiteConfigContext";

export function Footer() {
    const { config } = useSiteConfig();
    const { socialLinks, contact, hero } = config;

    return (
        <section id="contact" className="py-20 md:py-32 relative overflow-hidden bg-foreground text-background">
            <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">

                    {/* Left Column: Heading & Info */}
                    <div className="flex flex-col items-start">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary text-primary-foreground text-xs md:text-sm font-bold uppercase tracking-widest mb-6 transform -rotate-2 shadow-[2px_2px_0px_var(--background)]">
                            <Mail size={14} />
                            Communication_Channel
                        </div>
                        <h2 className="text-5xl md:text-8xl font-black mb-6 md:mb-8 text-background uppercase tracking-tighter leading-[0.9] break-words w-full">
                            {contact.title}
                        </h2>
                        <p className="text-lg md:text-xl text-background/80 font-medium max-w-md mb-8 md:mb-12 border-l-[length:var(--border-width)] border-primary pl-6">
                            Ready to start a new project? Initiate the connection sequence below.
                        </p>

                        <div className="flex flex-wrap gap-4 w-full">
                            {socialLinks.email && (
                                <Link
                                    href={`mailto:${socialLinks.email}`}
                                    className="w-full md:w-auto px-8 py-4 bg-background text-foreground font-bold uppercase tracking-widest hover:bg-primary hover:text-background transition-all rounded-[radius:var(--border-radius)] flex items-center justify-center gap-3 shadow-[4px_4px_0px_var(--primary)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                                >
                                    <Mail size={20} /> Send Email
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Social Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                        {/* Email Card (Large) */}
                        {socialLinks.email && (
                            <Link href={`mailto:${socialLinks.email}`} className="col-span-1 sm:col-span-2 group retro-card bg-background/5 p-5 md:p-6 flex items-center justify-between hover:bg-background/10 transition-colors cursor-pointer border-background shadow-[4px_4px_0px_var(--background)] hover:shadow-[2px_2px_0px_var(--background)] hover:translate-x-[2px] hover:translate-y-[2px]">
                                <div className="flex items-center gap-4 min-w-0">
                                    <div className="hidden sm:flex p-3 bg-background border-[length:var(--border-width)] border-foreground rounded-[radius:var(--border-radius)] shrink-0">
                                        <Mail size={24} className="text-foreground" />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="font-mono text-xs text-background/60 uppercase truncate">Direct Message</div>
                                        <div className="font-bold text-base md:text-lg truncate text-background">{socialLinks.email}</div>
                                    </div>
                                </div>
                                <div className="text-primary opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap ml-2">
                                    <ArrowRight size={24} />
                                </div>
                            </Link>
                        )}

                        {/* Social Links */}
                        {socialLinks.linkedin && (
                            <Link href={socialLinks.linkedin} target="_blank" className="retro-card bg-[#0077b5] text-white p-6 flex flex-col items-center justify-center gap-4 hover:brightness-110 transition-all border-background group shadow-[4px_4px_0px_var(--background)] hover:shadow-[2px_2px_0px_var(--background)] hover:translate-x-[2px] hover:translate-y-[2px]">
                                <Linkedin size={32} className="group-hover:scale-110 transition-transform" />
                                <span className="font-bold uppercase tracking-wider text-sm">LinkedIn</span>
                            </Link>
                        )}

                        {socialLinks.github && (
                            <Link href={socialLinks.github} target="_blank" className="retro-card bg-[#171515] text-white p-6 flex flex-col items-center justify-center gap-4 hover:bg-black transition-all border-background group shadow-[4px_4px_0px_var(--background)] hover:shadow-[2px_2px_0px_var(--background)] hover:translate-x-[2px] hover:translate-y-[2px]">
                                <Github size={32} className="group-hover:scale-110 transition-transform" />
                                <span className="font-bold uppercase tracking-wider text-sm">GitHub</span>
                            </Link>
                        )}

                        {socialLinks.instagram && (
                            <Link href={socialLinks.instagram} target="_blank" className="col-span-1 sm:col-span-2 retro-card bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] text-white p-6 flex items-center justify-center gap-4 hover:brightness-110 transition-all border-background group shadow-[4px_4px_0px_var(--background)] hover:shadow-[2px_2px_0px_var(--background)] hover:translate-x-[2px] hover:translate-y-[2px]">
                                <Instagram size={24} />
                                <span className="font-bold uppercase tracking-wider text-sm">Follow on Instagram</span>
                            </Link>
                        )}
                    </div>

                </div>

                <div className="mt-20 md:mt-32 border-t-[length:var(--border-width)] border-background/20 pt-8 flex flex-col md:flex-row justify-between items-center text-background/60 font-mono text-[10px] md:text-xs uppercase gap-4 text-center md:text-left">
                    <div>© {new Date().getFullYear()} {hero.title}. System_All_Rights_Reserved.</div>
                    <div className="flex gap-4">
                        <span>Privacy_Protocol</span>
                        <span>•</span>
                        <span>Terms_Of_Service</span>
                    </div>
                </div>
            </div>
        </section>
    );
}
