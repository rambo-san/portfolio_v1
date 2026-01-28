'use client';

import { PublicRoute } from '@/components/auth/PublicRoute';
import { AuthModal } from '@/components/auth/AuthModal';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
    const router = useRouter();

    return (
        <PublicRoute>
            <div className="min-h-screen flex items-center justify-center bg-black">
                <AuthModal isOpen={true} onClose={() => router.push('/')} initialMode="signup" />
            </div>
        </PublicRoute>
    );
}
