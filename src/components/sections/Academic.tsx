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
        <section id="academic" className="py-24 bg-background relative overflow-hidden">
            <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-6 border-b-[length:var(--border-width)] border-foreground pb-8">
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
                            className="text-5xl md:text-7xl font-black text-foreground uppercase tracking-tighter"
                        >
                            {config.title}
                        </motion.h2>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
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
            className="group relative h-full"
        >
            <div className="retro-card bg-card p-0 overflow-hidden border-foreground h-full flex flex-col hover:shadow-[10px_10px_0px_var(--foreground)] transition-shadow duration-300">
                {/* Header Bar */}
                <div className="border-b-[length:var(--border-width)] border-foreground p-3 bg-muted/50 flex justify-between items-center">
                    <div className="font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                        <GraduationCap size={14} /> ACCOUNT_EDU_0{index + 1}
                    </div>
                    <div className="w-2 h-2 bg-foreground rounded-full" />
                </div>

                <div className="p-8 flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-6">
                        <div className="p-3 rounded-[radius:var(--border-radius)] bg-primary/10 text-primary border-[length:var(--border-width)] border-primary/20 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-foreground transition-all duration-300 shadow-[4px_4px_0px_var(--foreground)]">
                            <GraduationCap size={28} strokeWidth={1.5} />
                        </div>
                        {edu.link && (
                            <a
                                href={edu.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 border-[length:var(--border-width)] border-foreground rounded-[radius:var(--border-radius)] hover:bg-foreground hover:text-background transition-colors"
                            >
                                <ExternalLink size={18} />
                            </a>
                        )}
                    </div>

                    <div className="space-y-4 flex-1">
                        <div>
                            <div className="flex items-center gap-2 text-primary font-bold text-sm mb-2 uppercase tracking-wide">
                                <Calendar size={14} />
                                {formatDate(edu.startDate)} — {edu.isCurrent ? 'Present' : (edu.endDate ? formatDate(edu.endDate) : 'Present')}
                            </div>
                            <h3 className="text-2xl font-black text-foreground uppercase leading-tight mb-2">
                                {edu.degree}
                            </h3>
                            {edu.score && (
                                <div className="inline-block px-2 py-1 bg-muted font-mono text-xs font-bold border-[length:var(--border-width)] border-foreground/30 rounded-[radius:var(--border-radius)] mb-2">
                                    GRADE: {edu.score}
                                </div>
                            )}
                            <div className="flex items-center gap-2 text-muted-foreground font-bold text-lg mt-1">
                                <MapPin size={16} />
                                {edu.institution}
                            </div>
                        </div>

                        {edu.description && (
                            <p className="text-muted-foreground/80 leading-relaxed pt-6 border-t-[length:var(--border-width)] border-dashed border-foreground/20 mt-auto">
                                {edu.description}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
