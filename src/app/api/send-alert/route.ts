/**
 * Send Alert Email API Route
 * 
 * SECURITY FEATURES:
 * - Rate limiting (IP-based, stricter for email operations)
 * - Input validation & sanitization
 * - Secure API key handling (no hardcoded keys)
 * - XSS prevention in email template
 * - Security headers
 * 
 * OWASP Compliance:
 * - A1: Injection prevention via input validation
 * - A3: Sensitive Data Exposure - API key not exposed
 * - A7: XSS - HTML sanitization in template
 */

import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import {
  checkRateLimit,
  getClientIP,
  createRateLimitResponse,
  RATE_LIMIT_CONFIGS,
  validateInput,
  SEND_ALERT_SCHEMA,
  createValidationErrorResponse,
  getSecureApiKey,
  logSecurityEvent,
  sanitizeString,
} from '@/lib/security';

// ============================================================================
// API Handler
// ============================================================================

export async function POST(request: Request) {
  const clientIP = getClientIP(request);

  // ========================================================================
  // Rate Limiting (Strict for email operations)
  // ========================================================================
  const rateLimitResult = checkRateLimit(`ip:${clientIP}:alert`, RATE_LIMIT_CONFIGS.ALERT_SEND);

  if (!rateLimitResult.allowed) {
    logSecurityEvent('RATE_LIMIT', {
      ip: clientIP,
      endpoint: '/api/send-alert',
      retryAfter: rateLimitResult.retryAfter,
    });
    return createRateLimitResponse(rateLimitResult.retryAfter!);
  }

  // ========================================================================
  // Secure API Key Validation
  // ========================================================================
  const RESEND_API_KEY = getSecureApiKey('RESEND_API_KEY');

  if (!RESEND_API_KEY) {
    console.error('[SECURITY] RESEND_API_KEY is completely missing from environment variables');
    return NextResponse.json(
      {
        error: 'Email service unavailable',
        message: 'RESEND_API_KEY is not configured in environment variables.'
      },
      { status: 503 }
    );
  }

  // ========================================================================
  // Parse and Validate Request Body
  // ========================================================================
  let body: Record<string, unknown>;

  try {
    body = await request.json();
  } catch (e) {
    logSecurityEvent('VALIDATION_FAILURE', {
      ip: clientIP,
      endpoint: '/api/send-alert',
      errors: ['Invalid JSON body'],
    });
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }

  const validationResult = validateInput(body, SEND_ALERT_SCHEMA, true);

  if (!validationResult.valid) {
    logSecurityEvent('VALIDATION_FAILURE', {
      ip: clientIP,
      endpoint: '/api/send-alert',
      errors: validationResult.errors,
    });
    return createValidationErrorResponse(validationResult.errors);
  }

  // ========================================================================
  // Extract and Sanitize Validated Data
  // ========================================================================
  const { to, pair, targetRate, currentRate, savings } = validationResult.sanitized!;

  // Additional sanitization for template injection prevention
  const safePair = sanitizeString(String(pair));
  const safeTargetRate = Number(targetRate);
  const safeCurrentRate = Number(currentRate);
  const safeSavings = sanitizeString(String(savings));
  const safeEmail = String(to).toLowerCase().trim();

  // ========================================================================
  // Send Email via Resend
  // ========================================================================
  const resend = new Resend(RESEND_API_KEY);
  const fromEmail = 'onboarding@resend.dev';

  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [safeEmail],
      subject: `🎯 Alert Triggered: ${safePair} hit ${safeTargetRate}`,
      html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; color: white;">
                        <h1>MERIDIAN</h1>
                        <p>AI-Powered FX Intelligence</p>
                    </div>
                    
                    <div style="background: #1a1a1a; padding: 40px; color: #fff;">
                        <div style="text-align: center; margin-bottom: 30px;">
                            <div style="width: 60px; height: 60px; background: #10b981; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; font-size: 30px;">
                                ✓
                            </div>
                            <h2 style="margin: 0 0 10px 0;">Your Alert Triggered! 🎯</h2>
                            <p style="color: #9ca3af; margin: 0;">The rate you were waiting for has been reached.</p>
                        </div>
                        
                        <div style="background: #2d2d2d; border-radius: 12px; padding: 30px; margin-bottom: 30px;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
                                <div>
                                    <p style="color: #9ca3af; margin: 0 0 5px 0; font-size: 14px;">YOUR TARGET</p>
                                    <p style="color: #fff; margin: 0; font-size: 24px; font-weight: bold;">${safeTargetRate} ✓</p>
                                </div>
                                <div style="text-align: right;">
                                    <p style="color: #9ca3af; margin: 0 0 5px 0; font-size: 14px;">CURRENT RATE</p>
                                    <p style="color: #10b981; margin: 0; font-size: 24px; font-weight: bold;">${safeCurrentRate}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div style="background: #065f46; border-radius: 12px; padding: 20px; margin-bottom: 30px;">
                            <p style="margin: 0 0 5px 0; font-size: 14px;">💡 Recommendation</p>
                            <p style="margin: 0 0 10px 0;">Based on our analysis, this is a good time to transfer.</p>
                            <p style="margin: 0; font-weight: bold;">Estimated savings: ${safeSavings} on a $3,000 transfer.</p>
                        </div>
                        
                        <a href="https://wise.com" style="display: block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-align: center; padding: 16px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-bottom: 15px;">
                            Transfer with Wise →
                        </a>
                        
                        <a href="https://meridian.app/dashboard" style="display: block; background: #2d2d2d; color: white; text-align: center; padding: 16px; border-radius: 8px; text-decoration: none;">
                            View in Dashboard
                        </a>
                    </div>
                    
                    <div style="background: #0a0a0a; padding: 20px; text-align: center; color: #6b7280; font-size: 14px;">
                        <p style="margin: 0 0 10px 0;">
                            <a href="https://meridian.app/alerts" style="color: #6b7280; text-decoration: none; margin-right: 15px;">Manage Alerts</a>
                            <a href="https://meridian.app/unsubscribe" style="color: #6b7280; text-decoration: none;">Unsubscribe</a>
                        </p>
                        <p style="margin: 0;">Meridian - AI-Powered FX Intelligence</p>
                    </div>
                </div>
            `,
    });

    if (error) {
      console.error('[SECURITY] Resend API Error Response:', JSON.stringify(error));
      return NextResponse.json(
        {
          error: 'Failed to send notification',
          details: error
        },
        { status: 500 }
      );
    }

    console.log(`[SECURITY] Alert email sent successfully to ${safeEmail}. Message ID: ${data?.id}`);

    return NextResponse.json(
      { success: true, messageId: data?.id },
      {
        headers: {
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
        },
      }
    );
  } catch (err: any) {
    console.error('[SECURITY] Server Error sending alert:', err);

    // Don't expose internal error details
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
