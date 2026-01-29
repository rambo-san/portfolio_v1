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
                "flex-1 flex flex-col relative pt-16" // Always keep top padding for TopBar
            )}
        >
            {children}
        </main>
    );
}
