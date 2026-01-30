'use client';

import React, { useEffect, useState } from 'react';
import { useSiteConfig } from '@/context/SiteConfigContext';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * LoadingScreen
 * A minimalist, robust loading screen.
 * - Solid grainy white background.
 * - Perfectly centered loader.
 * - Minimum 2s duration.
 */
export function LoadingScreen() {
    const { config, loading: configLoading } = useSiteConfig();
    const [mounted, setMounted] = useState(false);
    const [show, setShow] = useState(true);
    const [minDurationPassed, setMinDurationPassed] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Minimum time to show the loader (2 seconds) to cover at least one cycle
        const timer = setTimeout(() => {
            setMinDurationPassed(true);
        }, 2000);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (mounted && !configLoading && minDurationPassed) {
            const fadeTimer = setTimeout(() => {
                setShow(false);
            }, 100);
            return () => clearTimeout(fadeTimer);
        }
    }, [mounted, configLoading, minDurationPassed]);

    if (!mounted || !show) return null;

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: '#ffffff',
                        zIndex: 9999999,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: 0,
                        padding: 0,
                        boxSizing: 'border-box',
                        overflow: 'hidden'
                    }}
                >
                    {/* Grain Texture */}
                    <div
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            pointerEvents: 'none',
                            opacity: 0.05,
                            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                        }}
                    />

                    {/* Loader */}
                    <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {config.loaderUrl ? (
                            <img
                                src={config.loaderUrl}
                                alt="Loading"
                                style={{
                                    display: 'block',
                                    width: 'auto',
                                    height: 'auto',
                                    maxWidth: '220px',
                                    maxHeight: '220px',
                                    objectFit: 'contain'
                                }}
                                loading="eager"
                            />
                        ) : (
                            <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
