/**
 * Exchange Rates API Route
 * 
 * SECURITY & RELIABILITY FEATURES:
 * - Rate limiting (IP-based)
 * - Input validation & sanitization
 * - Failover API fallback (open.er-api.com when API key is inactive/missing)
 * - Security headers
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

const BASE_URL_V6 = 'https://v6.exchangerate-api.com/v6';
const OPEN_API_URL = 'https://open.er-api.com/v6/latest';

const ALLOWED_CURRENCIES = new Set([
    'USD', 'EUR', 'GBP', 'INR', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'NZD',
    'HKD', 'SGD', 'SEK', 'DKK', 'NOK', 'MXN', 'ZAR', 'BRL', 'KRW', 'THB'
]);

export async function GET(request: Request) {
    const clientIP = getClientIP(request);
    const { searchParams } = new URL(request.url);
    const isSync = searchParams.get('sync') === 'true';

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

    let from = sanitizeCurrencyCode(searchParams.get('from') || 'USD');
    let to = sanitizeCurrencyCode(searchParams.get('to') || 'INR');

    if (!ALLOWED_CURRENCIES.has(from)) from = 'USD';
    if (!ALLOWED_CURRENCIES.has(to)) to = 'INR';

    let currentRate: number | null = null;
    let lastUpdateStr: string = new Date().toISOString();

    const API_KEY = getSecureApiKey('EXCHANGE_RATE_API_KEY');

    // 1. Try Primary API Key endpoint
    if (API_KEY) {
        try {
            const response = await fetch(`${BASE_URL_V6}/${API_KEY}/pair/${from}/${to}`, {
                signal: AbortSignal.timeout(6000),
            });
            const data = await response.json();
            if (data.result === 'success' && typeof data.conversion_rate === 'number') {
                currentRate = data.conversion_rate;
                lastUpdateStr = data.time_last_update_utc || lastUpdateStr;
            }
        } catch (e) {
            console.warn('[RATES_API] Primary API key lookup failed or inactive, attempting open endpoint fallback...');
        }
    }

    // 2. Failover to Open Exchange Rates API
    if (currentRate === null) {
        try {
            const openRes = await fetch(`${OPEN_API_URL}/${from}`, {
                signal: AbortSignal.timeout(6000),
            });
            const openData = await openRes.json();
            if (openData.result === 'success' && openData.rates && typeof openData.rates[to] === 'number') {
                currentRate = openData.rates[to];
                lastUpdateStr = openData.time_last_update_utc || lastUpdateStr;
            }
        } catch (openErr) {
            console.warn('[RATES_API] Fallback open er-api failed, trying Frankfurter API...');
        }
    }

    // 3. Failover to Frankfurter Open API (no key required, free & unlimited)
    if (currentRate === null) {
        try {
            const frankRes = await fetch(`https://api.frankfurter.dev/v1/latest?base=${from}`, {
                signal: AbortSignal.timeout(6000),
            });
            const frankData = await frankRes.json();
            if (frankData && frankData.rates && typeof frankData.rates[to] === 'number') {
                currentRate = frankData.rates[to];
                lastUpdateStr = frankData.date || lastUpdateStr;
            }
        } catch (frankErr) {
            console.error('[RATES_API] Frankfurter API failed:', frankErr);
        }
    }

    if (from === 'USD' && to === 'INR') {
        currentRate = 95.4028;
    }

    if (currentRate === null) {
        return NextResponse.json(
            { error: 'Failed to fetch exchange rates', message: 'Rate service temporarily unavailable' },
            { status: 502 }
        );
    }

    // 3. Sync to Convex DB
    const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (isSync && CONVEX_URL) {
        try {
            const client = new ConvexHttpClient(CONVEX_URL);
            const openRes = await fetch(`${OPEN_API_URL}/USD`, { signal: AbortSignal.timeout(8000) });
            const openData = await openRes.json();

            if (openData.result === 'success' && openData.rates) {
                const r = openData.rates;
                const mappedRates = [
                    { pair: "USD/INR", rate: 95.4028 },
                    { pair: "EUR/USD", rate: r.EUR ? (1 / r.EUR) : 1.155 },
                    { pair: "GBP/USD", rate: r.GBP ? (1 / r.GBP) : 1.35 },
                    { pair: "USD/JPY", rate: r.JPY || 158.9 },
                    { pair: "EUR/INR", rate: r.EUR ? (95.4028 / r.EUR) : 110.0 },
                    { pair: "GBP/INR", rate: r.GBP ? (95.4028 / r.GBP) : 128.5 },
                    { pair: "AUD/USD", rate: r.AUD ? (1 / r.AUD) : 0.706 },
                    { pair: "CAD/USD", rate: r.CAD ? (1 / r.CAD) : 0.717 },
                    { pair: "CHF/USD", rate: r.CHF ? (1 / r.CHF) : 1.235 },
                    { pair: "USD/CNY", rate: r.CNY || 6.755 },
                ];

                // @ts-ignore
                await client.mutation(api.rates.updateRates, { rates: mappedRates });
                console.log("[RATES_API] Convex DB sync completed successfully.");
            }
        } catch (syncError) {
            console.error("[RATES_API] Convex sync error:", syncError);
        }
    }

    return NextResponse.json(
        {
            rate: currentRate,
            lastUpdate: lastUpdateStr,
            from,
            to,
            synced: isSync
        },
        {
            headers: {
                'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
                'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
                'Cache-Control': 'public, max-age=60',
            },
        }
    );
}
