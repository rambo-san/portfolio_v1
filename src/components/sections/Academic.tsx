'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, MapPin, ExternalLink, Calendar } from 'lucide-react';
import { Education, getEducation, SiteConfig } from '@/lib/firebase/siteConfig';
import { formatDate, formatDuration } from '@/lib/utils';

interface AcademicProps {
    config: SiteConfig['academic'];
}

export function AcademicSection({ config }: AcademicProps) {
    const [education, setEducation] = useState<Education[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            const data = await getEducation();
            setEducation(data);
            setLoading(false);
        };
        loadData();
    }, []);

    if (loading || education.length === 0) return null;

    return (
        <section id="academic" className="py-24 bg-black/20 relative overflow-hidden">
            <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                    <div className="max-w-2xl">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="flex items-center gap-2 text-primary font-bold tracking-widest uppercase text-sm mb-4"
                        >
                            <GraduationCap size={18} />
                            Academic Background
                        </motion.div>
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-5xl font-bold text-white"
                        >
                            {config.title}
                        </motion.h2>
                    </div>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-gray-400 text-lg md:text-right"
                    >
                        {config.subtitle}
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {education.map((edu, index) => (
                        <AcademicCard key={edu.id} edu={edu} index={index} />
                    ))}
                </div>
            </div>
        </section>
    );
}

function AcademicCard({ edu, index }: { edu: Education; index: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="group relative"
        >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500" />

            <div className="relative h-full p-8 rounded-2xl bg-gray-900 border border-gray-800 hover:border-primary/50 transition-colors duration-300">
                <div className="flex justify-between items-start mb-6">
                    <div className="p-3 rounded-xl bg-primary/10 text-primary border border-primary/20 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                        <GraduationCap size={24} />
                    </div>
                    {edu.link && (
                        <a
                            href={edu.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-primary hover:bg-white/10 transition-all"
                        >
                            <ExternalLink size={18} />
                        </a>
                    )}
                </div>

                <div className="space-y-4">
                    <div>
                        <div className="flex items-center gap-2 text-primary font-medium text-sm mb-2">
                            <Calendar size={14} />
                            {formatDate(edu.startDate)} — {edu.isCurrent ? 'Present' : (edu.endDate ? formatDate(edu.endDate) : 'Present')}
                            <span className="ml-1 text-gray-500 lowercase font-medium">
                                {formatDuration(edu.startDate, edu.endDate, edu.isCurrent)}
                            </span>
                        </div>
                        <h3 className="text-2xl font-bold text-white group-hover:text-primary transition-colors">
                            {edu.degree}
                            {edu.score && (
                                <span className="ml-3 text-lg font-medium text-primary/80">
                                    — {edu.score}
                                </span>
                            )}
                        </h3>
                        <div className="flex items-center gap-2 text-gray-400 mt-1">
                            <MapPin size={14} className="text-primary/70" />
                            {edu.institution}
                        </div>
                    </div>

                    {edu.description && (
                        <p className="text-gray-500 leading-relaxed pt-4 border-t border-gray-800/50">
                            {edu.description}
                        </p>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
