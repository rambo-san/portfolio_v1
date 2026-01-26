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
        <section className="py-24 px-4 relative overflow-hidden">
            <div className="container mx-auto max-w-7xl">
                {/* Header */}
                <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        {configLoading ? (
                            <Skeleton className="h-10 w-64 mb-2 rounded" />
                        ) : (
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                                {friendsConfig?.title || 'Cool People I Know'}
                            </h2>
                        )}
                        {configLoading ? (
                            <Skeleton className="h-5 w-96 rounded" />
                        ) : (
                            <p className="text-slate-400 text-lg max-w-2xl">
                                {friendsConfig?.subtitle || "Amazing developers, designers, and creators I'm lucky to call friends."}
                            </p>
                        )}
                    </div>

                    {/* Scroll hint or navigation could go here */}
                    <div className="text-slate-500 text-sm hidden md:flex items-center gap-2">
                        Scroll to explore <ChevronRight size={16} />
                    </div>
                </div>

                {/* Horizontal Scroll Area */}
                <div className="relative -mx-4 px-4 md:mx-0 md:px-0">
                    {/* Fade overlay for right side indicating scroll */}
                    <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#050505] to-transparent z-10 pointer-events-none md:hidden" />

                    <div className="flex overflow-x-auto pb-8 pt-2 gap-6 snap-x snap-mandatory scrollbar-hide">
                        {loading ? (
                            // Loading Skeletons
                            [1, 2, 3, 4].map((i) => (
                                <div key={i} className="flex-none w-64 md:w-72 h-80 rounded-2xl bg-white/5 animate-pulse border border-white/5" />
                            ))
                        ) : (
                            // Friend Cards
                            friends.map((friend) => (
                                <motion.div
                                    key={friend.id}
                                    layoutId={`card-${friend.id}`}
                                    onClick={() => setSelectedFriend(friend)}
                                    className="flex-none w-64 md:w-72 relative group cursor-pointer snap-start"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    whileHover={{ y: -5 }}
                                >
                                    <div className="h-80 rounded-2xl bg-gradient-to-b from-white/10 to-white/5 border border-white/10 p-6 flex flex-col items-center text-center backdrop-blur-sm hover:border-primary/50 hover:shadow-[0_0_30px_rgba(var(--primary-rgb),0.15)] transition-all duration-300">

                                        {/* Avatar */}
                                        <div className="relative w-24 h-24 mb-4">
                                            {friend.avatarUrl ? (
                                                <img
                                                    src={friend.avatarUrl}
                                                    alt={friend.name}
                                                    className="w-full h-full rounded-full object-cover border-4 border-white/10 group-hover:border-primary transition-colors bg-[#111]"
                                                />
                                            ) : (
                                                <div className="w-full h-full rounded-full bg-primary flex items-center justify-center text-white text-3xl font-bold border-4 border-white/10">
                                                    {friend.name.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                        </div>

                                        {/* Name & Role */}
                                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary transition-colors">
                                            {friend.name}
                                        </h3>
                                        <p className="text-sm text-slate-400 line-clamp-3 mb-4 flex-1">
                                            {friend.description}
                                        </p>

                                        {/* View Profile Action */}
                                        <div className="mt-auto px-4 py-2 rounded-full bg-white/5 text-sm font-medium text-white group-hover:bg-primary transition-colors">
                                            View Profile
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
                            className="fixed top-0 right-0 bottom-0 w-full md:w-[480px] bg-[#0A0A0A] border-l border-white/10 z-[51] overflow-y-auto shadow-2xl"
                        >
                            <div className="min-h-full p-8 flex flex-col">
                                <button
                                    onClick={() => setSelectedFriend(null)}
                                    className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors"
                                >
                                    <X size={20} />
                                </button>

                                <div className="mt-8 flex flex-col items-center text-center">
                                    <div className="w-32 h-32 mb-6 rounded-full overflow-hidden border-4 border-violet-500/20 shadow-[0_0_40px_rgba(139,92,246,0.3)]">
                                        {selectedFriend.avatarUrl ? (
                                            <img
                                                src={selectedFriend.avatarUrl}
                                                alt={selectedFriend.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center text-white text-4xl font-bold">
                                                {selectedFriend.name.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>

                                    <h2 className="text-3xl font-bold text-white mb-2">{selectedFriend.name}</h2>

                                    {selectedFriend.portfolioUrl && (
                                        <Link
                                            href={selectedFriend.portfolioUrl}
                                            target="_blank"
                                            className="inline-flex items-center gap-2 text-violet-400 hover:text-violet-300 transition-colors mb-6"
                                        >
                                            <Globe size={16} />
                                            Visit Portfolio <ExternalLink size={14} />
                                        </Link>
                                    )}

                                    <p className="text-slate-300 text-lg leading-relaxed mb-8 max-w-md">
                                        {selectedFriend.description}
                                    </p>

                                    {/* Social Links Grid */}
                                    <div className="w-full grid grid-cols-2 gap-3 mb-8">
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
                                                    className="flex items-center justify-center gap-3 p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-violet-500/30 hover:shadow-[0_0_15px_rgba(139,92,246,0.1)] transition-all group"
                                                >
                                                    <Icon size={20} className="text-slate-400 group-hover:text-white transition-colors" />
                                                    <span className="capitalize text-sm font-medium text-slate-300 group-hover:text-white">
                                                        {platform}
                                                    </span>
                                                </Link>
                                            );
                                        })}
                                    </div>

                                    <div className="mt-auto w-full pt-8 border-t border-white/10">
                                        <p className="text-sm text-slate-500 mb-4">
                                            Know this person?
                                        </p>
                                        <button
                                            onClick={() => window.open(`mailto:?subject=Connecting with ${selectedFriend.name}&body=Hey, I saw ${selectedFriend.name} on your portfolio!`, '_blank')}
                                            className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-medium hover:opacity-90 transition-opacity"
                                        >
                                            Connect
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
