/**
 * Security Configuration & Utilities
 * 
 * Central configuration for security-related settings.
 * This file provides a single source of truth for security configurations.
 * 
 * OWASP Reference: https://owasp.org/www-project-application-security-verification-standard/
 */

// ============================================================================
// Environment Variable Validation
// ============================================================================

/**
 * Validate that required environment variables are set
 * Throws an error in development, logs warning in production
 * 
 * OWASP: Never use hardcoded secrets or API keys
 */
export function validateEnvironment(): { valid: boolean; warnings: string[] } {
    const warnings: string[] = [];

    // Required for production
    const requiredVars = [
        'NEXT_PUBLIC_CONVEX_URL',
        'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
        'CLERK_SECRET_KEY',
    ];

    // Recommended but not strictly required
    const recommendedVars = [
        'EXCHANGE_RATE_API_KEY',
        'RESEND_API_KEY',
    ];

    for (const varName of requiredVars) {
        if (!process.env[varName]) {
            warnings.push(`Missing required environment variable: ${varName}`);
        }
    }

    for (const varName of recommendedVars) {
        if (!process.env[varName]) {
            warnings.push(`Missing recommended environment variable: ${varName}. Some features may not work.`);
        }
    }

    return {
        valid: warnings.filter(w => w.includes('required')).length === 0,
        warnings,
    };
}

/**
 * Get an API key from environment with validation
 * Returns undefined if not set (instead of a hardcoded fallback)
 * 
 * CRITICAL: This is the secure way to access API keys
 */
export function getSecureApiKey(keyName: string): string | undefined {
    const key = process.env[keyName];

    // Check for placeholder or test values
    if (key && (
        key.includes('placeholder') ||
        key.includes('123456789') ||
        key.includes('your_api_key') ||
        key === 'test' ||
        key === 'demo'
    )) {
        console.warn(`[SECURITY] ${keyName} appears to be a placeholder value`);
        return undefined;
    }

    return key;
}

// ============================================================================
// Security Headers
// ============================================================================

/**
 * Standard security headers for API responses
 * Based on OWASP recommendations
 */
export const SECURITY_HEADERS = {
    // Prevent MIME type sniffing
    'X-Content-Type-Options': 'nosniff',
    // Prevent clickjacking
    'X-Frame-Options': 'DENY',
    // XSS Protection (legacy browsers)
    'X-XSS-Protection': '1; mode=block',
    // Referrer policy
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    // Content Security Policy (basic)
    'Content-Security-Policy': "default-src 'self'",
} as const;

/**
 * Add security headers to a response
 */
export function addSecurityHeaders(response: Response): Response {
    const headers = new Headers(response.headers);

    for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
        // Don't override CSP if already set (may be customized)
        if (key === 'Content-Security-Policy' && headers.has(key)) {
            continue;
        }
        headers.set(key, value);
    }

    return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
    });
}

// ============================================================================
// Logging & Monitoring
// ============================================================================

/**
 * Log security events for monitoring
 * In production, these should go to a SIEM or logging service
 */
export function logSecurityEvent(
    eventType: 'RATE_LIMIT' | 'VALIDATION_FAILURE' | 'AUTH_FAILURE' | 'SUSPICIOUS_REQUEST',
    details: Record<string, unknown>
): void {
    const event = {
        timestamp: new Date().toISOString(),
        type: eventType,
        ...details,
    };

    // In development, log to console
    // In production, send to logging service
    if (process.env.NODE_ENV === 'development') {
        console.warn('[SECURITY EVENT]', JSON.stringify(event, null, 2));
    } else {
        // TODO: Send to logging service (e.g., Datadog, Splunk, CloudWatch)
        console.warn('[SECURITY EVENT]', JSON.stringify(event));
    }
}

// ============================================================================
// Request Fingerprinting
// ============================================================================

/**
 * Create a fingerprint for a request
 * Useful for detecting suspicious patterns
 */
export function createRequestFingerprint(request: Request): string {
    const parts = [
        request.headers.get('user-agent') || 'unknown',
        request.headers.get('accept-language') || 'unknown',
    ];

    // Simple hash function
    let hash = 0;
    const str = parts.join('|');
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }

    return Math.abs(hash).toString(16);
}
