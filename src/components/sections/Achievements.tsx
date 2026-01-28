'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Award, ExternalLink, Calendar, Medal } from 'lucide-react';
import { Achievement, getAchievements, SiteConfig } from '@/lib/firebase/siteConfig';

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
        <section id="achievements" className="py-24 relative overflow-hidden">
            <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-sm font-bold uppercase tracking-widest mb-6"
                    >
                        <Trophy size={16} />
                        Milestones & Recognition
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-6xl font-black text-white mb-6 uppercase tracking-tighter"
                    >
                        {config.title}
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-gray-400 max-w-2xl mx-auto text-lg italic"
                    >
                        "{config.subtitle}"
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
        <motion.div
            initial={{ opacity: 0, rotateY: 20, y: 20 }}
            whileInView={{ opacity: 1, rotateY: 0, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: index * 0.1 }}
            style={{ perspective: 1000 }}
            className="group"
        >
            <div className="relative h-full bg-gray-900/50 backdrop-blur-md border border-gray-800 rounded-2xl p-6 overflow-hidden transition-all duration-500 hover:border-yellow-500/50 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                    <Medal size={120} />
                </div>

                <div className="flex flex-col h-full">
                    {ach.imageUrl && (
                        <div className="relative aspect-video mb-6 rounded-xl overflow-hidden border border-gray-800 group-hover:border-yellow-500/30 transition-colors">
                            <img
                                src={ach.imageUrl}
                                alt={ach.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-60" />
                        </div>
                    )}

                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-500">
                            <Award size={20} />
                        </div>
                        <span className="text-gray-500 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                            <Calendar size={12} />
                            {ach.date}
                        </span>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-yellow-500 transition-colors">
                        {ach.title}
                    </h3>
                    <p className="text-primary text-sm font-medium mb-4">{ach.issuer}</p>

                    {ach.description && (
                        <p className="text-gray-400 text-sm leading-relaxed mb-6 line-clamp-3">
                            {ach.description}
                        </p>
                    )}

                    <div className="mt-auto pt-4 border-t border-gray-800 flex justify-between items-center">
                        {ach.link ? (
                            <a
                                href={ach.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-sm font-bold text-white hover:text-yellow-500 transition-colors"
                            >
                                Verify Credential
                                <ExternalLink size={14} />
                            </a>
                        ) : (
                            <span className="text-xs text-gray-600 font-medium">Internal Recognition</span>
                        )}
                        <Medal size={20} className="text-gray-800 group-hover:text-yellow-500/20 transition-colors" />
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
