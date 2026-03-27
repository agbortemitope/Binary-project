# CrewPay V2

Task-based team operations, wallet funding, and payout orchestration for Nigerian crews.

## Architecture

- **Framework**: Next.js 16 (App Router) with TypeScript
- **Styling**: Tailwind CSS v4
- **Auth & Database**: Supabase (SSR client)
- **Payments**: Interswitch (collections, payouts, webhooks)
- **Package manager**: npm

## Project Structure

```
src/
  app/           # Next.js App Router pages and API routes
    (app)/       # Authenticated app pages (dashboard, chat, tasks, etc.)
    (auth)/      # Auth pages (sign-in, sign-up)
    api/         # Server-side API route handlers
    crewlead/    # Crew lead specific screens
    screens/     # Worker screens
  components/    # Shared UI components
  lib/           # Utilities, Supabase clients, env config, business logic
  styles/        # Global CSS and theme
```

## Running on Replit

- Dev server: `npm run dev` — runs on port 5000, bound to 0.0.0.0
- Workflow: "Start application" configured for webview on port 5000

## Required Environment Variables

Set these as secrets in Replit:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=              # Set to your Replit dev domain
INTERSWITCH_MERCHANT_CODE=
INTERSWITCH_PAY_ITEM_ID=
INTERSWITCH_CLIENT_ID=
INTERSWITCH_SECRET_KEY=
INTERSWITCH_PAYOUT_BASE_URL=
INTERSWITCH_PAYOUT_WALLET_ID=
INTERSWITCH_PAYOUT_WALLET_PIN=
INTERSWITCH_SOURCE_ACCOUNT_NAME=
INTERSWITCH_SOURCE_ACCOUNT_NUMBER=
INTERSWITCH_WEBHOOK_SECRET=
INTERSWITCH_MODE=TEST             # or LIVE
CRON_SECRET=
```

## Security Notes

- All sensitive operations run server-side in API routes (`src/app/api/`)
- Supabase admin client (service role key) is only used server-side (`src/lib/supabase/admin.ts`)
- Environment variables validated at runtime via `src/lib/env.ts`
- Supabase RLS (Row Level Security) enforced at DB level
