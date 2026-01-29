"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTorch } from '@/context/TorchContext';

export function TorchOverlay() {
    const { isTorchMode } = useTorch();
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        if (!isTorchMode) return;

        const handleMouseMove = (e: MouseEvent) => {
            // Using requestAnimationFrame for smoother performance
            requestAnimationFrame(() => {
                setMousePos({ x: e.clientX, y: e.clientY });
            });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [isTorchMode]);

    useEffect(() => {
        if (isTorchMode) {
            document.body.style.cursor = 'none';
        } else {
            document.body.style.cursor = 'auto';
        }
        return () => {
            document.body.style.cursor = 'auto';
        };
    }, [isTorchMode]);

    return (
        <AnimatePresence>
            {isTorchMode && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="fixed inset-0 z-[9999] pointer-events-none overflow-hidden"
                    style={{
                        background: `radial-gradient(circle 180px at ${mousePos.x}px ${mousePos.y}px, rgba(0,0,0,0) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.98) 100%)`,
                    }}
                >
                    {/* The "Bulb" of the torch (the cursor replacement) */}
                    <div
                        className="absolute w-8 h-8 rounded-full border border-white/20 bg-white/5"
                        style={{
                            left: mousePos.x - 16,
                            top: mousePos.y - 16,
                            boxShadow: '0 0 20px rgba(255,255,255,0.2), inset 0 0 10px rgba(255,255,255,0.1)',
                        }}
                    />

                    {/* Beam effect glow */}
                    <div
                        className="absolute w-[400px] h-[400px] rounded-full opacity-30"
                        style={{
                            left: mousePos.x - 200,
                            top: mousePos.y - 200,
                            background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 70%)',
                            filter: 'blur(30px)',
                        }}
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
}
