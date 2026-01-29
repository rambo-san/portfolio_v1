"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

interface TorchContextType {
    isTorchMode: boolean;
    setTorchMode: (value: boolean) => void;
    toggleTorchMode: () => void;
}

const TorchContext = createContext<TorchContextType | undefined>(undefined);

export const TorchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isTorchMode, setTorchMode] = useState(false);

    const toggleTorchMode = () => setTorchMode(prev => !prev);

    // Disable on mobile/tablet
    useEffect(() => {
        const checkMobile = () => {
            if (window.innerWidth < 1024 && isTorchMode) {
                setTorchMode(false);
            }
        };

        window.addEventListener('resize', checkMobile);
        checkMobile();
        return () => window.removeEventListener('resize', checkMobile);
    }, [isTorchMode]);

    return (
        <TorchContext.Provider value={{ isTorchMode, setTorchMode, toggleTorchMode }}>
            {children}
        </TorchContext.Provider>
    );
};

export const useTorch = () => {
    const context = useContext(TorchContext);
    if (!context) {
        throw new Error('useTorch must be used within a TorchProvider');
    }
    return context;
};
