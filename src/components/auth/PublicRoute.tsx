'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface PublicRouteProps {
    children: React.ReactNode;
}

/**
 * Wrapper component for public-only routes (like Login/Signup)
 * Redirects authenticated users to the home page or profile
 */
export function PublicRoute({ children }: PublicRouteProps) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && user) {
            router.push('/'); // Redirect logged-in users to home
        }
    }, [user, loading, router]);

    // Loading state
    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 text-gray-500 animate-spin mx-auto mb-4" />
                    <p className="text-gray-400">Loading...</p>
                </div>
            </div>
        );
    }

    // If already logged in, show nothing (while redirecting)
    if (user) {
        return null;
    }

    // Not authenticated, allow viewing children
    return <>{children}</>;
}
