"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Friend, subscribeFriends } from "@/lib/firebase/siteConfig";
import { Github, Linkedin, Twitter, Instagram, Globe, ExternalLink, X, ChevronRight, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useSiteConfig } from "@/context/SiteConfigContext";
import { Skeleton } from "@/components/ui/skeleton";

export function Friends() {
    const { config, loading: configLoading } = useSiteConfig(); // Rename to avoid conflict
    const [friends, setFriends] = useState<Friend[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);

    useEffect(() => {
        const unsubscribe = subscribeFriends((fetchedFriends) => {
            setFriends(fetchedFriends);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const { friends: friendsConfig } = config;

    if (!loading && friends.length === 0) {
        return null;
    }

    return (
        <section className="py-24 relative overflow-hidden crt-overlay">
            {/* Retro Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-0 pointer-events-none opacity-20" />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />

            <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Header */}
                <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        {configLoading ? (
                            <Skeleton className="h-10 w-64 mb-2 rounded bg-white/5" />
                        ) : (
                            <h2 className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tighter uppercase italic retro-text-shadow">
                                {friendsConfig?.title || 'PARTY MEMBERS'}
                            </h2>
                        )}
                        {configLoading ? (
                            <Skeleton className="h-5 w-96 rounded bg-white/5" />
                        ) : (
                            <div className="flex items-center gap-3">
                                <div className="h-2 w-2 bg-primary animate-pulse rounded-full" />
                                <p className="text-primary font-mono text-sm uppercase tracking-widest">
                                    {friendsConfig?.subtitle || "Select a character to view stats"}
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="hidden md:flex items-center gap-4 font-mono text-xs text-slate-500">
                        <span className="animate-pulse">INSERT COIN</span>
                        <div className="h-4 w-px bg-slate-800" />
                        <span>PLAYER 1 READY</span>
                    </div>
                </div>

                {/* Horizontal Scroll Area */}
                <div className="relative -mx-4 px-4 md:mx-0 md:px-0">
                    <div className="flex overflow-x-auto pb-12 pt-4 gap-8 snap-x snap-mandatory scrollbar-hide">
                        {loading ? (
                            [1, 2, 3, 4].map((i) => (
                                <div key={i} className="flex-none w-72 h-[420px] rounded-sm bg-white/5 animate-pulse border-2 border-dashed border-white/10" />
                            ))
                        ) : (
                            friends.map((friend, idx) => (
                                <motion.div
                                    key={friend.id}
                                    layoutId={`card-${friend.id}`}
                                    onClick={() => setSelectedFriend(friend)}
                                    className="flex-none w-72 relative group cursor-pointer snap-start"
                                    initial={{ opacity: 0, x: 50 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.1 }}
                                >
                                    {/* Retro Card Wrapper */}
                                    <div className="h-[440px] relative transition-all duration-300 group-hover:-translate-y-2 group-hover:translate-x-1">
                                        {/* Background Shadow Offset */}
                                        <div className="absolute inset-0 bg-primary/20 translate-x-2 translate-y-2 pixel-corners -z-10 group-hover:bg-primary/40 transition-colors" />

                                        {/* Main Card */}
                                        <div className="h-full bg-black border-2 border-white/20 p-6 flex flex-col items-center text-center pixel-corners group-hover:border-primary group-hover:neon-border transition-all">

                                            {/* Rank/LVL Badge */}
                                            <div className="absolute top-4 left-4 font-mono text-[10px] text-primary bg-primary/10 border border-primary/30 px-2 py-0.5">
                                                LVL {Math.floor(Math.random() * 50) + 50}
                                            </div>

                                            {/* Avatar Area */}
                                            <div className="relative w-32 h-32 mb-6 mt-4">
                                                <div className="absolute inset-0 border-2 border-primary group-hover:animate-ping opacity-20" />
                                                <div className="w-full h-full p-2 border border-white/10 bg-white/5">
                                                    {friend.avatarUrl ? (
                                                        <img
                                                            src={friend.avatarUrl}
                                                            alt={friend.name}
                                                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full bg-primary/20 flex items-center justify-center text-primary text-4xl font-black">
                                                            {friend.name.charAt(0)}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Name & Role */}
                                            <div className="mb-4">
                                                <h3 className="text-xl font-black text-white uppercase tracking-tighter group-hover:text-primary transition-colors">
                                                    {friend.name}
                                                </h3>
                                                <div className="h-1 w-12 bg-primary mx-auto mt-1" />
                                            </div>

                                            <p className="text-xs font-mono text-slate-500 line-clamp-4 leading-relaxed flex-1">
                                                {friend.description || "NO DATA AVAILABLE FOR THIS ENTITY."}
                                            </p>

                                            {/* Footer Info */}
                                            <div className="w-full mt-6 pt-4 border-t border-white/5 flex justify-between items-center font-mono text-[10px]">
                                                <span className="text-slate-600">CLASS: DEV</span>
                                                <span className="text-primary group-hover:animate-pulse">CONNECT &gt;</span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Sidebar / Drawer */}
            <AnimatePresence>
                {selectedFriend && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedFriend(null)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 cursor-pointer"
                        />

                        {/* Sidebar */}
                        <motion.div
                            layoutId={`card-${selectedFriend.id}`}
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed top-0 right-0 bottom-0 w-full md:w-[480px] bg-black border-l-4 border-primary z-[51] overflow-y-auto shadow-2xl crt-overlay"
                        >
                            <div className="min-h-full p-8 flex flex-col relative">
                                {/* Close Button */}
                                <button
                                    onClick={() => setSelectedFriend(null)}
                                    className="absolute top-6 right-6 p-2 rounded-none bg-primary text-black hover:bg-white transition-colors z-20 font-black"
                                >
                                    [X]
                                </button>

                                <div className="mt-8 flex flex-col items-center text-center">
                                    {/* HUD Header */}
                                    <div className="w-full mb-8 flex items-center gap-4">
                                        <div className="h-px flex-1 bg-primary/30" />
                                        <span className="font-mono text-[10px] text-primary uppercase tracking-[0.3em]">Character Data</span>
                                        <div className="h-px flex-1 bg-primary/30" />
                                    </div>

                                    {/* Retro Avatar */}
                                    <div className="relative w-40 h-40 mb-8 p-1 border-2 border-white/20 bg-white/5 pixel-corners">
                                        <div className="absolute inset-0 border border-primary animate-pulse opacity-50" />
                                        {selectedFriend.avatarUrl ? (
                                            <img
                                                src={selectedFriend.avatarUrl}
                                                alt={selectedFriend.name}
                                                className="w-full h-full object-cover grayscale brightness-125 contrast-125"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-primary/20 flex items-center justify-center text-white text-6xl font-black">
                                                {selectedFriend.name.charAt(0)}
                                            </div>
                                        )}
                                    </div>

                                    <h2 className="text-4xl font-black text-white mb-2 uppercase italic tracking-tighter retro-text-shadow">
                                        {selectedFriend.name}
                                    </h2>

                                    {selectedFriend.portfolioUrl && (
                                        <Link
                                            href={selectedFriend.portfolioUrl}
                                            target="_blank"
                                            className="inline-flex items-center gap-2 text-primary hover:text-white transition-colors mb-6 font-mono text-xs uppercase"
                                        >
                                            <Globe size={12} />
                                            Visit_Server &gt;
                                        </Link>
                                    )}

                                    <div className="w-full text-left bg-white/5 border border-white/10 p-6 mb-8 pixel-corners relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-2 opacity-10">
                                            <Globe size={64} />
                                        </div>
                                        <p className="text-slate-300 font-mono text-sm leading-relaxed relative z-10">
                                            {selectedFriend.description || "NO BIOGRAPHY DATA FOUND IN DATABASE."}
                                        </p>
                                    </div>

                                    {/* Social Links Grid */}
                                    <div className="w-full grid grid-cols-2 gap-4 mb-8">
                                        {Object.entries(selectedFriend.socialLinks || {}).map(([platform, url]) => {
                                            if (!url) return null;

                                            const icons = {
                                                github: Github,
                                                linkedin: Linkedin,
                                                twitter: Twitter,
                                                instagram: Instagram,
                                                website: Globe
                                            };
                                            const Icon = icons[platform as keyof typeof icons] || Globe;

                                            return (
                                                <Link
                                                    key={platform}
                                                    href={url}
                                                    target="_blank"
                                                    className="flex items-center justify-start gap-4 p-4 bg-white/5 border-l-4 border-transparent hover:border-primary hover:bg-primary/10 transition-all group"
                                                >
                                                    <Icon size={18} className="text-primary" />
                                                    <span className="uppercase text-[10px] font-mono font-bold tracking-widest text-slate-400 group-hover:text-white">
                                                        {platform}
                                                    </span>
                                                </Link>
                                            );
                                        })}
                                    </div>

                                    <div className="mt-auto w-full pt-8 border-t-2 border-dashed border-white/10">
                                        <div className="flex justify-between items-center mb-6 font-mono text-[10px] text-slate-500">
                                            <span>STATUS: ONLINE</span>
                                            <span className="text-primary">SIGNAL STRENGTH: 100%</span>
                                        </div>
                                        <button
                                            onClick={() => window.open(`mailto:?subject=Connecting with ${selectedFriend.name}&body=Hey, I saw ${selectedFriend.name} on your portfolio!`, '_blank')}
                                            className="w-full py-4 bg-primary text-black font-black uppercase tracking-[0.2em] transform hover:scale-[1.02] active:scale-95 transition-all pixel-corners shadow-[0_0_20px_rgba(var(--primary-rgb),0.4)]"
                                        >
                                            Send Signal
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </section>
    );
}
