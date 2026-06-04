# Tribute Subscription Integration — Design Spec

**Date:** 2026-06-05
**Branch:** `redesign/top-co-style`
**Status:** Approved → implementation

## Goal

Integrate Tribute (Telegram-based payment) so that after a user logs in via the Telegram Login Widget, their subscription status is determined by a real DB record updated via Tribute's webhook. Locked content opens automatically once Tribute confirms payment.

## Background

Current state:
- Telegram Login Widget works (`oauth.telegram.org` → POST `/api/auth/login`).
- `subscriptions` table exists with `status`, `expiresAt`, `userId`.
- `/api/auth/login` already returns `hasSubscription`.
- Profile page (`/profile`) hardcodes "Faol" / "14 kun" / "8 iyun 2026" and force-activates the subscription on mount — wrong behavior.
- AccessModal CTA links to support Telegram chat, not Tribute.
- No Tribute webhook endpoint exists.

The user already configured Tribute with three subscription tiers:
- 1 month — $15.90
- 3 months — $39.90
- 6 months — $69.90

## Non-goals

- Building a Tribute admin/dashboard UI.
- Refunds, manual subscription overrides, prorated upgrades.
- Multi-currency display (Tribute returns USD; we display USD).
- Email receipts (Tribute handles).

## Architecture

Five units, each with a single purpose:

### A. DB schema additions

Add columns to `subscriptions`:
- `tributeSubscriptionId` (integer, unique, nullable) — Tribute's subscription ID. Used to match incoming webhooks to existing records.
- `period` (text, nullable) — "monthly" | "3month" | "6month".
- `cancelledAt` (timestamp, nullable) — set when Tribute sends `cancelled_subscription`. Subscription remains ACTIVE in our system until `expiresAt`.

Migration: `server/db/migrations/0003_tribute_subscription_fields.sql`.

### B. Webhook endpoint — `server/api/tribute/webhook.post.ts`

Responsibilities:
1. Read raw body (needed for signature verification).
2. Verify `trbt-signature` header — `HMAC-SHA256(rawBody, TRIBUTE_API_KEY)`. Reject with 401 if mismatch.
3. Parse event name:
   - `new_subscription` → upsert subscription record (by `tributeSubscriptionId`), set `status=ACTIVE`, `expiresAt = payload.expires_at`, `period`, `userId` (look up via `telegramId = payload.telegram_user_id`).
   - `renewed_subscription` → update existing record's `expiresAt`, set `status=ACTIVE`, clear `cancelledAt`.
   - `cancelled_subscription` → set `cancelledAt = now()`. Do NOT change `status` or `expiresAt` — user keeps access until `expiresAt`.
4. If `telegram_user_id` does not match any user in DB → return 200 (acknowledge) but log; user will sync on next login.

Idempotency: matching by `tributeSubscriptionId` makes replays safe.

### C. Auth sync endpoint — `server/api/auth/me.get.ts`

Lightweight endpoint that reads `cx-user` cookie, looks up the user's current subscription in DB, and returns:
```ts
{
  user: { id, telegramId, firstName, lastName, username, photoUrl } | null,
  hasSubscription: boolean,
  subscription: { period, expiresAt, cancelledAt } | null
}
```

Called by:
- Profile page on mount (to show fresh status after returning from Tribute).
- Any page that needs to re-verify (manual "refresh" button on profile).

### D. Auth store changes — `app/stores/auth.ts`

Add reactive fields:
- `subscriptionPeriod: 'monthly' | '3month' | '6month' | null`
- `subscriptionExpiresAt: string | null` (ISO)
- `subscriptionCancelled: boolean`

Computed:
- `daysLeft` — `Math.max(0, Math.ceil((expiresAt - now) / 86_400_000))`.
- `tariffLabel` — derived from `subscriptionPeriod` (e.g., "AI Room Club — 1 oy").

Persist to existing `cx-sub` cookie as a JSON object instead of a boolean (backward compat: read old boolean if present).

New action: `syncMe()` → calls `/api/auth/me`, updates store.

Remove the line in `app/pages/profile.vue` that calls `authStore.activateSubscription()` on mount (it forces subscription on for every visit — bug).

### E. UI updates

**`app/pages/profile.vue`:**
- Replace hardcoded `subscriptionUntil = '8 iyun 2026'` and `'14 kun'` with computed values from the store.
- Call `authStore.syncMe()` on mount.
- When `!hasSubscription`: show empty-state cards ("Obunasiz" / "Yo'q" / "—" / "—") matching the user's reference screenshot.
- When `hasSubscription`: show tariff name, "Faol" (or "Bekor qilingan" if `cancelledAt`), days left, expires-at date.

**`app/components/app/AccessModal.vue`:**
- Replace the single CTA with three tier cards (1 month $15.90 / 3 months $39.90 / 6 months $69.90).
- Each card → opens the corresponding Tribute deep link from runtime config in a new tab.
- Keep the existing benefits list ("Barcha kurslar va qo'llanmalar", etc.).

**`app/pages/guides/[slug].vue` paywall block:**
- The "Obuna olish" button stays as-is but now opens AccessModal (which has the three tiers), no behavior change beyond opening the modal.

### F. Configuration

`.env` additions (production via host's env vars):
```
TRIBUTE_API_KEY=…                                          # for HMAC verification
NUXT_PUBLIC_TRIBUTE_TIER_1MONTH_URL=https://t.me/tribute/app?startapp=sXgF
NUXT_PUBLIC_TRIBUTE_TIER_3MONTH_URL=https://t.me/tribute/app?startapp=…
NUXT_PUBLIC_TRIBUTE_TIER_6MONTH_URL=https://t.me/tribute/app?startapp=…
```

`nuxt.config.ts` `runtimeConfig`:
```ts
tributeApiKey: process.env.TRIBUTE_API_KEY,
public: {
  tributeTier1MonthUrl: process.env.NUXT_PUBLIC_TRIBUTE_TIER_1MONTH_URL,
  tributeTier3MonthUrl: process.env.NUXT_PUBLIC_TRIBUTE_TIER_3MONTH_URL,
  tributeTier6MonthUrl: process.env.NUXT_PUBLIC_TRIBUTE_TIER_6MONTH_URL,
}
```

## Data flow

```
Login (Telegram Widget)
  → POST /api/auth/login → upsert user, return hasSubscription
  → store user + sub state in cookies

User opens locked guide
  → AccessModal shows three tier cards
  → User clicks tier → opens t.me/tribute/app?startapp=… in Telegram

User pays in Tribute
  → Tribute → POST /api/tribute/webhook (with trbt-signature)
  → Server verifies signature, upserts subscription row

User returns to site, opens /profile
  → syncMe() → GET /api/auth/me
  → Store updates: hasSubscription=true, period, expiresAt
  → Profile renders "Faol" + days left
  → Locked guides now show green "Obuna asosida" badge and open content
```

## Error handling

| Scenario | Behavior |
|---|---|
| Webhook signature mismatch | 401, no DB write |
| Webhook for unknown telegram_user_id | 200 ack, log warning; user will sync next login |
| Webhook arrives before user has ever logged in | 200 ack, write subscription row with `userId=null`; reconcile on next login |
| `/api/auth/me` with no cookie | 200 with `user: null`, `hasSubscription: false` |
| User's `expiresAt` is in the past | `hasSubscription = false`, but row stays in DB for history |
| Clock skew on `expiresAt` boundary | Treat as expired (server clock authoritative) |

## Testing

Unit:
- Signature verification helper: valid signature passes, tampered body fails, missing header fails.
- `daysLeft` computation: today vs. future expires, expired returns 0.

Integration (manual, on `redesign/top-co-style`):
1. Webhook with fake signed payload `new_subscription` → DB row created, login returns `hasSubscription=true`.
2. Webhook `cancelled_subscription` → `cancelledAt` set; user still has access until `expiresAt`.
3. Webhook `renewed_subscription` → `expiresAt` extended.
4. Profile page with no sub → empty state. With sub → "Faol" + days.

## Open questions (resolved)

- **Webhook URL setup**: User will configure Tribute panel after code is deployed. Code written first, env vars added later.
- **Signature header name**: `trbt-signature` per Tribute docs (NOT `X-Tribute-Signature`).
- **Period mapping**: Tribute's `period` field is `"monthly" | "3month" | "6month"` — we store it verbatim.

## Out of scope (future)

- Refund webhook handling.
- Renewal reminder notifications via Telegram bot.
- Trial period / discount codes.
- Multi-account linking (one Telegram → multiple subscriptions).
