"use client";

import { Github, Linkedin, Twitter, Instagram } from "lucide-react";
import Link from "next/link";

import { useSiteConfig } from "@/context/SiteConfigContext";
import { Skeleton } from "@/components/ui/skeleton";

export function Footer() {
    const { config, loading } = useSiteConfig();
    const { socialLinks } = config;

    return (
        <footer className="w-full py-8 border-t border-white/5 bg-black/20 backdrop-blur-sm mt-auto relative z-10 pb-32">
            <div className="container mx-auto px-4 flex flex-col items-center justify-between gap-4 md:flex-row">
                {loading ? (
                    <Skeleton className="h-5 w-64 rounded" />
                ) : (
                    <p className="text-white/40 text-sm">
                        © {new Date().getFullYear()} {config.siteName}. All rights reserved.
                    </p>
                )}

                <div className="flex items-center gap-6">
                    {loading ? (
                        <>
                            <Skeleton className="h-5 w-5 rounded-full" />
                            <Skeleton className="h-5 w-5 rounded-full" />
                            <Skeleton className="h-5 w-5 rounded-full" />
                        </>
                    ) : (
                        <>
                            {socialLinks.github && (
                                <Link href={socialLinks.github} target="_blank" className="text-white/40 hover:text-white transition-colors">
                                    <Github size={20} />
                                </Link>
                            )}
                            {socialLinks.linkedin && (
                                <Link href={socialLinks.linkedin} target="_blank" className="text-white/40 hover:text-[#0077b5] transition-colors">
                                    <Linkedin size={20} />
                                </Link>
                            )}
                            {socialLinks.twitter && (
                                <Link href={socialLinks.twitter} target="_blank" className="text-white/40 hover:text-[#1DA1F2] transition-colors">
                                    <Twitter size={20} />
                                </Link>
                            )}
                            {socialLinks.instagram && (
                                <Link href={socialLinks.instagram} target="_blank" className="text-white/40 hover:text-[#E4405F] transition-colors">
                                    <Instagram size={20} />
                                </Link>
                            )}
                        </>
                    )}
                </div>
            </div>
        </footer>
    );
}
