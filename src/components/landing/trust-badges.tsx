'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function TrustBadges() {
    return (
        <section className="py-12 border-y border-white/5 bg-black/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <p className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-8">
                    As featured on
                </p>
                <div className="flex flex-wrap justify-center gap-12 md:gap-24 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                    {/* Product Hunt */}
                    <motion.div
                        whileHover={{ scale: 1.05, opacity: 1, filter: 'grayscale(0%)' }}
                        className="flex items-center gap-2 group cursor-pointer transition-all"
                    >
                        <div className="w-8 h-8 rounded-full bg-[#DA552F] flex items-center justify-center font-bold text-white text-lg group-hover:shadow-[0_0_20px_#DA552F]">P</div>
                        <span className="text-xl font-bold font-syne text-gray-400 group-hover:text-[#DA552F] transition-colors">Product Hunt</span>
                    </motion.div>

                    {/* Hacker News */}
                    <motion.div
                        whileHover={{ scale: 1.05, opacity: 1, filter: 'grayscale(0%)' }}
                        className="flex items-center gap-2 group cursor-pointer transition-all"
                    >
                        <div className="w-8 h-8 rounded bg-[#F0652F] flex items-center justify-center font-bold text-white text-sm group-hover:shadow-[0_0_20px_#F0652F]">Y</div>
                        <span className="text-xl font-bold font-mono text-gray-400 group-hover:text-[#F0652F] transition-colors">Hacker News</span>
                    </motion.div>

                    {/* YourStory */}
                    <motion.div
                        whileHover={{ scale: 1.05, opacity: 1, filter: 'grayscale(0%)' }}
                        className="flex items-center gap-2 group cursor-pointer transition-all"
                    >
                        <div className="w-8 h-8 rounded bg-[#E41F35] flex items-center justify-center font-serif font-bold text-white text-sm group-hover:shadow-[0_0_20px_#E41F35]">Ys</div>
                        <span className="text-xl font-bold font-serif text-gray-400 group-hover:text-[#E41F35] transition-colors">YourStory</span>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
