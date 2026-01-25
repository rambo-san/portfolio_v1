"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Gamepad2 } from "lucide-react";
import Link from "next/link";
import { useSiteConfig } from "@/context/SiteConfigContext";

import { Skeleton } from "@/components/ui/skeleton";

export function Hero() {
    const { config, loading } = useSiteConfig();
    const { hero } = config;

    return (
        <section id="home" className="min-h-[90vh] flex flex-col justify-center items-center text-center px-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.1)_0%,transparent_70%)] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-6"
            >
                {loading ? (
                    <Skeleton className="h-6 w-64 rounded bg-red-950/30 border border-red-800/10" />
                ) : (
                    <h2 className="text-red-400 font-mono tracking-widest uppercase text-xs md:text-sm bg-red-950/30 px-3 py-1 rounded border border-red-800/50 inline-block">
                        {hero.tagline}
                    </h2>
                )}
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="mb-8 max-w-5xl w-full flex flex-col items-center gap-4"
            >
                {loading ? (
                    <>
                        <Skeleton className="h-16 md:h-24 w-3/4 rounded-lg" />
                        <Skeleton className="h-16 md:h-24 w-1/2 rounded-lg" />
                    </>
                ) : (
                    <h1 className="text-5xl md:text-8xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white via-white/80 to-white/40">
                        {hero.title}
                        {hero.titleHighlight && (
                            <>
                                <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-600">
                                    {hero.titleHighlight}
                                </span>
                            </>
                        )}
                    </h1>
                )}
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="max-w-2xl w-full mb-12 flex justify-center"
            >
                {loading ? (
                    <div className="space-y-3 w-full max-w-lg">
                        <Skeleton className="h-4 w-full rounded" />
                        <Skeleton className="h-4 w-5/6 mx-auto rounded" />
                        <Skeleton className="h-4 w-4/6 mx-auto rounded" />
                    </div>
                ) : (
                    <p className="text-lg md:text-xl text-slate-400 leading-relaxed">
                        {hero.subtitle}
                    </p>
                )}
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-6 items-center"
            >
                <Link href={hero.ctaLink}>
                    <Button size="lg" className="rounded-full px-8 h-12 text-base font-semibold tracking-wide bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 border-none">
                        {hero.ctaText} <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                </Link>
                {hero.secondaryCtaText && hero.secondaryCtaLink && (
                    <Link href={hero.secondaryCtaLink}>
                        <Button variant="neon" size="lg" className="rounded-full px-8 h-12 text-base font-semibold tracking-wide shadow-[0_0_20px_-5px_rgba(220,38,38,0.5)] !text-red-400 !border-red-500 hover:!bg-red-950/30">
                            <Gamepad2 className="mr-2 w-5 h-5" /> {hero.secondaryCtaText}
                        </Button>
                    </Link>
                )}
            </motion.div>
        </section>
    );
}
