import { Transaction, Platform } from './types/transaction';

const STORAGE_KEY = 'meridian_transactions';

const MOCK_PLATFORMS: Platform[] = ['Wise', 'Skydo', 'PayPal', 'Bank', 'Payoneer'];

// Helper to generate random date in last 90 days
function randomDate(start: Date, end: Date) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

export function generateMockTransactions(): Transaction[] {
    const transactions: Transaction[] = [];
    let netSavings = 0;

    // Target ~12450 savings
    // We'll create 37 transactions
    // 25 good, 12 bad

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 90);
    const endDate = new Date();

    // 1. Generate 25 Good Decisions (Savings)
    for (let i = 0; i < 25; i++) {
        const amount = Math.floor(Math.random() * 4500) + 500; // $500 - $5000
        const rate = 83.0 + Math.random() * 1.5; // Base rate
        // Good decision: User got a rate BETTER than Meridian's conservative estimate or Market average in this mock logic?
        // Let's say: User followed Meridian. Meridian predicted X. User got X. 
        // "Savings" is usually compared to "Average Bank Rate".
        // Let's define Savings = (UserRate - BankRate) * Amount.

        // Mock: Bank Rate is usually ~2-3% lower.
        const bankRate = rate * 0.97;
        const savings = (rate - bankRate) * amount; // Savings in INR

        transactions.push({
            id: `tx-good-${i}`,
            date: randomDate(startDate, endDate),
            amount,
            fromCurrency: 'USD',
            toCurrency: 'INR',
            rate: Number(rate.toFixed(4)),
            platform: Math.random() > 0.5 ? 'Wise' : 'Skydo',
            fee: amount * 0.005,
            meridianPrediction: Number(rate.toFixed(4)), // Prediction matched
            savings: Number(savings.toFixed(2)),
            isGoodDecision: true,
            notes: 'Followed Meridian alert'
        });
        netSavings += savings;
    }

    // 2. Generate 12 Bad Decisions (Losses vs Potential)
    // Comparisons: User used Bank/PayPal instead of Wise/Skydo
    for (let i = 0; i < 12; i++) {
        const amount = Math.floor(Math.random() * 2000) + 200;
        const potentialRate = 83.5 + Math.random();

        // User got a bad rate (Bank/PayPal)
        const userRate = potentialRate * 0.96; // 4% loss
        const loss = (userRate - potentialRate) * amount; // Negative savings

        transactions.push({
            id: `tx-bad-${i}`,
            date: randomDate(startDate, endDate),
            amount,
            fromCurrency: 'USD',
            toCurrency: 'INR',
            rate: Number(userRate.toFixed(4)),
            platform: Math.random() > 0.5 ? 'PayPal' : 'Bank',
            fee: amount * 0.04,
            meridianPrediction: Number(potentialRate.toFixed(4)),
            savings: Number(loss.toFixed(2)),
            isGoodDecision: false,
            notes: 'Urgent transfer, ignored alert'
        });
        netSavings += loss;
    }

    // Sort by date desc
    return transactions.sort((a, b) => b.date.getTime() - a.date.getTime());
}

export function getTransactions(): Transaction[] {
    if (typeof window === 'undefined') return [];

    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
        const mocks = generateMockTransactions();
        saveTransactions(mocks);
        return mocks;
    }

    // Parse dates back to Date objects
    return JSON.parse(stored, (key, value) => {
        if (key === 'date') return new Date(value);
        return value;
    });
}

export function saveTransactions(transactions: Transaction[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

export function addTransaction(transaction: Transaction) {
    const current = getTransactions();
    const updated = [transaction, ...current];
    saveTransactions(updated);
    return updated;
}

export function getTransactionStats() {
    const transactions = getTransactions();
    const totalSaved = transactions.reduce((acc, t) => acc + t.savings, 0);
    const count = transactions.length;
    const goodDecisions = transactions.filter(t => t.isGoodDecision).length;
    const accuracy = count > 0 ? Math.round((goodDecisions / count) * 100) : 0;

    return {
        totalSaved,
        count,
        accuracy,
        lastTransaction: transactions[0]
    };
}
