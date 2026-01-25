'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { X, Mail, Lock, User, Loader2, Eye, EyeOff, AlertCircle } from 'lucide-react';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type AuthMode = 'login' | 'signup' | 'reset';

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
    const [mode, setMode] = useState<AuthMode>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [localError, setLocalError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { signIn, signUp, signInWithGoogle, resetPassword, error } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError(null);
        setSuccessMessage(null);
        setIsSubmitting(true);

        try {
            if (mode === 'login') {
                await signIn(email, password);
                onClose();
            } else if (mode === 'signup') {
                await signUp(email, password, displayName);
                onClose();
            } else if (mode === 'reset') {
                await resetPassword(email);
                setSuccessMessage('Password reset email sent! Check your inbox.');
            }
        } catch (err) {
            setLocalError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGoogleLogin = async () => {
        setLocalError(null);
        setIsSubmitting(true);

        try {
            await signInWithGoogle();
            onClose();
        } catch (err) {
            setLocalError(err instanceof Error ? err.message : 'Google login failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setEmail('');
        setPassword('');
        setDisplayName('');
        setLocalError(null);
        setSuccessMessage(null);
    };

    const switchMode = (newMode: AuthMode) => {
        resetForm();
        setMode(newMode);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="relative w-full max-w-md bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 rounded-2xl shadow-2xl border border-gray-700/50 overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Decorative gradient orb */}
                    <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-violet-500/30 to-fuchsia-500/30 rounded-full blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-br from-cyan-500/30 to-blue-500/30 rounded-full blur-3xl" />

                    {/* Header */}
                    <div className="relative px-8 pt-8 pb-4">
                        <button
                            onClick={onClose}
                            className="absolute right-4 top-4 p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <h2 className="text-2xl font-bold text-white">
                            {mode === 'login' && 'Welcome Back'}
                            {mode === 'signup' && 'Create Account'}
                            {mode === 'reset' && 'Reset Password'}
                        </h2>
                        <p className="text-gray-400 mt-1">
                            {mode === 'login' && 'Sign in to track your game scores'}
                            {mode === 'signup' && 'Join to save your gaming progress'}
                            {mode === 'reset' && "We'll send you a reset link"}
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="relative px-8 pb-8 space-y-4">
                        {/* Error/Success Messages */}
                        {(localError || error) && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm"
                            >
                                <AlertCircle size={16} />
                                {localError || error}
                            </motion.div>
                        )}

                        {successMessage && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm"
                            >
                                {successMessage}
                            </motion.div>
                        )}

                        {/* Display Name (signup only) */}
                        {mode === 'signup' && (
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    placeholder="Display Name"
                                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
                                />
                            </div>
                        )}

                        {/* Email */}
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email address"
                                required
                                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
                            />
                        </div>

                        {/* Password */}
                        {mode !== 'reset' && (
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Password"
                                    required
                                    minLength={6}
                                    className="w-full pl-10 pr-12 py-3 bg-white/5 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        )}

                        {/* Forgot Password link */}
                        {mode === 'login' && (
                            <button
                                type="button"
                                onClick={() => switchMode('reset')}
                                className="text-sm text-violet-400 hover:text-violet-300 transition-colors"
                            >
                                Forgot password?
                            </button>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-3 px-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold rounded-xl shadow-lg shadow-violet-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <>
                                    {mode === 'login' && 'Sign In'}
                                    {mode === 'signup' && 'Create Account'}
                                    {mode === 'reset' && 'Send Reset Link'}
                                </>
                            )}
                        </button>

                        {/* Divider */}
                        {mode !== 'reset' && (
                            <div className="flex items-center gap-4 my-6">
                                <div className="flex-1 h-px bg-gray-700" />
                                <span className="text-gray-500 text-sm">or continue with</span>
                                <div className="flex-1 h-px bg-gray-700" />
                            </div>
                        )}

                        {/* Google Sign In Button */}
                        {mode !== 'reset' && (
                            <button
                                type="button"
                                onClick={handleGoogleLogin}
                                disabled={isSubmitting}
                                className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white/5 hover:bg-white/10 border border-gray-700 rounded-xl text-white font-medium transition-all disabled:opacity-50"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path
                                        fill="#4285F4"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                        fill="#34A853"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="#FBBC05"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    />
                                    <path
                                        fill="#EA4335"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    />
                                </svg>
                                Continue with Google
                            </button>
                        )}

                        {/* Mode Switch */}
                        <div className="text-center text-gray-400 text-sm pt-4">
                            {mode === 'login' && (
                                <>
                                    Don&apos;t have an account?{' '}
                                    <button
                                        type="button"
                                        onClick={() => switchMode('signup')}
                                        className="text-violet-400 hover:text-violet-300 font-medium transition-colors"
                                    >
                                        Sign up
                                    </button>
                                </>
                            )}
                            {mode === 'signup' && (
                                <>
                                    Already have an account?{' '}
                                    <button
                                        type="button"
                                        onClick={() => switchMode('login')}
                                        className="text-violet-400 hover:text-violet-300 font-medium transition-colors"
                                    >
                                        Sign in
                                    </button>
                                </>
                            )}
                            {mode === 'reset' && (
                                <button
                                    type="button"
                                    onClick={() => switchMode('login')}
                                    className="text-violet-400 hover:text-violet-300 font-medium transition-colors"
                                >
                                    Back to sign in
                                </button>
                            )}
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
