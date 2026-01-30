'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    SiteConfig,
    defaultConfig,
    subscribeSiteConfig,
} from '@/lib/firebase/siteConfig';

interface SiteConfigContextType {
    config: SiteConfig;
    loading: boolean;
}

const SiteConfigContext = createContext<SiteConfigContextType>({
    config: defaultConfig,
    loading: true,
});

const CACHE_KEY = 'site_branding_cache';

export function SiteConfigProvider({
    children,
    initialConfig
}: {
    children: React.ReactNode;
    initialConfig?: SiteConfig;
}) {
    const [config, setConfig] = useState<SiteConfig>(initialConfig || defaultConfig);
    const [loading, setLoading] = useState(!initialConfig);

    useEffect(() => {
        // Handle client-side cache as a side effect to avoid hydration mismatch
        if (!initialConfig) {
            const cached = localStorage.getItem(CACHE_KEY);
            if (cached) {
                try {
                    const branding = JSON.parse(cached);
                    setConfig(prev => ({ ...prev, ...branding }));
                    setLoading(false);
                } catch (e) {
                    console.error('Failed to parse cached branding:', e);
                }
            }
        }

        // Subscribe to real-time config updates from Firestore
        const unsubscribe = subscribeSiteConfig((newConfig) => {
            setConfig(newConfig);
            setLoading(false);

            // Cache important branding URLs
            const brandingToCache = {
                logoUrl: newConfig.logoUrl,
                loaderUrl: newConfig.loaderUrl,
                faviconUrl: newConfig.faviconUrl,
                colors: newConfig.colors,
            };
            localStorage.setItem(CACHE_KEY, JSON.stringify(brandingToCache));
        });

        return () => unsubscribe();
    }, [initialConfig]);

    return (
        <SiteConfigContext.Provider value={{ config, loading }}>
            {children}
        </SiteConfigContext.Provider>
    );
}

export function useSiteConfig() {
    const context = useContext(SiteConfigContext);
    if (!context) {
        throw new Error('useSiteConfig must be used within a SiteConfigProvider');
    }
    return context;
}
