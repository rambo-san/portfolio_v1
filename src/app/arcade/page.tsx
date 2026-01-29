"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gamepad2, Trophy, Flame, Bird, User, LogIn } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useGuestName } from "@/context/GuestNameContext";
import { AuthModal } from "@/components/auth/AuthModal";
import { Button } from "@/components/ui/button";

import { useSiteConfig } from "@/context/SiteConfigContext";
import { getGameConfigs, GameConfig } from "@/lib/firebase/firestore";
import { Lock } from "lucide-react";

const games = [
    {
        id: "flappy-dillu",
        title: "Flappy Dillu",
        description: "Navigate Dillu through the pipes! A classic flappy-bird style game demonstrating canvas rendering and physics.",
        difficulty: "Easy",
        status: "Active",
        icon: Bird,
    },
    {
        id: "system-stabilizer",
        title: "System Stabilizer",
        description: "Balance server loads and prevent system overheating in this fast-paced reaction game. Uses pure HTML5 Canvas.",
        difficulty: "Medium",
        status: "Coming Soon",
    },
    {
        id: "packet-tracer",
        title: "Packet Tracer",
        description: "Route data packets through optimal paths while avoiding network congestion.",
        difficulty: "Hard",
        status: "Coming Soon",
    },
];

export default function Arcade() {
    const { user, loading: authLoading } = useAuth();
    const { config, loading: configLoading } = useSiteConfig();
    const { profile } = useAuth(); // Profile has the role
    const { guestName, setGuestName, hasGuestName } = useGuestName();
    const [nameInput, setNameInput] = useState("");
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [gameConfigs, setGameConfigs] = useState<Record<string, GameConfig>>({});
    const [loadingConfigs, setLoadingConfigs] = useState(true);

    // Load game configs for RBAC
    useEffect(() => {
        async function loadConfigs() {
            try {
                const configs = await getGameConfigs();
                const configMap: Record<string, GameConfig> = {};
                configs.forEach(c => configMap[c.id] = c);
                setGameConfigs(configMap);
            } catch (err) {
                console.error("Failed to load game configs:", err);
            } finally {
                setLoadingConfigs(false);
            }
        }
        loadConfigs();
    }, []);

    const loading = authLoading || configLoading;

    // Game settings from config
    const { allowGuestPlay, showLeaderboard } = config.gameSettings;

    // Show guest name prompt only if not logged in, guest play is allowed, and no guest name set
    const showGuestNamePrompt = !loading && !user && !hasGuestName && allowGuestPlay;

    // If guest play is NOT allowed and user is NOT logged in, we should probably show a login required message
    const loginRequired = !loading && !user && !allowGuestPlay;

    const handleSetGuestName = () => {
        if (nameInput.trim().length >= 2) {
            setGuestName(nameInput.trim());
        }
    };

    // Get display name (user's name or guest name)
    const displayName = user?.displayName || guestName || "Guest";

    return (
        <>
            <div className="min-h-screen pt-12 pb-12 px-4 crt-overlay bg-[#050505]">
                {/* Vintage Grid Overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] z-0 pointer-events-none" />

                <div className="container mx-auto relative z-10">
                    <header className="mb-16 text-center pt-8">
                        <div className="flex justify-between items-center mb-12 font-mono text-[10px] text-primary/60 tracking-[0.3em] uppercase">
                            <span>Credit: 01</span>
                            <div className="flex items-center gap-4">
                                <span className="animate-pulse text-white">Insert Coin</span>
                                <div className="h-4 w-px bg-white/20" />
                                <span>P1: 000000</span>
                            </div>
                        </div>

                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="inline-flex items-center justify-center p-8 bg-black border-4 border-primary shadow-[0_0_30px_rgba(var(--primary-rgb),0.5)] mb-8 pixel-corners"
                        >
                            <Gamepad2 size={64} className="text-primary animate-pulse" />
                        </motion.div>

                        <h1 className="text-5xl md:text-8xl font-black text-white mb-6 uppercase italic tracking-tighter retro-text-shadow">
                            SYSTEM ARCADE
                        </h1>

                        <div className="flex items-center justify-center gap-4 mb-8">
                            <div className="h-0.5 w-12 bg-primary" />
                            <p className="text-primary font-mono text-sm uppercase tracking-[0.4em]">
                                Initialization Sequence Complete
                            </p>
                            <div className="h-0.5 w-12 bg-primary" />
                        </div>

                        {/* Player Status */}
                        {!loading && (user || (hasGuestName && allowGuestPlay)) && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-6 inline-flex items-center gap-4 px-6 py-3 bg-white/5 border-2 border-primary/20 pixel-corners"
                            >
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                <span className="text-white font-mono text-xs uppercase tracking-widest">
                                    Operator: <span className="text-primary font-black">{displayName}</span>
                                </span>
                                {!user && (
                                    <button
                                        onClick={() => setShowAuthModal(true)}
                                        className="ml-4 text-[10px] font-mono text-gray-400 hover:text-primary transition-colors flex items-center gap-2 underline underline-offset-4"
                                    >
                                        [Save_Profile]
                                    </button>
                                )}
                            </motion.div>
                        )}
                    </header>

                    {/* Guest Name Prompt */}
                    <AnimatePresence>
                        {showGuestNamePrompt && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="max-w-md mx-auto mb-12"
                            >
                                <div className="bg-[#0a0a0a] border-4 border-primary shadow-[12px_12px_0px_rgba(0,0,0,0.5)] pixel-corners p-8 text-center relative overflow-hidden">
                                    <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(circle_at_center,var(--primary)_1px,transparent_1px)] bg-[size:20px_20px]" />

                                    <div className="relative z-10">
                                        <div className="w-16 h-16 bg-primary/10 border-2 border-primary/30 flex items-center justify-center mx-auto mb-6 pixel-corners">
                                            <User size={32} className="text-primary" />
                                        </div>
                                        <h2 className="text-2xl font-black text-white mb-2 uppercase italic tracking-tighter">ARCADE_ENTRY</h2>
                                        <p className="text-primary/60 font-mono text-[10px] uppercase mb-8 tracking-widest">
                                            Initialization required for high-score tracking.
                                        </p>

                                        <div className="space-y-4">
                                            <div className="relative group">
                                                <input
                                                    type="text"
                                                    value={nameInput}
                                                    onChange={(e) => setNameInput(e.target.value)}
                                                    onKeyDown={(e) => e.key === "Enter" && handleSetGuestName()}
                                                    placeholder="Enter operator name..."
                                                    className="w-full px-4 py-4 bg-black border-2 border-primary/20 text-white font-mono text-xs placeholder:text-white/20 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all pixel-corners text-center"
                                                    autoFocus
                                                />
                                            </div>

                                            <button
                                                onClick={handleSetGuestName}
                                                disabled={nameInput.trim().length < 2}
                                                className="w-full py-4 bg-primary text-black font-black uppercase tracking-[0.2em] pixel-corners shadow-[6px_6px_0px_rgba(var(--primary-rgb),0.3)] hover:bg-white transition-all disabled:opacity-30 disabled:cursor-not-allowed active:translate-y-[2px] active:translate-x-[2px] active:shadow-none"
                                            >
                                                START_GUEST_SESSION
                                            </button>

                                            <div className="flex items-center gap-4 my-6">
                                                <div className="flex-1 h-[1px] bg-primary/20" />
                                                <span className="text-[9px] font-mono text-primary/40 uppercase tracking-widest">or_relay</span>
                                                <div className="flex-1 h-[1px] bg-primary/20" />
                                            </div>

                                            <button
                                                onClick={() => setShowAuthModal(true)}
                                                className="w-full flex items-center justify-center gap-3 py-4 bg-black border-2 border-primary/20 text-white font-black text-xs uppercase tracking-widest pixel-corners hover:bg-primary/5 hover:border-primary transition-all"
                                            >
                                                <LogIn size={18} className="text-primary" />
                                                Identify_Operator
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {loginRequired && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="max-w-md mx-auto mb-12"
                            >
                                <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 rounded-2xl border border-gray-700/50 p-8 text-center relative overflow-hidden">
                                    <div className="relative z-10">
                                        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                                            <LogIn size={32} className="text-primary" />
                                        </div>
                                        <h2 className="text-xl font-bold text-white mb-2">Login Required</h2>
                                        <p className="text-gray-400 text-sm mb-6">
                                            Guest play is currently disabled. Please sign in to access the arcade and save your progress.
                                        </p>

                                        <Button
                                            onClick={() => setShowAuthModal(true)}
                                            className="w-full shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]"
                                        >
                                            <LogIn size={18} />
                                            Sign in with Google
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Games Grid - only show when user has a name or is logged in */}
                    {(user || (hasGuestName && allowGuestPlay)) && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="grid md:grid-cols-2 lg:grid-cols-3 gap-12"
                        >
                            {games.map((game, i) => (
                                <motion.div
                                    key={game.id}
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: i * 0.1 }}
                                    className={`relative group ${game.status !== "Active" ? "opacity-40 grayscale" : ""}`}
                                >
                                    {/* Cabinet Shadow/Offset */}
                                    <div className="absolute inset-0 bg-primary/20 translate-x-3 translate-y-3 pixel-corners -z-10 group-hover:bg-primary/30 transition-all" />

                                    {/* Cabinet Body */}
                                    <div className={`h-full bg-black border-2 border-white/20 p-8 flex flex-col pixel-corners transition-all duration-300 ${game.status === "Active" ? "group-hover:border-primary group-hover:neon-border group-hover:-translate-y-1 group-hover:translate-x-1" : ""}`}>

                                        {/* Status Bar */}
                                        <div className="flex justify-between items-center mb-8">
                                            <div className="flex gap-1">
                                                <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                                                <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full" />
                                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                                            </div>
                                            <div className={`font-mono text-[10px] uppercase tracking-widest px-2 py-1 border ${game.difficulty === "Hard" ? "border-red-500/50 text-red-500" : "border-primary/50 text-primary"}`}>
                                                {game.difficulty}
                                            </div>
                                        </div>

                                        {/* Icon Wrapper */}
                                        <div className="w-16 h-16 bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                                            {game.icon ? <game.icon size={32} className="text-white group-hover:text-primary" /> : <Gamepad2 size={32} className="text-white group-hover:text-primary" />}
                                        </div>

                                        <h3 className="text-2xl font-black text-white mb-3 uppercase tracking-tighter group-hover:text-primary transition-colors">
                                            {game.title}
                                        </h3>

                                        <p className="text-xs font-mono text-slate-500 mb-8 flex-1 leading-relaxed">
                                            {game.description}
                                        </p>

                                        <div className="mt-auto">
                                            {game.status === "Active" ? (
                                                <Link href={`/arcade/${game.id}`} className="block">
                                                    <button className="w-full py-4 bg-primary text-black font-black uppercase tracking-[0.2em] transform hover:bg-white transition-all pixel-corners shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)] group-active:scale-95">
                                                        START_SYSTEM
                                                    </button>
                                                </Link>
                                            ) : (
                                                <button disabled className="w-full py-4 bg-white/5 text-slate-600 font-black uppercase tracking-[0.2em] cursor-not-allowed border-2 border-dashed border-white/10 pixel-corners">
                                                    LOCKED
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* RBAC Lockdown Check - Styled more like a 'Service Error' */}
                                    {(() => {
                                        const config = gameConfigs[game.id];
                                        if (!config) return null;

                                        const userRole = profile?.role || 'guest';
                                        const allowedRoles = config.allowedRoles || ['player', 'admin'];
                                        const isAllowed = allowedRoles.includes(userRole) || userRole === 'admin';

                                        if (!isAllowed) {
                                            return (
                                                <div className="absolute inset-0 z-20 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center pixel-corners border-4 border-red-500/50 crt-flicker">
                                                    <Lock className="text-red-500 mb-4" size={48} />
                                                    <h4 className="text-xl font-black text-white mb-2 uppercase tracking-tighter">ACCESS_DENIED</h4>
                                                    <p className="text-[10px] font-mono text-red-400 mb-4 uppercase leading-tight">
                                                        Incompatible credentials for this simulation. <br />
                                                        Requires: {allowedRoles.join(', ')}
                                                    </p>
                                                    <div className="font-mono text-[9px] text-white/40 uppercase">
                                                        ID: {userRole} // VERIFICATION_FAILED
                                                    </div>
                                                </div>
                                            );
                                        }
                                        return null;
                                    })()}
                                </motion.div>
                            ))}

                            {/* Leaderboard Teaser - Styled like an 8-bit monitor */}
                            {showLeaderboard && (
                                <div className="relative">
                                    <div className="absolute inset-0 bg-yellow-500/10 translate-x-3 translate-y-3 pixel-corners -z-10" />
                                    <div className="h-full bg-black border-2 border-yellow-500/30 p-8 flex flex-col pixel-corners">
                                        <div className="flex items-center gap-3 mb-6">
                                            <Trophy size={20} className="text-yellow-500" />
                                            <h3 className="text-xl font-black text-white uppercase tracking-tighter">HIGH SCORES</h3>
                                        </div>

                                        <div className="space-y-4 font-mono text-xs mb-6">
                                            <div className="flex justify-between text-yellow-500/50 border-b border-white/10 pb-1">
                                                <span>OPERATOR</span>
                                                <span>POINTS</span>
                                            </div>
                                            <div className="flex justify-between text-white border-b border-white/5 pb-2">
                                                <span className="flex gap-2"><span className="text-yellow-500">1ST</span> ALX_99</span>
                                                <span className="text-primary font-bold">99,420</span>
                                            </div>
                                            <div className="flex justify-between text-white/70 border-b border-white/5 pb-2">
                                                <span className="flex gap-2"><span className="text-slate-500">2ND</span> DEV_OPS</span>
                                                <span className="text-primary/70">88,100</span>
                                            </div>
                                            <div className="flex justify-between text-white/50">
                                                <span className="flex gap-2"><span className="text-slate-700">3RD</span> NULL_PT</span>
                                                <span className="text-primary/50">72,500</span>
                                            </div>
                                        </div>

                                        <div className="mt-auto pt-4 border-t border-white/10 text-center">
                                            <span className="font-mono text-[9px] text-slate-500 animate-pulse tracking-widest uppercase items-center flex justify-center gap-2">
                                                <div className="w-1 h-1 bg-yellow-500" /> Connecting to Global_Net <div className="w-1 h-1 bg-yellow-500" />
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </div>
            </div>

            <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
        </>
    );
}
