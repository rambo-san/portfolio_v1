"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Friend, subscribeFriends } from "@/lib/firebase/siteConfig";
import { Github, Linkedin, Twitter, Instagram, Globe, ExternalLink, Users, X, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useSiteConfig } from "@/context/SiteConfigContext";

export function FriendsDrawer() {
    const { config } = useSiteConfig();
    const [friends, setFriends] = useState<Friend[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [expandedFriend, setExpandedFriend] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = subscribeFriends((fetchedFriends) => {
            setFriends(fetchedFriends);
        });
        return () => unsubscribe();
    }, []);

    // If no friends, render nothing
    if (friends.length === 0) return null;

    return (
        <>
            {/* Trigger Button */}
            <motion.button
                initial={{ x: 100 }}
                animate={{ x: 0 }}
                onClick={() => setIsOpen(true)}
                className="fixed right-0 top-1/2 -translate-y-1/2 z-40 bg-zinc-900 border-l border-y border-white/10 p-3 rounded-l-xl shadow-2xl hover:bg-zinc-800 transition-colors group"
                whileHover={{ x: -5 }}
                title="View Friends"
            >
                <div className="flex flex-col items-center gap-2 text-slate-400 group-hover:text-white">
                    <Users size={20} />
                    <span className="text-[10px] font-medium uppercase tracking-wider" style={{ writingMode: 'vertical-rl' }}>
                        People
                    </span>
                </div>
            </motion.button>

            {/* Backdrop */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 cursor-pointer"
                    />
                )}
            </AnimatePresence>

            {/* Drawer */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 bottom-0 w-full sm:w-[400px] bg-[#0A0A0A] border-l border-white/10 z-[51] flex flex-col shadow-2xl"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black/50 backdrop-blur-md">
                            <div>
                                <h2 className="text-xl font-bold text-white">
                                    {config.friends?.title || 'Connect'}
                                </h2>
                                <p className="text-xs text-slate-400 mt-1">
                                    {friends.length} amazing people
                                </p>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* List */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                            {friends.map((friend) => {
                                const isExpanded = expandedFriend === friend.id;

                                return (
                                    <motion.div
                                        layout
                                        key={friend.id}
                                        onClick={() => setExpandedFriend(isExpanded ? null : (friend.id || ''))}
                                        className={`rounded-xl border ${isExpanded ? 'bg-white/5 border-violet-500/30' : 'bg-transparent border-transparent hover:bg-white/5 hover:border-white/5'} transition-colors overflow-hidden`}
                                    >
                                        <div className="p-3 flex items-center gap-3 cursor-pointer">
                                            {/* Avatar */}
                                            <div className="relative w-12 h-12 flex-shrink-0">
                                                {friend.avatarUrl ? (
                                                    <img
                                                        src={friend.avatarUrl}
                                                        alt={friend.name}
                                                        className="w-full h-full rounded-full object-cover border-2 border-white/10"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full rounded-full bg-primary flex items-center justify-center text-white text-lg font-bold">
                                                        {friend.name.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0 text-left">
                                                <h3 className={`font-medium truncate ${isExpanded ? 'text-primary' : 'text-slate-200'}`}>
                                                    {friend.name}
                                                </h3>
                                                <p className="text-xs text-slate-500 truncate">
                                                    {isExpanded ? 'Click to collapse' : friend.description}
                                                </p>
                                            </div>

                                            <ChevronRight
                                                size={16}
                                                className={`text-slate-600 transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`}
                                            />
                                        </div>

                                        {/* Expanded Content */}
                                        <AnimatePresence>
                                            {isExpanded && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="p-4 pt-0 border-t border-white/5 mt-2">
                                                        <p className="text-sm text-slate-400 mt-3 leading-relaxed">
                                                            {friend.description}
                                                        </p>

                                                        {/* Actions */}
                                                        <div className="flex flex-wrap gap-2 mt-4">
                                                            {friend.portfolioUrl && (
                                                                <Link
                                                                    href={friend.portfolioUrl}
                                                                    target="_blank"
                                                                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-violet-500/10 text-violet-400 text-xs font-medium hover:bg-violet-500/20 transition-colors"
                                                                >
                                                                    <Globe size={12} /> Portfolio
                                                                </Link>
                                                            )}

                                                            {friend.socialLinks?.github && (
                                                                <Link href={friend.socialLinks.github} target="_blank" className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                                                                    <Github size={14} />
                                                                </Link>
                                                            )}
                                                            {friend.socialLinks?.linkedin && (
                                                                <Link href={friend.socialLinks.linkedin} target="_blank" className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-[#0077b5] transition-colors">
                                                                    <Linkedin size={14} />
                                                                </Link>
                                                            )}
                                                            {friend.socialLinks?.twitter && (
                                                                <Link href={friend.socialLinks.twitter} target="_blank" className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-[#1DA1F2] transition-colors">
                                                                    <Twitter size={14} />
                                                                </Link>
                                                            )}
                                                            {friend.socialLinks?.instagram && (
                                                                <Link href={friend.socialLinks.instagram} target="_blank" className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-[#E4405F] transition-colors">
                                                                    <Instagram size={14} />
                                                                </Link>
                                                            )}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
