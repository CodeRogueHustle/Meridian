/**
 * Next.js Middleware
 * 
 * SECURITY FEATURES:
 * - Route protection via Clerk authentication
 * - Security headers for all responses
 * - API route protection
 * 
 * OWASP Compliance:
 * - A2: Broken Authentication - Protected routes require auth
 * - A5: Broken Access Control - Route-level access control
 */

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ============================================================================
// Route Configuration
// ============================================================================

// Routes that require authentication
const isProtectedRoute = createRouteMatcher([
    '/dashboard(.*)',
    '/alerts(.*)',
    '/history(.*)',
    '/compare(.*)',
    '/transactions(.*)',
    '/api/rates(.*)',      // Protect sensitive API routes
    '/api/send-alert(.*)', // Protect sensitive API routes
]);

// API routes that should have rate limiting applied at the route level
// (Middleware can't do stateful rate limiting, but can add headers)
const isApiRoute = createRouteMatcher([
    '/api/(.*)',
]);

// ============================================================================
// Security Headers
// ============================================================================

const securityHeaders = {
    // Prevent MIME type sniffing
    'X-Content-Type-Options': 'nosniff',
    // Prevent clickjacking
    'X-Frame-Options': 'DENY',
    // XSS Protection (legacy browsers)
    'X-XSS-Protection': '1; mode=block',
    // Referrer policy
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    // Permissions policy (restrict browser features)
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

// ============================================================================
// Middleware Handler
// ============================================================================

export default clerkMiddleware(async (auth, req: NextRequest) => {
    // Apply security headers to all responses
    const response = NextResponse.next();

    for (const [key, value] of Object.entries(securityHeaders)) {
        response.headers.set(key, value);
    }

    // Protect authenticated routes
    if (isProtectedRoute(req)) {
        await auth.protect();
    }

    // Add cache control for API routes
    if (isApiRoute(req)) {
        response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    }

    return response;
});

// ============================================================================
// Configuration
// ============================================================================

export const config = {
    // Match all routes except static files and Next.js internals
    matcher: [
        "/((?!.*\\..*|_next).*)",
        "/",
        "/(api|trpc)(.*)"
    ],
};
