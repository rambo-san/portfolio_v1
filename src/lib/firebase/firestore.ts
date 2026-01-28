import {
    collection,
    doc,
    addDoc,
    getDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    serverTimestamp,
    Timestamp,
    DocumentData,
    QueryConstraint,
} from 'firebase/firestore';
import { db } from './config';

// ==================== GAME HISTORY ====================

export interface GameSession {
    id?: string;
    userId: string;
    displayName: string; // Added for leaderboard display
    photoURL?: string;   // Added
    gameId: string;
    gameName: string;
    score: number;
    duration: number; // in seconds
    completedAt: Date | Timestamp;
    metadata?: Record<string, unknown>; // game-specific data
}

// Re-using LeaderboardEntry type for frontend compatibility, but it maps from GameSession
export interface LeaderboardEntry {
    userId: string;
    displayName: string;
    photoURL?: string;
    score: number;
    gameId: string;
    achievedAt: Date | Timestamp;
}

/**
 * Save a game session
 */
export async function saveGameSession(
    userId: string,
    displayName: string,
    photoURL: string | null,
    gameId: string,
    gameName: string,
    score: number,
    duration: number,
    metadata?: Record<string, unknown>
): Promise<string> {
    const sessionsRef = collection(db, 'gameSessions');
    const docRef = await addDoc(sessionsRef, {
        userId,
        displayName,
        photoURL,
        gameId,
        gameName,
        score,
        duration,
        completedAt: serverTimestamp(),
        metadata: metadata || {},
    });
    return docRef.id;
}

/**
 * Get user's game history
 */
export async function getUserGameHistory(
    userId: string,
    gameId?: string,
    limitCount: number = 10
): Promise<GameSession[]> {
    const sessionsRef = collection(db, 'gameSessions');

    // Simple query by userId (auto-indexed)
    const q = query(
        sessionsRef,
        where('userId', '==', userId),
        orderBy('completedAt', 'desc'),
        limit(limitCount + 20) // Fetch extra to filter in client
    );

    const snapshot = await getDocs(q);
    let sessions = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    })) as GameSession[];

    // Client-side filter for gameId if needed
    if (gameId) {
        sessions = sessions.filter(s => s.gameId === gameId);
    }

    return sessions.slice(0, limitCount);
}

/**
 * Get user's best score for a game
 */
export async function getUserBestScore(
    userId: string,
    gameId: string
): Promise<number | null> {
    const sessionsRef = collection(db, 'gameSessions');

    // Query by userId only to avoid composite index
    const q = query(
        sessionsRef,
        where('userId', '==', userId)
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;

    const sessions = snapshot.docs.map(doc => doc.data() as GameSession);

    // Filter and find max in memory
    const gameSessions = sessions.filter(s => s.gameId === gameId);
    if (gameSessions.length === 0) return null;

    return Math.max(...gameSessions.map(s => s.score));
}

// ==================== LEADERBOARD ====================

// updateLeaderboard REMOVED - redundant

/**
 * Get global leaderboard for a game directly from gameSessions
 */
export async function getLeaderboard(
    gameId: string,
    limitCount: number = 10
): Promise<LeaderboardEntry[]> {
    const sessionsRef = collection(db, 'gameSessions');

    // Query by gameId only (single field index works)
    // No orderBy here to avoid compound index requirement for now
    // If dataset grows large, we MUST add index: gameId + score DESC
    const q = query(
        sessionsRef,
        where('gameId', '==', gameId)
    );

    const snapshot = await getDocs(q);

    const sessions = snapshot.docs.map((doc) => ({
        ...doc.data(),
    })) as GameSession[];

    // Sort in memory (descending score)
    sessions.sort((a, b) => b.score - a.score);

    // Map to LeaderboardEntry format
    return sessions.slice(0, limitCount).map(s => ({
        userId: s.userId,
        displayName: s.displayName,
        photoURL: s.photoURL,
        score: s.score,
        gameId: s.gameId,
        achievedAt: s.completedAt
    }));
}

/**
 * Get user's rank on leaderboard
 */
export async function getUserRank(
    userId: string,
    gameId: string
): Promise<number | null> {
    const leaderboard = await getLeaderboard(gameId, 100);
    const index = leaderboard.findIndex((entry) => entry.userId === userId);
    return index === -1 ? null : index + 1;
}

// ==================== USER STATS ====================

export interface UserStats {
    totalGamesPlayed: number;
    totalPlayTime: number; // in seconds
    favoriteGame: string | null;
    achievements: string[];
}

/**
 * Get aggregated user statistics
 */
export async function getUserStats(userId: string): Promise<UserStats> {
    const history = await getUserGameHistory(userId, undefined, 100);

    if (history.length === 0) {
        return {
            totalGamesPlayed: 0,
            totalPlayTime: 0,
            favoriteGame: null,
            achievements: [],
        };
    }

    // Calculate stats
    const totalPlayTime = history.reduce((sum, session) => sum + session.duration, 0);

    // Find favorite game (most played)
    const gameCounts: Record<string, number> = {};
    history.forEach((session) => {
        gameCounts[session.gameName] = (gameCounts[session.gameName] || 0) + 1;
    });
    const favoriteGame = Object.entries(gameCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    return {
        totalGamesPlayed: history.length,
        totalPlayTime,
        favoriteGame,
        achievements: [], // TODO: Implement achievements system
    };
}

// ==================== ACHIEVEMENTS ====================

export interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string;
    unlockedAt?: Date | Timestamp;
}

/**
 * Award achievement to user
 */
export async function awardAchievement(
    userId: string,
    achievementId: string
): Promise<void> {
    const achievementsRef = collection(db, 'users', userId, 'achievements');
    const achievementDoc = doc(achievementsRef, achievementId);

    const existingAchievement = await getDoc(achievementDoc);
    if (!existingAchievement.exists()) {
        await updateDoc(achievementDoc, {
            unlockedAt: serverTimestamp(),
        });
    }
}

/**
 * Get user's achievements
 */
export async function getUserAchievements(userId: string): Promise<Achievement[]> {
    const achievementsRef = collection(db, 'users', userId, 'achievements');
    const snapshot = await getDocs(achievementsRef);

    return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    })) as Achievement[];
}

// ==================== GAME CONFIGURATION ====================

export interface GameConfig {
    id: string;
    name: string;
    description: string;
    enabled: boolean;
    skillIssueImage: string | null;
    congratsImage: string | null;
    thumbnailImage: string | null;
    minScoreForCongrats: number;
    allowedRoles?: string[]; // RBAC: Roles that can play this game
    createdAt: Date | Timestamp;
    updatedAt: Date | Timestamp;
}

/**
 * Get all game configurations
 */
export async function getGameConfigs(): Promise<GameConfig[]> {
    const gamesRef = collection(db, 'gameConfigs');
    const snapshot = await getDocs(gamesRef);

    return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    })) as GameConfig[];
}

/**
 * Get a specific game configuration
 */
export async function getGameConfig(gameId: string): Promise<GameConfig | null> {
    const gameRef = doc(db, 'gameConfigs', gameId);
    const snapshot = await getDoc(gameRef);

    if (!snapshot.exists()) return null;

    return {
        id: snapshot.id,
        ...snapshot.data(),
    } as GameConfig;
}

/**
 * Create or update game configuration
 */
export async function saveGameConfig(gameId: string, config: Partial<Omit<GameConfig, 'id'>>): Promise<void> {
    const gameRef = doc(db, 'gameConfigs', gameId);
    const existing = await getDoc(gameRef);

    if (existing.exists()) {
        await updateDoc(gameRef, {
            ...config,
            updatedAt: serverTimestamp(),
        });
    } else {
        const { setDoc } = await import('firebase/firestore');
        await setDoc(gameRef, {
            name: config.name || gameId,
            description: config.description || '',
            enabled: config.enabled ?? true,
            skillIssueImage: config.skillIssueImage || null,
            congratsImage: config.congratsImage || null,
            thumbnailImage: config.thumbnailImage || null,
            minScoreForCongrats: config.minScoreForCongrats || 10,
            allowedRoles: config.allowedRoles || ['player', 'admin'],
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
    }
}

/**
 * Get all users from Firestore (admin only)
 */
export async function getAllUsers(): Promise<any[]> {
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    return snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
    }));
}

/**
 * Delete all game sessions for a specific game (admin only)
 */
export async function deleteGameData(gameId: string): Promise<number> {
    const sessionsRef = collection(db, 'gameSessions');
    const q = query(sessionsRef, where('gameId', '==', gameId));
    const snapshot = await getDocs(q);

    let deletedCount = 0;
    for (const docSnapshot of snapshot.docs) {
        await deleteDoc(doc(db, 'gameSessions', docSnapshot.id));
        deletedCount++;
    }

    return deletedCount;
}

/**
 * Get game statistics
 */
export async function getGameStats(gameId: string): Promise<{ totalPlays: number; uniquePlayers: number; topScore: number | null }> {
    const sessionsRef = collection(db, 'gameSessions');
    const q = query(sessionsRef, where('gameId', '==', gameId));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
        return { totalPlays: 0, uniquePlayers: 0, topScore: null };
    }

    const sessions = snapshot.docs.map(doc => doc.data() as GameSession);
    const uniqueUsers = new Set(sessions.map(s => s.userId));
    const topScore = Math.max(...sessions.map(s => s.score));

    return {
        totalPlays: sessions.length,
        uniquePlayers: uniqueUsers.size,
        topScore,
    };
}
