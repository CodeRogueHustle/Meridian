import { ArrowUp, ArrowDown } from "lucide-react";

export interface CurrencyPair {
    id: string; // e.g., 'usd-inr'
    from: string; // 'USD'
    to: string; // 'INR'
    fromFlag: string; // '🇺🇸'
    toFlag: string; // '🇮🇳'
    fromCountry: string; // 'us'
    toCountry: string; // 'in'
    rate: number;
    change24h: number; // Percentage
    prediction24h: number; // Percentage
    confidence: number; // 0-100
    chartData: { name: string; rate: number }[];
}

export interface Platform {
    id: string;
    name: string;
    logo: string;
    type: 'international' | 'bank' | 'india';
    rates: Record<string, number>; // pairId -> rate
    transferFee: number; // Fixed or percentage
    feeType: 'fixed' | 'percentage';
    speed: string; // Human readable string
    speedHours: number; // For sorting
    rating: number; // 0-5
    reviews: number;
    bestFor: string;
    minAmount: number;
    maxAmount: number;
    pros: string[];
    cons: string[];
    visitUrl: string;
}

export const currencyPairs: CurrencyPair[] = [
    {
        id: 'usd-inr', from: 'USD', to: 'INR', fromFlag: '🇺🇸', toFlag: '🇮🇳', fromCountry: 'us', toCountry: 'in', rate: 83.12, change24h: 0.15, prediction24h: 0.3, confidence: 78,
        chartData: [
            { name: "Mon", rate: 82.90 }, { name: "Tue", rate: 83.00 }, { name: "Wed", rate: 82.95 }, { name: "Thu", rate: 83.10 }, { name: "Fri", rate: 83.15 }, { name: "Sat", rate: 83.20 }, { name: "Sun", rate: 83.12 }
        ]
    },
    {
        id: 'eur-usd', from: 'EUR', to: 'USD', fromFlag: '🇪🇺', toFlag: '🇺🇸', fromCountry: 'eu', toCountry: 'us', rate: 1.09, change24h: -0.05, prediction24h: -0.1, confidence: 65,
        chartData: [
            { name: "Mon", rate: 1.085 }, { name: "Tue", rate: 1.088 }, { name: "Wed", rate: 1.092 }, { name: "Thu", rate: 1.090 }, { name: "Fri", rate: 1.089 }, { name: "Sat", rate: 1.091 }, { name: "Sun", rate: 1.090 }
        ]
    },
    {
        id: 'gbp-usd', from: 'GBP', to: 'USD', fromFlag: '🇬🇧', toFlag: '🇺🇸', fromCountry: 'gb', toCountry: 'us', rate: 1.27, change24h: 0.2, prediction24h: 0.25, confidence: 82,
        chartData: [{ name: "Mon", rate: 1.26 }, { name: "Tue", rate: 1.265 }, { name: "Wed", rate: 1.268 }, { name: "Thu", rate: 1.272 }, { name: "Fri", rate: 1.270 }, { name: "Sat", rate: 1.271 }, { name: "Sun", rate: 1.270 }]
    },
    {
        id: 'aud-usd', from: 'AUD', to: 'USD', fromFlag: '🇦🇺', toFlag: '🇺🇸', fromCountry: 'au', toCountry: 'us', rate: 0.65, change24h: -0.1, prediction24h: -0.2, confidence: 60,
        chartData: [{ name: "Mon", rate: 0.66 }, { name: "Tue", rate: 0.658 }, { name: "Wed", rate: 0.655 }, { name: "Thu", rate: 0.652 }, { name: "Fri", rate: 0.650 }, { name: "Sat", rate: 0.651 }, { name: "Sun", rate: 0.650 }]
    },
    {
        id: 'usd-jpy', from: 'USD', to: 'JPY', fromFlag: '🇺🇸', toFlag: '🇯🇵', fromCountry: 'us', toCountry: 'jp', rate: 148.5, change24h: 0.5, prediction24h: 0.4, confidence: 88,
        chartData: [{ name: "Mon", rate: 147.0 }, { name: "Tue", rate: 147.5 }, { name: "Wed", rate: 148.0 }, { name: "Thu", rate: 148.2 }, { name: "Fri", rate: 148.5 }, { name: "Sat", rate: 148.8 }, { name: "Sun", rate: 148.5 }]
    },
    {
        id: 'usd-cad', from: 'USD', to: 'CAD', fromFlag: '🇺🇸', toFlag: '🇨🇦', fromCountry: 'us', toCountry: 'ca', rate: 1.35, change24h: 0.05, prediction24h: 0.1, confidence: 70,
        chartData: [{ name: "Mon", rate: 1.34 }, { name: "Tue", rate: 1.345 }, { name: "Wed", rate: 1.348 }, { name: "Thu", rate: 1.352 }, { name: "Fri", rate: 1.350 }, { name: "Sat", rate: 1.351 }, { name: "Sun", rate: 1.350 }]
    },
    {
        id: 'usd-chf', from: 'USD', to: 'CHF', fromFlag: '🇺🇸', toFlag: '🇨🇭', fromCountry: 'us', toCountry: 'ch', rate: 0.88, change24h: -0.15, prediction24h: -0.1, confidence: 68,
        chartData: [{ name: "Mon", rate: 0.89 }, { name: "Tue", rate: 0.885 }, { name: "Wed", rate: 0.882 }, { name: "Thu", rate: 0.880 }, { name: "Fri", rate: 0.878 }, { name: "Sat", rate: 0.881 }, { name: "Sun", rate: 0.880 }]
    },
    {
        id: 'usd-cny', from: 'USD', to: 'CNY', fromFlag: '🇺🇸', toFlag: '🇨🇳', fromCountry: 'us', toCountry: 'cn', rate: 7.19, change24h: 0.0, prediction24h: 0.05, confidence: 55,
        chartData: [{ name: "Mon", rate: 7.18 }, { name: "Tue", rate: 7.185 }, { name: "Wed", rate: 7.19 }, { name: "Thu", rate: 7.192 }, { name: "Fri", rate: 7.195 }, { name: "Sat", rate: 7.190 }, { name: "Sun", rate: 7.190 }]
    },
    {
        id: 'nzd-usd', from: 'NZD', to: 'USD', fromFlag: '🇳🇿', toFlag: '🇺🇸', fromCountry: 'nz', toCountry: 'us', rate: 0.61, change24h: 0.1, prediction24h: 0.15, confidence: 62,
        chartData: [{ name: "Mon", rate: 0.605 }, { name: "Tue", rate: 0.608 }, { name: "Wed", rate: 0.610 }, { name: "Thu", rate: 0.612 }, { name: "Fri", rate: 0.610 }, { name: "Sat", rate: 0.611 }, { name: "Sun", rate: 0.610 }]
    },
    {
        id: 'eur-gbp', from: 'EUR', to: 'GBP', fromFlag: '🇪🇺', toFlag: '🇬🇧', fromCountry: 'eu', toCountry: 'gb', rate: 0.85, change24h: -0.05, prediction24h: -0.05, confidence: 75,
        chartData: [{ name: "Mon", rate: 0.855 }, { name: "Tue", rate: 0.852 }, { name: "Wed", rate: 0.850 }, { name: "Thu", rate: 0.848 }, { name: "Fri", rate: 0.850 }, { name: "Sat", rate: 0.851 }, { name: "Sun", rate: 0.850 }]
    }
];

export const PLATFORM_LOGOS: Record<string, string> = {
    'Wise': 'https://www.google.com/s2/favicons?domain=wise.com&sz=128',
    'Skydo': 'https://www.google.com/s2/favicons?domain=skydo.com&sz=128',
    'Remitly': 'https://www.google.com/s2/favicons?domain=remitly.com&sz=128',
    'Revolut': 'https://www.google.com/s2/favicons?domain=revolut.com&sz=128',
    'PayPal': 'https://www.google.com/s2/favicons?domain=paypal.com&sz=128',
    'Western Union': 'https://www.google.com/s2/favicons?domain=westernunion.com&sz=128',
    'Xoom': 'https://www.google.com/s2/favicons?domain=xoom.com&sz=128',
    'HDFC Bank': 'https://www.google.com/s2/favicons?domain=hdfcbank.com&sz=128',
    'SBI': 'https://www.google.com/s2/favicons?domain=sbi.co.in&sz=128',
    'ICICI Money2India': 'https://www.google.com/s2/favicons?domain=icicibank.com&sz=128',
    'Mulberry': 'https://www.google.com/s2/favicons?domain=getmulberry.com&sz=128',
    'BookMyForex': 'https://www.google.com/s2/favicons?domain=bookmyforex.com&sz=128',
    'Instarem': 'https://www.google.com/s2/favicons?domain=instarem.com&sz=128',
    'WorldRemit': 'https://www.google.com/s2/favicons?domain=worldremit.com&sz=128',
};

export const platforms: Platform[] = [
    {
        id: 'wise', name: 'Wise', logo: PLATFORM_LOGOS['Wise'], type: 'international',
        rates: { 'usd-inr': 83.05, 'eur-usd': 1.088, 'gbp-usd': 1.268, 'usd-jpy': 148.0 },
        transferFee: 0.6, feeType: 'percentage',
        speed: 'Instant - 1 day', speedHours: 2,
        rating: 4.8, reviews: 145000,
        bestFor: 'Small to medium transfers',
        minAmount: 1, maxAmount: 1000000,
        pros: ['Transparent fees', 'Real mid-market rate', 'Fast transfers'],
        cons: ['Fees can be higher for large amounts', 'No cash pickup'],
        visitUrl: 'https://wise.com'
    },
    {
        id: 'skydo', name: 'Skydo', logo: PLATFORM_LOGOS['Skydo'], type: 'india',
        rates: { 'usd-inr': 83.10, 'eur-usd': 1.089, 'gbp-usd': 1.269 },
        transferFee: 29, feeType: 'fixed',
        speed: '1 day', speedHours: 24,
        rating: 4.6, reviews: 1200,
        bestFor: 'Freelancers & B2B in India',
        minAmount: 500, maxAmount: 50000,
        pros: ['Flat fee structure', 'Zero forex markup', 'FIRA provided'],
        cons: ['Limited to business payments', 'Verification required'],
        visitUrl: 'https://skydo.com'
    },
    {
        id: 'remitly', name: 'Remitly', logo: PLATFORM_LOGOS['Remitly'], type: 'international',
        rates: { 'usd-inr': 82.80, 'eur-usd': 1.085 },
        transferFee: 1.99, feeType: 'fixed',
        speed: 'Express (Instant)', speedHours: 0.5,
        rating: 4.5, reviews: 45000,
        bestFor: 'Fast family remittances',
        minAmount: 10, maxAmount: 10000,
        pros: ['Very fast delivery', 'Cash pickup options', 'Promotional rates'],
        cons: ['Exchange rate markup', 'Lower limits'],
        visitUrl: 'https://remitly.com'
    },
    {
        id: 'revolut', name: 'Revolut', logo: PLATFORM_LOGOS['Revolut'], type: 'international',
        rates: { 'usd-inr': 83.00, 'eur-usd': 1.09, 'gbp-usd': 1.27 },
        transferFee: 0, feeType: 'fixed',
        speed: 'Instant', speedHours: 0.1,
        rating: 4.7, reviews: 98000,
        bestFor: 'Frequent travelers',
        minAmount: 1, maxAmount: 50000,
        pros: ['Multi-currency accounts', 'Instant transfers between users', 'Spending analytics'],
        cons: ['Weekend fees apply', 'Subscription needed for higher limits'],
        visitUrl: 'https://revolut.com'
    },
    {
        id: 'paypal', name: 'PayPal', logo: PLATFORM_LOGOS['PayPal'], type: 'international',
        rates: { 'usd-inr': 80.50, 'eur-usd': 1.05, 'gbp-usd': 1.23 },
        transferFee: 4.5, feeType: 'percentage',
        speed: 'Instant', speedHours: 0.1,
        rating: 4.2, reviews: 250000,
        bestFor: 'Convenience & Security',
        minAmount: 1, maxAmount: 10000,
        pros: ['Widely accepted', 'Buyer protection', 'Instant wallet transfers'],
        cons: ['Very high fees', 'Poor exchange rates', 'Account holds common'],
        visitUrl: 'https://paypal.com'
    },
    {
        id: 'western-union', name: 'Western Union', logo: PLATFORM_LOGOS['Western Union'], type: 'international',
        rates: { 'usd-inr': 82.90 },
        transferFee: 0, feeType: 'fixed',
        speed: 'Minutes', speedHours: 0.5,
        rating: 4.1, reviews: 85000,
        bestFor: 'Cash pickup globally',
        minAmount: 1, maxAmount: 5000,
        pros: ['Massive agent network', 'Cash pickup available almost everywhere'],
        cons: ['Hidden markup in rates', 'Website can be clunky'],
        visitUrl: 'https://westernunion.com'
    },
    {
        id: 'xoom', name: 'Xoom', logo: PLATFORM_LOGOS['Xoom'], type: 'international',
        rates: { 'usd-inr': 81.50 },
        transferFee: 4.99, feeType: 'fixed',
        speed: 'Minutes', speedHours: 0.5,
        rating: 4.0, reviews: 22000,
        bestFor: 'PayPal integration',
        minAmount: 10, maxAmount: 25000,
        pros: ['Fast', 'Integrated with PayPal', 'Easy to use'],
        cons: ['High markups', 'Transaction limits'],
        visitUrl: 'https://xoom.com'
    },
    {
        id: 'hdfc', name: 'HDFC Bank', logo: PLATFORM_LOGOS['HDFC Bank'], type: 'bank',
        rates: { 'usd-inr': 82.10 },
        transferFee: 15, feeType: 'fixed',
        speed: '2-3 days', speedHours: 48,
        rating: 3.8, reviews: 15000,
        bestFor: 'Large secure transfers',
        minAmount: 100, maxAmount: 1000000,
        pros: ['Trusted banking partner', 'High limits', 'Relationship manager support'],
        cons: ['Slow processing', 'Paperwork often needed', 'Lower rates'],
        visitUrl: 'https://hdfcbank.com'
    },
    {
        id: 'sbi', name: 'SBI', logo: PLATFORM_LOGOS['SBI'], type: 'bank',
        rates: { 'usd-inr': 82.15 },
        transferFee: 10, feeType: 'fixed',
        speed: '3-4 days', speedHours: 72,
        rating: 3.6, reviews: 20000,
        bestFor: 'Government compliance',
        minAmount: 100, maxAmount: 500000,
        pros: ['Widest network in India', 'Safe', 'Low fees for banks'],
        cons: ['Very slow', 'Poor customer service', 'Legacy interface'],
        visitUrl: 'https://sbi.co.in'
    },
    {
        id: 'icici', name: 'ICICI Money2India', logo: PLATFORM_LOGOS['ICICI Money2India'], type: 'bank',
        rates: { 'usd-inr': 82.40 },
        transferFee: 0, feeType: 'fixed',
        speed: '1-2 days', speedHours: 36,
        rating: 3.9, reviews: 10000,
        bestFor: 'Existing ICICI customers',
        minAmount: 100, maxAmount: 300000,
        pros: ['Reliable', 'Good mobile app for a bank', 'Competitive for bank transfers'],
        cons: ['Rate markup present', 'Login required'],
        visitUrl: 'https://icicibank.com'
    },
    {
        id: 'mulberry', name: 'Mulberry', logo: PLATFORM_LOGOS['Mulberry'], type: 'india',
        rates: { 'usd-inr': 83.15 },
        transferFee: 0.5, feeType: 'percentage',
        speed: '1 day', speedHours: 24,
        rating: 4.5, reviews: 500,
        bestFor: 'B2B Large Transfers',
        minAmount: 2000, maxAmount: 500000,
        pros: ['Dedicated support', 'Best rates for large volume', 'FIRA assistance'],
        cons: ['Newer platform', 'Higher minimums'],
        visitUrl: 'https://mulberry.com'
    },
    {
        id: 'bookmyforex', name: 'BookMyForex', logo: PLATFORM_LOGOS['BookMyForex'], type: 'india',
        rates: { 'usd-inr': 83.00 },
        transferFee: 0, feeType: 'fixed',
        speed: '2 days', speedHours: 48,
        rating: 4.3, reviews: 5000,
        bestFor: 'Cash & Forex Cards',
        minAmount: 200, maxAmount: 10000,
        pros: ['Doorstep delivery', 'Forex card options', 'Rate freeze'],
        cons: ['Slower for wire transfers', 'KYC heavy'],
        visitUrl: 'https://bookmyforex.com'
    }
];

export const getCurrencyPair = (pairId: string): CurrencyPair | undefined => {
    return currencyPairs.find(p => p.id === pairId);
};

export const getPlatformRate = (platformId: string, pairId: string): number | undefined => {
    const platform = platforms.find(p => p.id === platformId);
    return platform?.rates[pairId];
};

export const getBestPlatformForPair = (pairId: string, currentRate?: number): Platform | undefined => {
    const platformsForPair = platforms.filter(p => p.rates[pairId] !== undefined);
    if (platformsForPair.length === 0) return undefined;

    if (currentRate) {
        // Find platform with best rate relative to live market
        return platformsForPair.reduce((prev, curr) => {
            const prevRate = getAdjustedPlatformRate(prev, pairId, currentRate);
            const currRate = getAdjustedPlatformRate(curr, pairId, currentRate);
            return prevRate > currRate ? prev : curr;
        });
    }

    return platformsForPair.reduce((prev, current) => {
        return (prev.rates[pairId] > current.rates[pairId]) ? prev : current;
    });
};

export const getAdjustedPlatformRate = (platform: Platform, pairId: string, currentRate: number): number => {
    const basePair = currencyPairs.find(p => p.id === pairId);
    if (!basePair) return currentRate; // Should not happen for supported pairs

    // Calculate the percentage difference (markup/fee) from the mock data
    const mockMidMarket = basePair.rate;
    const mockPlatformRate = platform.rates[pairId] || mockMidMarket;
    const ratio = mockPlatformRate / mockMidMarket;

    return currentRate * ratio;
};

export const formatCurrency = (amount: number, decimals: number = 2): string => {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(amount);
};

export const convertCurrency = (amount: number, from: string, to: string, rate: number): number => {
    return amount * rate;
};

export const CURRENCY_TO_COUNTRY: Record<string, string> = {
    'USD': 'us',
    'INR': 'in',
    'EUR': 'eu',
    'GBP': 'gb',
    'AUD': 'au',
    'JPY': 'jp',
    'CAD': 'ca',
    'CHF': 'ch',
    'CNY': 'cn',
    'NZD': 'nz'
};
export const calculateSavings = (alert: any, currentRate: number): string => {
    // Mock savings calculation: (currentRate - targetRate) * standard transfer amount ($3,000)
    const diff = Math.abs(currentRate - alert.targetRate);
    const standardAmount = 3000;
    const savings = diff * standardAmount;

    // Format based on currency
    if (alert.toCurrency === 'INR' || alert.pairId?.endsWith('INR')) {
        return `₹${Math.round(savings).toLocaleString()}`;
    }
    return `$${savings.toFixed(2)}`;
};
