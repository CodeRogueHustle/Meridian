# Deployment implementation Plan - Meridian App

This plan outlines the steps required to deploy the Meridian application to production (Convex for backend, Vercel for frontend).

## 1. Backend Deployment (Convex)
1.  **Run Convex Deploy**: Execute `npx convex deploy` to push the current schema and functions to the production environment.
2.  **Environment Variables**: Ensure the following variables are set in the Convex dashboard:
    *   `RESEND_API_KEY`
    *   `EXCHANGE_RATE_API_KEY`
3.  **Authentication**: Configure the Clerk issuer URL in the Convex dashboard to allow authenticated mutations.

## 2. Frontend Deployment (Vercel)
1.  **Project Creation**: Create a new project on Vercel and link it to the GitHub repository.
2.  **Environment Variables**: Set the following variables in the Vercel project settings:
    *   `NEXT_PUBLIC_CONVEX_URL`: Your production Convex URL.
    *   `CONVEX_DEPLOYMENT`: Your production Convex deployment name.
    *   `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: From Clerk dashboard.
    *   `CLERK_SECRET_KEY`: From Clerk dashboard.
    *   `RESEND_API_KEY`: Same as used in Convex (if needed by frontend directly).
    *   `EXCHANGE_RATE_API_KEY`: Same as used in Convex.
    *   `NEXT_PUBLIC_CLERK_SIGN_IN_URL`: `/sign-in`
    *   `NEXT_PUBLIC_CLERK_SIGN_UP_URL`: `/sign-up`
    *   `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL`: `/dashboard`
    *   `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL`: `/dashboard`
3.  **Build Settings**: Use the default Next.js build settings.

## 3. Post-Deployment Configuration
1.  **Clerk Redirects**: Update the development/production redirect URLs in the Clerk dashboard to match the Vercel deployment URL.
2.  **Cron Jobs**: Verify that the rates sync cron job is active in the Convex dashboard.
3.  **Testing**: Perform a final test of the following flows:
    *   User Sign-in/Sign-up.
    *   Live rate fetching and syncing.
    *   Alert creation and email notification.
    *   Waitlist submission.

## 4. Completed Pre-deployment Fixes
- [x] Resolved hydration mismatch on `<body>` tag.
- [x] Added `favicon.svg` and updated metadata.
- [x] Verified build success locally.
