import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    alerts: defineTable({
        userId: v.string(), // For demo, we might use a fixed ID or pass it from client
        pair: v.string(),
        type: v.union(v.literal("above"), v.literal("below")),
        targetRate: v.number(),
        currentRate: v.number(),
        status: v.union(
            v.literal("active"),
            v.literal("paused"),
            v.literal("triggered")
        ),
        notificationMethods: v.array(
            v.union(v.literal("email"), v.literal("sms"), v.literal("push"))
        ),
        email: v.string(),
        phone: v.optional(v.string()),
        note: v.optional(v.string()),
        createdAt: v.number(),
        triggeredAt: v.optional(v.number()),
        emailSent: v.optional(v.boolean()),
    })
        .index("by_user", ["userId"])
        .index("by_status", ["status"])
        .index("by_user_status", ["userId", "status"]),

    users: defineTable({
        email: v.string(),
        name: v.string(),
        tier: v.union(v.literal("free"), v.literal("pro"), v.literal("trader")),
        createdAt: v.number(),
    })
        .index("by_email", ["email"]),

    rates: defineTable({
        pair: v.string(),
        rate: v.number(),
        timestamp: v.number(),
    })
        .index("by_pair", ["pair"])
        .index("by_timestamp", ["timestamp"])
        .index("by_pair_timestamp", ["pair", "timestamp"]),

    waitlist: defineTable({
        email: v.string(),
        plan: v.string(),
        useCase: v.string(),
        createdAt: v.number(),
    })
        .index("by_email", ["email"])
        .index("by_plan", ["plan"]),
});
