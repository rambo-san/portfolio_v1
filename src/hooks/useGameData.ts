'use client';

import { useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
    saveGameSession,
    getUserGameHistory,
    getUserBestScore,
    getLeaderboard,
    getUserRank,
    getUserStats,
    GameSession,
    LeaderboardEntry,
    UserStats,
} from '@/lib/firebase/firestore';

interface UseGameDataReturn {
    // State
    isLoading: boolean;
    error: string | null;

    // Game Session Functions
    saveScore: (
        gameId: string,
        gameName: string,
        score: number,
        duration: number,
        metadata?: Record<string, unknown>
    ) => Promise<string | null>;

    getHistory: (gameId?: string, limit?: number) => Promise<GameSession[]>;
    getBestScore: (gameId: string) => Promise<number | null>;

    // Leaderboard Functions
    getLeaderboard: (gameId: string, limit?: number) => Promise<LeaderboardEntry[]>;
    getRank: (gameId: string) => Promise<number | null>;

    // Stats
    getStats: () => Promise<UserStats | null>;
}

/**
 * Custom hook for game data operations
 * Provides easy access to game history, leaderboards, and stats
 */
export function useGameData(): UseGameDataReturn {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Save a game score and update leaderboard
     */
    const saveScore = useCallback(
        async (
            gameId: string,
            gameName: string,
            score: number,
            duration: number,
            metadata?: Record<string, unknown>
        ): Promise<string | null> => {
            if (!user) {
                setError('You must be logged in to save scores');
                return null;
            }

            setIsLoading(true);
            setError(null);

            try {
                // Save game session (Leaderboard is now derived from this)
                const sessionId = await saveGameSession(
                    user.uid,
                    user.displayName || 'Anonymous',
                    user.photoURL,
                    gameId,
                    gameName,
                    score,
                    duration,
                    metadata
                );

                return sessionId;
            } catch (err) {
                console.error("Error saving score:", err); // Log full error for debugging
                const message = err instanceof Error ? err.message : 'Failed to save score';
                setError(message);
                return null;
            } finally {
                setIsLoading(false);
            }
        },
        [user]
    );

    /**
     * Get user's game history
     */
    const getHistory = useCallback(
        async (gameId?: string, limit: number = 10): Promise<GameSession[]> => {
            if (!user) {
                setError('You must be logged in to view history');
                return [];
            }

            setIsLoading(true);
            setError(null);

            try {
                return await getUserGameHistory(user.uid, gameId, limit);
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Failed to fetch history';
                setError(message);
                return [];
            } finally {
                setIsLoading(false);
            }
        },
        [user]
    );

    /**
     * Get user's best score for a game
     */
    const getBestScore = useCallback(
        async (gameId: string): Promise<number | null> => {
            if (!user) return null;

            try {
                return await getUserBestScore(user.uid, gameId);
            } catch (err) {
                console.error('Failed to get best score:', err);
                return null;
            }
        },
        [user]
    );

    /**
     * Get global leaderboard for a game
     */
    const fetchLeaderboard = useCallback(
        async (gameId: string, limit: number = 10): Promise<LeaderboardEntry[]> => {
            setIsLoading(true);
            setError(null);

            try {
                return await getLeaderboard(gameId, limit);
            } catch (err) {
                console.error("Error fetching leaderboard:", err);
                const message = err instanceof Error ? err.message : 'Failed to fetch leaderboard';
                setError(message);
                return [];
            } finally {
                setIsLoading(false);
            }
        },
        []
    );

    /**
     * Get user's rank on a game's leaderboard
     */
    const getRank = useCallback(
        async (gameId: string): Promise<number | null> => {
            if (!user) return null;

            try {
                return await getUserRank(user.uid, gameId);
            } catch (err) {
                console.error('Failed to get rank:', err);
                return null;
            }
        },
        [user]
    );

    /**
     * Get user's aggregated stats
     */
    const getStats = useCallback(async (): Promise<UserStats | null> => {
        if (!user) return null;

        setIsLoading(true);
        setError(null);

        try {
            return await getUserStats(user.uid);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to fetch stats';
            setError(message);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    return {
        isLoading,
        error,
        saveScore,
        getHistory,
        getBestScore,
        getLeaderboard: fetchLeaderboard,
        getRank,
        getStats,
    };
}
