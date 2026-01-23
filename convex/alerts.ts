import { mutation, query, internalQuery } from "./_generated/server";
import { v } from "convex/values";

/**
 * Create new alert
 * 
 * SECURITY:
 * - Authentication required (ctx.auth.getUserIdentity())
 * - Input validation via Convex schema + additional checks
 * - Rate limiting handled at API layer
 */
export const createAlert = mutation({
    args: {
        pair: v.string(),
        type: v.union(v.literal("above"), v.literal("below")),
        targetRate: v.number(),
        currentRate: v.number(),
        email: v.string(),
        phone: v.optional(v.string()),
        note: v.optional(v.string()),
        notificationMethods: v.array(
            v.union(v.literal("email"), v.literal("sms"), v.literal("push"))
        ),
    },
    handler: async (ctx, args) => {
        // SECURITY: Require authentication
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Unauthenticated call to createAlert");
        }

        // SECURITY: Validate pair format (XXX/YYY)
        const VALID_PAIR_PATTERN = /^[A-Z]{3}\/[A-Z]{3}$/;
        if (!VALID_PAIR_PATTERN.test(args.pair)) {
            throw new Error("Invalid currency pair format");
        }

        // SECURITY: Validate rate ranges
        if (args.targetRate <= 0 || args.targetRate > 1000000) {
            throw new Error("Target rate out of valid range");
        }
        if (args.currentRate <= 0 || args.currentRate > 1000000) {
            throw new Error("Current rate out of valid range");
        }

        // SECURITY: Validate email format (basic check)
        const EMAIL_PATTERN = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!EMAIL_PATTERN.test(args.email)) {
            throw new Error("Invalid email format");
        }

        // SECURITY: Limit note length to prevent abuse
        if (args.note && args.note.length > 500) {
            throw new Error("Note too long (max 500 characters)");
        }

        // SECURITY: Sanitize note content (remove potential HTML/scripts)
        const sanitizedNote = args.note
            ? args.note.replace(/<[^>]*>/g, '').trim().slice(0, 500)
            : undefined;

        const alertId = await ctx.db.insert("alerts", {
            pair: args.pair,
            type: args.type,
            targetRate: args.targetRate,
            currentRate: args.currentRate,
            email: args.email.toLowerCase().trim(),
            phone: args.phone?.trim(),
            note: sanitizedNote,
            notificationMethods: args.notificationMethods,
            userId: identity.subject,
            status: "active",
            createdAt: Date.now(),
        });
        return alertId;
    },
});

// Get user's alerts
// SECURITY: Strictly enforces that users can only see their own alerts
export const getUserAlerts = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return [];
        }

        const alerts = await ctx.db
            .query("alerts")
            .withIndex("by_user", (q) => q.eq("userId", identity.subject))
            .order("desc")
            .collect();

        return alerts;
    },
});



// Get active alerts (for checking system)
// SECURITY: Made internal to prevent public access to all alerts
export const getActiveAlerts = internalQuery({
    handler: async (ctx) => {
        const alerts = await ctx.db
            .query("alerts")
            .withIndex("by_status", (q) => q.eq("status", "active"))
            .collect();
        return alerts;
    },
});

// Update alert status
// SECURITY: Enforces ownership or allows system-level updates
export const updateAlertStatus = mutation({
    args: {
        alertId: v.id("alerts"),
        status: v.union(
            v.literal("active"),
            v.literal("paused"),
            v.literal("triggered")
        ),
        triggeredAt: v.optional(v.number()),
        emailSent: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        const alert = await ctx.db.get(args.alertId);

        if (!alert) throw new Error("Alert not found");

        // Only allow owner to update, or internal system (if we had a system identity)
        // For now, if called from the frontend, it must be the owner.
        if (identity && alert.userId !== identity.subject) {
            throw new Error("Access denied: You do not own this alert");
        }

        const { alertId, ...updates } = args;
        await ctx.db.patch(alertId, updates);
    },
});

// Delete alert
// SECURITY: Enforces ownership
export const deleteAlert = mutation({
    args: { alertId: v.id("alerts") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        const alert = await ctx.db.get(args.alertId);

        if (!alert) throw new Error("Alert not found");
        if (!identity || alert.userId !== identity.subject) {
            throw new Error("Access denied: You do not own this alert");
        }

        await ctx.db.delete(args.alertId);
    },
});

// Pause/Resume alert
// SECURITY: Enforces ownership
export const toggleAlertStatus = mutation({
    args: { alertId: v.id("alerts") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        const alert = await ctx.db.get(args.alertId);

        if (!alert) throw new Error("Alert not found");
        if (!identity || alert.userId !== identity.subject) {
            throw new Error("Access denied: You do not own this alert");
        }

        await ctx.db.patch(args.alertId, {
            status: alert.status === "active" ? "paused" : "active",
        });
    },
});
