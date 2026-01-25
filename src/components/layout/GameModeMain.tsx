"use client";

import { useGameMode } from "@/context/GameModeContext";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GameModeMainProps {
    children: ReactNode;
}

export function GameModeMain({ children }: GameModeMainProps) {
    const { isGameMode } = useGameMode();

    return (
        <main
            className={cn(
                "flex-1 flex flex-col relative z-20 pt-16", // Always keep top padding for TopBar
                isGameMode
                    ? "pb-0" // No bottom padding in game mode (bottom nav hidden)
                    : "pb-24 md:pb-32" // Normal bottom padding
            )}
        >
            {children}
        </main>
    );
}
