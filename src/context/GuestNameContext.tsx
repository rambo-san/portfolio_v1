'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface GuestNameContextType {
    guestName: string | null;
    setGuestName: (name: string) => void;
    clearGuestName: () => void;
    hasGuestName: boolean;
}

const GuestNameContext = createContext<GuestNameContextType | undefined>(undefined);

const STORAGE_KEY = 'arcade-guest-name';

export function GuestNameProvider({ children }: { children: React.ReactNode }) {
    const [guestName, setGuestNameState] = useState<string | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            setGuestNameState(saved);
        }
        setIsLoaded(true);
    }, []);

    const setGuestName = (name: string) => {
        setGuestNameState(name);
        localStorage.setItem(STORAGE_KEY, name);
    };

    const clearGuestName = () => {
        setGuestNameState(null);
        localStorage.removeItem(STORAGE_KEY);
    };

    // Don't render children until we've loaded from localStorage
    // to prevent flash of guest name prompt
    if (!isLoaded) {
        return null;
    }

    return (
        <GuestNameContext.Provider
            value={{
                guestName,
                setGuestName,
                clearGuestName,
                hasGuestName: !!guestName,
            }}
        >
            {children}
        </GuestNameContext.Provider>
    );
}

export function useGuestName() {
    const context = useContext(GuestNameContext);
    if (context === undefined) {
        throw new Error('useGuestName must be used within a GuestNameProvider');
    }
    return context;
}
