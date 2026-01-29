'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { X, Mail, Lock, User, Loader2, Eye, EyeOff, AlertCircle } from 'lucide-react';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialMode?: AuthMode;
}

type AuthMode = 'login' | 'signup' | 'reset';

export function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
    const [mode, setMode] = useState<AuthMode>(initialMode);
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
                    className="relative w-full max-w-md bg-[#0a0a0a] border-4 border-primary shadow-[15px_15px_0px_rgba(0,0,0,0.5)] pixel-corners overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Retro Grid Background */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_center,var(--primary)_1px,transparent_1px)] bg-[size:20px_20px]" />

                    {/* Header */}
                    <div className="relative px-8 pt-10 pb-6 border-b-2 border-primary/20 bg-primary/5">
                        <button
                            onClick={onClose}
                            className="absolute right-4 top-4 p-1 border-2 border-primary/20 text-primary hover:bg-primary hover:text-black transition-all pixel-corners"
                        >
                            <X size={18} />
                        </button>

                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-3 h-3 bg-primary animate-pulse" />
                            <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic">
                                {mode === 'login' && 'AUTH://LOGIN'}
                                {mode === 'signup' && 'AUTH://SIGNUP'}
                                {mode === 'reset' && 'AUTH://RECOVERY'}
                            </h2>
                        </div>
                        <p className="text-[10px] font-mono text-primary/60 uppercase tracking-widest">
                            {mode === 'login' && 'Verification mode: active'}
                            {mode === 'signup' && 'New operator enrollment'}
                            {mode === 'reset' && "Initiating credential recovery"}
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="relative px-8 py-8 space-y-5">
                        {/* Error/Success Messages */}
                        {(localError || error) && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-center gap-3 p-4 bg-red-500/10 border-2 border-red-500 text-red-500 font-mono text-[10px] uppercase italic font-bold pixel-corners crt-flicker"
                            >
                                <AlertCircle size={16} />
                                ERROR: {localError || error}
                            </motion.div>
                        )}

                        {successMessage && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-center gap-3 p-4 bg-green-500/10 border-2 border-green-500 text-green-500 font-mono text-[10px] uppercase italic font-bold pixel-corners"
                            >
                                SUCCESS: {successMessage}
                            </motion.div>
                        )}

                        {/* Display Name (signup only) */}
                        {mode === 'signup' && (
                            <div className="relative group">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/60 group-focus-within:text-primary transition-colors" size={18} />
                                <input
                                    type="text"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    placeholder="Enter operator name..."
                                    className="w-full pl-10 pr-4 py-4 bg-black border-2 border-primary/30 text-white font-mono text-xs placeholder:text-white/20 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all pixel-corners"
                                />
                            </div>
                        )}

                        {/* Email */}
                        <div className="relative group">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/60 group-focus-within:text-primary transition-colors" size={18} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter email address..."
                                required
                                className="w-full pl-10 pr-4 py-4 bg-black border-2 border-primary/30 text-white font-mono text-xs placeholder:text-white/20 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all pixel-corners"
                            />
                        </div>

                        {/* Password */}
                        {mode !== 'reset' && (
                            <div className="relative group">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/60 group-focus-within:text-primary transition-colors" size={18} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter access key..."
                                    required
                                    minLength={6}
                                    className="w-full pl-10 pr-12 py-4 bg-black border-2 border-primary/30 text-white font-mono text-xs placeholder:text-white/20 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all pixel-corners"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-primary/60 hover:text-primary transition-colors"
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
                                className="text-[10px] font-mono text-primary/80 hover:text-primary hover:underline uppercase tracking-tighter"
                            >
                                [ LOST_PASSWORD? ]
                            </button>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-4 px-4 bg-primary text-black font-black uppercase tracking-[0.2em] pixel-corners shadow-[6px_6px_0px_rgba(var(--primary-rgb),0.3)] hover:bg-white transition-all disabled:opacity-30 disabled:cursor-not-allowed group active:translate-y-[2px] active:translate-x-[2px] active:shadow-none"
                        >
                            {isSubmitting ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <>
                                    {mode === 'login' && 'EXECUTE_LOGIN'}
                                    {mode === 'signup' && 'INITIALIZE_ACCOUNT'}
                                    {mode === 'reset' && 'PROCESS_RECOVERY'}
                                </>
                            )}
                        </button>

                        {/* Divider */}
                        {mode !== 'reset' && (
                            <div className="flex items-center gap-4 my-8">
                                <div className="flex-1 h-[1px] bg-primary/30" />
                                <span className="text-[9px] font-mono text-primary/60 uppercase tracking-widest leading-none">External_Relay</span>
                                <div className="flex-1 h-[1px] bg-primary/30" />
                            </div>
                        )}

                        {/* Google Sign In Button */}
                        {mode !== 'reset' && (
                            <button
                                type="button"
                                onClick={handleGoogleLogin}
                                disabled={isSubmitting}
                                className="w-full flex items-center justify-center gap-3 py-4 px-4 bg-black border-2 border-primary/30 text-white font-black text-xs uppercase tracking-widest pixel-corners hover:bg-primary/10 hover:border-primary transition-all disabled:opacity-30"
                            >
                                <svg className="w-5 h-5 opacity-70 contrast-125" viewBox="0 0 24 24">
                                    <path
                                        fill="currentColor"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    />
                                </svg>
                                Relay_G_Net
                            </button>
                        )}

                        {/* Mode Switch */}
                        <div className="text-center pt-4">
                            {mode === 'login' && (
                                <p className="text-[10px] font-mono text-primary/40 uppercase">
                                    No profile found?{' '}
                                    <button
                                        type="button"
                                        onClick={() => switchMode('signup')}
                                        className="text-primary hover:text-white font-bold underline underline-offset-4 transition-colors"
                                    >
                                        [ REGISTER_NEW ]
                                    </button>
                                </p>
                            )}
                            {mode === 'signup' && (
                                <p className="text-[10px] font-mono text-primary/40 uppercase">
                                    Existing operator?{' '}
                                    <button
                                        type="button"
                                        onClick={() => switchMode('login')}
                                        className="text-primary hover:text-white font-bold underline underline-offset-4 transition-colors"
                                    >
                                        [ LOGIN_SYSTEM ]
                                    </button>
                                </p>
                            )}
                            {mode === 'reset' && (
                                <button
                                    type="button"
                                    onClick={() => switchMode('login')}
                                    className="text-[10px] font-mono text-primary hover:text-white font-bold underline underline-offset-4 transition-colors uppercase"
                                >
                                    [ RETURN_TO_LOGIN ]
                                </button>
                            )}
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
