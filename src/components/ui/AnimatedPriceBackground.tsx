'use client';

import React from 'react';
import { motion } from 'framer-motion';

export const AnimatedPriceBackground = () => {
    return (
        <div className="fixed inset-0 -z-10 overflow-hidden bg-[#050505]">
            {/* Base gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#050505] via-[#050505] to-[#3a0ca3]/20" />

            {/* Animated Blobs */}
            <motion.div
                animate={{
                    x: [0, 100, 0],
                    y: [0, -50, 0],
                    scale: [1, 1.2, 1],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear"
                }}
                className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-[#3a0ca3]/30 rounded-full blur-[120px]"
            />

            <motion.div
                animate={{
                    x: [0, -120, 0],
                    y: [0, 80, 0],
                    scale: [1, 1.1, 1],
                }}
                transition={{
                    duration: 25,
                    repeat: Infinity,
                    ease: "linear"
                }}
                className="absolute -bottom-[10%] -right-[10%] w-[60%] h-[60%] bg-[#3a0ca3]/20 rounded-full blur-[150px]"
            />

            <motion.div
                animate={{
                    opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-tr from-transparent via-[#3a0ca3]/10 to-transparent"
            />
        </div>
    );
};
