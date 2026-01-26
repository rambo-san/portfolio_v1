'use client';

import { useEffect } from 'react';
import { useSiteConfig } from '@/context/SiteConfigContext';

export function ThemeInitializer() {
    const { config } = useSiteConfig();

    useEffect(() => {
        if (!config || !config.colors) return;

        const root = document.documentElement;

        // Update CSS variables from site configuration
        root.style.setProperty('--background', config.colors.background);
        root.style.setProperty('--foreground', config.colors.text);
        root.style.setProperty('--primary', config.colors.primary);
        root.style.setProperty('--secondary', config.colors.secondary);
        root.style.setProperty('--card', config.colors.surface);
        root.style.setProperty('--text-muted', config.colors.textMuted);

        // For Tailwind colors that use RGB + Opacity, we'd ideally want to pass RGB values
        // but for now, simple hex should work for basic colors.
        // If we want to support opacity (e.g., bg-primary/20), we need hex to RGB conversion.

        const hexToRgb = (hex: string) => {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ?
                `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)}` :
                null;
        };

        const primaryRgb = hexToRgb(config.colors.primary);
        if (primaryRgb) {
            root.style.setProperty('--primary-rgb', primaryRgb);
        }

    }, [config]);

    return null;
}
