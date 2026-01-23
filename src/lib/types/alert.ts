// Alert type definitions for Meridian

export type AlertCondition = 'above' | 'below';
export type AlertStatus = 'active' | 'paused' | 'triggered';
export type NotificationMethod = 'email' | 'sms' | 'push';

export interface Alert {
    id: string;
    // Currency pair
    fromCurrency: string;
    toCurrency: string;
    pairId: string;

    // Target
    targetRate: number;
    condition: AlertCondition;

    // Status
    status: AlertStatus;
    createdAt: Date;
    triggeredAt?: Date;
    pausedAt?: Date;

    // Notification
    notificationMethods: NotificationMethod[];
    email?: string;
    phone?: string;

    // Tracking
    currentRate?: number;
    distanceToTarget?: number;
    estimatedTimeToTrigger?: string;

    // Notes
    note?: string;
}

export interface AlertFormData {
    fromCurrency: string;
    toCurrency: string;
    targetRate: number;
    condition: AlertCondition;
    notificationMethods: NotificationMethod[];
    email?: string;
    note?: string;
}

export interface AlertTriggerResult {
    alert: Alert;
    previousRate: number;
    triggeredRate: number;
    savings?: number;
}

// Mock alert data for demo
export const mockAlerts: Alert[] = [
    {
        id: 'alert-1',
        fromCurrency: 'USD',
        toCurrency: 'INR',
        pairId: 'usd-inr',
        targetRate: 83.50,
        condition: 'above',
        status: 'active',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        notificationMethods: ['email'],
        email: 'user@example.com',
        currentRate: 83.12,
        distanceToTarget: 0.38,
        estimatedTimeToTrigger: '~4 hours',
        note: 'Transfer to family',
    },
    {
        id: 'alert-2',
        fromCurrency: 'EUR',
        toCurrency: 'USD',
        pairId: 'eur-usd',
        targetRate: 1.05,
        condition: 'below',
        status: 'active',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        notificationMethods: ['email'],
        email: 'user@example.com',
        currentRate: 1.07,
        distanceToTarget: 0.02,
        estimatedTimeToTrigger: '~2 hours',
    },
    {
        id: 'alert-3',
        fromCurrency: 'GBP',
        toCurrency: 'USD',
        pairId: 'gbp-usd',
        targetRate: 1.28,
        condition: 'above',
        status: 'paused',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        pausedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        notificationMethods: ['email'],
        currentRate: 1.26,
        distanceToTarget: 0.02,
    },
    {
        id: 'alert-4',
        fromCurrency: 'USD',
        toCurrency: 'JPY',
        pairId: 'usd-jpy',
        targetRate: 145.00,
        condition: 'below',
        status: 'triggered',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        triggeredAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        notificationMethods: ['email'],
        currentRate: 144.85,
    },
    {
        id: 'alert-5',
        fromCurrency: 'EUR',
        toCurrency: 'INR',
        pairId: 'eur-inr',
        targetRate: 88.00,
        condition: 'above',
        status: 'active',
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        notificationMethods: ['email'],
        email: 'user@example.com',
        currentRate: 86.80,
        distanceToTarget: 1.20,
        estimatedTimeToTrigger: '~12 hours',
        note: 'Business payment',
    },
];
