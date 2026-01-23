/**
 * Rate Limiter Utility
 * 
 * OWASP Security Control: A5:2017 - Broken Access Control
 * Implements in-memory rate limiting for API endpoints.
 * 
 * Features:
 * - IP-based rate limiting (for public endpoints)
 * - User-based rate limiting (for authenticated endpoints)
 * - Configurable window and max requests
 * - Graceful 429 responses with Retry-After header
 * 
 * Note: For production, consider using Redis or a distributed cache
 * to share rate limit state across multiple server instances.
 */

interface RateLimitEntry {
    count: number;
    resetTime: number;
}

interface RateLimitConfig {
    windowMs: number;      // Time window in milliseconds
    maxRequests: number;   // Max requests per window
}

// In-memory store for rate limits (per-instance)
// Key format: "ip:xxx.xxx.xxx.xxx" or "user:userId"
const rateLimitStore = new Map<string, RateLimitEntry>();

// Default configurations for different endpoint types
export const RATE_LIMIT_CONFIGS = {
    // Public rate sync endpoint - moderate limit
    PUBLIC_API: {
        windowMs: 60 * 1000,      // 1 minute window
        maxRequests: 30,          // 30 requests per minute
    },
    // Alert send endpoint - stricter limit to prevent spam
    ALERT_SEND: {
        windowMs: 60 * 1000,      // 1 minute window
        maxRequests: 10,          // 10 emails per minute
    },
    // Authenticated user actions - more lenient
    AUTHENTICATED: {
        windowMs: 60 * 1000,      // 1 minute window
        maxRequests: 60,          // 60 requests per minute
    },
    // Sync operations - prevent abuse
    SYNC_OPERATION: {
        windowMs: 5 * 60 * 1000,  // 5 minute window
        maxRequests: 10,          // 10 syncs per 5 minutes
    },
} as const;

/**
 * Check rate limit for a given identifier
 * @param identifier - Unique identifier (IP address or user ID)
 * @param config - Rate limit configuration
 * @returns Object with allowed status and remaining requests
 */
export function checkRateLimit(
    identifier: string,
    config: RateLimitConfig
): { allowed: boolean; remaining: number; resetTime: number; retryAfter?: number } {
    const now = Date.now();
    const key = identifier;
    const entry = rateLimitStore.get(key);

    // Clean up expired entries periodically
    if (rateLimitStore.size > 10000) {
        cleanupExpiredEntries();
    }

    // If no entry exists or entry has expired, create new one
    if (!entry || now > entry.resetTime) {
        rateLimitStore.set(key, {
            count: 1,
            resetTime: now + config.windowMs,
        });
        return {
            allowed: true,
            remaining: config.maxRequests - 1,
            resetTime: now + config.windowMs,
        };
    }

    // Check if limit exceeded
    if (entry.count >= config.maxRequests) {
        const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
        return {
            allowed: false,
            remaining: 0,
            resetTime: entry.resetTime,
            retryAfter,
        };
    }

    // Increment count
    entry.count++;
    rateLimitStore.set(key, entry);

    return {
        allowed: true,
        remaining: config.maxRequests - entry.count,
        resetTime: entry.resetTime,
    };
}

/**
 * Extract client IP from request headers
 * Handles various proxy scenarios (CloudFlare, Vercel, etc.)
 * 
 * OWASP Note: Be cautious with X-Forwarded-For as it can be spoofed.
 * In production, configure your reverse proxy to overwrite this header.
 */
export function getClientIP(request: Request): string {
    // Check CloudFlare header first
    const cfIP = request.headers.get('cf-connecting-ip');
    if (cfIP) return cfIP;

    // Check Vercel/standard proxies
    const forwardedFor = request.headers.get('x-forwarded-for');
    if (forwardedFor) {
        // Take the first IP (client IP in a chain)
        return forwardedFor.split(',')[0].trim();
    }

    // Check real IP header
    const realIP = request.headers.get('x-real-ip');
    if (realIP) return realIP;

    // Fallback to a default for local development
    return '127.0.0.1';
}

/**
 * Create rate limit headers for response
 */
export function createRateLimitHeaders(
    remaining: number,
    resetTime: number,
    retryAfter?: number
): Headers {
    const headers = new Headers();
    headers.set('X-RateLimit-Remaining', remaining.toString());
    headers.set('X-RateLimit-Reset', new Date(resetTime).toISOString());

    if (retryAfter !== undefined) {
        headers.set('Retry-After', retryAfter.toString());
    }

    return headers;
}

/**
 * Clean up expired entries from the store
 * Called periodically to prevent memory leaks
 */
function cleanupExpiredEntries(): void {
    const now = Date.now();
    rateLimitStore.forEach((entry, key) => {
        if (now > entry.resetTime) {
            rateLimitStore.delete(key);
        }
    });
}

/**
 * Create a rate-limited response (429 Too Many Requests)
 * Following OWASP best practices for error responses
 */
export function createRateLimitResponse(retryAfter: number): Response {
    return new Response(
        JSON.stringify({
            error: 'Too Many Requests',
            message: 'You have exceeded the rate limit. Please try again later.',
            retryAfter,
        }),
        {
            status: 429,
            headers: {
                'Content-Type': 'application/json',
                'Retry-After': retryAfter.toString(),
            },
        }
    );
}
