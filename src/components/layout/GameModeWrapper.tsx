"use client";

import { useGameMode } from "@/context/GameModeContext";
import { ReactNode } from "react";

interface GameModeWrapperProps {
    children: ReactNode;
}

export function GameModeWrapper({ children }: GameModeWrapperProps) {
    const { isGameMode } = useGameMode();

    // Hide children when in game mode
    if (isGameMode) {
        return null;
    }

    return <>{children}</>;
}
