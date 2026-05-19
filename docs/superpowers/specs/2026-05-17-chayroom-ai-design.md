# Chayroom AI — Design Spec

**Date:** 2026-05-17  
**Status:** Approved (visual prototype iterated and confirmed)

---

## 1. Product Overview

**Chayroom AI** is a closed community platform for learning AI tools in Russian and Uzbek. Members get courses, guides, a private Telegram chat, and live workshops. Access is sold as a subscription through a backend-owned payment layer. Tribute can be used only as a temporary MVP/test provider; Click and Payme are the primary production providers for Uzbekistan users.

**Pages:**
- `/` — Landing page (public)
- `/login` — Telegram auth page
- `/dashboard` — Member dashboard (protected)

---

## 2. Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Nuxt 4 |
| UI library | @nuxt/ui v4 |
| Styling | **Tailwind CSS v4.x only** — no custom CSS blocks |
| Language | TypeScript |
| Animation | GSAP 3.12.5 + ScrollTrigger (CDN) |
| Auth | Telegram Login Widget on web; Telegram Mini App init data inside Telegram |
| Payments | Provider-based backend payment layer. MVP: Tribute test flow. Production: Click + Payme |
| i18n | `@nuxtjs/i18n` — Russian (default) + Uzbek |

> **Rule:** All styling uses Tailwind utility classes in `class=""` attributes. No `<style>` blocks in `.vue` files. No inline `style=""` except for GSAP-injected values.

---

## 3. Design System

### Tokens (mapped to Tailwind via CSS custom properties in `app/assets/css/tokens.css`)

```css
--cx-ink: #0A0A0B        → text-[--cx-ink]
--cx-ink-soft: #1A1A1D
--cx-blue: #2962FF       → text-[--cx-blue], bg-[--cx-blue]
--cx-blue-soft: #E8EEFF  → bg-[--cx-blue-soft]
--cx-paper: #FFFFFF
--cx-surface: #FFFFFF
--cx-line: #E8E8EB       → border-[--cx-line]
--cx-text-muted: #6B6B72
--cx-text-faint: #9A9AA1
```

### Typography
- Font: Inter (400, 500, 600, 700, 800)
- Hero title: `clamp(48px, 5vw, 88px)`, weight 800, tracking -0.03em
- Section titles: 40px, weight 800
- Body: 16px, line-height 1.5

### Spacing & Radius
- Section padding: `py-16` (64px)
- Container: max-width 1180px, `px-10`
- Card radius: `rounded-3xl` (24px)
- Button radius: `rounded-full`

---

## 4. Components

### Layout
- `AppNav` — sticky top navbar: brand logo, nav links, lang switcher (RU/UZ), user avatar pill or "Login" button
- `AppFooter` — 4-column grid: brand, navigation, support, legal docs

### Shared
- `EyebrowPill` — small-caps label with blue dot, pill border
- `SectionHeader` — eyebrow + title + subtitle, centered
- `PrimaryButton` / `SecondaryButton` — pill shape, primary=black fill, secondary=outlined
- `Divider` — ornamental ✦ divider with flanking lines

### Landing sections (order on page)
1. **HeroSection** — 2-col grid (45% text / 55% art). Text: eyebrow pill, `h1` "Chayroom AI" (AI in blue, nowrap), subtitle, rotating keyword pill, CTA buttons. Art: teapot image overflowing right edge + steam SVG animation + radial glow circle.
2. **ClubForYouSection** — 2×2 card grid, numbered 01–04
3. **WhatInsideSection** — 3-col feature cards grid (6 cards)
4. **AIUsageSection** — interactive pills + AI quote block
5. **PricingSection** — 3-col pricing cards (1mo / 3mo featured / 6mo). Buttons request checkout creation from the backend. Note: "Оплата доступна через поддерживаемые платёжные системы."
6. **SkillsSection** — paginated slider (2 visible at a time, prev/next arrows, 9 skills total with dot indicators)
7. **GuidesBannerSection** — dark full-width banner with CTA
8. **FAQSection** — accordion, max-width 780px
9. **FinalCTASection** — centered, repeats primary CTA
10. **AppFooter**

### Login page (`/login`)
- Telegram Login Widget centered on page
- If opened inside Telegram Mini App, authenticate from signed Telegram WebApp init data instead of showing the widget
- Text: "Войди через Telegram" / "Войти через другой аккаунт"
- Privacy note: "Мы получаем только имя, аватар и Telegram ID"
- Help text for if confirmation doesn't arrive

### Dashboard page (`/dashboard`)
- **DashboardHeader** — greeting with avatar + name
- **StatsRow** — stat cards (courses, progress, streak)
- **CoursesGrid** — enrolled courses with progress bars
- **TelegramCommunityCard** — link to AI Room Club Telegram chat

---

## 5. Routing & Auth

```
/               → public landing
/login          → public, redirects to /dashboard if already logged in
/dashboard      → protected, redirects to /login if not authenticated
```

Auth state: stored in a Pinia store (`useAuthStore`). On mount, check Telegram widget callback for web login or signed Telegram WebApp init data when opened as a Telegram Mini App. User object: `{ id, telegramId, first_name, last_name, username, photo_url, hash }`.

---

## 6. i18n

- Default locale: `ru`
- Second locale: `uz`
- Switcher in navbar (RU / UZ buttons)
- All string literals go in `i18n/locales/ru.json` and `i18n/locales/uz.json`
- No locale prefix in URLs (strategy: `no_prefix`)

---

## 7. Animations

- **Hero entrance**: GSAP timeline — title fades up, subtitle, rotate pill, CTA, art slides in from right
- **Steam wisps**: looping SVG strokeDashoffset animation on 4 paths above teapot cup
- **ScrollTrigger reveals**: all section cards/titles fade+translateY on scroll into view
- **Skills slider**: GSAP `to` with `x` translate on track for page transitions
- **Rotating keyword**: CSS opacity/translateY transition cycling through AI keywords every 2.5s

---

## 8. Payment Architecture

Payment logic must be isolated behind a clean provider abstraction. The frontend never verifies payments, stores provider secrets, or activates access directly.

### Payment flow

```
User selects plan
→ Frontend sends create-payment request to backend with plan ID and Telegram identity/session
→ Backend creates payment with selected/default provider
→ Frontend opens checkout/payment page inside Telegram Mini App or external browser
→ User pays
→ Provider sends webhook/callback to backend
→ Backend verifies payment with provider
→ Backend activates user subscription/access by Telegram-linked user ID
```

### MVP stage

- Support a simple payment flow that is easy to launch.
- Tribute may be used as a temporary provider for MVP/payment testing.
- Tribute-specific logic must live only in the Tribute provider adapter and webhook handler.
- Do not hardcode Tribute links or Tribute behavior into pricing cards, plan data, access logic, or shared payment UI.
- Frontend uses generic payment actions such as `createPayment({ planId, provider })` and opens the returned `checkoutUrl`.

### Production stage

- Click and Payme are the main payment providers for Uzbekistan users.
- Preferred user experience is Telegram Mini App checkout: the user opens Chayroom AI inside Telegram, selects a plan, then pays through Click or Payme.
- Telegram is the identity and interface layer; Click/Payme remain the payment processors.
- Backend must verify signed Telegram Mini App init data before creating a payment for a Telegram user.
- Backend creates payment orders/invoices and returns the checkout URL or provider checkout payload.
- Backend receives every webhook/callback.
- Backend verifies provider signature/secret, transaction ID, internal payment ID, amount, currency, status, and duplicate delivery safety.
- Backend activates subscription/access for the Telegram-linked user only after successful verification.
- After successful payment, backend can notify the user through the Telegram bot and unlock dashboard/community access.
- Webhook handling must be idempotent: repeated successful callbacks must not create duplicate subscriptions.

### Telegram Mini App access flow

```
User opens Telegram Mini App
→ Frontend sends Telegram WebApp init data to backend
→ Backend verifies init data signature and resolves/creates user by telegramId
→ User selects plan
→ Backend creates Click/Payme payment for that user
→ Mini App opens the returned checkout URL
→ Click/Payme sends webhook/callback
→ Backend verifies payment
→ Backend activates subscription for telegramId-linked user
→ Telegram bot may send confirmation/access message
```

### Provider abstraction

```ts
interface PaymentProvider {
  name: 'tribute' | 'click' | 'payme'

  createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult>

  verifyWebhook(input: WebhookInput): Promise<VerifiedPaymentResult>

  getPaymentStatus?(providerPaymentId: string): Promise<PaymentStatus>
}
```

### Backend modules

```
server/
  api/
    payments/
      create.post.ts
    webhooks/
      tribute.post.ts
      click.post.ts
      payme.post.ts
  services/
    payments/
      payment.service.ts
      payment.types.ts
      providers/
        payment-provider.interface.ts
        tribute.provider.ts
        click.provider.ts
        payme.provider.ts
    subscriptions/
      subscription.service.ts
      access.service.ts
```

### Data model

```ts
type Plan = {
  id: string
  name: string
  durationDays: number
  price: number
  currency: 'UZS' | 'RUB' | 'USD'
  isActive: boolean
}

type Payment = {
  id: string
  userId: string
  telegramId?: string
  planId: string
  provider: 'tribute' | 'click' | 'payme'
  providerPaymentId?: string
  amount: number
  currency: string
  status: 'pending' | 'paid' | 'failed' | 'cancelled' | 'expired'
  createdAt: string
  paidAt?: string
  metadata?: Record<string, unknown>
}

type Subscription = {
  id: string
  userId: string
  planId: string
  startsAt: string
  expiresAt: string
  status: 'active' | 'expired' | 'cancelled'
}
```

### Frontend contract

The frontend only authenticates the Telegram session, requests checkout creation, and opens the returned URL.

```ts
const payment = await createPayment({
  planId,
  provider,
  telegramInitData
})

openCheckout(payment.checkoutUrl)
```

Provider secrets, Telegram init data verification, webhook verification, payment status decisions, and subscription activation belong on the backend.

---

## 9. File Structure

```
app/
  assets/
    css/
      tokens.css          ← CSS custom properties + @import in nuxt.config
    images/
      teapot-v4.png       ← hero image (24af7378-...)
  components/
    app/
      Nav.vue
      Footer.vue
    landing/
      HeroSection.vue
      ClubForYouSection.vue
      WhatInsideSection.vue
      AIUsageSection.vue
      PricingSection.vue
      SkillsSection.vue
      GuidesBannerSection.vue
      FAQSection.vue
      FinalCTASection.vue
    ui/
      EyebrowPill.vue
      SectionHeader.vue
  pages/
    index.vue             ← landing
    login.vue
    dashboard.vue
  stores/
    auth.ts               ← Pinia auth store
  i18n/
    locales/
      ru.json
      uz.json
server/
  api/
    payments/
      create.post.ts
    webhooks/
      tribute.post.ts
      click.post.ts
      payme.post.ts
  services/
    payments/
      payment.service.ts
      payment.types.ts
      providers/
        payment-provider.interface.ts
        tribute.provider.ts
        click.provider.ts
        payme.provider.ts
    telegram/
      telegram-auth.service.ts
      telegram-bot.service.ts
    subscriptions/
      subscription.service.ts
      access.service.ts
```

---

## 10. Key Constraints

- Telegram Login Widget requires a registered bot and must be served over HTTPS in production. For dev: `useAuthStore` has a `devLogin()` action that sets a hardcoded mock user, called from login page when `process.dev === true`.
- Telegram Mini App is the preferred production entry point for Telegram-based access. Backend must verify Telegram WebApp init data before trusting `telegramId`.
- Tribute is temporary MVP/payment-test only and must remain replaceable.
- Click and Payme are the primary production payment providers for Uzbekistan users.
- All payment verification must happen on the backend.
- Frontend only opens the checkout/payment page returned by the backend.
- Backend receives provider webhooks/callbacks and activates Telegram-linked user access only after successful verification.
- Production payments require persistent storage for users, plans, payments, and subscriptions. MVP may use simplified storage only if the payment provider abstraction and access activation boundaries remain intact.
- GSAP loaded via CDN script tag in `nuxt.config.ts` `app.head.script[]`.
