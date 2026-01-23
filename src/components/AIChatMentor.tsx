'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// ColorOrb Component (from MorphPanel)
// ============================================================================
interface OrbProps {
    dimension?: string;
    className?: string;
    tones?: {
        base?: string;
        accent1?: string;
        accent2?: string;
        accent3?: string;
    };
    spinDuration?: number;
}

const ColorOrb: React.FC<OrbProps> = ({
    dimension = "192px",
    className,
    tones,
    spinDuration = 20,
}) => {
    const fallbackTones = {
        base: "oklch(95% 0.02 264.695)",
        accent1: "oklch(75% 0.15 350)",
        accent2: "oklch(80% 0.12 200)",
        accent3: "oklch(78% 0.14 280)",
    };

    const palette = { ...fallbackTones, ...tones };
    const dimValue = parseInt(dimension.replace("px", ""), 10);

    const blurStrength = dimValue < 50 ? Math.max(dimValue * 0.008, 1) : Math.max(dimValue * 0.015, 4);
    const contrastStrength = dimValue < 50 ? Math.max(dimValue * 0.004, 1.2) : Math.max(dimValue * 0.008, 1.5);
    const pixelDot = dimValue < 50 ? Math.max(dimValue * 0.004, 0.05) : Math.max(dimValue * 0.008, 0.1);
    const shadowRange = dimValue < 50 ? Math.max(dimValue * 0.004, 0.5) : Math.max(dimValue * 0.008, 2);
    const maskRadius = dimValue < 30 ? "0%" : dimValue < 50 ? "5%" : dimValue < 100 ? "15%" : "25%";
    const adjustedContrast = dimValue < 30 ? 1.1 : dimValue < 50 ? Math.max(contrastStrength * 1.2, 1.3) : contrastStrength;

    return (
        <div
            className={cn("color-orb", className)}
            style={{
                width: dimension,
                height: dimension,
                "--base": palette.base,
                "--accent1": palette.accent1,
                "--accent2": palette.accent2,
                "--accent3": palette.accent3,
                "--spin-duration": `${spinDuration}s`,
                "--blur": `${blurStrength}px`,
                "--contrast": adjustedContrast,
                "--dot": `${pixelDot}px`,
                "--shadow": `${shadowRange}px`,
                "--mask": maskRadius,
            } as React.CSSProperties}
        >
            <style jsx>{`
                @property --angle {
                    syntax: "<angle>";
                    inherits: false;
                    initial-value: 0deg;
                }

                .color-orb {
                    display: grid;
                    grid-template-areas: "stack";
                    overflow: hidden;
                    border-radius: 50%;
                    position: relative;
                    transform: scale(1.1);
                }

                .color-orb::before,
                .color-orb::after {
                    content: "";
                    display: block;
                    grid-area: stack;
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                    transform: translateZ(0);
                }

                .color-orb::before {
                    background:
                        conic-gradient(from calc(var(--angle) * 2) at 25% 70%, var(--accent3), transparent 20% 80%, var(--accent3)),
                        conic-gradient(from calc(var(--angle) * 2) at 45% 75%, var(--accent2), transparent 30% 60%, var(--accent2)),
                        conic-gradient(from calc(var(--angle) * -3) at 80% 20%, var(--accent1), transparent 40% 60%, var(--accent1)),
                        conic-gradient(from calc(var(--angle) * 2) at 15% 5%, var(--accent2), transparent 10% 90%, var(--accent2)),
                        conic-gradient(from calc(var(--angle) * 1) at 20% 80%, var(--accent1), transparent 10% 90%, var(--accent1)),
                        conic-gradient(from calc(var(--angle) * -2) at 85% 10%, var(--accent3), transparent 20% 80%, var(--accent3));
                    box-shadow: inset var(--base) 0 0 var(--shadow) calc(var(--shadow) * 0.2);
                    filter: blur(var(--blur)) contrast(var(--contrast));
                    animation: spin var(--spin-duration) linear infinite;
                }

                .color-orb::after {
                    background-image: radial-gradient(circle at center, var(--base) var(--dot), transparent var(--dot));
                    background-size: calc(var(--dot) * 2) calc(var(--dot) * 2);
                    backdrop-filter: blur(calc(var(--blur) * 2)) contrast(calc(var(--contrast) * 2));
                    mix-blend-mode: overlay;
                }

                .color-orb[style*="--mask: 0%"]::after {
                    mask-image: none;
                }

                .color-orb:not([style*="--mask: 0%"])::after {
                    mask-image: radial-gradient(black var(--mask), transparent 75%);
                }

                @keyframes spin {
                    to {
                        --angle: 360deg;
                    }
                }

                @media (prefers-reduced-motion: reduce) {
                    .color-orb::before {
                        animation: none;
                    }
                }
            `}</style>
        </div>
    );
};

// ============================================================================
// Floating Particles Component (from AIChatCard)
// ============================================================================
const FloatingParticles = () => {
    const particles = useMemo(() =>
        Array.from({ length: 15 }).map((_, i) => ({
            id: i,
            left: `${Math.random() * 100}%`,
            xStart: Math.random() * 200 - 100,
            xEnd: Math.random() * 200 - 100,
            duration: 5 + Math.random() * 3,
            delay: i * 0.4,
        })), []
    );

    return (
        <>
            {particles.map((p) => (
                <motion.div
                    key={p.id}
                    className="absolute w-1 h-1 rounded-full bg-white/10"
                    animate={{
                        y: ["0%", "-140%"],
                        x: [p.xStart, p.xEnd],
                        opacity: [0, 1, 0],
                    }}
                    transition={{
                        duration: p.duration,
                        repeat: Infinity,
                        delay: p.delay,
                        ease: "easeInOut",
                    }}
                    style={{ left: p.left, bottom: "-10%" }}
                />
            ))}
        </>
    );
};

// ============================================================================
// Message Interface
// ============================================================================
interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

// ============================================================================
// AIChatMentor Component (Unified with MorphPanel + AIChatCard)
// ============================================================================
export default function AIChatMentor() {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: "👋 Hello! I'm your Meridian AI Mentor. I can help you understand market trends, explain predictions, or guide you through currency transfers.",
            timestamp: new Date(),
        },
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    const triggerClose = useCallback(() => {
        setIsOpen(false);
        textareaRef.current?.blur();
    }, []);

    const triggerOpen = useCallback(() => {
        setIsOpen(true);
        setTimeout(() => {
            textareaRef.current?.focus();
        }, 100);
    }, []);

    // Handle external "Ask AI" events
    const askQuestion = useCallback((question: string, aiResponse: string) => {
        setIsOpen(true);

        // Add user question
        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: question,
            timestamp: new Date(),
        };
        setMessages(prev => [...prev, userMsg]);
        setIsTyping(true);

        // Simulate AI response
        setTimeout(() => {
            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: aiResponse,
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, aiMsg]);
            setIsTyping(false);
        }, 1200);
    }, []);

    // Listen for custom "askAIMentor" events
    useEffect(() => {
        const handleAskAI = (e: CustomEvent<{ question: string; response: string }>) => {
            askQuestion(e.detail.question, e.detail.response);
        };

        window.addEventListener('askAIMentor', handleAskAI as EventListener);
        return () => window.removeEventListener('askAIMentor', handleAskAI as EventListener);
    }, [askQuestion]);

    // Click outside to close
    useEffect(() => {
        function clickOutsideHandler(e: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as any) && isOpen) {
                triggerClose();
            }
        }
        document.addEventListener("mousedown", clickOutsideHandler);
        return () => document.removeEventListener("mousedown", clickOutsideHandler);
    }, [isOpen, triggerClose]);

    // Auto-scroll messages
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        // Mock AI response based on input
        const responseMap: Record<string, string> = {
            'why wait': "🤖 Based on our LSTM prediction model, the USD/INR rate shows a **+0.42% upward momentum** over the next 24 hours. Waiting could save you approximately ₹500 on a $3,000 transfer. The RSI indicator is at 62 and climbing!",
            'market': "🤖 Current market analysis shows the Fed is expected to maintain rates, which typically strengthens USD. Combined with RBI's dovish stance, we predict continued INR weakness. Best time to transfer: within the next 6-12 hours.",
            'platform': "🤖 For USD→INR, I recommend **Wise** for the best overall value. They offer the mid-market rate with a 0.45% fee. Transfer takes about 1-2 hours. On $3,000, you'd save ₹2,100 compared to HDFC Bank!",
        };

        let response = "🤖 Based on current LSTM models, the USD/INR pair is showing a bullish trend. I'd recommend waiting for the RSI to stabilize before making a large transfer.";

        const inputLower = input.toLowerCase();
        for (const [key, value] of Object.entries(responseMap)) {
            if (inputLower.includes(key)) {
                response = value;
                break;
            }
        }

        setTimeout(() => {
            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: response,
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, aiMsg]);
            setIsTyping(false);
        }, 1200);
    };

    const handleKeys = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Escape') triggerClose();
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[70]" ref={wrapperRef}>
            {/* Morphing Container with Animated Border */}
            <div className="relative p-[2px]">
                {/* Animated Outer Border */}
                <motion.div
                    className="absolute inset-0 rounded-3xl border-2 border-white/20 pointer-events-none"
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    style={{ display: isOpen ? 'block' : 'none' }}
                />

                <motion.div
                    data-panel
                    className="relative overflow-hidden backdrop-blur-2xl border border-white/10 flex flex-col items-center shadow-[0_24px_100px_rgba(0,0,0,0.5)]"
                    initial={false}
                    animate={{
                        width: isOpen ? 400 : 160,
                        height: isOpen ? 500 : 48,
                        borderRadius: 24,
                    }}
                    transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 40,
                        mass: 0.8,
                    }}
                >
                    {/* Animated Background Gradient */}
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-gray-800 via-black to-gray-900"
                        animate={{ backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"] }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        style={{ backgroundSize: "200% 200%" }}
                    />

                    {/* Floating Particles (only when expanded) */}
                    {isOpen && <FloatingParticles />}

                    {/* Collapsed State: Dock Bar */}
                    <AnimatePresence>
                        {!isOpen && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.15 }}
                                className="h-full flex items-center justify-center gap-3 px-4 cursor-pointer select-none relative z-10"
                                onClick={triggerOpen}
                            >
                                <ColorOrb dimension="28px" tones={{ base: "oklch(22.64% 0 0)" }} />
                                <span className="text-white font-semibold text-sm whitespace-nowrap">Ask AI</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Expanded State: Full Chat */}
                    <AnimatePresence>
                        {isOpen && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2, delay: 0.1 }}
                                className="flex flex-col h-full w-full relative z-10"
                            >
                                {/* Header */}
                                <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between shrink-0">
                                    <div className="flex items-center gap-3">
                                        <ColorOrb dimension="32px" tones={{ base: "oklch(22.64% 0 0)" }} />
                                        <div>
                                            <h3 className="text-white font-syne font-bold text-sm leading-tight">🤖 AI Mentor</h3>
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-1.5 h-1.5 rounded-full bg-[#28ff00] animate-pulse" />
                                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Active</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={triggerClose}
                                        className="p-2 rounded-xl hover:bg-white/10 text-gray-400 transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Messages */}
                                <div
                                    ref={scrollRef}
                                    className="flex-1 overflow-y-auto px-4 py-3 space-y-3 text-sm flex flex-col"
                                >
                                    {messages.map((msg) => (
                                        <motion.div
                                            key={msg.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.4 }}
                                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div
                                                className={cn(
                                                    "max-w-[85%] px-3 py-2 rounded-xl shadow-md backdrop-blur-md",
                                                    msg.role === 'user'
                                                        ? "bg-white/30 text-black font-semibold rounded-tr-none"
                                                        : "bg-white/10 text-white rounded-tl-none"
                                                )}
                                            >
                                                {msg.content}
                                            </div>
                                        </motion.div>
                                    ))}

                                    {/* AI Typing Indicator */}
                                    {isTyping && (
                                        <motion.div
                                            className="flex items-center gap-1 px-3 py-2 rounded-xl max-w-[30%] bg-white/10 self-start"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: [0, 1, 0.6, 1] }}
                                            transition={{ repeat: Infinity, duration: 1.2 }}
                                        >
                                            <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                                            <span className="w-2 h-2 rounded-full bg-white animate-pulse [animation-delay:0.2s]"></span>
                                            <span className="w-2 h-2 rounded-full bg-white animate-pulse [animation-delay:0.4s]"></span>
                                        </motion.div>
                                    )}
                                </div>

                                {/* Quick Suggestions */}
                                <div className="px-4 py-2 flex gap-2 overflow-x-auto no-scrollbar shrink-0">
                                    {["Why wait 24h?", "Market trends", "Best platform?"].map((suggestion) => (
                                        <button
                                            key={suggestion}
                                            onClick={() => { setInput(suggestion); textareaRef.current?.focus(); }}
                                            className="whitespace-nowrap px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                                        >
                                            {suggestion}
                                        </button>
                                    ))}
                                </div>

                                {/* Input */}
                                <div className="flex items-center gap-2 p-3 border-t border-white/10 shrink-0">
                                    <textarea
                                        ref={textareaRef}
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={handleKeys}
                                        placeholder="Type a message..."
                                        rows={1}
                                        className="flex-1 px-3 py-2 text-sm bg-black/50 rounded-lg border border-white/10 text-white resize-none focus:outline-none focus:ring-1 focus:ring-white/50"
                                    />
                                    <button
                                        onClick={handleSend}
                                        className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                                    >
                                        <Send className="w-4 h-4 text-white" />
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </div>
    );
}
