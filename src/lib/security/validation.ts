/**
 * Input Validation & Sanitization Utility
 * 
 * OWASP Security Controls:
 * - A3:2017 - Injection
 * - A7:2017 - Cross-Site Scripting (XSS)
 * 
 * Implements schema-based validation with:
 * - Type checking
 * - Length limits
 * - Pattern matching
 * - Field whitelisting (reject unexpected fields)
 * - HTML/script sanitization
 */

// ============================================================================
// Type Definitions
// ============================================================================

export type ValidatorResult = {
    valid: boolean;
    errors: string[];
    sanitized?: Record<string, unknown>;
};

export type FieldValidator = {
    type: 'string' | 'number' | 'boolean' | 'email' | 'array' | 'enum';
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: RegExp;
    enumValues?: readonly string[];
    arrayItemType?: 'string' | 'number';
    arrayMaxLength?: number;
    sanitize?: boolean;  // Whether to sanitize HTML/scripts
};

export type ValidationSchema = Record<string, FieldValidator>;

// ============================================================================
// Validation Constants
// ============================================================================

// Common patterns for validation
export const PATTERNS = {
    // Email: RFC 5322 simplified
    EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    // Currency code: 3 uppercase letters
    CURRENCY_CODE: /^[A-Z]{3}$/,
    // Currency pair: XXX/YYY format
    CURRENCY_PAIR: /^[A-Z]{3}\/[A-Z]{3}$/,
    // Phone: International format (simplified)
    PHONE: /^\+?[1-9]\d{1,14}$/,
    // Alphanumeric with spaces
    ALPHA_SPACE: /^[a-zA-Z0-9\s]+$/,
    // No HTML/scripts - basic check
    NO_HTML: /^[^<>]*$/,
} as const;

// Maximum field lengths (OWASP recommendation: always set limits)
export const MAX_LENGTHS = {
    EMAIL: 254,           // RFC 5321
    CURRENCY_CODE: 3,
    CURRENCY_PAIR: 7,
    PHONE: 20,
    NOTE: 500,
    GENERAL_STRING: 255,
} as const;

// ============================================================================
// Sanitization Functions
// ============================================================================

/**
 * Sanitize string input to prevent XSS
 * Removes HTML tags and encodes special characters
 */
export function sanitizeString(input: string): string {
    if (typeof input !== 'string') return '';

    return input
        // Remove HTML tags
        .replace(/<[^>]*>/g, '')
        // Encode special HTML characters
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        // Remove null bytes
        .replace(/\0/g, '')
        // Trim whitespace
        .trim();
}

/**
 * Sanitize email address
 * Normalizes and validates format
 */
export function sanitizeEmail(input: string): string {
    if (typeof input !== 'string') return '';
    return input.toLowerCase().trim().slice(0, MAX_LENGTHS.EMAIL);
}

/**
 * Sanitize currency code
 * Uppercase and limit length
 */
export function sanitizeCurrencyCode(input: string): string {
    if (typeof input !== 'string') return '';
    return input.toUpperCase().trim().slice(0, MAX_LENGTHS.CURRENCY_CODE);
}

// ============================================================================
// Validation Schemas for API Endpoints
// ============================================================================

/**
 * Schema for /api/rates endpoint
 */
export const RATES_API_SCHEMA: ValidationSchema = {
    from: {
        type: 'string',
        required: false,
        minLength: 3,
        maxLength: 3,
        pattern: PATTERNS.CURRENCY_CODE,
    },
    to: {
        type: 'string',
        required: false,
        minLength: 3,
        maxLength: 3,
        pattern: PATTERNS.CURRENCY_CODE,
    },
    sync: {
        type: 'string',
        required: false,
        enumValues: ['true', 'false'],
    },
};

/**
 * Schema for /api/send-alert endpoint
 */
export const SEND_ALERT_SCHEMA: ValidationSchema = {
    to: {
        type: 'email',
        required: true,
        maxLength: MAX_LENGTHS.EMAIL,
    },
    pair: {
        type: 'string',
        required: true,
        minLength: 7,
        maxLength: 7,
        pattern: PATTERNS.CURRENCY_PAIR,
    },
    targetRate: {
        type: 'number',
        required: true,
        min: 0.0001,
        max: 1000000,
    },
    currentRate: {
        type: 'number',
        required: true,
        min: 0.0001,
        max: 1000000,
    },
    savings: {
        type: 'string',
        required: true,
        maxLength: 50,
        sanitize: true,
    },
};

/**
 * Schema for Convex alert creation
 */
export const CREATE_ALERT_SCHEMA: ValidationSchema = {
    pair: {
        type: 'string',
        required: true,
        pattern: PATTERNS.CURRENCY_PAIR,
        maxLength: 10,
    },
    type: {
        type: 'enum',
        required: true,
        enumValues: ['above', 'below'],
    },
    targetRate: {
        type: 'number',
        required: true,
        min: 0.0001,
        max: 1000000,
    },
    currentRate: {
        type: 'number',
        required: true,
        min: 0.0001,
        max: 1000000,
    },
    email: {
        type: 'email',
        required: true,
        maxLength: MAX_LENGTHS.EMAIL,
    },
    phone: {
        type: 'string',
        required: false,
        pattern: PATTERNS.PHONE,
        maxLength: MAX_LENGTHS.PHONE,
    },
    note: {
        type: 'string',
        required: false,
        maxLength: MAX_LENGTHS.NOTE,
        sanitize: true,
    },
    notificationMethods: {
        type: 'array',
        required: true,
        arrayItemType: 'string',
        arrayMaxLength: 3,
    },
};

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validate input against a schema
 * Implements strict validation with field whitelisting
 * 
 * @param input - The input object to validate
 * @param schema - The validation schema
 * @param strictMode - If true, reject fields not in schema (default: true)
 */
export function validateInput(
    input: Record<string, unknown>,
    schema: ValidationSchema,
    strictMode: boolean = true
): ValidatorResult {
    const errors: string[] = [];
    const sanitized: Record<string, unknown> = {};

    // Check for unexpected fields (OWASP: reject unexpected input)
    if (strictMode) {
        const allowedFields = new Set(Object.keys(schema));
        for (const key of Object.keys(input)) {
            if (!allowedFields.has(key)) {
                errors.push(`Unexpected field: ${key}`);
            }
        }
    }

    // Validate each field in schema
    for (const [fieldName, validator] of Object.entries(schema)) {
        const value = input[fieldName];

        // Check required fields
        if (validator.required && (value === undefined || value === null || value === '')) {
            errors.push(`${fieldName} is required`);
            continue;
        }

        // Skip optional empty fields
        if (!validator.required && (value === undefined || value === null || value === '')) {
            continue;
        }

        // Type-specific validation
        const fieldErrors = validateField(fieldName, value, validator);
        errors.push(...fieldErrors);

        // Sanitize if valid and required
        if (fieldErrors.length === 0) {
            sanitized[fieldName] = sanitizeField(value, validator);
        }
    }

    return {
        valid: errors.length === 0,
        errors,
        sanitized: errors.length === 0 ? sanitized : undefined,
    };
}

/**
 * Validate a single field against its validator
 */
function validateField(
    fieldName: string,
    value: unknown,
    validator: FieldValidator
): string[] {
    const errors: string[] = [];

    switch (validator.type) {
        case 'string':
            if (typeof value !== 'string') {
                errors.push(`${fieldName} must be a string`);
                break;
            }
            if (validator.minLength && value.length < validator.minLength) {
                errors.push(`${fieldName} must be at least ${validator.minLength} characters`);
            }
            if (validator.maxLength && value.length > validator.maxLength) {
                errors.push(`${fieldName} must be at most ${validator.maxLength} characters`);
            }
            if (validator.pattern && !validator.pattern.test(value)) {
                errors.push(`${fieldName} has invalid format`);
            }
            break;

        case 'email':
            if (typeof value !== 'string') {
                errors.push(`${fieldName} must be a string`);
                break;
            }
            if (!PATTERNS.EMAIL.test(value)) {
                errors.push(`${fieldName} must be a valid email address`);
            }
            if (validator.maxLength && value.length > validator.maxLength) {
                errors.push(`${fieldName} is too long`);
            }
            break;

        case 'number':
            const numValue = typeof value === 'string' ? parseFloat(value) : value;
            if (typeof numValue !== 'number' || isNaN(numValue)) {
                errors.push(`${fieldName} must be a number`);
                break;
            }
            if (validator.min !== undefined && numValue < validator.min) {
                errors.push(`${fieldName} must be at least ${validator.min}`);
            }
            if (validator.max !== undefined && numValue > validator.max) {
                errors.push(`${fieldName} must be at most ${validator.max}`);
            }
            break;

        case 'boolean':
            if (typeof value !== 'boolean' && value !== 'true' && value !== 'false') {
                errors.push(`${fieldName} must be a boolean`);
            }
            break;

        case 'enum':
            if (!validator.enumValues?.includes(value as string)) {
                errors.push(`${fieldName} must be one of: ${validator.enumValues?.join(', ')}`);
            }
            break;

        case 'array':
            if (!Array.isArray(value)) {
                errors.push(`${fieldName} must be an array`);
                break;
            }
            if (validator.arrayMaxLength && value.length > validator.arrayMaxLength) {
                errors.push(`${fieldName} can have at most ${validator.arrayMaxLength} items`);
            }
            break;
    }

    return errors;
}

/**
 * Sanitize a field value based on its type
 */
function sanitizeField(value: unknown, validator: FieldValidator): unknown {
    if (validator.type === 'string' || validator.type === 'email') {
        const strValue = String(value);
        if (validator.sanitize) {
            return sanitizeString(strValue);
        }
        if (validator.type === 'email') {
            return sanitizeEmail(strValue);
        }
        return strValue.trim();
    }

    if (validator.type === 'number') {
        return typeof value === 'string' ? parseFloat(value) : value;
    }

    return value;
}

/**
 * Create a validation error response
 */
export function createValidationErrorResponse(errors: string[]): Response {
    return new Response(
        JSON.stringify({
            error: 'Validation Error',
            message: 'The request contains invalid data',
            details: errors,
        }),
        {
            status: 400,
            headers: {
                'Content-Type': 'application/json',
            },
        }
    );
}
