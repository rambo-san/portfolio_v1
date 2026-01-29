"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    Gamepad2, Home, User, Briefcase, Cpu, Mail,
    GraduationCap, Trophy, Monitor, Hash, Terminal
} from "lucide-react";
import {
    motion, useMotionValue, useSpring, useTransform, AnimatePresence
} from "framer-motion";
import { useSiteConfig } from "@/context/SiteConfigContext";
import { MobileWheelNav } from "./MobileWheelNav";

// --- Configuration ---

// Individual App Icon Component
function DockIcon({ mouseX, item, isActive, onClick }: any) {
    const ref = useRef<HTMLDivElement>(null);

    // Calculate distance from mouse to center of this icon
    const distance = useTransform(mouseX, (val: number) => {
        const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
        return val - bounds.x - bounds.width / 2;
    });

    // Magnification Physics
    const widthSync = useTransform(distance, [-150, 0, 150], [50, 100, 50]); // Increased base size
    const width = useSpring(widthSync, { mass: 0.1, stiffness: 150, damping: 12 });

    const [isHovered, setIsHovered] = useState(false);

    return (
        <div className="relative flex flex-col items-center justify-end">
            {/* Tooltip Title */}
            <AnimatePresence>
                {isHovered && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, x: "-50%" }}
                        animate={{ opacity: 1, y: 0, x: "-50%" }}
                        exit={{ opacity: 0, y: 2, x: "-50%" }}
                        className="absolute -top-14 left-1/2 px-3 py-1 bg-foreground/90 text-background text-xs font-bold rounded-lg whitespace-nowrap z-[60] shadow-xl pointer-events-none backdrop-blur-sm"
                    >
                        {item.name}
                        {/* Little triangle arrow */}
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-foreground/90 rotate-45" />
                    </motion.div>
                )}
            </AnimatePresence>

            <Link href={item.href} onClick={onClick}>
                <motion.div
                    ref={ref}
                    style={{ width, height: width }}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    className={cn(
                        "aspect-square rounded-2xl flex items-center justify-center relative shadow-lg ring-1 ring-white/10 transition-colors backdrop-blur-sm",
                        isActive
                            ? "bg-primary/20 ring-primary/50 shadow-[0_0_20px_-5px_rgba(var(--primary-rgb),0.5)]"
                            : "bg-background/40 hover:bg-background/60"
                    )}
                >
                    <item.icon
                        className={cn(
                            "w-1/2 h-1/2 transition-colors duration-300",
                            isActive || item.special ? "text-primary" : "text-foreground/80"
                        )}
                        strokeWidth={2}
                    />

                    {/* Active "Running App" Dot */}
                    {isActive && (
                        <motion.div
                            layoutId="active-dot"
                            className="absolute -bottom-2 w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_8px_var(--primary)]"
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        />
                    )}
                </motion.div>
            </Link>
        </div>
    );
}

// --- Main Navbar Component ---

const SECTION_MAP: Record<string, { name: string; icon: any; href: string }> = {
    hero: { name: "Home", icon: Home, href: "/" },
    about: { name: "About", icon: User, href: "/#about" },
    experience: { name: "Experience", icon: Briefcase, href: "/#experience" },
    projects: { name: "Work", icon: Monitor, href: "/#projects" },
    services: { name: "Services", icon: Cpu, href: "/#services" },
    academic: { name: "Education", icon: GraduationCap, href: "/#academic" },
    achievements: { name: "Awards", icon: Trophy, href: "/#achievements" },
    contact: { name: "Contact", icon: Mail, href: "/#contact" },
};

export function Navbar() {
    const pathname = usePathname();
    const { config } = useSiteConfig();
    const mouseX = useMotionValue(Infinity);

    // Config Extraction
    const hiddenSections = config.layout?.hiddenSections || [];
    const sectionOrder = (config.layout?.sectionOrder || ['hero', 'about', 'experience', 'projects'])
        .filter(id => !hiddenSections.includes(id));

    // Ensure contact is always at the end if not hidden
    if (!hiddenSections.includes('contact') && !sectionOrder.includes('contact')) {
        sectionOrder.push('contact');
    }

    const navItems = [
        ...sectionOrder
            .map(id => ({ ...SECTION_MAP[id], id }))
            .filter(item => item && item.name),
    ];

    // Active State Logic
    const [activeId, setActiveId] = useState("hero");
    const isManualRef = useRef(false);

    useEffect(() => {
        if (pathname === "/arcade") {
            setActiveId("arcade-page");
        } else if (pathname === "/") {
            if (typeof window !== 'undefined' && window.location.hash) {
                const hash = window.location.hash.substring(1);
                setActiveId(hash);
                // Lock scroll spy briefly
                isManualRef.current = true;
                setTimeout(() => { isManualRef.current = false; }, 1000);
            } else {
                setActiveId("hero");
            }
        }
    }, [pathname]);

    // Scroll Spy
    useEffect(() => {
        if (pathname !== "/") return;

        const handleScroll = () => {
            if (isManualRef.current) return;

            const sections = navItems
                .filter(item => item.href.startsWith("/#") || item.href === "/")
                .map(item => item.id);

            let current = "hero";
            const scrollY = window.scrollY;
            const checkPoint = scrollY + (window.innerHeight * 0.4);

            for (const sectionId of sections) {
                if (!sectionId) continue;
                if (sectionId === 'hero') {
                    if (scrollY < 300) { current = 'hero'; break; }
                    continue;
                }
                const element = document.getElementById(sectionId);
                if (element) {
                    const { offsetTop, offsetHeight } = element;
                    if (checkPoint >= offsetTop && checkPoint < offsetTop + offsetHeight) {
                        current = sectionId;
                    }
                }
            }
            setActiveId(current);
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        // Delay initial check to allow layout to settle
        const timer = setTimeout(handleScroll, 200);
        return () => {
            window.removeEventListener("scroll", handleScroll);
            clearTimeout(timer);
        };
    }, [pathname, navItems]);

    return (
        <>
            {/* Mobile Wheel Navigation */}
            <MobileWheelNav
                items={navItems as any}
                activeId={activeId}
                onSelect={(id) => {
                    setActiveId(id);
                    isManualRef.current = true;
                    setTimeout(() => { isManualRef.current = false; }, 1000);
                }}
            />

            {/* Desktop Dock */}
            <div className="hidden md:flex fixed bottom-6 left-0 right-0 z-50 justify-center pointer-events-none">
                <motion.div
                    onMouseMove={(e) => mouseX.set(e.pageX)}
                    onMouseLeave={() => mouseX.set(Infinity)}
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
                    className="pointer-events-auto flex items-end gap-5 px-6 pb-4 pt-4 mx-auto rounded-3xl bg-background/20 backdrop-blur-xl border border-white/10 shadow-2xl relative"
                >
                    {/* Background Blur Layer for "Frosted" look */}
                    <div className="absolute inset-0 bg-background/10 backdrop-blur-2xl rounded-3xl -z-10" />

                    {navItems.map((item) => (
                        <DockIcon
                            key={item.id}
                            mouseX={mouseX}
                            item={item}
                            isActive={activeId === item.id}
                            onClick={() => {
                                setActiveId(item.id);
                                isManualRef.current = true;
                                setTimeout(() => { isManualRef.current = false; }, 1000);
                            }}
                        />
                    ))}
                </motion.div>
            </div>
        </>
    );
}

