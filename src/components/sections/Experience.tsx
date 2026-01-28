'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Calendar, ExternalLink, ChevronRight } from 'lucide-react';
import { Experience, getExperience, SiteConfig } from '@/lib/firebase/siteConfig';
import { formatDate, formatDuration } from '@/lib/utils';

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
        <section id="experience" className="py-24 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute top-1/4 -left-20 w-80 h-80 bg-primary/5 rounded-full blur-[100px]" />
                <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-secondary/5 rounded-full blur-[100px]" />
            </div>

            <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4"
                    >
                        <Briefcase size={16} />
                        Professional Journey
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-4xl md:text-5xl font-bold text-white mb-4"
                    >
                        {config.title}
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-gray-400 max-w-2xl mx-auto text-lg"
                    >
                        {config.subtitle}
                    </motion.p>
                </div>

                <div className="space-y-12 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-700 before:to-transparent">
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
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group"
        >
            {/* Icon/Dot */}
            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-700 bg-gray-900 text-primary shadow-xl z-20 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shrink-0 transition-transform group-hover:scale-110 group-hover:border-primary/50">
                <Briefcase size={18} />
            </div>

            {/* Content Card */}
            <div className="w-[calc(100%-4rem)] md:w-[45%] p-6 rounded-2xl bg-gray-900/40 backdrop-blur-sm border border-gray-800 hover:border-primary/30 transition-all duration-300 group-hover:bg-gray-900/60 group-hover:shadow-2xl group-hover:shadow-primary/5">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                    <div className="flex items-center gap-2 text-primary text-sm font-bold uppercase tracking-wider">
                        <Calendar size={14} />
                        {formatDate(exp.startDate)} — {exp.isCurrent ? 'Present' : (exp.endDate ? formatDate(exp.endDate) : 'Present')}
                        <span className="ml-1 text-gray-500 lowercase font-medium">
                            {formatDuration(exp.startDate, exp.endDate, exp.isCurrent)}
                        </span>
                    </div>
                    {exp.link && (
                        <a
                            href={exp.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-500 hover:text-primary transition-colors"
                        >
                            <ExternalLink size={16} />
                        </a>
                    )}
                </div>

                <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-primary transition-colors">
                    {exp.role}
                </h3>
                <div className="text-lg font-medium text-gray-300 mb-4 flex items-center gap-2">
                    {exp.company}
                    <ChevronRight size={16} className="text-primary/50" />
                </div>

                <p className="text-gray-400 leading-relaxed mb-6">
                    {exp.description}
                </p>

                {exp.technologies && exp.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {exp.technologies.map((tech) => (
                            <span
                                key={tech}
                                className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-gray-400"
                            >
                                {tech}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
    );
}
