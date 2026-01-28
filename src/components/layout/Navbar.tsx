"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Gamepad2, Home, User, Cpu, Mail, Briefcase, Layout } from "lucide-react";
import { motion } from "framer-motion";

const navItems = [
    { name: "Home", href: "/", icon: Home, id: "home" },
    { name: "About", href: "/#about", icon: User, id: "about" },
    // { name: "Services", href: "/#services", icon: Layout, id: "services" },
    { name: "Exp", href: "/#experience", icon: Briefcase, id: "experience" },
    { name: "Work", href: "/#projects", icon: Cpu, id: "projects" },
    { name: "Arcade", href: "/arcade", icon: Gamepad2, special: true },
    { name: "Contact", href: "/#contact", icon: Mail, id: "contact" },
];

export function Navbar() {
    const pathname = usePathname();
    const [activeIndex, setActiveIndex] = useState(0);
    const [tabBounds, setTabBounds] = useState<{ left: number; width: number }[]>([]);
    const navRef = useRef<HTMLDivElement>(null);
    const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);

    // Measure tab positions
    useEffect(() => {
        const measureTabs = () => {
            if (!navRef.current) return;
            const navRect = navRef.current.getBoundingClientRect();
            const bounds = itemRefs.current.map((el) => {
                if (!el) return { left: 0, width: 0 };
                const rect = el.getBoundingClientRect();
                return {
                    left: rect.left - navRect.left,
                    width: rect.width,
                };
            });
            setTabBounds(bounds);
        };

        measureTabs();
        window.addEventListener("resize", measureTabs);
        return () => window.removeEventListener("resize", measureTabs);
    }, []);

    // Set active based on pathname or scroll
    useEffect(() => {
        if (pathname !== "/" && pathname !== "") {
            const idx = navItems.findIndex((item) => item.href === pathname);
            if (idx !== -1) setActiveIndex(idx);
            return;
        }

        const handleScroll = () => {
            const sections = navItems.filter((item) => item.id).map((item) => item.id);
            let current = "home";

            for (const section of sections) {
                const element = document.getElementById(section as string);
                if (element) {
                    const rect = element.getBoundingClientRect();
                    const offset = window.innerHeight / 2;
                    if (rect.top <= offset && rect.bottom >= offset) {
                        current = section as string;
                    }
                }
            }

            if (window.scrollY < 100) current = "home";

            const foundIdx = navItems.findIndex((item) => item.id === current);
            if (foundIdx !== -1) setActiveIndex(foundIdx);
        };

        window.addEventListener("scroll", handleScroll);
        handleScroll();
        return () => window.removeEventListener("scroll", handleScroll);
    }, [pathname]);

    const activeBounds = tabBounds[activeIndex] || { left: 0, width: 0 };
    const activeItem = navItems[activeIndex];

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
            <nav
                ref={navRef}
                className="relative flex items-center gap-1 p-1.5 rounded-full border border-white/10 bg-black/80 backdrop-blur-md shadow-2xl shadow-black/80"
            >
                {/* The sliding indicator - always rendered */}
                <motion.div
                    className={cn(
                        "absolute top-1.5 bottom-1.5 rounded-full -z-0",
                        activeItem?.special
                            ? "bg-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]"
                            : "bg-white/10 border border-white/10"
                    )}
                    animate={{
                        left: activeBounds.left,
                        width: activeBounds.width,
                    }}
                    transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                    }}
                />

                {navItems.map((item, index) => {
                    const isActive = activeIndex === index;

                    return (
                        <Link
                            key={item.href}
                            ref={(el) => { itemRefs.current[index] = el; }}
                            href={item.href}
                            onClick={() => setActiveIndex(index)}
                            className={cn(
                                "relative flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-colors duration-200 z-10",
                                isActive ? "text-white" : "text-slate-400 hover:text-slate-200",
                                !isActive && item.special && "text-primary hover:brightness-110"
                            )}
                        >
                            <item.icon
                                size={18}
                                className={cn(
                                    item.special && "drop-shadow-[0_0_5px_rgba(var(--primary-rgb),0.8)]"
                                )}
                            />
                            <span className="hidden md:block">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
