import { mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Join the waitlist for a specific plan.
 * 
 * SECURITY:
 * - Public endpoint (no auth required to join waitlist)
 * - Input validation via schema
 * - Email sanitization
 */
export const joinWaitlist = mutation({
    args: {
        email: v.string(),
        plan: v.string(),
        useCase: v.string(),
    },
    handler: async (ctx, args) => {
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(args.email)) {
            throw new Error("Invalid email address");
        }

        // Check if already on waitlist for this plan
        const existing = await ctx.db
            .query("waitlist")
            .withIndex("by_email", (q) => q.eq("email", args.email))
            .filter((q) => q.eq(q.field("plan"), args.plan))
            .first();

        if (existing) {
            return { success: true, message: "Already on the waitlist for this plan." };
        }

        await ctx.db.insert("waitlist", {
            email: args.email.toLowerCase().trim(),
            plan: args.plan,
            useCase: args.useCase,
            createdAt: Date.now(),
        });

        return { success: true, message: "Successfully joined the waitlist!" };
    },
});
