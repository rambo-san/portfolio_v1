'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Calendar, ExternalLink, ChevronRight } from 'lucide-react';
import { Experience, getExperience, SiteConfig } from '@/lib/firebase/siteConfig';
import { formatDate, formatDuration } from '@/lib/utils';
import { MouseParallax } from '@/components/ui/MouseParallax';

interface ExperienceProps {
    config: SiteConfig['experience'];
}

export function ExperienceSection({ config }: ExperienceProps) {
    const [experiences, setExperiences] = useState<Experience[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            const data = await getExperience();
            setExperiences(data);
            setLoading(false);
        };
        loadData();
    }, []);

    if (loading || experiences.length === 0) return null;

    return (
        <section id="experience" className="py-24 relative overflow-hidden bg-background">
            <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-left mb-20 border-l-[length:var(--border-width)] border-foreground pl-6 ml-4">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-primary text-primary-foreground text-sm font-bold uppercase tracking-widest mb-4 transform -skew-x-12"
                    >
                        <Briefcase size={16} />
                        Experience Log
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-6xl font-black text-foreground uppercase tracking-tighter"
                    >
                        {config.title}
                    </motion.h2>
                </div>

                <div className="relative border-l-[length:var(--border-width)] border-dashed border-foreground/30 ml-4 md:ml-10 space-y-16 pl-8 md:pl-16 py-8">
                    {experiences.map((exp, index) => (
                        <ExperienceCard key={exp.id} exp={exp} index={index} />
                    ))}
                </div>
            </div>
        </section>
    );
}

function ExperienceCard({ exp, index }: { exp: Experience; index: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="relative"
        >
            {/* Timeline Node */}
            <div className="absolute -left-[41px] md:-left-[73px] top-6 w-5 h-5 bg-background border-[length:var(--border-width)] border-foreground rounded-full flex items-center justify-center z-20 group">
                <div className="w-2 h-2 bg-primary rounded-full group-hover:animate-ping" />
            </div>

            <div className="retro-card p-0 bg-card border-foreground group hover:shadow-[8px_8px_0px_var(--foreground)] transition-all duration-300">
                {/* Header Bar */}
                <div className="flex flex-col md:flex-row border-b-[length:var(--border-width)] border-foreground divide-y md:divide-y-0 md:divide-x divide-foreground bg-muted/30">
                    <div className="p-4 flex-1 font-mono text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                        <Calendar size={14} className="text-primary" />
                        {formatDate(exp.startDate)} — {exp.isCurrent ? <span className="text-primary">PRESENT</span> : (exp.endDate ? formatDate(exp.endDate) : 'Present')}
                    </div>
                    <div className="p-4 font-mono text-xs font-bold uppercase text-muted-foreground bg-background/50">
                        {formatDuration(exp.startDate, exp.endDate, exp.isCurrent)}
                    </div>
                </div>

                <div className="p-6 md:p-8">
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-start mb-6">
                        <div>
                            <h3 className="text-2xl font-black uppercase text-foreground mb-1">
                                {exp.role}
                            </h3>
                            <div className="flex items-center gap-2 text-xl font-bold text-muted-foreground">
                                <span className="text-primary">@</span> {exp.company}
                            </div>
                        </div>
                        {exp.link && (
                            <a
                                href={exp.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2 border-[length:var(--border-width)] border-foreground rounded-[radius:var(--border-radius)] text-sm font-bold uppercase hover:bg-foreground hover:text-background transition-colors flex items-center gap-2"
                            >
                                Company URL <ExternalLink size={14} />
                            </a>
                        )}
                    </div>

                    <p className="text-muted-foreground text-lg leading-relaxed mb-8 max-w-4xl border-l-[length:var(--border-width)] border-primary/20 pl-4">
                        {exp.description}
                    </p>

                    {exp.technologies && exp.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-4 border-t-[length:var(--border-width)] border-dashed border-foreground/20">
                            {exp.technologies.map((tech) => (
                                <span
                                    key={tech}
                                    className="px-2 py-1 bg-muted/50 border-[length:var(--border-width)] border-transparent hover:border-foreground rounded-[radius:var(--border-radius)] text-xs font-mono font-bold text-muted-foreground hover:text-foreground transition-all uppercase"
                                >
                                    #{tech}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
