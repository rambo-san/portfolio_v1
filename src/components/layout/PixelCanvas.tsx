"use client";

import React, { useEffect, useRef } from 'react';

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    life: number;
    color: string;
}

export function PixelCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let mouse = { x: -1000, y: -1000 };
        let lastMouse = { x: -1000, y: -1000 };

        const pixelSize = 30;
        let cols = 0;
        let rows = 0;
        let pixels: { x: number, y: number, intensity: number, targetIntensity: number }[] = [];
        let particles: Particle[] = [];

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            cols = Math.ceil(canvas.width / pixelSize);
            rows = Math.ceil(canvas.height / pixelSize);

            pixels = [];
            for (let i = 0; i < cols; i++) {
                for (let j = 0; j < rows; j++) {
                    pixels.push({
                        x: i * pixelSize,
                        y: j * pixelSize,
                        intensity: 0,
                        targetIntensity: 0
                    });
                }
            }
        };

        const handleMouseMove = (e: MouseEvent) => {
            lastMouse.x = mouse.x;
            lastMouse.y = mouse.y;
            mouse.x = e.clientX;
            mouse.y = e.clientY;

            // Emit particles on move
            if (lastMouse.x !== -1000) {
                const dist = Math.sqrt(Math.pow(mouse.x - lastMouse.x, 2) + Math.pow(mouse.y - lastMouse.y, 2));
                if (dist > 5) {
                    const primaryRgb = getComputedStyle(document.documentElement).getPropertyValue('--primary-rgb').trim() || '255, 0, 0';
                    for (let i = 0; i < 2; i++) {
                        particles.push({
                            x: mouse.x,
                            y: mouse.y,
                            vx: (Math.random() - 0.5) * 2,
                            vy: (Math.random() - 0.5) * 2,
                            size: Math.random() * 3 + 1,
                            life: 1.0,
                            color: `rgba(${primaryRgb}, 0.5)`
                        });
                    }
                }
            }
        };

        const render = () => {
            // Get colors from CSS variables
            const primaryRgb = getComputedStyle(document.documentElement).getPropertyValue('--primary-rgb').trim() || '255, 0, 0';
            const bgColor = getComputedStyle(document.documentElement).getPropertyValue('background-color').trim() || '#0a0a0a';

            // Draw Background to make it a true "body bg"
            ctx.fillStyle = bgColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw Pixels
            pixels.forEach(p => {
                const dx = mouse.x - (p.x + pixelSize / 2);
                const dy = mouse.y - (p.y + pixelSize / 2);
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 350) {
                    p.targetIntensity = (1 - dist / 350) * 0.8;
                } else {
                    p.targetIntensity = 0;
                }

                p.intensity += (p.targetIntensity - p.intensity) * 0.1;

                if (p.intensity > 0.001) {
                    const size = pixelSize * (0.2 + p.intensity * 4);
                    const offset = (pixelSize - size) / 2;

                    ctx.fillStyle = `rgba(${primaryRgb}, ${p.intensity * 1.8})`;
                    ctx.fillRect(p.x + offset, p.y + offset, size, size);

                    if (p.intensity > 0.25) {
                        ctx.shadowBlur = 30;
                        ctx.shadowColor = `rgba(${primaryRgb}, ${p.intensity})`;
                    } else {
                        ctx.shadowBlur = 0;
                    }
                }
            });

            // Draw Particles
            ctx.shadowBlur = 0;
            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];
                p.x += p.vx;
                p.y += p.vy;
                p.life -= 0.02;

                if (p.life <= 0) {
                    particles.splice(i, 1);
                } else {
                    ctx.fillStyle = p.color.replace('0.5', (p.life * 0.8).toString());
                    ctx.fillRect(p.x, p.y, p.size, p.size);
                }
            }

            animationFrameId = requestAnimationFrame(render);
        };

        window.addEventListener('resize', resize);
        window.addEventListener('mousemove', handleMouseMove);
        resize();
        render();

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-[-1]"
        />
    );
}
