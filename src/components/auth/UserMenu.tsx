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
                className="px-6 py-2 bg-primary text-white font-black uppercase tracking-widest pixel-corners shadow-[4px_4px_0px_rgba(var(--primary-rgb),0.3)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all text-sm"
            >
                Connect_Pulse
            </button>
        );
    }

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 p-1 pr-4 bg-black border-2 border-primary/30 pixel-corners hover:border-primary transition-all group"
            >
                {user.photoURL ? (
                    <img
                        src={user.photoURL}
                        alt={user.displayName || 'User'}
                        className="w-8 h-8 object-cover border border-primary/20"
                    />
                ) : (
                    <div className="w-8 h-8 bg-primary flex items-center justify-center text-white font-black text-xs">
                        {(user.displayName || user.email || 'U')[0].toUpperCase()}
                    </div>
                )}
                <span className="text-white text-xs font-mono uppercase tracking-wider hidden sm:block max-w-[100px] truncate">
                    {user.displayName || 'Operator'}
                </span>
                <ChevronDown
                    size={14}
                    className={`text-primary transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-3 w-64 bg-black border-2 border-primary pixel-corners shadow-[8px_8px_0px_rgba(0,0,0,0.5)] z-50 overflow-hidden"
                >
                    {/* User Info */}
                    <div className="px-5 py-4 border-b-2 border-primary/20 bg-primary/5">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            <p className="text-white font-black uppercase tracking-tighter text-sm truncate">
                                {user.displayName || 'Operator'}
                            </p>
                        </div>
                        <p className="text-primary/60 font-mono text-[10px] truncate uppercase">{user.email}</p>
                        {profile && (
                            <div className="mt-3 inline-block px-2 py-0.5 border border-primary text-[9px] font-mono text-primary uppercase bg-primary/10">
                                Rank: {profile.role}
                            </div>
                        )}
                    </div>

                    {/* Menu Items */}
                    <div className="py-2 font-mono text-xs uppercase">
                        <Link
                            href="/profile"
                            onClick={() => setIsOpen(false)}
                            className="w-full px-5 py-3 text-left text-white/70 hover:text-primary hover:bg-primary/10 flex items-center gap-3 transition-all group"
                        >
                            <User size={16} className="group-hover:scale-110 transition-transform" />
                            Access_Profile
                        </Link>

                        {profile?.role === 'admin' && (
                            <Link
                                href="/admin"
                                onClick={() => setIsOpen(false)}
                                className="w-full px-5 py-3 text-left text-white/70 hover:text-yellow-500 hover:bg-yellow-500/10 flex items-center gap-3 transition-all group"
                            >
                                <Settings size={16} className="group-hover:scale-110 transition-transform" />
                                System_Control
                            </Link>
                        )}
                    </div>

                    {/* Sign Out */}
                    <div className="border-t-2 border-primary/20 py-2 bg-red-500/5">
                        <button
                            onClick={handleSignOut}
                            className="w-full px-5 py-3 text-left text-red-500 hover:bg-red-500 hover:text-white flex items-center gap-3 transition-all font-mono text-xs uppercase italic font-bold"
                        >
                            <LogOut size={16} />
                            Terminate_Session
                        </button>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
