'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { LogOut, User, Trophy, Settings, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

import Link from 'next/link';

interface UserMenuProps {
    onOpenAuth: () => void;
}

export function UserMenu({ onOpenAuth }: UserMenuProps) {
    const { user, profile, signOut, loading } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSignOut = async () => {
        await signOut();
        setIsOpen(false);
    };

    if (loading) {
        return (
            <div className="w-10 h-10 rounded-full bg-gray-700 animate-pulse" />
        );
    }

    if (!user) {
        return (
            <button
                onClick={onOpenAuth}
                className="px-4 py-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-medium rounded-lg shadow-lg shadow-violet-500/25 transition-all"
            >
                Sign In
            </button>
        );
    }

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 p-1 pr-3 rounded-full bg-white/5 hover:bg-white/10 border border-gray-700/50 transition-all"
            >
                {user.photoURL ? (
                    <img
                        src={user.photoURL}
                        alt={user.displayName || 'User'}
                        className="w-8 h-8 rounded-full object-cover"
                    />
                ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-semibold text-sm">
                        {(user.displayName || user.email || 'U')[0].toUpperCase()}
                    </div>
                )}
                <span className="text-white text-sm font-medium hidden sm:block max-w-[100px] truncate">
                    {user.displayName || 'Player'}
                </span>
                <ChevronDown
                    size={16}
                    className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-56 bg-gray-900 border border-gray-700/50 rounded-xl shadow-xl overflow-hidden z-50"
                >
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-700/50">
                        <p className="text-white font-medium truncate">
                            {user.displayName || 'Player'}
                        </p>
                        <p className="text-gray-400 text-sm truncate">{user.email}</p>
                        {profile && (
                            <span className="inline-block mt-2 px-2 py-0.5 text-xs font-medium rounded-full bg-violet-500/20 text-violet-400 capitalize">
                                {profile.role}
                            </span>
                        )}
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                        <Link
                            href="/profile"
                            onClick={() => setIsOpen(false)}
                            className="w-full px-4 py-2 text-left text-gray-300 hover:text-white hover:bg-white/5 flex items-center gap-3 transition-colors"
                        >
                            <User size={18} />
                            Profile
                        </Link>
                        {/* 
                        <button
                            onClick={() => setIsOpen(false)}
                            className="w-full px-4 py-2 text-left text-gray-300 hover:text-white hover:bg-white/5 flex items-center gap-3 transition-colors"
                        >
                            <Trophy size={18} />
                            My Scores
                        </button> 
                        */}
                        {profile?.role === 'admin' && (
                            <Link
                                href="/admin"
                                onClick={() => setIsOpen(false)}
                                className="w-full px-4 py-2 text-left text-gray-300 hover:text-white hover:bg-white/5 flex items-center gap-3 transition-colors"
                            >
                                <Settings size={18} />
                                Admin Panel
                            </Link>
                        )}
                    </div>

                    {/* Sign Out */}
                    <div className="border-t border-gray-700/50 py-2">
                        <button
                            onClick={handleSignOut}
                            className="w-full px-4 py-2 text-left text-red-400 hover:text-red-300 hover:bg-red-500/10 flex items-center gap-3 transition-colors"
                        >
                            <LogOut size={18} />
                            Sign Out
                        </button>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
