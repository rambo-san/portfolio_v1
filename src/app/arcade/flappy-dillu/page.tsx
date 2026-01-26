"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RotateCcw, Trophy, Play, LogIn } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useGuestName } from "@/context/GuestNameContext";
import { useGameData } from "@/hooks/useGameData";
import { GameLayout } from "@/components/arcade/GameLayout";
import { useSiteConfig } from "@/context/SiteConfigContext";

type GameState = "READY" | "PLAYING" | "GAME_OVER";

interface Pipe {
    x: number;
    gapY: number;
    gapSize: number; // Store the specific gap for this pipe
    passed: boolean;
}

const CANVAS_WIDTH = 400; // Legacy ref, mostly unused now
const CANVAS_HEIGHT = 600; // Legacy ref

// ========== RESPONSIVE GAME SETTINGS ==========
// All values are calculated relative to screen dimensions for universal compatibility

// Bird size: 12% of the smaller dimension (works for both portrait and landscape)
const getBirdSize = (width: number, height: number) => Math.min(width, height) * 0.12;

// Bird X position: 15% from left edge
const getBirdX = (width: number) => width * 0.15;

// Pipe width: 10% of screen width
const getPipeWidth = (width: number) => Math.max(40, width * 0.1);

// Base pipe gap: 35% of screen height (comfortable gap)
const getBasePipeGap = (height: number) => height * 0.35;

// Minimum pipe gap: 25% of screen height (harder)
const getMinPipeGap = (height: number) => height * 0.25;

// Pipe speed: 25% of screen width per second
const getPipeSpeed = (width: number) => width * 0.25;

// Pipe spawn interval: spawn when pipes are 40% of screen width apart
const getPipeSpawnInterval = (width: number, speed: number) => (width * 0.4) / speed;

// Gravity: 200% of screen height per second squared
const getGravity = (height: number) => height * 2.0;

// Jump force: -60% of screen height per second
const getJumpForce = (height: number) => height * -0.6;

// Dynamic gap based on score (gets harder as score increases)
const getPipeGap = (baseGap: number, minGap: number, score: number) => {
    const reduction = score * (baseGap * 0.02); // 2% reduction per point
    return Math.max(minGap, baseGap - reduction);
};

const GAME_ID = "flappy-dillu";
const GAME_NAME = "Flappy Dillu";

export default function FlappyDilluPage() {
    const [scoreUpdateTrigger, setScoreUpdateTrigger] = useState(0); // Trigger for leaderboard
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const gameLoopRef = useRef<number | null>(null);
    const gameStartTime = useRef<number>(0);

    const { user } = useAuth();
    const { config } = useSiteConfig();
    const { guestName } = useGuestName();
    const { saveScore, getLeaderboard } = useGameData();

    // Theme and settings from config
    const { primary: primaryColor } = config.colors;
    const { requireLoginForLeaderboard } = config.gameSettings;

    const [gameState, setGameState] = useState<GameState>("READY");
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [scoreSaved, setScoreSaved] = useState(false);

    // Custom Game Over States
    const [gameOverType, setGameOverType] = useState<'normal' | 'skill_issue' | 'top_10' | 'guest_top_10'>('normal');
    const [achievedRank, setAchievedRank] = useState<number | null>(null);

    // Get player name from auth or guest context
    const playerName = user?.displayName || guestName || "Guest";
    const isLoggedIn = !!user;

    // Game state refs
    const birdY = useRef(300);
    const birdVelocity = useRef(0);
    const pipes = useRef<Pipe[]>([]);
    const scoreRef = useRef(0);
    const gameStateRef = useRef<GameState>("READY");
    const lastTimeRef = useRef<number>(0);
    const pipeSpawnTimer = useRef<number>(0);
    const gameOverSpaceCount = useRef(0);

    useEffect(() => {
        gameStateRef.current = gameState;
    }, [gameState]);

    useEffect(() => {
        const saved = localStorage.getItem("flappy-dillu-highscore");
        if (saved) setHighScore(parseInt(saved, 10));
    }, []);

    // Handle Resize
    useEffect(() => {
        const updateSize = () => {
            if (containerRef.current) {
                const { clientWidth, clientHeight } = containerRef.current;
                setDimensions({
                    width: clientWidth,
                    height: clientHeight
                });

                // If game is NOT running (READY), center the bird
                if (gameStateRef.current === "READY") {
                    birdY.current = clientHeight / 2;
                }
            }
        };

        window.addEventListener('resize', updateSize);
        updateSize(); // Initial

        // ResizeObserver for more robust sizing
        const observer = new ResizeObserver(updateSize);
        if (containerRef.current) observer.observe(containerRef.current);

        return () => {
            window.removeEventListener('resize', updateSize);
            observer.disconnect();
        };
    }, []);

    const resetGame = useCallback(() => {
        // Use current dimensions from state/ref
        if (containerRef.current) {
            birdY.current = containerRef.current.clientHeight / 2;
        }
        birdVelocity.current = 0;
        pipes.current = [];
        scoreRef.current = 0;
        pipeSpawnTimer.current = 0;
        lastTimeRef.current = 0;
        gameStartTime.current = 0;
        setScore(0);
        setScoreSaved(false);
        setGameOverType('normal'); // Reset type
        setAchievedRank(null);
    }, []);

    const restartGame = useCallback(() => {
        resetGame();
        setGameState("READY");
    }, [resetGame]);

    const jump = useCallback(() => {
        if (gameStateRef.current === "READY") {
            lastTimeRef.current = performance.now();
            gameStartTime.current = performance.now();
            setGameState("PLAYING");

            if (containerRef.current) {
                const width = containerRef.current.clientWidth;
                const height = containerRef.current.clientHeight;

                // Use responsive jump force
                birdVelocity.current = getJumpForce(height);

                // Calculate responsive game parameters
                const pipeSpeed = getPipeSpeed(width);
                const spawnInterval = getPipeSpawnInterval(width, pipeSpeed);
                const spacing = pipeSpeed * spawnInterval;
                const baseGap = getBasePipeGap(height);
                const minGap = getMinPipeGap(height);
                const birdSize = getBirdSize(width, height);

                // Clear existing pipes
                pipes.current = [];

                // Start pipes from 60% of screen width
                let currentX = width * 0.6;
                const minGapTop = height * 0.08; // 8% from top

                while (currentX < width + spacing) {
                    const currentGap = getPipeGap(baseGap, minGap, scoreRef.current);
                    const maxGapTop = height - currentGap - birdSize;

                    const gapY = Math.random() * (maxGapTop - minGapTop) + minGapTop;
                    pipes.current.push({ x: currentX, gapY, gapSize: currentGap, passed: false });
                    currentX += spacing;
                }

                if (pipes.current.length > 0) {
                    const lastPipeX = pipes.current[pipes.current.length - 1].x;
                    const distanceToWait = (lastPipeX + spacing) - width;
                    const timeToWait = distanceToWait / pipeSpeed;
                    pipeSpawnTimer.current = spawnInterval - timeToWait;
                } else {
                    pipeSpawnTimer.current = 0;
                }
            }

        } else if (gameStateRef.current === "PLAYING") {
            if (containerRef.current) {
                const height = containerRef.current.clientHeight;
                birdVelocity.current = getJumpForce(height);
            }
        }
    }, []);

    // Global keyboard handler
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === "Space" || e.code === "ArrowUp") {
                e.preventDefault();
                if (gameStateRef.current === "GAME_OVER") {
                    gameOverSpaceCount.current += 1;
                    if (gameOverSpaceCount.current >= 2) {
                        restartGame();
                    }
                } else {
                    jump();
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [jump, restartGame]);

    const handleCanvasClick = useCallback(() => {
        jump();
    }, [jump]);

    const birdImageRef = useRef<HTMLImageElement | null>(null);

    // Load Bird Image
    useEffect(() => {
        const img = new Image();
        img.src = "/resource/flappy_dillu/dillu_flappy_face.png";
        img.onload = () => {
            birdImageRef.current = img;
        };
    }, []);

    // Render function updated to use dynamic dimensions
    const renderFrame = useCallback((ctx: CanvasRenderingContext2D) => {
        const { width, height } = ctx.canvas;

        // Calculate responsive sizes for this frame
        const birdSize = getBirdSize(width, height);
        const birdX = getBirdX(width);
        const pipeWidth = getPipeWidth(width);
        const baseGap = getBasePipeGap(height);
        const minGap = getMinPipeGap(height);

        // Background
        ctx.fillStyle = "#0a0a0a";
        ctx.fillRect(0, 0, width, height);

        // Grid pattern (responsive spacing)
        const gridSize = Math.max(20, Math.min(width, height) * 0.04);
        ctx.strokeStyle = `rgba(var(--primary-rgb), 0.05)`;
        ctx.lineWidth = 1;
        for (let x = 0; x < width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }
        for (let y = 0; y < height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }

        // Pipes
        ctx.fillStyle = primaryColor;
        pipes.current.forEach((pipe) => {
            const currentGap = pipe.gapSize || getPipeGap(baseGap, minGap, 0);

            ctx.fillRect(pipe.x, 0, pipeWidth, pipe.gapY);
            ctx.fillRect(pipe.x, pipe.gapY + currentGap, pipeWidth, height - pipe.gapY - currentGap);

            ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
            // Cap (5% of pipe width for overhang)
            const capOverhang = pipeWidth * 0.1;
            const capHeight = pipeWidth * 0.25;
            ctx.fillRect(pipe.x - capOverhang, pipe.gapY - capHeight, pipeWidth + capOverhang * 2, capHeight);
            ctx.fillRect(pipe.x - capOverhang, pipe.gapY + currentGap, pipeWidth + capOverhang * 2, capHeight);
            ctx.fillStyle = primaryColor;
        });

        // Bird Calculation
        const birdYPos = birdY.current;

        if (birdImageRef.current) {
            const img = birdImageRef.current;
            const aspect = img.naturalWidth / img.naturalHeight;

            const drawHeight = birdSize;
            const drawWidth = drawHeight * aspect;

            ctx.save();
            ctx.translate(birdX + birdSize / 2, birdYPos + birdSize / 2);

            // Rotation based on velocity (normalized to screen size)
            let targetRotation = birdVelocity.current / height * 0.8;
            targetRotation = Math.max(-0.5, Math.min(Math.PI / 2, targetRotation));
            ctx.rotate(targetRotation);

            ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
            ctx.restore();
        } else {
            // Fallback circle
            ctx.beginPath();
            ctx.arc(birdX + birdSize / 2, birdYPos + birdSize / 2, birdSize / 2, 0, Math.PI * 2);
            ctx.fillStyle = "#fbbf24";
            ctx.fill();
        }
    }, [primaryColor]);

    // Main game loop updated
    useEffect(() => {
        if (gameState !== "READY" && gameState !== "PLAYING") return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Ensure canvas setup
        const cleanup = () => {
            if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
        };

        let animationStartTime = performance.now();

        const endGame = async () => {
            setGameState("GAME_OVER");
            gameOverSpaceCount.current = 0; // Reset counter overlay

            const finalScore = scoreRef.current;
            const duration = Math.floor((performance.now() - gameStartTime.current) / 1000);

            // 1. Check for Skill Issue (0 Score)
            if (finalScore === 0) {
                setGameOverType('skill_issue');
                return; // No need to check leaderboard
            }

            if (finalScore > highScore) {
                setHighScore(finalScore);
                localStorage.setItem("flappy-dillu-highscore", finalScore.toString());
            }

            // 2. Check Rank / Top 10
            try {
                // Fetch current top 10
                const leaderboard = await getLeaderboard(GAME_ID, 10);

                // Calculate potential rank
                let potentialRank = 1;
                for (const entry of leaderboard) {
                    if (finalScore < entry.score) {
                        potentialRank++;
                    }
                }

                // If leaderboard is full (10) and we are worse than 10th
                if (leaderboard.length >= 10 && finalScore <= leaderboard[leaderboard.length - 1].score) {
                    setGameOverType('normal');
                } else if (potentialRank <= 10) {
                    setAchievedRank(potentialRank);
                    if (user) {
                        setGameOverType('top_10');
                    } else {
                        setGameOverType('guest_top_10');
                    }
                } else {
                    setGameOverType('normal');
                }

            } catch (err) {
                console.error("Rank check failed", err);
                setGameOverType('normal');
            }

            if ((user || !requireLoginForLeaderboard) && finalScore > 0) {
                const sessionId = await saveScore(GAME_ID, GAME_NAME, finalScore, duration);
                if (sessionId) {
                    setScoreSaved(true);
                    setScoreUpdateTrigger(Date.now());
                }
            }
        };

        const gameLoop = (currentTime: number) => {
            const currentState = gameStateRef.current;
            const { width, height } = ctx.canvas;

            if (currentState !== "READY" && currentState !== "PLAYING") return;

            if (currentState === "READY") {
                const elapsed = (currentTime - animationStartTime) / 1000;
                birdY.current = (height / 2) + Math.sin(elapsed * 3) * 15;
                renderFrame(ctx);

                // Overlay for READY
                ctx.fillStyle = "rgba(0,0,0,0.4)";
                ctx.fillRect(0, 0, width, height);

            } else if (currentState === "PLAYING") {
                if (lastTimeRef.current === 0) lastTimeRef.current = currentTime;

                // Cap delta time to prevent huge jumps
                const deltaTime = Math.min((currentTime - lastTimeRef.current) / 1000, 0.05);
                lastTimeRef.current = currentTime;

                // Calculate responsive game parameters
                const gravity = getGravity(height);
                const pipeSpeed = getPipeSpeed(width);
                const spawnInterval = getPipeSpawnInterval(width, pipeSpeed);
                const baseGap = getBasePipeGap(height);
                const minGap = getMinPipeGap(height);
                const birdSize = getBirdSize(width, height);
                const birdX = getBirdX(width);
                const pipeWidth = getPipeWidth(width);

                birdVelocity.current += gravity * deltaTime;
                birdY.current += birdVelocity.current * deltaTime;

                pipeSpawnTimer.current += deltaTime;
                if (pipeSpawnTimer.current >= spawnInterval) {
                    pipeSpawnTimer.current = 0;
                    const currentGap = getPipeGap(baseGap, minGap, scoreRef.current);
                    const minGapTop = height * 0.08;
                    const maxGapTop = height - currentGap - birdSize;
                    const gapY = Math.random() * (maxGapTop - minGapTop) + minGapTop;

                    pipes.current.push({ x: width, gapY, gapSize: currentGap, passed: false });
                }

                pipes.current = pipes.current.filter((pipe) => pipe.x + pipeWidth > 0);
                pipes.current.forEach((pipe) => {
                    pipe.x -= pipeSpeed * deltaTime;
                    if (!pipe.passed && pipe.x + pipeWidth < birdX) {
                        pipe.passed = true;
                        scoreRef.current++;
                        setScore(scoreRef.current);
                    }
                });

                // Collision detection with responsive hitbox
                const HITBOX_SCALE = 0.6;
                const hitboxSize = birdSize * HITBOX_SCALE;
                const hitboxOffset = (birdSize - hitboxSize) / 2;

                const birdLeft = birdX + hitboxOffset;
                const birdRight = birdLeft + hitboxSize;
                const birdTop = birdY.current + hitboxOffset;
                const birdBottom = birdTop + hitboxSize;

                // Floor/Ceiling collision
                if (birdTop < 0 || birdBottom > height) {
                    endGame();
                    return;
                }

                for (const pipe of pipes.current) {
                    if (birdRight > pipe.x && birdLeft < pipe.x + pipeWidth) {
                        const currentGap = pipe.gapSize || getPipeGap(baseGap, minGap, 0);
                        if (birdTop < pipe.gapY || birdBottom > pipe.gapY + currentGap) {
                            endGame();
                            return;
                        }
                    }
                }

                renderFrame(ctx);
            }

            gameLoopRef.current = requestAnimationFrame(gameLoop);
        };

        gameLoopRef.current = requestAnimationFrame(gameLoop);

        return cleanup;
    }, [gameState, highScore, renderFrame, user, saveScore, getLeaderboard, requireLoginForLeaderboard]);


    return (
        <GameLayout
            gameId={GAME_ID}
            gameName={GAME_NAME}
            scoreUpdateTrigger={scoreUpdateTrigger}
            currentScore={score}
        >
            <div ref={containerRef} className="absolute inset-0 bg-[#0a0a0a] overflow-hidden">
                <canvas
                    ref={canvasRef}
                    width={dimensions.width}
                    height={dimensions.height}
                    onClick={handleCanvasClick}
                    className="block w-full h-full cursor-pointer touch-none"
                    style={{ touchAction: 'none' }}
                />

                {/* UI Overlays */}
                <AnimatePresence>
                    {gameState === "READY" && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px] pointer-events-none"
                        >
                            <div className="bg-black/60 p-6 rounded-2xl border border-white/10 text-center">
                                <h2 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent mb-2">
                                    Flappy Dillu
                                </h2>
                                <p className="text-white/80">Press Space or Tap to Jump</p>
                            </div>
                        </motion.div>
                    )}

                    {gameState === "PLAYING" && (
                        <div className="absolute top-8 left-0 right-0 text-center pointer-events-none">
                            <span className="text-6xl font-black text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] stroke-black tracking-wider">
                                {score}
                            </span>
                        </div>
                    )}

                    {gameState === "GAME_OVER" && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-md z-50 p-4"
                        >
                            <div className="flex flex-col items-center w-[90%] max-w-sm md:max-w-md relative z-20">
                                {/* CARD CONTENT BASED ON TYPE */}
                                {gameOverType === 'skill_issue' ? (
                                    <div className="relative w-full aspect-[3/4] rounded-[1.5rem] md:rounded-[2rem] overflow-hidden shadow-2xl border border-primary/30 mb-4 md:mb-6 group">
                                        {/* Full Background Image */}
                                        <div className="absolute inset-0 bg-primary/20">
                                            <img src="/resource/flappy_dillu/dillu_flappy_skill_issue.png" alt="Skill Issue" className="w-full h-full object-cover object-top" />
                                        </div>

                                        {/* Gradient Overlay */}
                                        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black via-black/80 to-transparent flex flex-col justify-end p-6 md:p-8 text-center">
                                            <h2 className="text-4xl md:text-5xl font-black text-primary mb-2 drop-shadow-[0_4px_4px_rgba(0,0,0,1)] tracking-tighter">SKILL ISSUE</h2>
                                            <div className="bg-primary/20 backdrop-blur-md px-4 py-1 md:px-6 md:py-2 rounded-full border border-primary/40 inline-flex items-center justify-center gap-2 mx-auto mb-3 md:mb-4">
                                                <span className="text-white font-bold tracking-widest text-xs md:text-sm">SCORE: 0</span>
                                            </div>
                                            <p className="text-white/70 italic text-xs md:text-sm font-medium">"Don't worry bro, it happens."</p>
                                        </div>
                                    </div>
                                ) : (gameOverType === 'top_10' || gameOverType === 'guest_top_10') ? (
                                    <div className="relative w-full aspect-[3/4] rounded-[1.5rem] md:rounded-[2rem] overflow-hidden shadow-2xl border border-yellow-500/30 mb-4 md:mb-6 group">
                                        {/* Full Background Image */}
                                        <div className="absolute inset-0 bg-yellow-900/20">
                                            <img src="/resource/flappy_dillu/dillu_flappy_congrats.png" alt="Congrats" className="w-full h-full object-cover object-top" />
                                        </div>

                                        {/* Gradient Overlay */}
                                        <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-black via-black/90 to-transparent flex flex-col justify-end p-6 md:p-8 text-center">
                                            <div className="mb-1">
                                                <span className="text-yellow-400 font-bold uppercase tracking-[0.2em] text-[10px] md:text-xs drop-shadow-md">Outstanding Performance</span>
                                            </div>

                                            <h2 className="text-6xl md:text-7xl font-black text-white mb-1 drop-shadow-2xl">{score}</h2>
                                            <p className="text-white/40 font-medium text-[10px] md:text-xs uppercase tracking-widest mb-4 md:mb-6 border-b border-white/10 pb-4 md:pb-6">Total Points</p>

                                            <div className="flex justify-between items-end w-full px-2">
                                                <div className="text-left">
                                                    <p className="text-white/40 text-[10px] uppercase font-bold tracking-wider mb-1">Rank</p>
                                                    <p className="text-yellow-400 text-2xl md:text-3xl font-black leading-none">#{achievedRank || '?'}</p>
                                                </div>
                                                <div className="text-right max-w-[60%]">
                                                    <p className="text-white/60 text-[9px] md:text-[10px] leading-tight">
                                                        {gameOverType === 'top_10'
                                                            ? "You are now a certified Dillu Legend."
                                                            : "Top 10 stats achieved! Log in to save."}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    // NORMAL GAME OVER
                                    <div className="bg-white/5 p-6 md:p-8 rounded-3xl border border-white/10 text-center backdrop-blur-md mb-4 md:mb-6 w-full relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>
                                        <h2 className="text-6xl md:text-7xl font-black text-white mb-2 tracking-tighter relative z-10">{score}</h2>
                                        <div className="text-white/40 font-medium uppercase tracking-widest text-xs md:text-sm mb-4 md:mb-6 relative z-10">Final Score</div>

                                        <div className="flex items-center justify-center gap-2 text-white/50 bg-white/5 py-2 px-4 rounded-lg mx-auto w-fit relative z-10 border border-white/5">
                                            <Trophy className="w-4 h-4 text-yellow-500" />
                                            <span className="font-mono text-xs md:text-sm">BEST: {highScore}</span>
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-2 md:gap-3 w-full">
                                    <Button
                                        onClick={restartGame}
                                        className="flex-1 bg-white hover:bg-gray-200 text-black h-12 md:h-14 text-sm md:text-lg font-bold rounded-xl shadow-lg transition-all active:scale-95 translate-y-0 hover:-translate-y-1"
                                    >
                                        <RotateCcw className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                                        Play Again
                                    </Button>
                                    <Link href="/arcade" className="flex-1">
                                        <Button
                                            variant="outline"
                                            className="w-full bg-black/60 border-white/20 hover:bg-white/10 text-white h-12 md:h-14 text-sm md:text-lg font-medium rounded-xl backdrop-blur-sm transition-all"
                                        >
                                            <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                                            Exit
                                        </Button>
                                    </Link>
                                </div>
                                <p className="text-white/30 text-[9px] md:text-[10px] uppercase tracking-widest mt-4 md:mt-6 font-medium animate-pulse">Press Space twice to restart</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </GameLayout>
    );
}
