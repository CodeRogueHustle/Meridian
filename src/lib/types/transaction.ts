export type Platform = 'Wise' | 'Skydo' | 'PayPal' | 'Bank' | 'Payoneer';

export interface Transaction {
    id: string;
    date: Date;
    amount: number; // in USD usually, or source currency
    fromCurrency: string;
    toCurrency: string;
    rate: number;
    platform: Platform;
    fee: number;
    notes?: string;

    // Analytics / Comparison data
    meridianPrediction: number; // What Meridian predicted/would have recommended
    savings: number; // Positive = Saved, Negative = Lost vs Meridian/Market
    isGoodDecision: boolean; // Calculated based on savings > 0 or within margin
}

export const PLATFORMS: Platform[] = ['Wise', 'Skydo', 'PayPal', 'Bank', 'Payoneer'];
