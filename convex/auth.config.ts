export default {
    providers: [
        {
            // Clerk JWT Template Setup:
            // 1. Go to https://dashboard.clerk.com
            // 2. Select your application
            // 3. Go to "JWT Templates" -> "New Template" -> Select "Convex"
            // 4. IMPORTANT: Do NOT rename the template - it must be called "convex"
            // 5. Click "Apply Changes"
            // 6. Copy the "Issuer URL" and ensure it matches the domain below
            domain: process.env.CLERK_JWT_ISSUER_DOMAIN || "https://exact-monarch-6.clerk.accounts.dev",
            applicationID: "convex",
        },
    ],
};
