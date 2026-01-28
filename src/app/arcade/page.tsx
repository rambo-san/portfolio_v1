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
            <div className="min-h-screen pt-12 pb-12 px-4">
                <div className="container mx-auto">
                    <header className="mb-16 text-center">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="inline-flex items-center justify-center p-6 rounded-full bg-primary/10 mb-8 border border-primary/20 shadow-[0_0_50px_rgba(var(--primary-rgb),0.2)]"
                        >
                            <Gamepad2 size={64} className="text-primary" />
                        </motion.div>
                        <h1 className="text-4xl md:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary via-white to-primary/80 mb-6">
                            Engineering Arcade
                        </h1>
                        <p className="text-slate-400 max-w-2xl mx-auto text-lg">
                            Test your reflexes and problem-solving skills. These simulations demonstrate distinct engineering skills: rendering, state management, and algorithmic thinking.
                        </p>

                        {/* Player Status */}
                        {!loading && (user || (hasGuestName && allowGuestPlay)) && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10"
                            >
                                <User size={16} className="text-primary" />
                                <span className="text-white">
                                    Playing as <span className="font-semibold text-primary">{displayName}</span>
                                </span>
                                {!user && (
                                    <button
                                        onClick={() => setShowAuthModal(true)}
                                        className="ml-2 text-xs text-gray-400 hover:text-primary transition-colors flex items-center gap-1"
                                    >
                                        <LogIn size={12} />
                                        Sign in to save scores
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
                                <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 rounded-2xl border border-gray-700/50 p-8 text-center relative overflow-hidden">
                                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
                                    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />

                                    <div className="relative z-10">
                                        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                                            <User size={32} className="text-primary" />
                                        </div>
                                        <h2 className="text-xl font-bold text-white mb-2">Welcome to the Arcade!</h2>
                                        <p className="text-gray-400 text-sm mb-6">
                                            Enter your name to get started, or sign in to save your scores.
                                        </p>

                                        <div className="space-y-3">
                                            <input
                                                type="text"
                                                value={nameInput}
                                                onChange={(e) => setNameInput(e.target.value)}
                                                onKeyDown={(e) => e.key === "Enter" && handleSetGuestName()}
                                                placeholder="Enter your name"
                                                className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-center"
                                                autoFocus
                                            />
                                            <Button
                                                onClick={handleSetGuestName}
                                                disabled={nameInput.trim().length < 2}
                                                className="w-full"
                                            >
                                                Play as Guest
                                            </Button>

                                            <div className="flex items-center gap-4 my-4">
                                                <div className="flex-1 h-px bg-gray-700" />
                                                <span className="text-gray-500 text-xs">or</span>
                                                <div className="flex-1 h-px bg-gray-700" />
                                            </div>

                                            <Button
                                                variant="outline"
                                                onClick={() => setShowAuthModal(true)}
                                                className="w-full"
                                            >
                                                <LogIn size={18} />
                                                Sign in with Google
                                            </Button>
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
                            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
                        >
                            {games.map((game, i) => (
                                <motion.div
                                    key={game.id}
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: i * 0.1 }}
                                    className={`rounded-3xl bg-white/5 border border-white/10 p-8 flex flex-col ${game.status !== "Active" ? "opacity-50 grayscale" : "hover:bg-white/10 hover:border-primary/50 hover:shadow-[0_0_30px_rgba(var(--primary-rgb),0.15)]"} transition-all duration-300 group overflow-hidden relative`}
                                >
                                    {/* RBAC Lockdown Check */}
                                    {(() => {
                                        const config = gameConfigs[game.id];
                                        if (!config) return null;

                                        const userRole = profile?.role || 'guest';
                                        const allowedRoles = config.allowedRoles || ['player', 'admin']; // Default
                                        const isAllowed = allowedRoles.includes(userRole) || userRole === 'admin';

                                        if (!isAllowed) {
                                            return (
                                                <div className="absolute inset-0 z-20 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
                                                    <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
                                                        <Lock className="text-red-500" size={32} />
                                                    </div>
                                                    <h4 className="text-xl font-bold text-white mb-2">Access Restricted</h4>
                                                    <p className="text-gray-400 text-sm mb-4">
                                                        This game is only available for: <br />
                                                        <span className="text-primary font-medium">{allowedRoles.join(', ')}</span>
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        Your current role: <span className="capitalize">{userRole}</span>
                                                    </p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    })()}

                                    <div className="flex justify-between items-start mb-6">
                                        <div
                                            className={`px-3 py-1 rounded-full text-xs font-mono border ${game.difficulty === "Hard"
                                                ? "border-red-500/50 text-red-400 bg-red-500/10"
                                                : game.difficulty === "Medium"
                                                    ? "border-orange-500/50 text-orange-400 bg-orange-500/10"
                                                    : "border-green-500/50 text-green-400 bg-green-500/10"
                                                }`}
                                        >
                                            {game.difficulty}
                                        </div>
                                        {game.status === "Active" && <Flame className="text-primary animate-pulse" size={24} />}
                                    </div>

                                    <h3 className="text-2xl font-bold mb-3 text-white group-hover:text-primary transition-colors">{game.title}</h3>
                                    <p className="text-slate-400 text-sm mb-8 flex-1 leading-relaxed">{game.description}</p>

                                    <div className="mt-auto">
                                        {game.status === "Active" ? (
                                            <Link href={`/arcade/${game.id}`} className="block">
                                                <Button className="w-full py-6 text-lg font-bold">
                                                    PLAY NOW
                                                </Button>
                                            </Link>
                                        ) : (
                                            <Button disabled variant="outline" className="w-full py-6 text-lg font-bold opacity-50">
                                                COMING SOON
                                            </Button>
                                        )}
                                    </div>
                                </motion.div>
                            ))}

                            {/* Leaderboard Teaser */}
                            {showLeaderboard && (
                                <div className="rounded-3xl bg-gradient-to-br from-primary/10 to-black border border-primary/20 p-8 flex flex-col justify-center items-center text-center relative overflow-hidden">
                                    <div className="absolute inset-0 bg-primary/5 animate-pulse rounded-3xl" />
                                    <Trophy size={56} className="text-yellow-500 mb-6 relative z-10 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]" />
                                    <h3 className="text-xl font-bold mb-2 relative z-10">Global Leaderboard</h3>
                                    <p className="text-slate-400 text-sm mb-6 relative z-10">Compete with other players for the high score.</p>
                                    <div className="w-full bg-black/40 border border-white/5 rounded-xl p-4 relative z-10 backdrop-blur-sm">
                                        <div className="flex justify-between text-xs text-slate-500 mb-3 tracking-widest">
                                            <span>RANK</span>
                                            <span>SCORE</span>
                                        </div>
                                        <div className="flex justify-between text-sm font-mono text-white mb-2 border-b border-white/5 pb-2">
                                            <span>1. ALX_99</span>
                                            <span className="text-primary">99,420</span>
                                        </div>
                                        <div className="flex justify-between text-sm font-mono text-white/60">
                                            <span>2. DEV_OPS</span>
                                            <span className="text-primary">88,100</span>
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
