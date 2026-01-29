"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Gamepad2 } from "lucide-react";
import Link from "next/link";
import { useSiteConfig } from "@/context/SiteConfigContext";

import { Skeleton } from "@/components/ui/skeleton";
import { useTorch } from "@/context/TorchContext";

export function Hero() {
    const { config, loading } = useSiteConfig();
    const { hero } = config;
    const { isTorchMode, toggleTorchMode } = useTorch();

    return (
        <section id="home" className="min-h-screen pt-32 pb-16 flex flex-col justify-center relative overflow-hidden bg-background">
            <div className="absolute top-0 w-full border-b-[length:var(--border-width)] border-border bg-card/50 backdrop-blur-sm z-30">
                <div className="overflow-hidden whitespace-nowrap py-2 flex gap-8">
                    <div className="animate-marquee flex gap-8 text-sm font-mono font-bold uppercase tracking-widest text-muted-foreground">
                        <span>{'//'} SYSTEM_READY</span>
                        <span>•</span>
                        <span>OPEN_FOR_WORK</span>
                        <span>•</span>
                        <span>BUILDING_THE_FUTURE</span>
                        <span>•</span>
                        <span>{hero.tagline || "DESIGN_ENGINEER"}</span>
                        <span>•</span>
                        <span>{'//'} SYSTEM_READY</span>
                        <span>•</span>
                        <span>OPEN_FOR_WORK</span>
                        <span>•</span>
                        <span>BUILDING_THE_FUTURE</span>
                        <span>•</span>
                        <span>{hero.tagline || "DESIGN_ENGINEER"}</span>
                    </div>
                </div>
            </div>

            <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-start text-left">

                <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                    {/* Left Column: Typography & Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: "circOut" }}
                        className="lg:col-span-8 flex flex-col gap-6"
                    >
                        {loading ? (
                            <Skeleton className="h-4 w-32 rounded bg-primary/10" />
                        ) : (
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 border-[length:var(--border-width)] border-accent text-accent font-mono text-xs font-bold uppercase tracking-widest w-fit shadow-[4px_4px_0px_var(--accent)] transform -rotate-1 rounded-[radius:var(--border-radius)]">
                                <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                                {hero.tagline}
                            </div>
                        )}

                        <div className="relative">
                            {loading ? (
                                <div className="space-y-4">
                                    <Skeleton className="h-24 w-3/4 rounded-lg bg-muted" />
                                    <Skeleton className="h-24 w-1/2 rounded-lg bg-muted" />
                                </div>
                            ) : (
                                <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-[0.9] text-foreground mix-blend-difference">
                                    {hero.title}
                                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] animate-gradient">
                                        {hero.titleHighlight}
                                    </span>
                                </h1>
                            )}
                        </div>

                        {loading ? (
                            <div className="space-y-2 max-w-lg mt-4">
                                <Skeleton className="h-4 w-full bg-muted" />
                                <Skeleton className="h-4 w-5/6 bg-muted" />
                            </div>
                        ) : (
                            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl font-medium leading-relaxed border-l-4 border-primary pl-6 mt-4">
                                {hero.subtitle}
                            </p>
                        )}

                        <div className="flex flex-wrap gap-6 mt-8">
                            <Link href={hero.ctaLink}>
                                <Button size="lg" className="h-16 px-10 rounded-[radius:var(--border-radius)] border-[length:var(--border-width)] border-foreground bg-foreground text-background font-bold text-lg uppercase tracking-wider shadow-[6px_6px_0px_var(--primary)] hover:translate-y-1 hover:translate-x-1 hover:shadow-[2px_2px_0px_var(--primary)] transition-all flex items-center gap-3 group">
                                    {hero.ctaText}
                                    <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>

                            {hero.secondaryCtaText && hero.secondaryCtaLink && (
                                <Link href={hero.secondaryCtaLink}>
                                    <Button size="lg" variant="outline" className="h-16 px-10 rounded-[radius:var(--border-radius)] border-[length:var(--border-width)] border-foreground text-foreground font-bold text-lg uppercase tracking-wider bg-transparent hover:bg-accent/10 hover:text-accent hover:border-accent shadow-[6px_6px_0px_var(--foreground)] hover:shadow-[6px_6px_0px_var(--accent)] transition-all flex items-center gap-3">
                                        <Gamepad2 className="w-6 h-6" />
                                        {hero.secondaryCtaText}
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </motion.div>

                    {/* Right Column: Visual Element / Decorative Box */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
                        animate={{ opacity: 1, scale: 1, rotate: 3 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="hidden lg:flex lg:col-span-4 justify-center relative"
                    >
                        <div className="w-full aspect-[4/5] bg-card border-[length:var(--border-width)] border-foreground rounded-[radius:var(--border-radius)] shadow-[12px_12px_0px_var(--foreground)] relative overflow-hidden flex flex-col p-2">
                            {/* "Window" Header */}
                            <div className="border-b-[length:var(--border-width)] border-foreground pb-2 mb-2 flex justify-between items-center px-2 bg-muted/50">
                                <span className="font-mono text-xs font-bold uppercase">profile_v1.0.exe</span>
                                <div className="flex gap-1">
                                    <div className="w-3 h-3 border border-foreground bg-red-500 rounded-full" />
                                    <div className="w-3 h-3 border border-foreground bg-yellow-400 rounded-full" />
                                    <div className="w-3 h-3 border border-foreground bg-green-500 rounded-full" />
                                </div>
                            </div>

                            {/* "Window" Content - A pixelated or abstract representation */}
                            <div className="flex-1 bg-grid-white/[0.05] relative flex items-center justify-center overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 mix-blend-overlay" />
                                <div className="text-[10rem] font-black text-foreground/5 select-none absolute z-0 rotate-90">
                                    DEV
                                </div>
                                <div className="z-10 text-center space-y-2 p-6 border-[length:var(--border-width)] border-dashed border-muted-foreground/30 bg-background/80 backdrop-blur-sm rounded-[radius:var(--border-radius)] mx-4">
                                    <p className="font-mono text-xs text-muted-foreground uppercase">Status</p>
                                    <p className="font-bold text-xl text-primary">ONLINE</p>
                                    <div className="h-px w-full bg-border my-2" />
                                    <p className="font-mono text-xs text-muted-foreground uppercase">Location</p>
                                    <p className="font-bold text-lg">World Wide Web</p>

                                    {/* Torch Mode Toggle */}
                                    <div className="flex flex-col items-center gap-2 mt-4 pt-4 border-t border-dashed border-muted-foreground/30">
                                        <p className="font-mono text-[10px] text-muted-foreground uppercase">
                                            {isTorchMode ? "LIGHTS ON" : "LIGHTS OFF"}
                                        </p>
                                        <button
                                            onClick={toggleTorchMode}
                                            className={`group relative w-12 h-6 rounded-full border-2 border-foreground transition-colors duration-300 ${isTorchMode ? 'bg-primary' : 'bg-muted'}`}
                                            aria-label="Toggle Torch Mode"
                                        >
                                            <motion.div
                                                animate={{
                                                    x: isTorchMode ? 24 : 0,
                                                    backgroundColor: isTorchMode ? "#ffffff" : "#000000"
                                                }}
                                                className="absolute left-0.5 top-0.5 w-4 h-4 rounded-full border border-foreground"
                                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                            />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* "Window" Footer */}
                            <div className="border-t-[length:var(--border-width)] border-foreground pt-2 mt-2 px-2 flex justify-between font-mono text-[10px] text-muted-foreground">
                                <span>CPU: 12%</span>
                                <span>MEM: 440MB</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Background Grain/Noise is handled globally, but we can add specific section decorations */}
            <div className="absolute right-0 bottom-0 w-1/2 h-1/2 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
        </section>
    );
}
