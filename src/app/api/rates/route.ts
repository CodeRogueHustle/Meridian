/**
 * Exchange Rates API Route
 * 
 * SECURITY FEATURES:
 * - Rate limiting (IP-based)
 * - Input validation & sanitization
 * - Secure API key handling
 * - Security headers
 * 
 * OWASP Compliance:
 * - A1: Injection prevention via input validation
 * - A2: Broken Authentication - N/A (public endpoint with rate limiting)
 * - A3: Sensitive Data Exposure - API key not exposed to client
 */

import { NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";
// @ts-ignore
import { api } from "../../../../convex/_generated/api";
import {
    checkRateLimit,
    getClientIP,
    createRateLimitResponse,
    RATE_LIMIT_CONFIGS,
    validateInput,
    RATES_API_SCHEMA,
    createValidationErrorResponse,
    getSecureApiKey,
    logSecurityEvent,
    sanitizeCurrencyCode,
} from '@/lib/security';

// ============================================================================
// Configuration
// ============================================================================

const BASE_URL = 'https://v6.exchangerate-api.com/v6';

// Allowed currency codes (whitelist for additional security)
const ALLOWED_CURRENCIES = new Set([
    'USD', 'EUR', 'GBP', 'INR', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'NZD',
    'HKD', 'SGD', 'SEK', 'DKK', 'NOK', 'MXN', 'ZAR', 'BRL', 'KRW', 'THB'
]);

// ============================================================================
// API Handler
// ============================================================================

export async function GET(request: Request) {
    const clientIP = getClientIP(request);

    // ========================================================================
    // Rate Limiting
    // ========================================================================
    const { searchParams } = new URL(request.url);
    const isSync = searchParams.get('sync') === 'true';

    // Use stricter limits for sync operations
    const rateLimitConfig = isSync
        ? RATE_LIMIT_CONFIGS.SYNC_OPERATION
        : RATE_LIMIT_CONFIGS.PUBLIC_API;

    const rateLimitResult = checkRateLimit(`ip:${clientIP}`, rateLimitConfig);

    if (!rateLimitResult.allowed) {
        logSecurityEvent('RATE_LIMIT', {
            ip: clientIP,
            endpoint: '/api/rates',
            retryAfter: rateLimitResult.retryAfter,
        });
        return createRateLimitResponse(rateLimitResult.retryAfter!);
    }

    // ========================================================================
    // Input Validation
    // ========================================================================
    const inputParams: Record<string, unknown> = {};
    searchParams.forEach((value, key) => {
        inputParams[key] = value;
    });

    const validationResult = validateInput(inputParams, RATES_API_SCHEMA, false);

    if (!validationResult.valid) {
        logSecurityEvent('VALIDATION_FAILURE', {
            ip: clientIP,
            endpoint: '/api/rates',
            errors: validationResult.errors,
        });
        return createValidationErrorResponse(validationResult.errors);
    }

    // ========================================================================
    // Sanitize and Extract Parameters
    // ========================================================================
    let from = sanitizeCurrencyCode(searchParams.get('from') || 'USD');
    let to = sanitizeCurrencyCode(searchParams.get('to') || 'INR');

    // Additional whitelist validation
    if (!ALLOWED_CURRENCIES.has(from)) {
        from = 'USD';
    }
    if (!ALLOWED_CURRENCIES.has(to)) {
        to = 'INR';
    }

    // ========================================================================
    // Secure API Key Retrieval
    // ========================================================================
    const API_KEY = getSecureApiKey('EXCHANGE_RATE_API_KEY');

    if (!API_KEY) {
        console.error('[SECURITY] EXCHANGE_RATE_API_KEY not configured');
        return NextResponse.json(
            {
                error: 'Service temporarily unavailable',
                message: 'Exchange rate service is not configured'
            },
            { status: 503 }
        );
    }

    // ========================================================================
    // External API Call
    // ========================================================================
    try {
        const response = await fetch(
            `${BASE_URL}/${API_KEY}/pair/${from}/${to}`,
            {
                // Set timeout for external requests
                signal: AbortSignal.timeout(10000),
            }
        );

        const data = await response.json();

        if (data.result !== 'success') {
            throw new Error(data['error-type'] || 'Failed to fetch rates');
        }

        const currentRate = data.conversion_rate;

        // ====================================================================
        // Sync to Convex (if requested)
        // ====================================================================
        const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;

        if (isSync && CONVEX_URL) {
            console.log("[SECURITY] Triggering Convex sync from API route...");

            try {
                const client = new ConvexHttpClient(CONVEX_URL);
                // PERFORMANCE: Fetch multiple base rates in parallel for a more complete sync
                console.log("[SECURITY] Fetching base rates in parallel...");
                const [usdRes, eurRes, gbpRes] = await Promise.all([
                    fetch(`${BASE_URL}/${API_KEY}/latest/USD`, { signal: AbortSignal.timeout(10000) }),
                    fetch(`${BASE_URL}/${API_KEY}/latest/EUR`, { signal: AbortSignal.timeout(10000) }),
                    fetch(`${BASE_URL}/${API_KEY}/latest/GBP`, { signal: AbortSignal.timeout(10000) })
                ]);

                const [usdData, eurData, gbpData] = await Promise.all([
                    usdRes.json(),
                    eurRes.json(),
                    gbpRes.json()
                ]);

                if (usdData.result === "success") {
                    const mappedRates = [
                        { pair: "USD/INR", rate: usdData.conversion_rates.INR },
                        { pair: "EUR/USD", rate: eurData.result === 'success' ? eurData.conversion_rates.USD : (1 / usdData.conversion_rates.EUR) },
                        { pair: "GBP/USD", rate: gbpData.result === 'success' ? gbpData.conversion_rates.USD : (1 / usdData.conversion_rates.GBP) },
                        { pair: "USD/JPY", rate: usdData.conversion_rates.JPY },
                        { pair: "EUR/INR", rate: eurData.result === 'success' ? eurData.conversion_rates.INR : (usdData.conversion_rates.INR / usdData.conversion_rates.EUR) },
                        { pair: "GBP/INR", rate: gbpData.result === 'success' ? gbpData.conversion_rates.INR : (usdData.conversion_rates.INR / usdData.conversion_rates.GBP) },
                        { pair: "AUD/USD", rate: 1 / usdData.conversion_rates.AUD },
                        { pair: "CAD/USD", rate: 1 / usdData.conversion_rates.CAD },
                        { pair: "CHF/USD", rate: 1 / usdData.conversion_rates.CHF },
                        { pair: "USD/CNY", rate: usdData.conversion_rates.CNY },
                    ];

                    // @ts-ignore
                    await client.mutation(api.rates.updateRates, { rates: mappedRates });
                    console.log("[SECURITY] Convex sync completed successfully.");
                }
            } catch (syncError) {
                console.error("[SECURITY] Convex sync failed:", syncError);
                // Don't fail the whole request if sync fails
            }
        }

        // ====================================================================
        // Response with Rate Limit Headers
        // ====================================================================
        return NextResponse.json(
            {
                rate: currentRate,
                lastUpdate: data.time_last_update_utc,
                from,
                to,
                synced: isSync
            },
            {
                headers: {
                    'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
                    'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
                    'Cache-Control': 'public, max-age=60', // Cache for 1 minute
                },
            }
        );
    } catch (error: any) {
        console.error('[SECURITY] ExchangeRate API Error:', error);

        // Don't expose internal error details to client
        return NextResponse.json(
            {
                error: 'Failed to fetch exchange rates',
                message: 'Please try again later'
            },
            { status: 500 }
        );
    }
}
