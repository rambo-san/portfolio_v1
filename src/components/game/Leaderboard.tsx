'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Crown, User } from 'lucide-react';
import { useGameData } from '@/hooks/useGameData';
import { useAuth } from '@/context/AuthContext';
import { LeaderboardEntry } from '@/lib/firebase/firestore';

interface LeaderboardProps {
    gameId: string;
    gameName: string;
    limit?: number;
}

export function Leaderboard({ gameId, gameName, limit = 10 }: LeaderboardProps) {
    const { user } = useAuth();
    const { getLeaderboard, getRank, isLoading } = useGameData();
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [userRank, setUserRank] = useState<number | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            const leaderboardData = await getLeaderboard(gameId, limit);
            setEntries(leaderboardData);

            if (user) {
                const rank = await getRank(gameId);
                setUserRank(rank);
            }
        };

        fetchData();
    }, [gameId, limit, getLeaderboard, getRank, user]);

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1:
                return <Crown className="w-5 h-5 text-yellow-400" />;
            case 2:
                return <Medal className="w-5 h-5 text-gray-300" />;
            case 3:
                return <Medal className="w-5 h-5 text-amber-600" />;
            default:
                return <span className="text-gray-400 font-mono text-sm">{rank}</span>;
        }
    };

    const getRankBackground = (rank: number) => {
        switch (rank) {
            case 1:
                return 'bg-gradient-to-r from-yellow-500/20 to-amber-500/10 border-yellow-500/30';
            case 2:
                return 'bg-gradient-to-r from-gray-400/20 to-gray-500/10 border-gray-400/30';
            case 3:
                return 'bg-gradient-to-r from-amber-600/20 to-orange-600/10 border-amber-600/30';
            default:
                return 'bg-white/5 border-white/10';
        }
    };

    return (
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-700/50 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-white">{gameName} Leaderboard</h3>
                    <p className="text-gray-400 text-sm">Top {limit} players</p>
                </div>
            </div>

            {/* Leaderboard List */}
            <div className="p-4 space-y-2">
                {isLoading ? (
                    <div className="py-8 text-center text-gray-400">
                        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                        Loading leaderboard...
                    </div>
                ) : entries.length === 0 ? (
                    <div className="py-8 text-center text-gray-400">
                        <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p>No scores yet. Be the first!</p>
                    </div>
                ) : (
                    entries.map((entry, index) => {
                        const rank = index + 1;
                        const isCurrentUser = user?.uid === entry.userId;

                        return (
                            <motion.div
                                key={`${entry.userId}-${index}`}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className={`flex items-center gap-4 p-3 rounded-xl border transition-all ${getRankBackground(rank)} ${isCurrentUser ? 'ring-2 ring-violet-500/50' : ''
                                    }`}
                            >
                                {/* Rank */}
                                <div className="w-8 flex justify-center">{getRankIcon(rank)}</div>

                                {/* Avatar */}
                                {entry.photoURL ? (
                                    <img
                                        src={entry.photoURL}
                                        alt={entry.displayName}
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-semibold">
                                        {entry.displayName[0]?.toUpperCase() || <User size={18} />}
                                    </div>
                                )}

                                {/* Name */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-white font-medium truncate">
                                        {entry.displayName}
                                        {isCurrentUser && (
                                            <span className="ml-2 text-xs text-violet-400">(You)</span>
                                        )}
                                    </p>
                                </div>

                                {/* Score */}
                                <div className="text-right">
                                    <p className="text-white font-bold text-lg">
                                        {entry.score.toLocaleString()}
                                    </p>
                                </div>
                            </motion.div>
                        );
                    })
                )}
            </div>

            {/* User's Rank (if not in top list) */}
            {user && userRank && userRank > limit && (
                <div className="px-4 pb-4">
                    <div className="border-t border-gray-700/50 pt-4">
                        <div className="flex items-center gap-4 p-3 rounded-xl bg-violet-500/10 border border-violet-500/30">
                            <div className="w-8 text-center text-violet-400 font-mono text-sm">
                                {userRank}
                            </div>
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-semibold text-sm">
                                {(user.displayName || 'Y')[0].toUpperCase()}
                            </div>
                            <div className="flex-1">
                                <p className="text-white font-medium">Your Rank</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
