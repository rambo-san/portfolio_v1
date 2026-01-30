'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import { Service, getServices, SiteConfig } from '@/lib/firebase/siteConfig';
import { MouseParallax } from '@/components/ui/MouseParallax';

interface ServicesProps {
    config: SiteConfig['services'];
}

export function ServicesSection({ config }: ServicesProps) {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            const data = await getServices();
            setServices(data);
            setLoading(false);
        };
        loadData();
    }, []);

    if (loading || services.length === 0) return null;

    return (
        <section id="services" className="py-24 relative overflow-hidden">
            <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-20">
                    <div className="inline-block px-4 py-2 border-[length:var(--border-width)] border-foreground rounded-[radius:var(--border-radius)] font-mono text-sm font-bold uppercase tracking-widest mb-6 bg-accent text-accent-foreground shadow-[4px_4px_0px_var(--foreground)]">
                        system.services_check()
                    </div>
                    <motion.h2
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="text-5xl md:text-7xl font-black text-foreground uppercase tracking-tighter mb-6"
                    >
                        {config.title}
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-muted-foreground max-w-2xl text-xl font-medium leading-relaxed border-l-[length:var(--border-width)] border-primary pl-6"
                    >
                        {config.subtitle}
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {services.map((service, index) => (
                        <ServiceCard key={service.id} service={service} index={index} />
                    ))}
                </div>
            </div>
        </section>
    );
}

function ServiceCard({ service, index }: { service: Service; index: number }) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const IconComponent = (LucideIcons as any)[service.icon] || LucideIcons.HelpCircle;

    return (
        <MouseParallax strength={10} className="h-full">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group retro-card bg-card p-0 overflow-hidden border-foreground hover:shadow-[10px_10px_0px_var(--foreground)] transition-all duration-300 hover:translate-x-[-4px] hover:translate-y-[-4px] h-full"
            >
                <div className="border-b-[length:var(--border-width)] border-foreground p-3 bg-muted/50 flex justify-between items-center group-hover:bg-primary/20 transition-colors">
                    <div className="font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground group-hover:text-foreground">
                        SVC_0{index + 1}
                    </div>
                    <LucideIcons.ArrowUpRight size={18} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                <div className="p-8">
                    <div className="w-16 h-16 rounded-[radius:var(--border-radius)] border-[length:var(--border-width)] border-foreground bg-background flex items-center justify-center text-foreground mb-6 group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-[4px_4px_0px_var(--foreground)] transition-all duration-300">
                        <IconComponent size={32} strokeWidth={1.5} />
                    </div>

                    <h3 className="text-2xl font-black uppercase text-foreground mb-4 group-hover:text-primary transition-colors">
                        {service.title}
                    </h3>

                    <p className="text-muted-foreground leading-relaxed text-lg group-hover:text-foreground transition-colors">
                        {service.description}
                    </p>
                </div>
            </motion.div>
        </MouseParallax>
    );
}
