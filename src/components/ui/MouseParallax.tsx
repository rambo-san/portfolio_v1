"use client";

import React, { useRef, useState, useEffect } from 'react';
import { motion, useSpring, useMotionValue, useTransform } from 'framer-motion';

interface MouseParallaxProps {
    children: React.ReactNode;
    strength?: number;
    className?: string;
}

export function MouseParallax({ children, strength = 20, className = "" }: MouseParallaxProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [isHovered, setIsHovered] = useState(false);

    // Position of mouse relative to card center
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    // Glare position
    const glareX = useMotionValue(50); // percentage
    const glareY = useMotionValue(50); // percentage

    const springConfig = { damping: 25, stiffness: 150 };
    const springX = useSpring(x, springConfig);
    const springY = useSpring(y, springConfig);

    // Rotation transforms
    const rotateX = useTransform(springY, [-300, 300], [strength, -strength]);
    const rotateY = useTransform(springX, [-300, 300], [-strength, strength]);

    // Background brightness transform for glare
    const glareOpacity = useTransform(
        [springX, springY],
        ([latestX, latestY]) => {
            const dist = Math.sqrt(Math.pow(latestX as number, 2) + Math.pow(latestY as number, 2));
            return Math.min(dist / 300, 0.4);
        }
    );

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();

        // Calculate center relative position
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        x.set(e.clientX - centerX);
        y.set(e.clientY - centerY);

        // Calculate percentage for glare
        const pX = ((e.clientX - rect.left) / rect.width) * 100;
        const pY = ((e.clientY - rect.top) / rect.height) * 100;
        glareX.set(pX);
        glareY.set(pY);
    };

    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => {
        setIsHovered(false);
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={{
                perspective: 1200,
                transformStyle: "preserve-3d",
            }}
            className={`relative ${className}`}
        >
            <motion.div
                style={{
                    rotateX,
                    rotateY,
                    transformStyle: "preserve-3d",
                }}
                className="w-full h-full"
            >
                {/* 3D Content Wrapper */}
                <div style={{ transform: "translateZ(50px)" }} className="relative z-10">
                    {children}
                </div>

                {/* Glass Glare Effect */}
                <motion.div
                    style={{
                        position: "absolute",
                        inset: 0,
                        zIndex: 20,
                        pointerEvents: "none",
                        opacity: isHovered ? glareOpacity : 0,
                        background: useTransform(
                            [glareX, glareY],
                            ([latestX, latestY]) =>
                                `radial-gradient(circle at ${latestX}% ${latestY}%, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 80%)`
                        ),
                        transform: "translateZ(80px)",
                    }}
                />
            </motion.div>
        </motion.div>
    );
}
