'use client';

import { AuthProvider } from '@/context/AuthContext';
import { SiteConfigProvider } from '@/context/SiteConfigContext';
import { GuestNameProvider } from '@/context/GuestNameContext';
import { GameModeProvider } from '@/context/GameModeContext';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <SiteConfigProvider>
                <GuestNameProvider>
                    <GameModeProvider>{children}</GameModeProvider>
                </GuestNameProvider>
            </SiteConfigProvider>
        </AuthProvider>
    );
}
