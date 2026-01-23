'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const testimonials = [
    {
        quote: "Meridian saved me $400 in 3 months just by timing my transfers better. The AI mentor explained everything in simple terms.",
        name: "Rahul S.",
        role: "Software Engineer",
        location: "Bangalore",
        initials: "RS",
        rating: 5,
        color: "bg-purple-500"
    },
    {
        quote: "I was losing ₹5K every month using my bank. Meridian showed me better options. Now I use Wise and save consistently.",
        name: "Priya M.",
        role: "Designer",
        location: "Mumbai",
        initials: "PM",
        rating: 5,
        color: "bg-pink-500"
    },
    {
        quote: "The predictions aren't always perfect, but 7 out of 10 times they're right. That's way better than guessing.",
        name: "Arjun K.",
        role: "Freelancer",
        location: "Pune",
        initials: "AK",
        rating: 4.5,
        color: "bg-indigo-500"
    },
    {
        quote: "Converting EUR to USD was a headache. Meridian's alerts helped me time my invoices perfectly. Highly recommended.",
        name: "Elena R.",
        role: "UX Researcher",
        location: "Barcelona",
        initials: "ER",
        rating: 5,
        color: "bg-blue-500"
    },
    {
        quote: "The savings on my monthly transfers cover my workspace rent. A no-brainer for freelancers getting paid in USD.",
        name: "Liam O.",
        role: "Content Strategist",
        location: "Dublin",
        initials: "LO",
        rating: 5,
        color: "bg-green-500"
    },
    {
        quote: "I used to just guess when to withdraw. Now I have data-backed confidence. The UI is absolutely stunning too.",
        name: "Sarah J.",
        role: "Full Stack Dev",
        location: "Austin",
        initials: "SJ",
        rating: 5,
        color: "bg-orange-500"
    }
];

export default function Testimonials() {
    return (
        <section className="py-24 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-syne font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                        What Users Say
                    </h2>
                    <p className="text-xl text-gray-400">Trusted by the globe's top remote talent.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {testimonials.map((t, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            viewport={{ once: true }}
                            className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm relative group hover:border-white/20 transition-colors"
                        >
                            <Quote className="absolute top-8 right-8 w-10 h-10 text-white/5 group-hover:text-white/10 transition-colors" />

                            <div className="flex gap-1 mb-6">
                                {[...Array(5)].map((_, starIndex) => (
                                    <Star
                                        key={starIndex}
                                        className={`w-5 h-5 ${starIndex < Math.floor(t.rating)
                                            ? 'text-yellow-400 fill-yellow-400'
                                            : starIndex < t.rating
                                                ? 'text-yellow-400 fill-yellow-400 opacity-50'
                                                : 'text-gray-600'
                                            }`}
                                    />
                                ))}
                            </div>

                            <p className="text-lg text-gray-200 leading-relaxed mb-8">
                                "{t.quote}"
                            </p>

                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-full ${t.color} flex items-center justify-center font-bold text-white shadow-lg`}>
                                    {t.initials}
                                </div>
                                <div>
                                    <div className="font-bold text-white">{t.name}</div>
                                    <div className="text-sm text-gray-400">{t.role} • {t.location}</div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
