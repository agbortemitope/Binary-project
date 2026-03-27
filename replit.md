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
    (app)/       # Authenticated app pages
      lead/      # Lead-only pages (dashboard, tasks, teams, wallet, chat, analytics)
      worker/    # Worker-only pages (home, tasks, earnings, teams, profile, chat)
      chat/      # Shared chat room page (real-time bubble UI)
      notifications/ # Shared notifications page
    (auth)/      # Auth pages (sign-in, sign-up)
    api/         # Server-side API route handlers
  components/    # Shared UI components
    chat/        # ChatInterface (bubble-style chat client component)
    forms/       # Action forms (submit task, review, claim, edit profile, etc.)
    team/        # Team-related components
    ui/          # Base UI primitives (Button, Badge, Input, etc.)
  lib/           # Utilities, Supabase clients, env config, business logic
  styles/        # Global CSS and theme
```

## Role Architecture

**Strict separation**: Worker and lead are completely separate accounts. There is no role switching.

- `default_role_view: "lead"` → lands on `/lead`, sees team/task management, wallet, payout controls
- `default_role_view: "worker"` → lands on `/worker`, sees claimable tasks, earnings, profile

## UI/UX Design

### Lead flow (funding → payouts)
- **Dashboard**: Pipeline command center — 4-stage wallet breakdown, urgency banner, numbered step CTAs
- **Tasks page**: Status-grouped — "Needs approval" (amber) → "In progress" → "Completed"
- **Task detail**: Submission review with submitter/payout destination + approve/reject
- **Wallet page**: Funding CTA, per-team balance summary, 4-step explainer
- **Create task form**: Live wallet balance with insufficient-funds warning
- **Analytics page**: Correctly labeled "Settings" in nav — shows account info + workspace stats + payout history

### Worker flow (claim → earn)
- **Home page**: Pending payout balance hero, stat cards, available tasks, my tasks
- **Tasks page**: Status-grouped — Claimable (blue) → Active → Completed
- **Task detail**: Claim/submit work with evidence upload, submission history
- **Earnings page**: Paid/pending totals, earnings list with status, full payout history with bank details
- **Profile page**: Edit name/phone live (PATCH /api/profile), payout account view, sign out

### Chat
- **Chat room** (`/chat/[roomId]`): Bubble-style layout — own messages right (blue), others left (grey), initials avatar, keyboard-submit composer (Enter to send)
- **Chat lists**: Separate team chats and task chats sections

### Notifications
- Unread count shown, blue highlight for unread, relative timestamp

## API Routes

- `PATCH /api/profile` — update worker profile (full_name, phone)
- `POST /api/auth/sign-up` — account creation with payout method
- `POST /api/messages` — send chat message
- `POST /api/tasks/[taskId]/submit` — submit task work
- `POST /api/tasks/[taskId]/review` — approve/reject submission (triggers payout)
- `POST /api/tasks/[taskId]/claim` — claim open task
- `GET /api/notifications/unread-count` — unread badge count for app shell

## Payout Status Labels

Human-readable labels used throughout the UI:
- `pending` → "Queued"
- `processing` → "Sending"
- `successful` → "Sent"
- `failed` → "Failed"

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
