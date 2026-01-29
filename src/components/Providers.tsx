'use client';

import { AuthProvider } from '@/context/AuthContext';
import { SiteConfigProvider } from '@/context/SiteConfigContext';
import { GuestNameProvider } from '@/context/GuestNameContext';
import { GameModeProvider } from '@/context/GameModeContext';

import { TorchProvider } from '@/context/TorchContext';
import { ThemeInitializer } from '@/components/ThemeInitializer';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <SiteConfigProvider>
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
