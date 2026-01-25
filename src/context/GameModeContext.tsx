"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface GameModeContextType {
    isGameMode: boolean;
    enterGameMode: () => void;
    exitGameMode: () => void;
}

const GameModeContext = createContext<GameModeContextType>({
    isGameMode: false,
    enterGameMode: () => { },
    exitGameMode: () => { },
});

export function GameModeProvider({ children }: { children: ReactNode }) {
    const [isGameMode, setIsGameMode] = useState(false);

    const enterGameMode = useCallback(() => setIsGameMode(true), []);
    const exitGameMode = useCallback(() => setIsGameMode(false), []);

    return (
        <GameModeContext.Provider value={{ isGameMode, enterGameMode, exitGameMode }}>
            {children}
        </GameModeContext.Provider>
    );
}

export function useGameMode() {
    return useContext(GameModeContext);
}
