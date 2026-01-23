"use client";

import { useState } from "react";
import { X, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation } from "convex/react";
// @ts-ignore
import { api } from "../../../convex/_generated/api";

interface WaitlistModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialPlan?: string;
}

export default function WaitlistModal({ isOpen, onClose, initialPlan = "Saver" }: WaitlistModalProps) {
    const [email, setEmail] = useState("");
    const [plan, setPlan] = useState(initialPlan);
    const [useCase, setUseCase] = useState("Personal");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const joinWaitlist = useMutation(api.waitlist.joinWaitlist);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            await joinWaitlist({ email, plan, useCase });
            setIsSuccess(true);
        } catch (err: any) {
            setError(err.message || "Something went wrong. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                />

                {/* Modal Content */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-md overflow-hidden rounded-3xl bg-gray-900 border border-white/10 shadow-2xl"
                >
                    {/* Success State */}
                    {isSuccess ? (
                        <div className="p-12 text-center">
                            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 text-green-400">
                                <CheckCircle2 className="h-10 w-10" />
                            </div>
                            <h3 className="text-2xl font-bold text-white font-syne mb-2">You&apos;re on the list!</h3>
                            <p className="text-gray-400 mb-8 leading-relaxed">
                                We&apos;ve added you to the waitlist for the <span className="text-white font-bold">{plan}</span> plan.
                                We&apos;ll notify you at <span className="text-white font-semibold">{email}</span> as soon as we launch!
                            </p>
                            <button
                                onClick={onClose}
                                className="w-full rounded-xl bg-white/10 py-3 font-bold hover:bg-white/20 transition-all"
                            >
                                Close
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="p-8 border-b border-white/5 flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-bold font-syne text-white flex items-center gap-2">
                                        <Sparkles className="w-5 h-5 text-purple-400" />
                                        Join Plan Waitlist
                                    </h3>
                                    <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest font-bold">Coming FEB 22</p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-xl border border-white/5 hover:bg-white/5 transition-colors"
                                >
                                    <X className="h-5 w-5 text-gray-400" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8 space-y-5">
                                {error && (
                                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                                        {error}
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1.5 ml-1">Email Address</label>
                                    <input
                                        required
                                        type="email"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50 transition-colors"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1.5 ml-1">Interest</label>
                                    <select
                                        value={plan}
                                        onChange={(e) => setPlan(e.target.value)}
                                        className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white focus:outline-none focus:border-purple-500/50 transition-colors appearance-none"
                                    >
                                        <option value="Saver" className="bg-gray-900 uppercase">Saver Plan ($12/mo)</option>
                                        <option value="Business" className="bg-gray-900 uppercase">Business Plan ($49/mo)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1.5 ml-1">Primary Use Case</label>
                                    <select
                                        value={useCase}
                                        onChange={(e) => setUseCase(e.target.value)}
                                        className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white focus:outline-none focus:border-purple-500/50 transition-colors appearance-none"
                                    >
                                        <option value="Personal" className="bg-gray-900">Personal Transfers</option>
                                        <option value="Freelance" className="bg-gray-900">Freelancing / Remote Work</option>
                                        <option value="SME" className="bg-gray-900">Small / Medium Business</option>
                                        <option value="Institutional" className="bg-gray-900">Institutional / Large Scale</option>
                                        <option value="Other" className="bg-gray-900">Other</option>
                                    </select>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full mt-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 py-4 font-bold text-white shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 transition-all active:scale-[0.98] disabled:opacity-50"
                                >
                                    {isSubmitting ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            Joining Waitlist...
                                        </div>
                                    ) : (
                                        "Secure Early Access"
                                    )}
                                </button>

                                <p className="text-[10px] text-center text-gray-500 uppercase tracking-widest leading-relaxed">
                                    By joining, you agree to receive updates about Meridian launch. <br /> No credit card required now.
                                </p>
                            </form>
                        </>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
