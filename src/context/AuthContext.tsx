'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import {
    UserProfile,
    UserRole,
    getUserProfile,
    signUpWithEmail,
    signInWithEmail,
    signInWithGoogle,
    signOut as firebaseSignOut,
    resetPassword,
    hasRole,
    updateDisplayName as firebaseUpdateDisplayName,
} from '@/lib/firebase/auth';

interface AuthContextType {
    user: User | null;
    profile: UserProfile | null;
    loading: boolean;
    error: string | null;
    // Auth methods
    signUp: (email: string, password: string, displayName?: string) => Promise<void>;
    signIn: (email: string, password: string) => Promise<void>;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
    updateDisplayName: (newName: string) => Promise<void>;
    // RBAC helpers
    checkRole: (requiredRole: UserRole) => Promise<boolean>;
    isAdmin: boolean;
    isPlayer: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Listen for auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser);

            if (firebaseUser) {
                // Fetch user profile from Firestore
                const userProfile = await getUserProfile(firebaseUser.uid);
                setProfile(userProfile);
            } else {
                setProfile(null);
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Auth methods with error handling
    const handleSignUp = async (email: string, password: string, displayName?: string) => {
        try {
            setError(null);
            setLoading(true);
            await signUpWithEmail(email, password, displayName);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Sign up failed');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const handleSignIn = async (email: string, password: string) => {
        try {
            setError(null);
            setLoading(true);
            await signInWithEmail(email, password);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Sign in failed');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            setError(null);
            setLoading(true);
            await signInWithGoogle();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Google sign in failed');
            throw err;
        } finally {
            setLoading(false);
        }
    };



    const handleSignOut = async () => {
        try {
            setError(null);
            await firebaseSignOut();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Sign out failed');
            throw err;
        }
    };

    const handleResetPassword = async (email: string) => {
        try {
            setError(null);
            await resetPassword(email);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Password reset failed');
            throw err;
        }
    };

    const checkRole = async (requiredRole: UserRole): Promise<boolean> => {
        if (!user) return false;
        return hasRole(user.uid, requiredRole);
    };

    const handleUpdateDisplayName = async (newName: string) => {
        try {
            setError(null);
            await firebaseUpdateDisplayName(newName);
            // Refresh profile
            if (user) {
                const updatedProfile = await getUserProfile(user.uid);
                setProfile(updatedProfile);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update display name');
            throw err;
        }
    };

    const value: AuthContextType = {
        user,
        profile,
        loading,
        error,
        signUp: handleSignUp,
        signIn: handleSignIn,
        signInWithGoogle: handleGoogleSignIn,
        signOut: handleSignOut,
        resetPassword: handleResetPassword,
        updateDisplayName: handleUpdateDisplayName,
        checkRole,
        isAdmin: profile?.role === 'admin',
        isPlayer: profile?.role === 'player' || profile?.role === 'admin',
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
