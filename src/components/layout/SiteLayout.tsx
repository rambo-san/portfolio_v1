'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { TopBar } from "@/components/layout/TopBar";
import { FriendsDrawer } from "@/components/layout/FriendsDrawer";
import { GameModeWrapper } from "@/components/layout/GameModeWrapper";
import { GameModeMain } from "@/components/layout/GameModeMain";
import { TorchOverlay } from "@/components/layout/TorchOverlay";
import { PixelCanvas } from "@/components/layout/PixelCanvas";
import { BackgroundBlob } from "@/components/layout/BackgroundBlob";

export function SiteLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Defensive check for admin pages
    const isAdmin = pathname?.includes('/admin') ||
        (typeof window !== 'undefined' && window.location.pathname.includes('/admin'));

    if (isAdmin) {
        return (
            <div className="flex flex-col min-h-screen w-full bg-[#030712] relative z-[100]">
                {children}
            </div>
        );
    }

    // Don't render site-wide elements until mounted to avoid hydration flash of wrong layout
    if (!mounted) {
        return (
            <div className="min-h-screen bg-background">
                {children}
            </div>
        );
    }

    return (
        <>
            <TorchOverlay />
            <div className="bg-grain" />
            <PixelCanvas />
            <BackgroundBlob />
            <TopBar />
            <div className="relative z-10 bg-transparent shadow-[0_20px_50px_rgba(0,0,0,0.5)] min-h-screen flex flex-col md:mb-[0] mb-0 backdrop-blur-[2px]">
                <GameModeMain>
                    {children}
                </GameModeMain>
                <div id="contact" className="h-px" />
            </div>

            <footer className="md:sticky md:bottom-0 md:z-0 w-full bg-foreground relative z-20">
                <Footer />
            </footer>

            <GameModeWrapper>
                <Navbar />
                <FriendsDrawer />
            </GameModeWrapper>
        </>
    );
}
