# Tribute Subscription Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire up Tribute webhook so that Telegram-authenticated users automatically get subscription access when payment lands, profile reflects real DB state, and the access modal funnels users to Tribute checkout.

**Architecture:** Five-unit slice — DB columns, signed webhook receiver, auth/me sync endpoint, store reactivity, UI fixes. Webhook is the single source of truth; the rest reads from DB on demand.

**Tech Stack:** Nuxt 4 (Nitro), Drizzle ORM (Postgres), Pinia store, Node `crypto` HMAC, `node:test` for unit tests.

**Spec:** [docs/superpowers/specs/2026-06-05-tribute-subscription-integration-design.md](/Users/behruzzaripov/Desktop/Chayroom-AI/nuxt-app/docs/superpowers/specs/2026-06-05-tribute-subscription-integration-design.md)

---

## File map

**Create:**

- `server/db/migrations/0003_tribute_subscription_fields.sql` — schema migration
- `server/utils/tribute-signature.ts` — HMAC verification helper
- `server/utils/tribute-signature.test.mjs` — unit tests
- `server/api/tribute/webhook.post.ts` — webhook receiver
- `server/api/auth/me.get.ts` — auth + subscription sync endpoint

**Modify:**

- `server/db/schema.ts` — add `tributeSubscriptionId`, `period`, `cancelledAt`
- `server/db/migrations/meta/_journal.json` — append migration entry
- `nuxt.config.ts` — add Tribute env keys to runtimeConfig
- `app/stores/auth.ts` — add subscription fields + `syncMe()` action
- `app/pages/profile.vue` — remove hardcoded values, render real state
- `app/components/app/AccessModal.vue` — three tier cards with Tribute links

---

## Task 1: DB schema additions + migration

**Files:**

- Modify: `server/db/schema.ts`
- Create: `server/db/migrations/0003_tribute_subscription_fields.sql`
- Modify: `server/db/migrations/meta/_journal.json`

- [ ] **Step 1: Add columns to subscriptions table in schema.ts**

In `server/db/schema.ts`, locate the `subscriptions` table definition and add three new columns after `expiresAt`:

```ts
export const subscriptions = pgTable('subscriptions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  status: subscriptionStatusEnum('status').notNull().default('ACTIVE'),
  expiresAt: timestamp('expires_at').notNull(),
  tributeSubscriptionId: integer('tribute_subscription_id').unique(),
  period: text('period'),
  cancelledAt: timestamp('cancelled_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
})
```

- [ ] **Step 2: Create migration SQL**

Create `server/db/migrations/0003_tribute_subscription_fields.sql`:

```sql
ALTER TABLE "subscriptions" ADD COLUMN "tribute_subscription_id" integer;
ALTER TABLE "subscriptions" ADD COLUMN "period" text;
ALTER TABLE "subscriptions" ADD COLUMN "cancelled_at" timestamp;
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_tribute_subscription_id_unique" UNIQUE ("tribute_subscription_id");
```

- [ ] **Step 3: Append journal entry**

In `server/db/migrations/meta/_journal.json`, append a new entry to the `entries` array (after the existing `0002_add_course_is_free` entry):

```json
{
  "idx": 3,
  "version": "7",
  "when": 1780000000000,
  "tag": "0003_tribute_subscription_fields",
  "breakpoints": true
}
```

- [ ] **Step 4: Commit**

```bash
git add server/db/schema.ts server/db/migrations/0003_tribute_subscription_fields.sql server/db/migrations/meta/_journal.json
git commit -m "feat(db): add Tribute subscription fields"
```

---

## Task 2: Signature verification helper + tests

**Files:**

- Create: `server/utils/tribute-signature.ts`
- Create: `server/utils/tribute-signature.test.mjs`

- [ ] **Step 1: Write the failing test**

Create `server/utils/tribute-signature.test.mjs`:

```js
import test from 'node:test'
import assert from 'node:assert/strict'
import { createHmac } from 'node:crypto'

import { verifyTributeSignature } from './tribute-signature.ts'

const SECRET = 'test-api-key'
const body = JSON.stringify({ name: 'new_subscription', payload: { subscription_id: 1 } })
const validSig = createHmac('sha256', SECRET).update(body).digest('hex')

test('verifyTributeSignature accepts valid signature', () => {
  assert.equal(verifyTributeSignature(body, validSig, SECRET), true)
})

test('verifyTributeSignature rejects tampered body', () => {
  const tampered = body + 'x'
  assert.equal(verifyTributeSignature(tampered, validSig, SECRET), false)
})

test('verifyTributeSignature rejects missing signature', () => {
  assert.equal(verifyTributeSignature(body, '', SECRET), false)
})

test('verifyTributeSignature rejects wrong-length signature', () => {
  assert.equal(verifyTributeSignature(body, 'deadbeef', SECRET), false)
})
```

- [ ] **Step 2: Run test, verify it fails**

```bash
node --test --experimental-strip-types server/utils/tribute-signature.test.mjs
```

Expected: FAIL with "Cannot find module './tribute-signature.ts'"

- [ ] **Step 3: Implement the helper**

Create `server/utils/tribute-signature.ts`:

```ts
import { createHmac, timingSafeEqual } from 'node:crypto'

export function verifyTributeSignature(rawBody: string, signature: string, apiKey: string): boolean {
  if (!signature || !apiKey) return false

  const expected = createHmac('sha256', apiKey).update(rawBody).digest('hex')
  if (expected.length !== signature.length) return false

  try {
    return timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(signature, 'hex'))
  } catch {
    return false
  }
}
```

- [ ] **Step 4: Run test, verify it passes**

```bash
node --test --experimental-strip-types server/utils/tribute-signature.test.mjs
```

Expected: 4 tests pass.

- [ ] **Step 5: Commit**

```bash
git add server/utils/tribute-signature.ts server/utils/tribute-signature.test.mjs
git commit -m "feat(tribute): HMAC-SHA256 signature verification helper"
```

---

## Task 3: Add runtimeConfig keys

**Files:**

- Modify: `nuxt.config.ts`

- [ ] **Step 1: Add Tribute keys to runtimeConfig**

In `nuxt.config.ts`, update the `runtimeConfig` block:

```ts
runtimeConfig: {
  openaiApiKey: '',
  r2AccountId: '',
  r2AccessKeyId: '',
  r2SecretAccessKey: '',
  r2BucketName: '',
  r2PublicUrl: '',
  telegramBotToken: '',
  tributeApiKey: '',
  public: {
    telegramBotUsername: '',
    appUrl: 'https://chayroom.uz',
    supportUsername: 'hellobehruz',
    sentryDsn: '',
    tributeTier1MonthUrl: '',
    tributeTier3MonthUrl: '',
    tributeTier6MonthUrl: ''
  }
},
```

Nuxt maps these to env vars: `NUXT_TRIBUTE_API_KEY`, `NUXT_PUBLIC_TRIBUTE_TIER_1MONTH_URL`, etc.

- [ ] **Step 2: Commit**

```bash
git add nuxt.config.ts
git commit -m "feat(config): add Tribute runtime config keys"
```

---

## Task 4: Webhook endpoint

**Files:**

- Create: `server/api/tribute/webhook.post.ts`

- [ ] **Step 1: Implement the webhook**

Create `server/api/tribute/webhook.post.ts`:

```ts
import { eq } from 'drizzle-orm'
import { db } from '../../db'
import { users, subscriptions } from '../../db/schema'
import { verifyTributeSignature } from '../../utils/tribute-signature'

interface TributePayload {
  subscription_id: number
  period: string
  telegram_user_id: number
  expires_at: string
}

interface TributeEvent {
  name: 'new_subscription' | 'renewed_subscription' | 'cancelled_subscription'
  payload: TributePayload
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const apiKey = config.tributeApiKey

  if (!apiKey) {
    throw createError({ statusCode: 500, statusMessage: 'Tribute API key not configured' })
  }

  const rawBody = await readRawBody(event, 'utf-8')
  if (!rawBody) {
    throw createError({ statusCode: 400, statusMessage: 'Empty body' })
  }

  const signature = getHeader(event, 'trbt-signature') ?? ''
  if (!verifyTributeSignature(rawBody, signature, apiKey)) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid signature' })
  }

  const body = JSON.parse(rawBody) as TributeEvent
  const { name, payload } = body

  if (!payload?.telegram_user_id || !payload?.subscription_id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing required payload fields' })
  }

  const telegramId = String(payload.telegram_user_id)
  const [user] = await db.select().from(users).where(eq(users.telegramId, telegramId)).limit(1)

  if (!user) {
    console.warn('[tribute] webhook for unknown telegram_user_id', payload.telegram_user_id)
    return { ok: true, matched: false }
  }

  const expiresAt = new Date(payload.expires_at)

  if (name === 'new_subscription') {
    const [existing] = await db.select().from(subscriptions)
      .where(eq(subscriptions.tributeSubscriptionId, payload.subscription_id))
      .limit(1)

    if (existing) {
      await db.update(subscriptions).set({
        status: 'ACTIVE',
        expiresAt,
        period: payload.period,
        cancelledAt: null,
        updatedAt: new Date()
      }).where(eq(subscriptions.id, existing.id))
    } else {
      await db.insert(subscriptions).values({
        userId: user.id,
        status: 'ACTIVE',
        expiresAt,
        tributeSubscriptionId: payload.subscription_id,
        period: payload.period
      })
    }
  } else if (name === 'renewed_subscription') {
    await db.update(subscriptions).set({
      status: 'ACTIVE',
      expiresAt,
      cancelledAt: null,
      updatedAt: new Date()
    }).where(eq(subscriptions.tributeSubscriptionId, payload.subscription_id))
  } else if (name === 'cancelled_subscription') {
    await db.update(subscriptions).set({
      cancelledAt: new Date(),
      updatedAt: new Date()
    }).where(eq(subscriptions.tributeSubscriptionId, payload.subscription_id))
  }

  return { ok: true }
})
```

- [ ] **Step 2: Smoke-test with curl (locally)**

Generate a signed test payload and POST it. From the project root, in a shell:

```bash
SECRET="test-api-key"
BODY='{"name":"new_subscription","payload":{"subscription_id":9999,"period":"monthly","telegram_user_id":123456789,"expires_at":"2026-12-31T00:00:00Z"}}'
SIG=$(node -e "console.log(require('crypto').createHmac('sha256','$SECRET').update(process.argv[1]).digest('hex'))" "$BODY")
# Start dev server with NUXT_TRIBUTE_API_KEY=test-api-key, then:
curl -X POST http://localhost:3000/api/tribute/webhook \
  -H "Content-Type: application/json" \
  -H "trbt-signature: $SIG" \
  -d "$BODY"
```

Expected: `{"ok":true,"matched":false}` (if telegramId 123456789 not in DB) or `{"ok":true}` if matched. Tampered body or wrong sig → 401.

- [ ] **Step 3: Commit**

```bash
git add server/api/tribute/webhook.post.ts
git commit -m "feat(tribute): webhook endpoint for subscription events"
```

---

## Task 5: Auth /me sync endpoint

**Files:**

- Create: `server/api/auth/me.get.ts`

- [ ] **Step 1: Implement the endpoint**

Create `server/api/auth/me.get.ts`:

```ts
import { eq, desc } from 'drizzle-orm'
import { db } from '../../db'
import { users, subscriptions } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const cookie = getCookie(event, 'cx-user')
  if (!cookie) {
    return { user: null, hasSubscription: false, subscription: null }
  }

  let parsed: { id?: number, telegramId?: number } | null = null
  try {
    parsed = JSON.parse(cookie)
  } catch {
    return { user: null, hasSubscription: false, subscription: null }
  }

  const telegramId = String(parsed?.telegramId ?? parsed?.id ?? '')
  if (!telegramId) {
    return { user: null, hasSubscription: false, subscription: null }
  }

  const [user] = await db.select().from(users).where(eq(users.telegramId, telegramId)).limit(1)
  if (!user) {
    return { user: null, hasSubscription: false, subscription: null }
  }

  const [sub] = await db.select().from(subscriptions)
    .where(eq(subscriptions.userId, user.id))
    .orderBy(desc(subscriptions.expiresAt))
    .limit(1)

  const now = new Date()
  const hasSubscription = !!sub && sub.status === 'ACTIVE' && sub.expiresAt > now

  return {
    user: {
      id: user.id,
      telegramId: Number(user.telegramId),
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      photoUrl: user.photoUrl
    },
    hasSubscription,
    subscription: sub ? {
      period: sub.period,
      expiresAt: sub.expiresAt.toISOString(),
      cancelledAt: sub.cancelledAt ? sub.cancelledAt.toISOString() : null
    } : null
  }
})
```

- [ ] **Step 2: Smoke-test**

With dev server running, hit:

```bash
curl -i http://localhost:3000/api/auth/me
```

Expected: `200 OK` with `{"user":null,"hasSubscription":false,"subscription":null}` (no cookie).

- [ ] **Step 3: Commit**

```bash
git add server/api/auth/me.get.ts
git commit -m "feat(auth): /api/auth/me endpoint for subscription sync"
```

---

## Task 6: Auth store reactive subscription state

**Files:**

- Modify: `app/stores/auth.ts`

- [ ] **Step 1: Add subscription fields and syncMe action**

In `app/stores/auth.ts`:

1. After the `hasSubscription` ref (line 28), add:

```ts
const subscriptionPeriod = ref<string | null>(null)
const subscriptionExpiresAt = ref<string | null>(null)
const subscriptionCancelled = ref(false)

const daysLeft = computed(() => {
  if (!subscriptionExpiresAt.value) return null
  const ms = new Date(subscriptionExpiresAt.value).getTime() - Date.now()
  return Math.max(0, Math.ceil(ms / 86_400_000))
})

const tariffLabel = computed(() => {
  if (!subscriptionPeriod.value) return null
  const map: Record<string, string> = {
    monthly: 'AI Room Club — 1 oy',
    '3month': 'AI Room Club — 3 oy',
    '6month': 'AI Room Club — 6 oy'
  }
  return map[subscriptionPeriod.value] ?? 'AI Room Club'
})
```

2. Replace the `activateSubscription` function with:

```ts
function activateSubscription(data?: { period?: string | null, expiresAt?: string | null, cancelledAt?: string | null }) {
  hasSubscription.value = true
  subCookie.value = true
  if (data) {
    subscriptionPeriod.value = data.period ?? null
    subscriptionExpiresAt.value = data.expiresAt ?? null
    subscriptionCancelled.value = !!data.cancelledAt
  }
}

function clearSubscription() {
  hasSubscription.value = false
  subCookie.value = null
  subscriptionPeriod.value = null
  subscriptionExpiresAt.value = null
  subscriptionCancelled.value = false
}
```

3. Add `syncMe` action — place it after `syncSubscription`:

```ts
async function syncMe() {
  if (!import.meta.client) return
  try {
    const res = await $fetch<{
      user: TelegramUser | null
      hasSubscription: boolean
      subscription: { period: string | null, expiresAt: string, cancelledAt: string | null } | null
    }>('/api/auth/me')

    if (!res.user) {
      logout()
      return
    }

    if (res.hasSubscription && res.subscription) {
      activateSubscription({
        period: res.subscription.period,
        expiresAt: res.subscription.expiresAt,
        cancelledAt: res.subscription.cancelledAt
      })
    } else {
      clearSubscription()
    }
  } catch {
    // silent — leave existing state
  }
}
```

4. Update `logout()` to also clear new fields — change it to:

```ts
function logout() {
  user.value = null
  userCookie.value = null
  clearSubscription()
  if (import.meta.client) {
    localStorage.removeItem('cx-user')
  }
}
```

5. Update the return statement at the bottom of `useAuthStore` to expose the new fields:

```ts
return {
  user,
  hasSubscription,
  subscriptionPeriod,
  subscriptionExpiresAt,
  subscriptionCancelled,
  daysLeft,
  tariffLabel,
  isOwner,
  agentVariant,
  resolvedAgentVariant,
  displayName,
  initials,
  login,
  loginFromMiniApp,
  activateSubscription,
  clearSubscription,
  syncMe,
  setAgentVariant,
  logout,
  restoreFromStorage,
  devLogin
}
```

- [ ] **Step 2: Commit**

```bash
git add app/stores/auth.ts
git commit -m "feat(auth): reactive subscription state + syncMe action"
```

---

## Task 7: Profile page — use real subscription state

**Files:**

- Modify: `app/pages/profile.vue`

- [ ] **Step 1: Remove the force-activate bug and add syncMe**

In `app/pages/profile.vue`:

1. Delete the entire `onMounted` block at lines 46–48:

```ts
onMounted(() => {
  authStore.activateSubscription()
})
```

2. Replace `const subscriptionUntil = '8 iyun 2026'` (line 10) with:

```ts
const hasSubscription = computed(() => authStore.hasSubscription)
const subscriptionExpiresAt = computed(() => {
  const iso = authStore.subscriptionExpiresAt
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long', year: 'numeric' })
})
const tariffLabel = computed(() => authStore.tariffLabel ?? 'Obunasiz')
const subscriptionStatusLabel = computed(() => {
  if (!authStore.hasSubscription) return "Yo'q"
  if (authStore.subscriptionCancelled) return 'Bekor qilingan'
  return 'Faol'
})
const daysLeftLabel = computed(() => {
  const n = authStore.daysLeft
  return n === null ? '—' : `${n} kun`
})
```

3. Inside the existing `onMounted` that loads `aboutMe` (around line 29), add a call to `syncMe`:

```ts
onMounted(() => {
  try { aboutMe.value = JSON.parse(localStorage.getItem(ABOUT_KEY) || '{}') } catch {}
  void authStore.syncMe()
})
```

- [ ] **Step 2: Update template — desktop 4 stat cards**

In the desktop template block (line ~199), replace the four hardcoded card values:

- "AI Room Club" → `{{ tariffLabel }}`
- "Faol" → `{{ subscriptionStatusLabel }}`
- "14 kun" → `{{ daysLeftLabel }}`
- `{{ subscriptionUntil }}` → `{{ subscriptionExpiresAt }}`

Concrete diff — find the four `<p class="text-[17px] font-bold text-[#14161f]">…</p>` lines in the stat cards section and replace their inner text with the four computed names above (in order: tariff, status, days, expires).

- [ ] **Step 3: Update template — mini-app 2×2 grid**

In the mini-app template (line ~86), replace the four hardcoded values the same way:

- "Chayroom AI Club" → `{{ tariffLabel }}`
- "Faol" → `{{ subscriptionStatusLabel }}`
- "14 kun" → `{{ daysLeftLabel }}`
- `{{ subscriptionUntil }}` → `{{ subscriptionExpiresAt }}`

- [ ] **Step 4: Verify in browser**

Run `pnpm dev`, log in via dev login button, visit `/profile`.

Expected with no Tribute subscription:
- Tarif: "Obunasiz"
- Obuna holati: "Yo'q"
- Kun qoldi: "—"
- Tugash sanasi: "—"

- [ ] **Step 5: Commit**

```bash
git add app/pages/profile.vue
git commit -m "fix(profile): show real subscription state, remove force-activate bug"
```

---

## Task 8: AccessModal — three tier cards

**Files:**

- Modify: `app/components/app/AccessModal.vue`

- [ ] **Step 1: Replace the single CTA with three tier cards**

Read the existing `app/components/app/AccessModal.vue`. Find the `<a href="https://t.me/hellobehruz" ...>` block (the "Telegram orqali kirish" button). Replace that whole `<a>` tag with the tier grid below.

Also add this to the `<script setup>` at the top:

```ts
const config = useRuntimeConfig()
const tiers = [
  {
    label: '1 oy',
    price: '$15.90',
    url: config.public.tributeTier1MonthUrl,
    highlight: false
  },
  {
    label: '3 oy',
    price: '$39.90',
    sub: '$13.30 / oy',
    url: config.public.tributeTier3MonthUrl,
    highlight: true
  },
  {
    label: '6 oy',
    price: '$69.90',
    sub: '$11.65 / oy',
    url: config.public.tributeTier6MonthUrl,
    highlight: false
  }
]
```

Then replace the single `<a>` button with this block (placed where the old button was):

```html
<div class="mb-2 grid grid-cols-3 gap-2">
  <a
    v-for="tier in tiers"
    :key="tier.label"
    :href="tier.url || '#'"
    target="_blank"
    rel="noopener noreferrer"
    class="flex flex-col items-center gap-1 rounded-2xl border px-3 py-3 text-center transition-all duration-150 hover:scale-[1.03]"
    :class="tier.highlight
      ? 'border-[#3480f1] bg-[#3480f1] text-white shadow-[0_8px_20px_rgba(52,128,241,0.25)]'
      : 'border-[#e8e6e1] bg-white text-[#14161f] hover:border-[#3480f1]'"
  >
    <span class="text-[12px] font-semibold opacity-80">{{ tier.label }}</span>
    <span class="text-[17px] font-extrabold leading-tight">{{ tier.price }}</span>
    <span v-if="tier.sub" class="text-[10px] font-medium opacity-70">{{ tier.sub }}</span>
  </a>
</div>
```

- [ ] **Step 2: Verify in browser**

Run dev server. Open a locked guide while logged out, click "Obuna olish", verify the three tier cards render and each opens its Tribute URL in a new tab (URLs will be empty strings until `.env` is configured, but the structure should render).

- [ ] **Step 3: Commit**

```bash
git add app/components/app/AccessModal.vue
git commit -m "feat(modal): three Tribute subscription tiers"
```

---

## Task 9: End-to-end manual verification

- [ ] **Step 1: Set up dev env**

Add to a local `.env` (do not commit):

```
NUXT_TRIBUTE_API_KEY=test-api-key
NUXT_PUBLIC_TRIBUTE_TIER_1MONTH_URL=https://t.me/tribute/app?startapp=sXgF
NUXT_PUBLIC_TRIBUTE_TIER_3MONTH_URL=https://t.me/tribute/app?startapp=sXgF
NUXT_PUBLIC_TRIBUTE_TIER_6MONTH_URL=https://t.me/tribute/app?startapp=sXgF
```

Then run the migration:

```bash
pnpm exec drizzle-kit migrate
```

Expected: `0003_tribute_subscription_fields` applied.

- [ ] **Step 2: Smoke-test webhook with dev user**

1. Start `pnpm dev`.
2. Log in via the Dev login button on `/login` (creates user with `telegramId=123456789`).
3. From a shell:

```bash
SECRET="test-api-key"
BODY='{"name":"new_subscription","payload":{"subscription_id":9999,"period":"monthly","telegram_user_id":123456789,"expires_at":"2026-12-31T00:00:00Z"}}'
SIG=$(node -e "console.log(require('crypto').createHmac('sha256','$SECRET').update(process.argv[1]).digest('hex'))" "$BODY")
curl -X POST http://localhost:3000/api/tribute/webhook \
  -H "Content-Type: application/json" \
  -H "trbt-signature: $SIG" \
  -d "$BODY"
```

Expected: `{"ok":true}`.

4. Reload `/profile`.

Expected: Tarif shows "AI Room Club — 1 oy", Status "Faol", "Kun qoldi" shows positive number, "Tugash sanasi" shows "31 dekabr 2026".

- [ ] **Step 3: Test cancellation**

```bash
BODY='{"name":"cancelled_subscription","payload":{"subscription_id":9999,"period":"monthly","telegram_user_id":123456789,"expires_at":"2026-12-31T00:00:00Z"}}'
SIG=$(node -e "console.log(require('crypto').createHmac('sha256','$SECRET').update(process.argv[1]).digest('hex'))" "$BODY")
curl -X POST http://localhost:3000/api/tribute/webhook -H "trbt-signature: $SIG" -H "Content-Type: application/json" -d "$BODY"
```

Reload `/profile`. Expected: Status shows "Bekor qilingan", days/expires still set.

- [ ] **Step 4: Test bad signature**

```bash
curl -X POST http://localhost:3000/api/tribute/webhook \
  -H "trbt-signature: deadbeef" -H "Content-Type: application/json" -d '{"name":"new_subscription"}'
```

Expected: HTTP 401.

- [ ] **Step 5: Commit verification notes (optional)**

No code commit needed if all checks passed.

---

## Self-review checklist (done before handoff)

- ✅ Spec sections A–F all covered by tasks 1–8.
- ✅ Webhook idempotency: matches by `tributeSubscriptionId` (unique), upserts safely.
- ✅ `tributeSubscriptionId` consistently spelled across schema, webhook, and store. No `tributeId` / `tribute_sub_id` drift.
- ✅ Error paths covered: unknown user (200 ack), bad sig (401), missing api key (500), empty body (400).
- ✅ Profile bug (`activateSubscription` on mount) explicitly removed in Task 7 Step 1.
- ✅ No TODO / TBD placeholders.
