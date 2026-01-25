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

export function SiteConfigProvider({ children }: { children: React.ReactNode }) {
    const [config, setConfig] = useState<SiteConfig>(defaultConfig);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Subscribe to real-time config updates from Firestore
        const unsubscribe = subscribeSiteConfig((newConfig) => {
            setConfig(newConfig);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

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
