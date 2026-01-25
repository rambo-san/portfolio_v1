"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Maximize2, Minimize2, Trophy, RotateCcw, Monitor } from "lucide-react";
import { useGameData } from "@/hooks/useGameData";
import { LeaderboardEntry } from "@/lib/firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { useGuestName } from "@/context/GuestNameContext";
import { useGameMode } from "@/context/GameModeContext";
import { cn } from "@/lib/utils";

interface GameLayoutProps {
    children: React.ReactNode;
    gameId: string;
    gameName: string;
    currentScore?: number; // Optional: to show live comparison
    scoreUpdateTrigger?: number; // timestamp to trigger refresh
}

export function GameLayout({ children, gameId, gameName, currentScore = 0, scoreUpdateTrigger }: GameLayoutProps) {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);
    const containerRef = useRef<HTMLDivElement>(null);
    const { getLeaderboard } = useGameData();
    const { user } = useAuth();
    const { guestName } = useGuestName();
    const { enterGameMode, exitGameMode } = useGameMode();

    const playerName = user?.displayName || guestName || "Guest";

    // Enter game mode on mount, exit on unmount
    useEffect(() => {
        enterGameMode();
        return () => exitGameMode();
    }, [enterGameMode, exitGameMode]);

    // Fetch Leaderboard
    useEffect(() => {
        const fetchScores = async () => {
            setLoadingLeaderboard(true);
            const data = await getLeaderboard(gameId, 10);
            setLeaderboard(data);
            setLoadingLeaderboard(false);
        };

        fetchScores();
        // Refresh every minute roughly? Or just once on mount
    }, [gameId, getLeaderboard, scoreUpdateTrigger]);

    // Handle Fullscreen
    const toggleFullscreen = async () => {
        if (!document.fullscreenElement) {
            try {
                if (containerRef.current?.requestFullscreen) {
                    await containerRef.current.requestFullscreen();
                } else if ((containerRef.current as any)?.webkitRequestFullscreen) {
                    await (containerRef.current as any).webkitRequestFullscreen();
                }
                setIsFullscreen(true);
            } catch (err) {
                console.error("Error attempting to enable full-screen mode:", err);
            }
        } else {
            if (document.exitFullscreen) {
                await document.exitFullscreen();
            }
            setIsFullscreen(false);
        }
    };

    // Listen for fullscreen change events (ESC key)
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener("fullscreenchange", handleFullscreenChange);
        document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
        return () => {
            document.removeEventListener("fullscreenchange", handleFullscreenChange);
            document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className={cn(
                "min-h-screen bg-[#050505] flex flex-col relative transition-all duration-700 font-sans",
                isFullscreen ? "p-0 bg-black justify-center" : "p-4 md:p-6 lg:p-8"
            )}
        >
            {/* Header */}
            {!isFullscreen && (
                <div className="flex items-center justify-between mb-6 relative z-20">
                    <Link
                        href="/arcade"
                        className="flex items-center gap-2 text-white/50 hover:text-white transition-colors group"
                    >
                        <div className="p-2 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors border border-white/5">
                            <ArrowLeft size={18} />
                        </div>
                        <span className="font-medium tracking-wide text-sm">Back to Arcade</span>
                    </Link>

                    <h1 className="absolute left-1/2 -translate-x-1/2 text-2xl md:text-3xl font-black text-white/90 tracking-tight hidden md:block">
                        {gameName}
                    </h1>

                    <div className="flex items-center gap-4">
                        {/* Currently playing as... */}
                        <div className="hidden md:flex flex-col items-end">
                            <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Player</span>
                            <span className="text-sm font-bold text-white max-w-[150px] truncate">{playerName}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Scrollable container on mobile, side-by-side on desktop */}
            <div className="flex-1 flex flex-col lg:flex-row gap-4 lg:gap-6 items-stretch justify-start lg:justify-center overflow-y-auto lg:overflow-hidden">

                {/* Game Area - guaranteed minimum height on mobile */}
                <div className={cn(
                    "relative w-full flex items-center justify-center transition-all duration-500 overflow-hidden flex-shrink-0",
                    isFullscreen
                        ? "h-full flex-1"
                        : "min-h-[300px] h-[50vh] lg:h-auto lg:flex-1 lg:min-h-[500px] bg-[#0A0A0A]/80 rounded-[1.5rem] md:rounded-[2rem] border border-white/5 shadow-2xl backdrop-blur-2xl ring-1 ring-white/5"
                )}>
                    {/* Fullscreen Overlay Controls */}
                    {isFullscreen && (
                        <div className="absolute top-6 right-6 z-50 opacity-0 hover:opacity-100 transition-opacity">
                            <button
                                onClick={toggleFullscreen}
                                className="p-3 rounded-full bg-black/50 text-white border border-white/10 backdrop-blur-md hover:bg-white/10 transition-all"
                            >
                                <Minimize2 size={24} />
                            </button>
                        </div>
                    )}

                    {/* Fullscreen Button - Top Right Corner of Game */}
                    {!isFullscreen && (
                        <button
                            onClick={toggleFullscreen}
                            className="absolute top-3 right-3 z-40 flex items-center gap-2 px-3 py-2 rounded-full bg-black/60 border border-white/20 backdrop-blur-md text-white/80 text-xs font-medium hover:bg-white/10 hover:text-white transition-all"
                        >
                            <Maximize2 size={14} />
                            <span className="hidden sm:inline">Fullscreen</span>
                        </button>
                    )}

                    {children}
                </div>

                {/* Leaderboard Sidebar - Visible on all screens */}
                {!isFullscreen && (
                    <div className="w-full lg:w-80 flex-shrink-0 flex flex-col gap-4">
                        {/* Live Score Card */}
                        <div className="p-4 md:p-5 bg-gradient-to-br from-violet-500/10 via-fuchsia-500/5 to-transparent border border-white/10 rounded-2xl relative overflow-hidden">
                            {/* Background glow effect */}
                            <div className={cn(
                                "absolute inset-0 bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 blur-xl transition-opacity duration-500",
                                currentScore > 0 ? "opacity-50" : "opacity-0"
                            )} />

                            <div className="relative z-10">
                                {/* Header with live indicator */}
                                <div className="flex items-center gap-2 mb-3">
                                    <div className={cn(
                                        "w-2 h-2 rounded-full transition-colors",
                                        currentScore > 0 ? "bg-green-500 animate-pulse" : "bg-white/20"
                                    )} />
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">
                                        {currentScore > 0 ? "Playing Now" : "Ready"}
                                    </span>
                                </div>

                                {/* Score Display */}
                                <div className="flex items-end justify-between">
                                    <div>
                                        <div className="flex items-baseline gap-1">
                                            <span className={cn(
                                                "text-5xl md:text-6xl font-black tracking-tighter transition-all duration-300",
                                                currentScore > 0 ? "text-white" : "text-white/60"
                                            )}>
                                                {currentScore}
                                            </span>
                                            <span className="text-sm font-medium text-white/40 mb-1">pts</span>
                                        </div>
                                    </div>

                                    {/* Game icon */}
                                    <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                                        <Monitor size={24} className="text-violet-400/60" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Leaderboard List */}
                        <div className="bg-[#0A0A0A]/60 border border-white/5 rounded-[1.5rem] overflow-hidden flex flex-col flex-1 min-h-0 backdrop-blur-xl">
                            <div className="p-5 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                                <h3 className="font-bold text-white flex items-center gap-2.5">
                                    <Trophy size={18} className="text-yellow-500" />
                                    <span>Leaderboard</span>
                                </h3>
                                <span className="px-2 py-0.5 rounded-full bg-white/5 text-[10px] font-bold text-white/40 uppercase tracking-wider">Top 10</span>
                            </div>

                            <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                                {loadingLeaderboard ? (
                                    // Sleek Skeletons
                                    [1, 2, 3, 4, 5].map(i => (
                                        <div key={i} className="h-14 w-full bg-white/5 rounded-xl animate-pulse" />
                                    ))
                                ) : leaderboard.length > 0 ? (
                                    leaderboard.map((entry, index) => {
                                        const isYou = user?.uid === entry.userId;

                                        // Handle Timestamp
                                        let dateStr = "";
                                        if (entry.achievedAt) {
                                            const date = 'toDate' in entry.achievedAt
                                                ? (entry.achievedAt as any).toDate()
                                                : new Date(entry.achievedAt as any);
                                            dateStr = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                                        }

                                        return (
                                            <div
                                                key={index}
                                                className={cn(
                                                    "flex items-center gap-3 p-3 rounded-xl transition-all duration-300 relative overflow-hidden group border",
                                                    isYou ? "bg-violet-500/10 border-violet-500/20" : "hover:bg-white/5 border-transparent hover:border-white/5"
                                                )}
                                            >
                                                {/* Rank Badge */}
                                                <div className={cn(
                                                    "w-7 h-7 flex items-center justify-center rounded-lg text-xs font-black shadow-lg",
                                                    index === 0 ? "bg-gradient-to-br from-yellow-400 to-yellow-600 text-black shadow-yellow-500/20" :
                                                        index === 1 ? "bg-gradient-to-br from-slate-300 to-slate-400 text-black shadow-white/10" :
                                                            index === 2 ? "bg-gradient-to-br from-amber-600 to-amber-700 text-white shadow-amber-900/20" :
                                                                "bg-white/5 text-slate-500"
                                                )}>
                                                    {index + 1}
                                                </div>

                                                {/* Avatar */}
                                                <div className="w-9 h-9 rounded-full overflow-hidden bg-white/5 border border-white/10 ring-2 ring-transparent group-hover:ring-white/10 transition-all flex-shrink-0">
                                                    {entry.photoURL ? (
                                                        <img src={entry.photoURL} alt={entry.displayName} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white/60 bg-gradient-to-br from-white/5 to-white/0">
                                                            {entry.displayName.slice(0, 2).toUpperCase()}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Name */}
                                                <div className="flex-1 min-w-0 flex flex-col">
                                                    <p className={cn("text-sm font-bold truncate leading-tight", isYou ? "text-violet-300" : "text-slate-200")}>
                                                        {entry.displayName}
                                                    </p>
                                                    <p className="text-[10px] text-white/30 font-medium">
                                                        {dateStr}
                                                    </p>
                                                </div>

                                                {/* Score */}
                                                <div className="text-right pl-2">
                                                    <p className="font-mono font-black text-white text-lg tracking-tight group-hover:scale-110 transition-transform origin-right">
                                                        {entry.score}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <Trophy size={32} className="text-white/10 mb-3" />
                                        <p className="text-white/30 text-sm font-medium">No scores yet</p>
                                        <p className="text-white/20 text-xs">Be the legend who starts it all</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function ExpandIcon({ isFullscreen }: { isFullscreen: boolean }) {
    if (isFullscreen) return <Minimize2 size={18} />;
    return <Maximize2 size={18} />;
}
