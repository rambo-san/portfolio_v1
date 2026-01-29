"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Github } from "lucide-react";
import Link from "next/link";
import { useSiteConfig } from "@/context/SiteConfigContext";
import { useEffect, useState } from "react";
import { Project, subscribeProjects } from "@/lib/firebase/siteConfig";

export function Projects() {
    const { config } = useSiteConfig();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = subscribeProjects((fetchedProjects) => {
            setProjects(fetchedProjects.filter(p => p.featured));
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <section id="projects" className="py-32 relative overflow-hidden bg-background">
            <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="mb-20 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-[length:var(--border-width)] border-foreground pb-8"
                >
                    <div>
                        <h2 className="text-5xl md:text-7xl font-black text-foreground uppercase tracking-tighter mb-4">
                            {config.projects.title}
                        </h2>
                        <p className="text-xl text-muted-foreground max-w-xl font-medium">
                            {config.projects.subtitle}
                        </p>
                    </div>

                    <div className="hidden md:block">
                        <div className="px-4 py-2 bg-card border-[length:var(--border-width)] border-foreground rounded-[radius:var(--border-radius)] font-mono text-xs font-bold shadow-[4px_4px_0px_var(--foreground)] transform rotate-3">
                            <span className="text-primary">●</span> {projects.length} PROJECTS LABELED
                        </div>
                    </div>
                </motion.div>

                {/* Empty State */}
                {!loading && projects.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center py-32 border-[length:var(--border-width)] border-dashed border-muted-foreground/30 rounded-[radius:var(--border-radius)]"
                    >
                        <div className="text-6xl mb-6 grayscale opacity-50">🦥</div>
                        <h3 className="text-2xl font-bold uppercase tracking-widest text-muted-foreground">No Projects Found</h3>
                        <p className="text-muted-foreground/60 font-mono mt-2">Check back later for updates.</p>
                    </motion.div>
                )}

                {/* Projects Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {projects.map((project: Project, index: number) => {
                        return (
                            <motion.div
                                key={project.id || index}
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="group flex flex-col h-full"
                            >
                                <div className="flex-1 retro-card bg-card overflow-hidden flex flex-col transition-all duration-300 group-hover:translate-x-[-4px] group-hover:translate-y-[-4px] group-hover:shadow-[8px_8px_0px_var(--foreground)] border-foreground">

                                    {/* Card Header (Window Bar) */}
                                    <div className="border-b-[length:var(--border-width)] border-foreground p-3 bg-muted/50 flex justify-between items-center">
                                        <div className="flex gap-2">
                                            <div className="w-3 h-3 border border-foreground bg-background rounded-full" />
                                            <div className="w-3 h-3 border border-foreground bg-background rounded-full" />
                                        </div>
                                        <div className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                            PROJECT_ID_{index + 1}
                                        </div>
                                    </div>

                                    {/* Card Content */}
                                    <div className="p-8 flex flex-col flex-1 gap-6">
                                        <div className="flex justify-between items-start">
                                            <h3 className="text-3xl font-black uppercase leading-none group-hover:text-primary transition-colors">
                                                {project.title}
                                            </h3>
                                            <Link href={project.demoUrl || project.githubUrl || "#"} target="_blank">
                                                <div className="p-3 bg-foreground text-background rounded-[radius:var(--border-radius)] group-hover:bg-primary group-hover:text-foreground transition-colors">
                                                    <ArrowUpRight size={24} />
                                                </div>
                                            </Link>
                                        </div>

                                        <p className="text-muted-foreground text-lg leading-relaxed line-clamp-3">
                                            {project.description}
                                        </p>

                                        <div className="mt-auto pt-6 flex flex-wrap gap-2">
                                            {project.tags.slice(0, 4).map((tag: string) => (
                                                <span
                                                    key={tag}
                                                    className="px-3 py-1 text-xs font-bold uppercase tracking-wider border-[length:var(--border-width)] border-foreground rounded-[radius:var(--border-radius)] bg-background group-hover:bg-accent/20 group-hover:border-accent group-hover:text-accent-foreground transition-all"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Card Footer (Action Bar) */}
                                    <div className="flex border-t-[length:var(--border-width)] border-foreground">
                                        {project.githubUrl && (
                                            <Link href={project.githubUrl} target="_blank" className="flex-1 flex items-center justify-center gap-2 py-4 font-mono text-sm font-bold uppercase hover:bg-muted/50 transition-colors border-r-[length:var(--border-width)] border-foreground last:border-r-0">
                                                <Github size={16} /> Code
                                            </Link>
                                        )}
                                        <Link href={project.demoUrl || "#"} target="_blank" className="flex-1 flex items-center justify-center gap-2 py-4 font-mono text-sm font-bold uppercase hover:bg-muted/50 transition-colors">
                                            View Project
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
