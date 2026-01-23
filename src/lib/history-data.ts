// Mock history data for predictions and transactions

export interface PredictionRecord {
    id: string;
    date: string;
    time: string;
    currencyPair: string;
    pairDisplay: string;
    predictedDirection: 'up' | 'down';
    predictedChange: number;
    actualDirection: 'up' | 'down';
    actualChange: number;
    isCorrect: boolean;
    confidence: number;
}

export interface TransactionRecord {
    id: string;
    date: string;
    amount: number;
    fromCurrency: string;
    toCurrency: string;
    rateUsed: number;
    platform: string;
    ourPrediction: string;
    savings: number;
    savingsPercent: number;
}

export interface AccuracyData {
    date: string;
    accuracy: number;
}

export interface SavingsData {
    month: string;
    savings: number;
}

export interface PlatformUsage {
    platform: string;
    count: number;
    percentage: number;
    [key: string]: string | number;
}

// Generate mock prediction history
export const predictionHistory: PredictionRecord[] = [
    { id: '1', date: '2026-01-09', time: '09:30', currencyPair: 'usd-inr', pairDisplay: 'USD → INR', predictedDirection: 'up', predictedChange: 0.3, actualDirection: 'up', actualChange: 0.25, isCorrect: true, confidence: 72 },
    { id: '2', date: '2026-01-08', time: '14:15', currencyPair: 'eur-usd', pairDisplay: 'EUR → USD', predictedDirection: 'down', predictedChange: 0.1, actualDirection: 'down', actualChange: 0.12, isCorrect: true, confidence: 68 },
    { id: '3', date: '2026-01-08', time: '10:00', currencyPair: 'usd-inr', pairDisplay: 'USD → INR', predictedDirection: 'up', predictedChange: 0.2, actualDirection: 'down', actualChange: 0.05, isCorrect: false, confidence: 58 },
    { id: '4', date: '2026-01-07', time: '16:45', currencyPair: 'gbp-usd', pairDisplay: 'GBP → USD', predictedDirection: 'up', predictedChange: 0.15, actualDirection: 'up', actualChange: 0.18, isCorrect: true, confidence: 65 },
    { id: '5', date: '2026-01-07', time: '11:20', currencyPair: 'usd-jpy', pairDisplay: 'USD → JPY', predictedDirection: 'down', predictedChange: 0.2, actualDirection: 'up', actualChange: 0.1, isCorrect: false, confidence: 55 },
    { id: '6', date: '2026-01-06', time: '09:00', currencyPair: 'eur-inr', pairDisplay: 'EUR → INR', predictedDirection: 'up', predictedChange: 0.25, actualDirection: 'up', actualChange: 0.22, isCorrect: true, confidence: 70 },
    { id: '7', date: '2026-01-06', time: '15:30', currencyPair: 'gbp-inr', pairDisplay: 'GBP → INR', predictedDirection: 'up', predictedChange: 0.18, actualDirection: 'up', actualChange: 0.15, isCorrect: true, confidence: 64 },
    { id: '8', date: '2026-01-05', time: '12:00', currencyPair: 'usd-inr', pairDisplay: 'USD → INR', predictedDirection: 'down', predictedChange: 0.1, actualDirection: 'down', actualChange: 0.08, isCorrect: true, confidence: 75 },
    { id: '9', date: '2026-01-05', time: '08:45', currencyPair: 'aud-usd', pairDisplay: 'AUD → USD', predictedDirection: 'down', predictedChange: 0.15, actualDirection: 'down', actualChange: 0.2, isCorrect: true, confidence: 62 },
    { id: '10', date: '2026-01-04', time: '17:00', currencyPair: 'cad-usd', pairDisplay: 'CAD → USD', predictedDirection: 'up', predictedChange: 0.12, actualDirection: 'down', actualChange: 0.05, isCorrect: false, confidence: 52 },
    { id: '11', date: '2026-01-04', time: '10:30', currencyPair: 'usd-cny', pairDisplay: 'USD → CNY', predictedDirection: 'down', predictedChange: 0.08, actualDirection: 'down', actualChange: 0.1, isCorrect: true, confidence: 58 },
    { id: '12', date: '2026-01-03', time: '14:00', currencyPair: 'chf-usd', pairDisplay: 'CHF → USD', predictedDirection: 'up', predictedChange: 0.1, actualDirection: 'up', actualChange: 0.08, isCorrect: true, confidence: 71 },
];

// Generate mock transaction history
export const transactionHistory: TransactionRecord[] = [
    { id: '1', date: '2026-01-08', amount: 2500, fromCurrency: 'USD', toCurrency: 'INR', rateUsed: 83.85, platform: 'Wise', ourPrediction: 'Wait', savings: 1250, savingsPercent: 2.3 },
    { id: '2', date: '2026-01-05', amount: 1000, fromCurrency: 'USD', toCurrency: 'INR', rateUsed: 83.70, platform: 'Skydo', ourPrediction: 'Send Now', savings: 850, savingsPercent: 1.8 },
    { id: '3', date: '2026-01-02', amount: 5000, fromCurrency: 'EUR', toCurrency: 'INR', rateUsed: 90.95, platform: 'Wise', ourPrediction: 'Wait', savings: 3200, savingsPercent: 2.5 },
    { id: '4', date: '2025-12-28', amount: 1500, fromCurrency: 'GBP', toCurrency: 'INR', rateUsed: 105.80, platform: 'Instarem', ourPrediction: 'Send Now', savings: 1100, savingsPercent: 2.1 },
    { id: '5', date: '2025-12-22', amount: 3000, fromCurrency: 'USD', toCurrency: 'INR', rateUsed: 83.50, platform: 'Remitly', ourPrediction: 'Wait', savings: -450, savingsPercent: -0.8 },
    { id: '6', date: '2025-12-18', amount: 2000, fromCurrency: 'USD', toCurrency: 'INR', rateUsed: 83.90, platform: 'Wise', ourPrediction: 'Send Now', savings: 1800, savingsPercent: 2.8 },
    { id: '7', date: '2025-12-12', amount: 800, fromCurrency: 'EUR', toCurrency: 'INR', rateUsed: 90.60, platform: 'WorldRemit', ourPrediction: 'Wait', savings: 520, savingsPercent: 1.9 },
    { id: '8', date: '2025-12-05', amount: 4500, fromCurrency: 'USD', toCurrency: 'INR', rateUsed: 83.65, platform: 'Skydo', ourPrediction: 'Send Now', savings: 2650, savingsPercent: 2.4 },
];

// Accuracy over time (last 90 days, sampled weekly)
export const accuracyOverTime: AccuracyData[] = [
    { date: 'Oct 15', accuracy: 62 },
    { date: 'Oct 22', accuracy: 65 },
    { date: 'Oct 29', accuracy: 64 },
    { date: 'Nov 5', accuracy: 68 },
    { date: 'Nov 12', accuracy: 66 },
    { date: 'Nov 19', accuracy: 70 },
    { date: 'Nov 26', accuracy: 69 },
    { date: 'Dec 3', accuracy: 72 },
    { date: 'Dec 10', accuracy: 68 },
    { date: 'Dec 17', accuracy: 71 },
    { date: 'Dec 24', accuracy: 67 },
    { date: 'Dec 31', accuracy: 73 },
    { date: 'Jan 7', accuracy: 68 },
];

// Savings per month
export const savingsPerMonth: SavingsData[] = [
    { month: 'Aug', savings: 8500 },
    { month: 'Sep', savings: 9200 },
    { month: 'Oct', savings: 7800 },
    { month: 'Nov', savings: 11500 },
    { month: 'Dec', savings: 13200 },
    { month: 'Jan', savings: 2100 },
];

// Platform usage distribution
export const platformUsage: PlatformUsage[] = [
    { platform: 'Wise', count: 45, percentage: 38 },
    { platform: 'Skydo', count: 28, percentage: 23 },
    { platform: 'Remitly', count: 18, percentage: 15 },
    { platform: 'Instarem', count: 15, percentage: 12 },
    { platform: 'Others', count: 14, percentage: 12 },
];

// Stats
export const historyStats = {
    overallAccuracy: 68,
    bestPerformingPair: 'EUR/USD',
    bestPairAccuracy: 75,
    totalPredictions: 247,
    totalTransferred: 15420,
    totalSaved: 12450,
    avgSavingsPercent: 2.3,
    bestDecisionId: '6',
};
