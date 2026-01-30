"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, animate, PanInfo, useSpring, useTransform, MotionValue } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface NavItem {
    id: string;
    name: string;
    icon: any;
    href: string;
    special?: boolean;
}

interface MobileWheelNavProps {
    items: NavItem[];
    activeId: string;
    onSelect: (id: string) => void;
}

// Sub-component for individual wheel items to handle complex transforms
const WheelItem = ({
    item,
    index,
    totalItems,
    radius,
    rotation,
    activeId,
    onSelect
}: {
    item: NavItem;
    index: number;
    totalItems: number;
    radius: number;
    rotation: MotionValue<number>;
    activeId: string;
    onSelect: (id: string) => void;
}) => {
    const angle = index * (360 / totalItems);

    // Counter-rotate the icon so it stays upright relative to the screen
    // Total rotation of item container is (WheelRotation + ItemPositionAngle)
    // We want to subtract this to get back to 0
    const iconRotation = useTransform(rotation, (r) => -r - angle);

    return (
        <div
            className="absolute top-1/2 left-1/2 flex flex-col items-center justify-center p-4 -ml-8 -mt-8"
            style={{
                width: "64px",
                height: "64px",
                // Position the item on the circle edge
                transform: `rotate(${angle}deg) translateY(-${radius}px)`,
            }}
        >
            <Link
                href={item.href}
                onClick={() => onSelect(item.id)}
            >
                <motion.div
                    style={{ rotate: iconRotation }} // Keep icon upright
                    className={cn(
                        "relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300",
                        activeId === item.id
                            ? "bg-primary text-primary-foreground shadow-[0_0_20px_var(--primary)] scale-110"
                            : "text-white/70 hover:bg-white/10"
                    )}
                >
                    <item.icon size={24} />

                    {/* Active Label - Attached to icon but also upright */}
                    {activeId === item.id && (
                        <motion.span
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 24 }} // Position below icon
                            className="absolute left-1/2 -translate-x-1/2 text-[10px] font-black tracking-widest uppercase text-primary whitespace-nowrap bg-black/50 backdrop-blur-md px-2 py-0.5 rounded"
                        >
                            {item.name}
                        </motion.span>
                    )}
                </motion.div>
            </Link>
        </div >
    );
};

export function MobileWheelNav({ items, activeId, onSelect }: MobileWheelNavProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const rotation = useMotionValue(0);
    const [isDragging, setIsDragging] = useState(false);

    const damping = 40;
    const stiffness = 300;
    const springRotation = useSpring(rotation, { damping, stiffness });

    // --- Circular Logic Configuration ---
    // Duplicate items to ensure sufficient density for "3 items visible" (aiming for ~30-40 deg spacing)
    // If we have 5 items -> 72deg (too sparse). Double to 10 -> 36deg (good).
    const MIN_ITEMS = 18; // Increased density from 10 to 18
    const repeatCount = Math.ceil(MIN_ITEMS / items.length);
    // Create a stable display list with unique keys
    // We use useMemo to prevent regeneration on every render, but depends on items change
    const displayItems = React.useMemo(() => {
        return Array(repeatCount).fill(items).flat().map((item, idx) => ({
            ...item,
            uniqueId: `${item.id}-${idx}`, // needed for React keys
            originalIndex: idx
        }));
    }, [items, repeatCount]);

    const TOTAL_ITEMS = displayItems.length;
    const ITEM_SPACING = 360 / TOTAL_ITEMS;
    const WHEEL_SIZE = 500;
    const RADIUS = 220;

    // Haptic/Audio Feedback
    const lastIndexRef = useRef(0);
    const playTick = () => {
        if (typeof window === 'undefined') return;
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.05);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
    };

    useEffect(() => {
        const unsubscribe = rotation.on("change", (latest) => {
            const currentIndex = Math.round(-latest / ITEM_SPACING);
            if (currentIndex !== lastIndexRef.current) {
                playTick();
                if (typeof navigator !== 'undefined' && navigator.vibrate) {
                    navigator.vibrate(5);
                }
                lastIndexRef.current = currentIndex;
            }
        });
        return () => unsubscribe();
    }, [rotation, ITEM_SPACING]);

    // Handle Active State & Shortest Path Rotation
    useEffect(() => {
        if (isDragging) return;

        // Find the direct slot for the active item
        const targetIndex = displayItems.findIndex(item => item.id === activeId);
        if (targetIndex === -1) return;

        const targetAngle = -(targetIndex * ITEM_SPACING);
        animate(rotation, targetAngle, { type: "spring", damping, stiffness });

    }, [activeId, displayItems, ITEM_SPACING, isDragging, rotation]);

    const handlePan = (_: any, info: PanInfo) => {
        const delta = info.delta.x * 0.4;
        rotation.set(rotation.get() + delta);
    };

    const router = useRouter();

    // ... inside handlePanEnd ...

    const handlePanEnd = (_: any, info: PanInfo) => {
        setIsDragging(false);
        const velocity = info.velocity.x * 0.2;
        const currentRot = rotation.get();
        const targetRotation = currentRot + velocity;

        // Snap to nearest item slot
        const snapIndex = Math.round(-targetRotation / ITEM_SPACING);
        const snapAngle = -(snapIndex * ITEM_SPACING);

        animate(rotation, snapAngle, {
            type: "spring", stiffness: 200, damping: 20
        });

        // Determine which item is selected
        // snapIndex might be negative or large. Normalize to 0...N-1
        const normalizedIndex = ((snapIndex % TOTAL_ITEMS) + TOTAL_ITEMS) % TOTAL_ITEMS;
        const selectedItem = displayItems[normalizedIndex];

        if (selectedItem && selectedItem.id !== activeId) {
            onSelect(selectedItem.id);
            router.push(selectedItem.href);
        }
    };

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 h-[200px] overflow-visible z-50 pointer-events-none flex justify-center">
            {/* The Wheel Container */}
            <motion.div
                ref={containerRef}
                className="absolute bottom-[-350px] rounded-full border border-white/10 shadow-2xl pointer-events-auto cursor-grab active:cursor-grabbing touch-none"
                style={{
                    width: WHEEL_SIZE,
                    height: WHEEL_SIZE,
                    rotate: springRotation,
                    backgroundColor: "rgba(10, 10, 10, 0.4)", // Dark semi-transparent
                    backdropFilter: "blur(12px)", // Glassmorphism
                }}
                onPanStart={() => setIsDragging(true)}
                onPanEnd={handlePanEnd}
                onPan={handlePan}
            >
                {/* Decorative Inner Rings */}
                <div className="absolute inset-0 m-20 rounded-full border border-white/5 pointer-events-none" />
                <div className="absolute inset-0 m-32 rounded-full border border-dashed border-white/5 pointer-events-none" />

                {/* Items */}
                {displayItems.map((item, index) => (
                    <WheelItem
                        key={item.uniqueId}
                        item={item}
                        index={index}
                        totalItems={TOTAL_ITEMS}
                        radius={RADIUS}
                        rotation={rotation}
                        activeId={activeId}
                        onSelect={onSelect}
                    />
                ))}
            </motion.div>

            {/* Selection Triangle / Needle */}
            {/* Positioned relative to the SCREEN, pointing at the top of the wheel arc */}
            <div className="absolute bottom-[170px] z-[60] pointer-events-none">
                <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[12px] border-t-primary drop-shadow-[0_0_8px_var(--primary)]" />
            </div>

            {/* Bottom Label Guide */}
            <div className="absolute bottom-6 w-full text-center z-20 pointer-events-none">
                <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-medium">Swipe to Navigate</p>
            </div>

            {/* Fade Gradient at bottom to blend with bezel */}
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-background to-transparent -z-10" />
        </div>
    );
}
