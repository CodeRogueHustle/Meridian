'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, TrendingUp, BrainCircuit } from 'lucide-react';

export default function StatsBar() {
    const [counts, setCounts] = useState({ users: 0, savings: 0, accuracy: 0 });

    useEffect(() => {
        // Simple animation simulation
        const interval = setInterval(() => {
            setCounts(prev => ({
                users: Math.min(prev.users + 45, 1247),
                savings: Math.min(prev.savings + 0.1, 2.4),
                accuracy: Math.min(prev.accuracy + 2, 68)
            }));
        }, 30);

        return () => clearInterval(interval);
    }, []);

    return (
        <section className="w-full py-10 border-b border-white/5 bg-black/40 backdrop-blur-sm z-40 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Stat 1 */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="flex items-center justify-center gap-4 p-6 rounded-2xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 hover:border-purple-500/30 transition-colors"
                    >
                        <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                            <Users className="w-6 h-6 text-purple-400" />
                        </div>
                        <div>
                            <h3 className="text-3xl font-bold font-syne tabular-nums text-white">
                                {counts.users.toLocaleString()}
                            </h3>
                            <p className="text-sm text-gray-400 uppercase tracking-wider font-medium">Freelancers Trust Us</p>
                        </div>
                    </motion.div>

                    {/* Stat 2 */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex items-center justify-center gap-4 p-6 rounded-2xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 hover:border-green-500/30 transition-colors"
                    >
                        <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-green-400" />
                        </div>
                        <div>
                            <h3 className="text-3xl font-bold font-syne tabular-nums text-white">
                                ₹{counts.savings.toFixed(1)}M
                            </h3>
                            <p className="text-sm text-gray-400 uppercase tracking-wider font-medium">Saved This Month</p>
                        </div>
                    </motion.div>

                    {/* Stat 3 */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex items-center justify-center gap-4 p-6 rounded-2xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 hover:border-blue-500/30 transition-colors"
                    >
                        <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                            <BrainCircuit className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                            <h3 className="text-3xl font-bold font-syne tabular-nums text-white">
                                {counts.accuracy}%
                            </h3>
                            <p className="text-sm text-gray-400 uppercase tracking-wider font-medium">Prediction Accuracy</p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
