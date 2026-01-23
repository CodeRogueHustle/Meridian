import type { Metadata } from "next";
import { Inter, Syne, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });
const syne = Syne({ subsets: ["latin"], weight: ['700', '800'], variable: '--font-syne' });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: '--font-space-grotesk' });

import ConvexClientProvider from "@/components/ConvexClientProvider";

export const metadata: Metadata = {
    title: "MERIDIAN | AI-Powered Forex & Payments",
    description: "The next generation of global currency management and forex intelligence.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="dark">
            <body className={`${inter.variable} ${syne.variable} ${spaceGrotesk.variable} font-sans`}>
                <ConvexClientProvider>
                    {children}
                </ConvexClientProvider>
            </body>
        </html>
    );
}
