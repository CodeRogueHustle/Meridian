import { mutation, query, internalMutation, action, internalAction } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { v } from "convex/values";

// Get latest rate for a pair
export const getLatestRate = query({
    args: { pair: v.string() },
    handler: async (ctx, args) => {
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
// SECURITY: Input is validated by Convex schema (v.string(), v.number())
// Additional validation: pair format and rate range checks
export const updateRates = mutation({
    args: {
        rates: v.array(v.object({
            pair: v.string(),
            rate: v.number(),
        }))
    },
    handler: async (ctx, args) => {
        const timestamp = Date.now();

        // SECURITY: Validate rate data before inserting
        const VALID_PAIR_PATTERN = /^[A-Z]{3}\/[A-Z]{3}$/;
        const MIN_RATE = 0.0001;
        const MAX_RATE = 1000000;

        for (const r of args.rates) {
            // Validate pair format
            if (!VALID_PAIR_PATTERN.test(r.pair)) {
                console.warn(`[SECURITY] Invalid pair format rejected: ${r.pair}`);
                continue;
            }

            // Validate rate range
            if (r.rate < MIN_RATE || r.rate > MAX_RATE) {
                console.warn(`[SECURITY] Invalid rate rejected: ${r.rate} for ${r.pair}`);
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

export const syncRates = action({
    handler: async (ctx) => {
        return await syncRatesHandler(ctx);
    }
});

const syncRatesHandler = async (ctx: any) => {
    // SECURITY: No hardcoded fallback - require proper configuration
    const API_KEY = process.env.EXCHANGE_RATE_API_KEY;

    if (!API_KEY) {
        console.error("[SECURITY] EXCHANGE_RATE_API_KEY environment variable not set");
        return {
            success: false,
            error: "Exchange rate API not configured. Set EXCHANGE_RATE_API_KEY in Convex environment variables."
        };
    }

    try {
        // PERFORMANCE: Fetch all base rates in parallel instead of sequentially
        const [usdResponse, eurResponse, gbpResponse] = await Promise.all([
            fetch(`https://v6.exchangerate-api.com/v6/${API_KEY}/latest/USD`),
            fetch(`https://v6.exchangerate-api.com/v6/${API_KEY}/latest/EUR`),
            fetch(`https://v6.exchangerate-api.com/v6/${API_KEY}/latest/GBP`)
        ]);

        const [usdData, eurData, gbpData] = await Promise.all([
            usdResponse.json(),
            eurResponse.json(),
            gbpResponse.json()
        ]);

        if (usdData.result !== "success") throw new Error(usdData["error-type"] || "USD API error");
        if (eurData.result !== "success") throw new Error(eurData["error-type"] || "EUR API error");
        if (gbpData.result !== "success") throw new Error(gbpData["error-type"] || "GBP API error");

        const ratesToStore = [
            { pair: "USD/INR", rate: usdData.conversion_rates.INR },
            { pair: "EUR/USD", rate: eurData.conversion_rates.USD },
            { pair: "GBP/USD", rate: gbpData.conversion_rates.USD },
            { pair: "USD/JPY", rate: usdData.conversion_rates.JPY },
            { pair: "EUR/INR", rate: eurData.conversion_rates.INR },
            { pair: "GBP/INR", rate: gbpData.conversion_rates.INR },
            { pair: "AUD/USD", rate: usdData.conversion_rates.AUD }, // This should be 1/AUD or similar if base is USD
            // Wait, if base is USD, conversion_rates.AUD is USD->AUD. 
            // We need AUD/USD (AUD->USD). That is 1/conversion_rates.AUD.
        ];

        // Re-map to correct formats
        const mappedRates = [
            { pair: "USD/INR", rate: usdData.conversion_rates.INR },
            { pair: "EUR/USD", rate: 1 / usdData.conversion_rates.EUR },
            { pair: "GBP/USD", rate: 1 / usdData.conversion_rates.GBP },
            { pair: "USD/JPY", rate: usdData.conversion_rates.JPY },
            { pair: "EUR/INR", rate: eurData.conversion_rates.INR },
            { pair: "GBP/INR", rate: gbpData.conversion_rates.INR },
            { pair: "AUD/USD", rate: 1 / usdData.conversion_rates.AUD },
            { pair: "CAD/USD", rate: 1 / usdData.conversion_rates.CAD },
            { pair: "CHF/USD", rate: 1 / usdData.conversion_rates.CHF },
            { pair: "USD/CNY", rate: usdData.conversion_rates.CNY },
        ];

        await ctx.runMutation(internal.rates.updateRatesInternal, { rates: mappedRates });
        return { success: true, count: mappedRates.length };
    } catch (error: any) {
        console.error("Failed to sync rates:", error);
        return { success: false, error: error.message };
    }
}

// Kept for backward compatibility but changed to action call
export const fetchAllRates = mutation({
    handler: async (ctx) => {
        // We can't call actions from mutations. 
        // We'll leave this empty or throw error, but Dashboard should be updated.
        console.error("fetchAllRates mutation is deprecated. Use syncRates action.");
    }
});
