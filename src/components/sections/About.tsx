"use client";

import { motion } from "framer-motion";
import { useSiteConfig } from "@/context/SiteConfigContext";
import { Skeleton } from "@/components/ui/skeleton";

export function About() {
    const { config, loading } = useSiteConfig();
    const { about } = config;

    return (
        <section id="about" className="py-24 px-4 relative">
            <div className="container mx-auto max-w-5xl">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="glass-card p-8 md:p-14 rounded-3xl overflow-hidden relative"
                >
                    {/* Decorative abstract shape */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] rounded-full pointer-events-none" />

                    <div className="flex flex-col md:flex-row gap-12 relative z-10">
                        <div className="flex-1">
                            {loading ? (
                                <>
                                    <Skeleton className="h-8 w-48 mb-6 rounded" />
                                    <div className="space-y-3">
                                        <Skeleton className="h-4 w-full rounded" />
                                        <Skeleton className="h-4 w-full rounded" />
                                        <Skeleton className="h-4 w-5/6 rounded" />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <h2 className="text-3xl font-bold mb-6 text-white">{about.title}</h2>
                                    <p className="text-slate-400 mb-6 leading-relaxed text-lg">
                                        {about.description}
                                    </p>
                                </>
                            )}
                        </div>

                        <div className="flex-1">
                            {loading ? (
                                <>
                                    <Skeleton className="h-6 w-32 mb-6 rounded" />
                                    <div className="flex flex-wrap gap-3">
                                        {[1, 2, 3, 4, 5, 6].map((i) => (
                                            <Skeleton key={i} className="h-9 w-24 rounded-full" />
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <>
                                    <h3 className="text-xl font-semibold mb-6 text-white">{about.skillsLabel}</h3>
                                    <div className="flex flex-wrap gap-3">
                                        {about.skills.map((skill, index) => (
                                            <span
                                                key={index}
                                                className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm font-medium text-slate-300 hover:bg-white/10 hover:border-primary/50 hover:text-white transition-all cursor-default"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
