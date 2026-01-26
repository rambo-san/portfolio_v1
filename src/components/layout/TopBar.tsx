'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { UserMenu } from '@/components/auth/UserMenu';
import { AuthModal } from '@/components/auth/AuthModal';
import { Sparkles } from 'lucide-react';

import { useSiteConfig } from '@/context/SiteConfigContext';

import { Skeleton } from "@/components/ui/skeleton";

export function TopBar() {
    const { config, loading } = useSiteConfig();
    const [isAuthOpen, setIsAuthOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const { scrollY } = useScroll();

    useMotionValueEvent(scrollY, "change", (latest) => {
        setIsScrolled(latest > 20);
    });

    return (
        <>
            <motion.header
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className={`fixed top-0 left-0 right-0 z-40 px-4 py-3 transition-all duration-300 ${isScrolled
                    ? "bg-black/50 backdrop-blur-md border-b border-white/5 shadow-lg"
                    : "bg-transparent"
                    }`}
            >
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    {/* Logo */}
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-white font-bold text-lg hover:opacity-80 transition-opacity"
                    >
                        {loading ? (
                            <>
                                <Skeleton className="w-8 h-8 rounded-lg" />
                                <Skeleton className="w-24 h-6 rounded hidden sm:block" />
                            </>
                        ) : (
                            <>
                                {config.logoUrl ? (
                                    <img
                                        src={config.logoUrl}
                                        alt={config.siteName}
                                        className="w-8 h-8 rounded-lg object-contain"
                                    />
                                ) : (
                                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white">
                                        <Sparkles size={18} />
                                    </div>
                                )}
                                <span className="hidden sm:block">{config.siteName}</span>
                            </>
                        )}
                    </Link>

                    {/* User Menu */}
                    <UserMenu onOpenAuth={() => setIsAuthOpen(true)} />
                </div>
            </motion.header>

            {/* Auth Modal */}
            <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
        </>
    );
}
