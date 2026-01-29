"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Friend, subscribeFriends } from "@/lib/firebase/siteConfig";
import { Github, Linkedin, Twitter, Instagram, Globe, ExternalLink, Users, X, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useSiteConfig } from "@/context/SiteConfigContext";
import { cn } from "@/lib/utils";

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
            {/* Trigger Button - Retro Hardware Handle */}
            <motion.button
                initial={{ x: 100 }}
                animate={{ x: 0 }}
                onClick={() => setIsOpen(true)}
                className="fixed right-0 top-1/2 -translate-y-1/2 z-40 bg-black border-2 border-primary border-r-0 p-4 pixel-corners shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] hover:bg-primary hover:text-black transition-all group"
                whileHover={{ x: -2 }}
                title="View Friends"
            >
                <div className="flex flex-col items-center gap-3 text-primary group-hover:text-black">
                    <Users size={24} className="animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] italic" style={{ writingMode: 'vertical-rl' }}>
                        DATA_NET
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
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 cursor-pointer"
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
                        className="fixed top-0 right-0 bottom-0 w-full sm:w-[400px] bg-black border-l-4 border-primary z-[51] flex flex-col shadow-2xl crt-overlay"
                    >
                        {/* Header */}
                        <div className="p-8 border-b-2 border-dashed border-primary/30 bg-black relative">
                            <div className="absolute top-2 left-4 font-mono text-[8px] text-primary/40 uppercase tracking-widest">
                                Signal_Receiver v2.0
                            </div>
                            <div className="flex items-center justify-between mt-2">
                                <div>
                                    <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter retro-text-shadow">
                                        {config.friends?.title || 'NETWORK'}
                                    </h2>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" />
                                        <p className="text-[10px] font-mono text-primary uppercase tracking-widest">
                                            {friends.length} Entities Found
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 border-2 border-primary bg-primary text-black hover:bg-white hover:border-white transition-colors font-black pixel-corners translate-y-1"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        {/* List */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-black relative">
                            {/* Low-opacity Noise Overlay */}
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat opacity-20 pointer-events-none z-0" />

                            <div className="relative z-10 flex flex-col gap-4">
                                {friends.map((friend) => {
                                    const isExpanded = expandedFriend === friend.id;

                                    return (
                                        <motion.div
                                            layout
                                            key={friend.id}
                                            onClick={() => setExpandedFriend(isExpanded ? null : (friend.id || ''))}
                                            className={`relative group transition-all duration-300 ${isExpanded ? 'scale-[1.02]' : ''}`}
                                        >
                                            {/* Row Background */}
                                            <div className={cn(
                                                "p-4 flex items-center gap-4 cursor-pointer pixel-corners border-2 transition-all",
                                                isExpanded
                                                    ? "bg-primary/20 border-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.2)]"
                                                    : "bg-white/5 border-white/10 hover:border-primary/50 hover:bg-white/10"
                                            )}>
                                                {/* Avatar Area */}
                                                <div className="relative w-14 h-14 flex-shrink-0 p-0.5 bg-black border border-white/20">
                                                    {friend.avatarUrl ? (
                                                        <img
                                                            src={friend.avatarUrl}
                                                            alt={friend.name}
                                                            className={cn(
                                                                "w-full h-full object-cover transition-all",
                                                                isExpanded ? "grayscale-0" : "grayscale group-hover:grayscale-0"
                                                            )}
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full bg-primary/20 flex items-center justify-center text-primary text-xl font-black">
                                                            {friend.name.charAt(0)}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex-1 min-w-0 text-left">
                                                    <h3 className={cn(
                                                        "font-black uppercase tracking-tight text-lg transition-colors",
                                                        isExpanded ? "text-white" : "text-slate-200"
                                                    )}>
                                                        {friend.name}
                                                    </h3>
                                                    <div className="flex items-center gap-2">
                                                        <p className={cn(
                                                            "text-[9px] font-mono uppercase truncate",
                                                            isExpanded ? "text-primary font-bold" : "text-slate-500"
                                                        )}>
                                                            {isExpanded ? "SCANNING_COMPLETE" : "STATUS: VERIFIED"}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className={cn(
                                                    "transition-transform duration-300 text-xl font-black",
                                                    isExpanded ? "rotate-90 text-primary" : "text-slate-600"
                                                )}>
                                                    &gt;
                                                </div>
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
                                                        <div className="p-6 bg-black border-2 border-t-0 border-primary pixel-corners">
                                                            <div className="font-mono text-[10px] text-primary mb-3 font-bold">
                                                                // DATA_ENTITY_LOG
                                                            </div>
                                                            <p className="text-[13px] font-mono text-white leading-relaxed mb-6">
                                                                {friend.description || "NO DATA FOUND IN LOCAL CACHE."}
                                                            </p>

                                                            {/* Actions Grid */}
                                                            <div className="grid grid-cols-2 gap-2">
                                                                {friend.portfolioUrl && (
                                                                    <Link
                                                                        href={friend.portfolioUrl}
                                                                        target="_blank"
                                                                        className="flex items-center justify-center gap-2 py-3 bg-primary text-black text-[11px] font-black uppercase tracking-wider hover:bg-white transition-colors"
                                                                    >
                                                                        ACCESS_SYS
                                                                    </Link>
                                                                )}

                                                                <div className="flex gap-2">
                                                                    {friend.socialLinks?.github && (
                                                                        <Link href={friend.socialLinks.github} target="_blank" className="flex-1 flex items-center justify-center py-2 bg-white/10 border border-white/20 text-white hover:border-primary hover:bg-primary/20 transition-all">
                                                                            <Github size={16} />
                                                                        </Link>
                                                                    )}
                                                                    {friend.socialLinks?.linkedin && (
                                                                        <Link href={friend.socialLinks.linkedin} target="_blank" className="flex-1 flex items-center justify-center py-2 bg-white/10 border border-white/20 text-white hover:border-primary hover:bg-primary/20 transition-all">
                                                                            <Linkedin size={16} />
                                                                        </Link>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Footer Status */}
                        <div className="p-4 bg-primary text-black font-mono text-[10px] flex justify-between uppercase font-black">
                            <span>Link: Active</span>
                            <span className="animate-pulse">Buffer: 99%</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
