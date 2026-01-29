import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { currentUser } from '@clerk/nextjs/server';

export async function POST(req: Request) {
    try {
        const user = await currentUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { plan } = await req.json();

        // Plan details
        const plans: Record<string, { price: string; name: string }> = {
            'Saver': {
                price: 'price_saver_monthly', // We will use a mock id or the user will provide one
                name: 'Meridian Saver Plan',
            },
            'Business': {
                price: 'price_business_monthly',
                name: 'Meridian Business Plan',
            }
        };

        const selectedPlan = plans[plan];
        if (!selectedPlan) {
            return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
        }

        // Create Checkout Sessions from body params.
        const session = await stripe.checkout.sessions.create({
            line_items: [
                {
                    // For demo/setup purposes, we can use price_data if no Price ID exists yet
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: selectedPlan.name,
                            description: `Upgrade to Meridian ${plan} for advanced FX timing tools.`,
                        },
                        unit_amount: plan === 'Saver' ? 1200 : 4900,
                        recurring: {
                            interval: 'month',
                        },
                    },
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${req.headers.get('origin')}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${req.headers.get('origin')}/subscription?canceled=true`,
            customer_email: user.emailAddresses[0].emailAddress,
            metadata: {
                userId: user.id,
                plan: plan,
            },
        });

        return NextResponse.json({ sessionId: session.id, url: session.url });
    } catch (err: any) {
        console.error('Stripe Session Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
