'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/lib/firebase/auth';
import { Loader2, Lock } from 'lucide-react';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole?: UserRole;
    fallback?: React.ReactNode;
    loadingFallback?: React.ReactNode;
}

/**
 * Wrapper component for protected routes
 * Checks authentication and optionally role-based access
 */
export function ProtectedRoute({
    children,
    requiredRole = 'player',
    fallback,
    loadingFallback,
}: ProtectedRouteProps) {
    const { user, profile, loading } = useAuth();

    // Loading state
    if (loading) {
        if (loadingFallback) return <>{loadingFallback}</>;

        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 text-gray-500 animate-spin mx-auto mb-4" />
                    <p className="text-gray-400">Loading...</p>
                </div>
            </div>
        );
    }

    // Not authenticated
    if (!user) {
        if (fallback) return <>{fallback}</>;

        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center max-w-md mx-auto px-4">
                    <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock className="w-8 h-8 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                        Sign In Required
                    </h2>
                    <p className="text-gray-400">
                        Please sign in to access this content and track your gaming progress.
                    </p>
                </div>
            </div>
        );
    }

    // Check role-based access
    const roleHierarchy: Record<UserRole, number> = {
        admin: 3,
        player: 2,
        guest: 1,
    };

    const userRoleLevel = profile ? roleHierarchy[profile.role] : 0;
    const requiredRoleLevel = roleHierarchy[requiredRole];

    if (userRoleLevel < requiredRoleLevel) {
        if (fallback) return <>{fallback}</>;

        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center max-w-md mx-auto px-4">
                    <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock className="w-8 h-8 text-red-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                        Access Denied
                    </h2>
                    <p className="text-gray-400">
                        You don&apos;t have permission to access this page. Required role: <span className="text-violet-400 capitalize">{requiredRole}</span>
                    </p>
                </div>
            </div>
        );
    }

    // All checks passed
    return <>{children}</>;
}
