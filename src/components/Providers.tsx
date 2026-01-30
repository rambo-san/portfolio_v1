'use client';

import { AuthProvider } from '@/context/AuthContext';
import { SiteConfigProvider } from '@/context/SiteConfigContext';
import { GuestNameProvider } from '@/context/GuestNameContext';
import { GameModeProvider } from '@/context/GameModeContext';

import { TorchProvider } from '@/context/TorchContext';
import { ThemeInitializer } from '@/components/ThemeInitializer';
import { LoadingScreen } from '@/components/layout/LoadingScreen';

import { SiteConfig } from '@/lib/firebase/siteConfig';

export function Providers({
    children,
    initialConfig
}: {
    children: React.ReactNode;
    initialConfig?: SiteConfig;
}) {
    return (
        <AuthProvider>
            <SiteConfigProvider initialConfig={initialConfig}>
                <LoadingScreen />
                <ThemeInitializer />
                <GuestNameProvider>
                    <GameModeProvider>
                        <TorchProvider>
                            {children}
                        </TorchProvider>
                    </GameModeProvider>
                </GuestNameProvider>
            </SiteConfigProvider>
        </AuthProvider>
    );
}
