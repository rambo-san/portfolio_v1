"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gamepad2, Trophy, Flame, Bird, User, LogIn } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useGuestName } from "@/context/GuestNameContext";
import { AuthModal } from "@/components/auth/AuthModal";

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
    const { user, loading } = useAuth();
    const { guestName, setGuestName, hasGuestName } = useGuestName();
    const [nameInput, setNameInput] = useState("");
    const [showAuthModal, setShowAuthModal] = useState(false);

    // Show guest name prompt only if not logged in and no guest name set
    const showGuestNamePrompt = !loading && !user && !hasGuestName;

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
                            className="inline-flex items-center justify-center p-6 rounded-full bg-red-500/10 mb-8 border border-red-500/20 shadow-[0_0_50px_rgba(220,38,38,0.2)]"
                        >
                            <Gamepad2 size={64} className="text-red-500" />
                        </motion.div>
                        <h1 className="text-5xl md:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-white to-red-400 mb-6">
                            Engineering Arcade
                        </h1>
                        <p className="text-slate-400 max-w-2xl mx-auto text-lg">
                            Test your reflexes and problem-solving skills. These simulations demonstrate distinct engineering skills: rendering, state management, and algorithmic thinking.
                        </p>

                        {/* Player Status */}
                        {!loading && (user || hasGuestName) && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10"
                            >
                                <User size={16} className="text-violet-400" />
                                <span className="text-white">
                                    Playing as <span className="font-semibold text-violet-400">{displayName}</span>
                                </span>
                                {!user && (
                                    <button
                                        onClick={() => setShowAuthModal(true)}
                                        className="ml-2 text-xs text-gray-400 hover:text-violet-400 transition-colors flex items-center gap-1"
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
                                    {/* Decorative orbs */}
                                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-violet-500/20 rounded-full blur-3xl" />
                                    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-red-500/20 rounded-full blur-3xl" />

                                    <div className="relative z-10">
                                        <div className="w-16 h-16 rounded-full bg-violet-500/20 flex items-center justify-center mx-auto mb-4">
                                            <User size={32} className="text-violet-400" />
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
                                                className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 text-center"
                                                autoFocus
                                            />
                                            <button
                                                onClick={handleSetGuestName}
                                                disabled={nameInput.trim().length < 2}
                                                className="w-full py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Play as Guest
                                            </button>

                                            <div className="flex items-center gap-4 my-4">
                                                <div className="flex-1 h-px bg-gray-700" />
                                                <span className="text-gray-500 text-xs">or</span>
                                                <div className="flex-1 h-px bg-gray-700" />
                                            </div>

                                            <button
                                                onClick={() => setShowAuthModal(true)}
                                                className="w-full py-3 bg-white/5 hover:bg-white/10 border border-gray-700 text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2"
                                            >
                                                <LogIn size={18} />
                                                Sign in with Google
                                            </button>
                                            <p className="text-gray-500 text-xs">
                                                Sign in to save your scores to the leaderboard
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Games Grid - only show when user has a name or is logged in */}
                    {(user || hasGuestName) && (
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
                                    className={`rounded-3xl bg-white/5 border border-white/10 p-8 flex flex-col ${game.status !== "Active" ? "opacity-50 grayscale" : "hover:bg-white/10 hover:border-red-500/50 hover:shadow-[0_0_30px_rgba(220,38,38,0.15)]"} transition-all duration-300 group`}
                                >
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
                                        {game.status === "Active" && <Flame className="text-red-500 animate-pulse" size={24} />}
                                    </div>

                                    <h3 className="text-2xl font-bold mb-3 text-white group-hover:text-red-400 transition-colors">{game.title}</h3>
                                    <p className="text-slate-400 text-sm mb-8 flex-1 leading-relaxed">{game.description}</p>

                                    <div className="mt-auto">
                                        {game.status === "Active" ? (
                                            <Link
                                                href={`/arcade/${game.id}`}
                                                className="block w-full py-4 bg-red-700 hover:bg-red-600 text-white font-bold text-center rounded-xl transition-all shadow-lg shadow-red-900/40 active:scale-95"
                                            >
                                                PLAY NOW
                                            </Link>
                                        ) : (
                                            <button disabled className="block w-full py-4 bg-white/5 text-white/20 font-bold text-center rounded-xl cursor-not-allowed border border-white/5">
                                                COMING SOON
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            ))}

                            {/* Leaderboard Teaser */}
                            <div className="rounded-3xl bg-gradient-to-br from-red-900/20 to-black border border-red-500/20 p-8 flex flex-col justify-center items-center text-center relative overflow-hidden">
                                <div className="absolute inset-0 bg-red-500/5 animate-pulse rounded-3xl" />
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
                                        <span className="text-red-500">99,420</span>
                                    </div>
                                    <div className="flex justify-between text-sm font-mono text-white/60">
                                        <span>2. DEV_OPS</span>
                                        <span className="text-red-500">88,100</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Auth Modal */}
            <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
        </>
    );
}
