"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Github } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSiteConfig } from "@/context/SiteConfigContext";
import { useEffect, useState } from "react";
import { Project, subscribeProjects } from "@/lib/firebase/siteConfig";

const projectColors = [
    { color: "from-red-900/40 to-black", border: "hover:border-red-500/30" },
    { color: "from-orange-900/40 to-black", border: "hover:border-orange-500/30" },
    { color: "from-stone-900/40 to-black", border: "hover:border-stone-500/30" },
    { color: "from-violet-900/40 to-black", border: "hover:border-violet-500/30" },
    { color: "from-blue-900/40 to-black", border: "hover:border-blue-500/30" },
];

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
        <section id="projects" className="py-24 px-4 overflow-hidden">
            <div className="container mx-auto max-w-6xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-bold mb-4">{config.projects.title}</h2>
                    <p className="text-slate-400 max-w-2xl">
                        {config.projects.subtitle}
                    </p>
                </motion.div>

                {/* Empty State */}
                {!loading && projects.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center py-20"
                    >
                        <div className="inline-block p-8 rounded-3xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50">
                            <p className="text-2xl md:text-3xl font-bold text-gray-400 mb-2">
                                🦥
                            </p>
                            <p className="text-xl md:text-2xl font-medium text-gray-400">
                                Sorry, I&apos;m too lazy to make projects
                            </p>
                            <p className="text-sm text-gray-500 mt-2">
                                (Check back later, maybe I&apos;ll get motivated)
                            </p>
                        </div>
                    </motion.div>
                )}

                {/* Projects Grid */}
                <div className="grid md:grid-cols-1 gap-8">
                    {projects.map((project: Project, index: number) => {
                        const colorScheme = projectColors[index % projectColors.length];
                        return (
                            <motion.div
                                key={project.id || index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className={`group relative rounded-3xl border border-white/10 overflow-hidden bg-gradient-to-br ${colorScheme.color} backdrop-blur-sm ${colorScheme.border} transition-all duration-500 hover:shadow-2xl`}
                            >
                                <div className="flex flex-col md:flex-row h-full">
                                    {/* Project Info */}
                                    <div className="p-8 md:p-14 flex-1 flex flex-col justify-center relative z-10">
                                        <h3 className="text-3xl font-bold mb-4 text-white group-hover:text-primary transition-colors duration-300">{project.title}</h3>
                                        <p className="text-slate-300 mb-8 text-lg leading-relaxed max-w-2xl">{project.description}</p>

                                        <div className="flex flex-wrap gap-3 mb-10">
                                            {project.tags.map((tag: string) => (
                                                <span key={tag} className="text-xs font-mono font-medium px-3 py-1 bg-black/40 border border-white/5 text-white/70 rounded-full">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <Button variant="outline" className="border-white/20 hover:bg-white/10 rounded-full">
                                                View Architecture
                                            </Button>
                                            <div className="flex gap-2">
                                                {project.githubUrl && (
                                                    <Link href={project.githubUrl} target="_blank" className="p-3 text-white/40 hover:text-white bg-white/5 rounded-full transition-colors hover:bg-white/10">
                                                        <Github size={20} />
                                                    </Link>
                                                )}
                                                {project.demoUrl && (
                                                    <Link href={project.demoUrl} target="_blank" className="p-3 text-white/40 hover:text-white bg-white/5 rounded-full transition-colors hover:bg-white/10">
                                                        <ArrowUpRight size={20} />
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Visual Placeholder (Right side - Abstract) */}
                                    <div className="hidden md:block w-1/3 min-h-[300px] relative overflow-hidden mask-image-gradient">
                                        <div className="absolute inset-0 bg-grid-white/[0.05]" />
                                        <div className="absolute inset-10 rounded-xl border border-white/10 bg-black/20 backdrop-blur-md flex items-center justify-center group-hover:scale-105 transition-transform duration-700">
                                            <span className="text-white/20 font-mono tracking-widest text-sm">SYSTEM_PREVIEW</span>
                                        </div>
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
