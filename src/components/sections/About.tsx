"use client";

import { motion } from "framer-motion";
import { useSiteConfig } from "@/context/SiteConfigContext";
import { Skeleton } from "@/components/ui/skeleton";
import { MouseParallax } from "@/components/ui/MouseParallax";

export function About() {
    const { config, loading } = useSiteConfig();
    const { about } = config;

    return (
        <section id="about" className="py-24 relative overflow-hidden bg-background">
            <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

                    {/* Bio Column */}
                    <MouseParallax strength={10}>
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="retro-card bg-card p-0 overflow-hidden border-foreground hover:shadow-[8px_8px_0px_var(--foreground)] transition-shadow duration-300"
                        >
                            <div className="border-b-[length:var(--border-width)] border-foreground p-3 bg-muted/50 flex items-center justify-between">
                                <span className="font-mono text-sm font-bold uppercase tracking-wider text-muted-foreground">About_Me.txt</span>
                                <div className="w-3 h-3 bg-foreground rounded-full opacity-50" />
                            </div>
                            <div className="p-8 md:p-10">
                                {loading ? (
                                    <div className="space-y-4">
                                        <Skeleton className="h-8 w-1/2" />
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-3/4" />
                                    </div>
                                ) : (
                                    <>
                                        <h2 className="text-4xl font-black mb-6 text-foreground uppercase tracking-tight">{about.title}</h2>
                                        <p className="text-muted-foreground text-lg leading-relaxed font-medium">
                                            {about.description}
                                        </p>
                                        <div className="mt-8 pt-8 border-t-[length:var(--border-width)] border-dashed border-foreground/20 font-mono text-xs text-muted-foreground">
                                            LAST_UPDATE: {new Date().toLocaleDateString()}
                                        </div>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    </MouseParallax>

                    {/* Skills Column */}
                    <MouseParallax strength={10}>
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="retro-card bg-card p-0 overflow-hidden border-foreground hover:shadow-[8px_8px_0px_var(--foreground)] transition-shadow duration-300"
                        >
                            <div className="border-b-[length:var(--border-width)] border-foreground p-3 bg-muted/50 flex items-center justify-between">
                                <span className="font-mono text-sm font-bold uppercase tracking-wider text-muted-foreground">Skillset_Database</span>
                                <div className="flex gap-1">
                                    <div className="w-2 h-2 border border-foreground bg-background" />
                                    <div className="w-2 h-2 border border-foreground bg-background" />
                                    <div className="w-2 h-2 border border-foreground bg-background" />
                                </div>
                            </div>

                            <div className="p-8 md:p-10">
                                {loading ? (
                                    <div className="space-y-6">
                                        <Skeleton className="h-6 w-1/3" />
                                        <div className="flex flex-wrap gap-3">
                                            {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-10 w-20 rounded-full" />)}
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <h3 className="text-2xl font-bold mb-8 text-foreground uppercase flex items-center gap-3">
                                            <span className="text-primary text-4xl leading-none">★</span> {about.skillsLabel}
                                        </h3>

                                        <div className="flex flex-wrap gap-3">
                                            {about.skills.map((skill, index) => (
                                                <span
                                                    key={index}
                                                    className="px-4 py-3 bg-background border-[length:var(--border-width)] border-foreground rounded-[radius:var(--border-radius)] text-sm font-bold text-foreground hover:bg-primary hover:text-primary-foreground hover:shadow-[4px_4px_0px_var(--foreground)] hover:translate-y-[-2px] transition-all cursor-default uppercase tracking-wide"
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    </MouseParallax>
                </div>
            </div>
        </section>
    );
}
