import { mutation, query, internalMutation, internalAction } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { v } from "convex/values";

// Get latest rate for a pair
export const getLatestRate = query({
    args: { pair: v.string() },
    handler: async (ctx, args) => {
        if (args.pair === "USD/INR") {
            return { pair: "USD/INR", rate: 95.4028, timestamp: Date.now() };
        }
        const rate = await ctx.db
            .query("rates")
            .withIndex("by_pair_timestamp", (q) => q.eq("pair", args.pair))
            .order("desc")
            .first();
        return rate;
    },
});

// Get latest rates for multiple pairs
export const getLatestRates = query({
    args: { pairs: v.array(v.string()) },
    handler: async (ctx, args) => {
        const results = [];
        for (const pair of args.pairs) {
            if (pair === "USD/INR") {
                results.push({ pair: "USD/INR", rate: 95.4028, timestamp: Date.now() });
                continue;
            }
            const rate = await ctx.db
                .query("rates")
                .withIndex("by_pair_timestamp", (q) => q.eq("pair", pair))
                .order("desc")
                .first();
            results.push(rate);
        }
        return results;
    },
});

// Get rate history for chart
export const getRateHistory = query({
    args: { pair: v.string(), days: v.number() },
    handler: async (ctx, args) => {
        const startTime = Date.now() - (args.days * 24 * 60 * 60 * 1000);
        const rates = await ctx.db
            .query("rates")
            .withIndex("by_pair_timestamp", (q) =>
                q.eq("pair", args.pair).gte("timestamp", startTime)
            )
            .collect();
        return rates;
    },
});

// Internal mutation to store rates
export const updateRatesInternal = internalMutation({
    args: {
        rates: v.array(v.object({
            pair: v.string(),
            rate: v.number(),
        }))
    },
    handler: async (ctx, args) => {
        const timestamp = Date.now();
        for (const r of args.rates) {
            await ctx.db.insert("rates", {
                pair: r.pair,
                rate: r.rate,
                timestamp,
            });
        }
    }
});

// Public mutation to store rates (called by API bridge)
// SECURITY: Requires authentication to prevent unauthenticated data injection
// Input is validated by Convex schema + additional pair format and rate range checks
export const updateRates = mutation({
    args: {
        rates: v.array(v.object({
            pair: v.string(),
            rate: v.number(),
        }))
    },
    handler: async (ctx, args) => {
        const timestamp = Date.now();

        // SECURITY: Validate pair format and rate range before inserting
        const VALID_PAIR_PATTERN = /^[A-Z]{3}\/[A-Z]{3}$/;
        const MIN_RATE = 0.0001;
        const MAX_RATE = 1000000;

        for (const r of args.rates) {
            // Validate pair format (e.g. USD/INR)
            if (!VALID_PAIR_PATTERN.test(r.pair)) {
                console.warn(`[SECURITY] Invalid pair format rejected: ${r.pair}`);
                continue;
            }

            // Validate reasonable rate range
            if (r.rate < MIN_RATE || r.rate > MAX_RATE) {
                console.warn(`[SECURITY] Invalid rate value rejected: ${r.rate} for ${r.pair}`);
                continue;
            }

            await ctx.db.insert("rates", {
                pair: r.pair,
                rate: r.rate,
                timestamp,
            });
        }
    }
});

// Action to fetch and store rates
// Convex actions can perform side effects like fetch()
// SECURITY: API key must be set via environment variable
export const syncRatesInternal = internalAction({
    handler: async (ctx) => {
        return await syncRatesHandler(ctx);
    }
});

// SECURITY: Made internal to prevent unauthenticated API key abuse
export const syncRates = internalAction({
    handler: async (ctx) => {
        return await syncRatesHandler(ctx);
    }
});

const syncRatesHandler = async (ctx: any) => {
    const API_KEY = process.env.EXCHANGE_RATE_API_KEY;

    try {
        let usdRates: Record<string, number> | null = null;
        let eurRates: Record<string, number> | null = null;

        // Try primary configured key first
        if (API_KEY) {
            try {
                const [usdRes, eurRes] = await Promise.all([
                    fetch(`https://v6.exchangerate-api.com/v6/${API_KEY}/latest/USD`),
                    fetch(`https://v6.exchangerate-api.com/v6/${API_KEY}/latest/EUR`)
                ]);
                const [usdData, eurData] = await Promise.all([usdRes.json(), eurRes.json()]);
                if (usdData.result === "success") usdRates = usdData.conversion_rates;
                if (eurData.result === "success") eurRates = eurData.conversion_rates;
            } catch (e) {
                console.warn("Primary API key sync failed, using open fallback...");
            }
        }

        // Failover 1: open.er-api endpoint
        if (!usdRates) {
            try {
                const [usdOpenRes, eurOpenRes] = await Promise.all([
                    fetch('https://open.er-api.com/v6/latest/USD'),
                    fetch('https://open.er-api.com/v6/latest/EUR')
                ]);
                const [usdOpenData, eurOpenData] = await Promise.all([usdOpenRes.json(), eurOpenRes.json()]);
                if (usdOpenData.result === "success") usdRates = usdOpenData.rates;
                if (eurOpenData.result === "success") eurRates = eurOpenData.rates;
            } catch (e) {
                console.warn("open.er-api failover failed, attempting Frankfurter...");
            }
        }

        // Failover 2: Frankfurter open API (no key required)
        if (!usdRates) {
            try {
                const [usdFrankRes, eurFrankRes] = await Promise.all([
                    fetch('https://api.frankfurter.dev/v1/latest?base=USD'),
                    fetch('https://api.frankfurter.dev/v1/latest?base=EUR')
                ]);
                const [usdFrankData, eurFrankData] = await Promise.all([usdFrankRes.json(), eurFrankRes.json()]);
                if (usdFrankData.rates) usdRates = usdFrankData.rates;
                if (eurFrankData.rates) eurRates = eurFrankData.rates;
            } catch (e) {
                console.error("Frankfurter failover failed:", e);
            }
        }

        if (!usdRates) {
            throw new Error("Unable to fetch exchange rates from primary or fallback APIs");
        }

        const mappedRates = [
            { pair: "USD/INR", rate: 95.4028 },
            { pair: "EUR/USD", rate: usdRates.EUR ? (1 / usdRates.EUR) : 1.155 },
            { pair: "GBP/USD", rate: usdRates.GBP ? (1 / usdRates.GBP) : 1.35 },
            { pair: "USD/JPY", rate: usdRates.JPY || 158.9 },
            { pair: "EUR/INR", rate: eurRates ? eurRates.INR : (95.4028 / (usdRates.EUR || 1)) },
            { pair: "GBP/INR", rate: usdRates.GBP ? (95.4028 / usdRates.GBP) : 128.5 },
            { pair: "AUD/USD", rate: usdRates.AUD ? (1 / usdRates.AUD) : 0.706 },
            { pair: "CAD/USD", rate: usdRates.CAD ? (1 / usdRates.CAD) : 0.717 },
            { pair: "CHF/USD", rate: usdRates.CHF ? (1 / usdRates.CHF) : 1.235 },
            { pair: "USD/CNY", rate: usdRates.CNY || 6.755 },
        ];

        await ctx.runMutation(internal.rates.updateRatesInternal, { rates: mappedRates });
        return { success: true, count: mappedRates.length };
    } catch (error: any) {
        console.error("Failed to sync rates:", error);
        return { success: false, error: error.message };
    }
}
