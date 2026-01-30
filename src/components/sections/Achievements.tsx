'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Award, ExternalLink, Calendar, Medal } from 'lucide-react';
import { Achievement, getAchievements, SiteConfig } from '@/lib/firebase/siteConfig';
import { MouseParallax } from '@/components/ui/MouseParallax';

interface AchievementsProps {
    config: SiteConfig['achievements'];
}

export function AchievementsSection({ config }: AchievementsProps) {
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            const data = await getAchievements();
            setAchievements(data);
            setLoading(false);
        };
        loadData();
    }, []);

    if (loading || achievements.length === 0) return null;

    return (
        <section id="achievements" className="py-24 relative overflow-hidden bg-background">
            <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-20">
                    <div className="inline-block px-4 py-2 bg-yellow-400 text-black border-[length:var(--border-width)] border-foreground rounded-[radius:var(--border-radius)] font-mono text-sm font-bold uppercase tracking-widest mb-6 shadow-[4px_4px_0px_var(--foreground)] transform rotate-1">
                        <Trophy size={16} className="inline mr-2" />
                        Hall_of_Fame
                    </div>
                    <motion.h2
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="text-5xl md:text-7xl font-black text-foreground uppercase tracking-tighter mb-4"
                    >
                        {config.title}
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-muted-foreground text-xl italic font-serif border-l-4 border-yellow-400 pl-6"
                    >
                        "{config.subtitle}"
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {achievements.map((ach, index) => (
                        <AchievementCard key={ach.id} ach={ach} index={index} />
                    ))}
                </div>
            </div>
        </section>
    );
}

function AchievementCard({ ach, index }: { ach: Achievement; index: number }) {
    return (
        <MouseParallax strength={10} className="h-full">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group h-full"
            >
                <div className="retro-card bg-card p-0 overflow-hidden border-foreground h-full flex flex-col hover:shadow-[10px_10px_0px_rgba(250,204,21,1)] hover:border-yellow-500 transition-all duration-300">
                    {ach.imageUrl && (
                        <div className="relative aspect-video border-b-[length:var(--border-width)] border-foreground overflow-hidden">
                            <img
                                src={ach.imageUrl}
                                alt={ach.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 grayscale group-hover:grayscale-0"
                            />
                            <div className="absolute top-2 right-2 px-2 py-1 bg-yellow-400 text-black text-xs font-bold border border-black rounded uppercase tracking-wider">
                                Verified
                            </div>
                        </div>
                    )}

                    <div className="p-6 flex flex-col flex-1">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-[radius:var(--border-radius)] bg-yellow-400 text-black border-[length:var(--border-width)] border-black shadow-[2px_2px_0px_black]">
                                <Award size={20} className="stroke-[2.5px]" />
                            </div>
                            <span className="text-muted-foreground text-xs font-bold uppercase tracking-wider flex items-center gap-1 font-mono">
                                <Calendar size={12} />
                                {ach.date}
                            </span>
                        </div>

                        <h3 className="text-xl font-black text-foreground uppercase mb-1 leading-tight group-hover:text-yellow-600 transition-colors">
                            {ach.title}
                        </h3>
                        <p className="text-primary font-bold text-sm mb-4 uppercase tracking-wide">{ach.issuer}</p>

                        {ach.description && (
                            <p className="text-muted-foreground text-sm leading-relaxed mb-6 pt-4 border-t-[length:var(--border-width)] border-dashed border-foreground/20">
                                {ach.description}
                            </p>
                        )}

                        <div className="mt-auto">
                            {ach.link ? (
                                <a
                                    href={ach.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-foreground hover:text-yellow-600 transition-colors group/link"
                                >
                                    Verify Credential
                                    <ExternalLink size={12} className="group-hover/link:translate-x-1 transition-transform" />
                                </a>
                            ) : (
                                <span className="text-xs text-muted-foreground font-bold uppercase tracking-widest opacity-50 cursor-not-allowed">Internal Recognition</span>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
        </MouseParallax>
    );
}
