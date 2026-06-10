# Telegram Login Barqarorlashtirish — Dizayn

**Sana:** 2026-06-10
**Holat:** Tasdiqlangan (implementatsiya rejasidan oldin)

## 1. Kontekst va muammo

Loyihada Telegram orqali kirishning **uchta usuli** allaqachon mavjud:

1. **Telegram Login Widget** — `app/pages/login.vue` ko'k rasmiy widgetni auto-mount qiladi; `id&hash` `/api/auth/telegram`ga boradi, HMAC tekshiriladi, JWT httpOnly cookie o'rnatiladi.
2. **Telegram Mini App (WebApp)** — `initData` `/api/auth/telegram-webapp`ga boradi, tekshiriladi, JWT cookie.
3. **Bot deep-link + polling** — `/api/auth/bot-login/start` token yaratadi → `t.me/bot?start=auth_TOKEN` → bot `process-telegram-update.ts`da tokenni `authenticated` qiladi → frontend `/api/auth/bot-login/status`ni poll qiladi → cookie + redirect.

Sessiya barcha yo'llarda bir xil: httpOnly JWT cookie (`server/utils/session-cookie.ts`) + mijoz uchun `cx-user` / `cx-sub` cookie.

### Aniqlangan nosozliklar

- **Bug A — qaytgach osilib qolish (asosiy).** Bot oqimi ikki kontekstda ishlaydi: asl tab `status`ni poll qiladi, ikkinchi tab/Telegram-app esa botni ochadi. iOS Safari fondagi tabni muzlatadi, `setTimeout` polling to'xtaydi, foydalanuvchi ko'pincha noto'g'ri tabga qaytadi → asl tab "yetim" qoladi, `/profile`ga o'tmaydi. Git tarixida shu oqim bo'yicha ko'p "fix" commitlar bor; botdagi "saytga qaytish" tugmasi "race condition" sababli olib tashlangan — ya'ni ishonchli qaytish yo'li yo'q.
- **Bug B — akkaunt almashmaydi.** Widget redirect rejimida `/login?id=B&hash=...`ga qaytadi, lekin `onMounted` avval eski cookie (akkaunt A) bo'lsa darhol `/profile`ga otib yuboradi va URL'dagi yangi hash'ni **umuman o'qimaydi**. Natijada boshqa akkaunt bilan kirib bo'lmaydi.

Mo'rt nuqtalar (qo'shimcha): `start.post.ts`da token KV'ga TTL'siz yoziladi; ikkita yakunlash yo'li (`status` polling va `bot-callback` sahifa) tokenni har xil tozalaydi; `process-telegram-update.ts`da debug `console.log`lar qoldirilgan.

## 2. Maqsad va muvaffaqiyat mezoni

**Maqsad:** login'ni barqarorlashtirish — Bug A va Bug B'ni yo'q qilish, mo'rt bot deep-link oqimini olib tashlash orqali.

**Muvaffaqiyat mezoni:**

1. Brauzerda (desktop/mobil) ko'k widget bosiladi → **bir tab ichida, polling'siz** login bo'ladi → post-login manziliga (`/dashboard` yoki `redirect`) o'tadi.
2. A akkaunt bilan kirgan holatda B akkaunt `id&hash` bilan `/login`ga qaytsa → **B'ga almashadi** (A'da qotmaydi).
3. Telegram ichida Mini App `initData` bilan avtomatik kiradi (o'zgarmaydi).
4. Kodbazada `bot-login` poll/popup, `bot_login_token`, `bot-callback`, `telegram/start` qolmaydi.
5. `npm run test` va `lint` o'tadi.

## 3. Qaror: ikki yo'lli arxitektura

Uch yo'ldan **ikkitasi** qoladi; mo'rt bot deep-link oqimi **butunlay olib tashlanadi**.

```text
Brauzer (desktop/mobil)   →  Telegram Login Widget  →  /login?id&hash  →  /api/auth/telegram        →  JWT cookie
Telegram ichi (Mini App)  →  WebApp initData        →                     /api/auth/telegram-webapp  →  JWT cookie
[O'CHIRILADI]  Bot deep-link + polling + popup + bot-callback + status + telegram/start
```

- Widget **redirect rejimida** (`data-auth-url`) qoladi — mobilda popup muammosi yo'q, bir tab. `data-auth-url` = `window.location.href` ning `?`gacha qismi (toza `/login`), Telegram `id&hash` qo'shib qaytaradi.
- Server endpointlari (`/api/auth/telegram`, `/api/auth/telegram-webapp`) va sessiya mexanizmi **o'zgarmaydi**.

### Ko'rib chiqilgan va rad etilgan muqobillar

- **Bot oqimini zaxira sifatida mustahkamlash** — bitta tab + qaytishda agressiv qayta-tekshiruv. Rad etildi: ko'proq murakkablik, kamroq foyda; widget allaqachon brauzerni qoplaydi.
- **Hozirgidek ikkalasini qoldirib bug tuzatish** — rad etildi: mo'rtlik to'liq ketmaydi.

**Cheklov (e'tiborga olinadi):** widget in-app webview'da (Instagram va h.k.) ishlamasligi mumkin; bunday holatda zaxira yo'q. Bu ongli kelishuv — soddalik va barqarorlik foydasiga.

## 4. Account-switch tuzatish (Bug B)

Mount paytidagi qaror mantig'i sof, test qilinadigan funksiyaga ajratiladi — `app/utils/login-flow.mjs`:

```js
// resolveLoginMountAction({ isMiniApp, hasAuthPayload, hasSession }) → string
//   isMiniApp === true       → 'mini-app'
//   hasAuthPayload === true   → 'process-auth'   // ← sessiyadan OLDIN; akkaunt almashishini ta'minlaydi
//   hasSession === true       → 'redirect'
//   aks holda                 → 'show-widget'
```

`login.vue` `onMounted` shu funksiya natijasiga ko'ra ish tutadi:

- `mini-app` → `authStore.loginFromMiniApp(...)` (mavjud xulq).
- `process-auth` → URL'dagi `{ id, hash, ... }` bilan `authStore.login(...)`; muvaffaqiyatda `goAfterLogin()`, aks holda `authError`. `authStore.login` cookie + JWT'ni qayta yozadi, shu sabab eski sessiya **almashtiriladi**.
- `redirect` → `goAfterLogin()`.
- `show-widget` → widgetni mount qiladi.

`hasAuthPayload` = `route.query.id && route.query.hash` mavjudligi.

**Telegram tomoni cheklovi (hujjatlashtiriladi):** widget o'sha brauzerda avval ruxsat berilgan akkauntni qaytarishi mumkin. Boshqa akkauntni majburan tanlash Telegram tomonida (ruxsatni bekor qilish / boshqa akkauntga kirish) hal bo'ladi — bizning nazoratimizdan tashqarida. Biz **qaytgan akkauntni to'g'ri hurmat qilishni** kafolatlaymiz. Atayin almashtirish uchun `/profile`dagi "Chiqish" (`authStore.logout`) ishlatiladi. Alohida "Boshqa akkaunt" tugmasi **qo'shilmaydi** (YAGNI).

## 5. Olib tashlash ko'lami

### To'liq o'chiriladi

- `server/api/auth/bot-login/start.post.ts`
- `server/api/auth/bot-login/status.get.ts`
- `server/api/auth/telegram/start.post.ts` (re-export shim)
- `server/routes/auth/bot-callback.get.ts`
- `server/utils/bot-login.ts` (avval `BOT_LOGIN_SUCCESS_MESSAGE` `telegram.post.ts` ichiga inline ko'chiriladi — pastga qarang)
- `server/utils/bot-login.test.mjs`
- `app/plugins/bot-login.client.ts`
- Bo'shab qolgan kataloglar: `server/api/auth/bot-login/`, `server/api/auth/telegram/`

### Qisqartiriladi

- `server/api/auth/telegram.post.ts` — `BOT_LOGIN_SUCCESS_MESSAGE` import o'rniga konstantani shu fayl ichiga (yoki kichik `server/utils/messages.ts`ga) ko'chirish. Bu yagona qolgan foydalanuvchi.
- `server/utils/process-telegram-update.ts` — `auth_` tarmog'i, `callback_query` bot-login handleri, `bot-login` importlari va debug `console.log`lar olib tashlanadi. Oddiy `/start` (xush kelibsiz xabar + Mini App tugmasi) **qoladi**.
- `app/utils/login-flow.mjs` — `resolvePostLoginTarget` **qoladi**; barcha `*BotLoginToken*`, `buildBotLoginStartRequest`, `isSafariUserAgent`, `resolveBotLoginLaunchUrl` o'chadi. `resolveLoginMountAction` **qo'shiladi**.
- `app/utils/login-flow.test.mjs` — bot-token testlari olib tashlanadi; `resolvePostLoginTarget` testlari qoladi; `resolveLoginMountAction` testlari qo'shiladi.
- `app/pages/login.vue` — poll/popup/expired-button, `pageshow`/`visibilitychange` poll-resume, `window.onTelegramAuth` global mantig'i olib tashlanadi. Widget mount + Mini App holatlari + qayta tartiblangan auth qaror qoladi.
- `app/stores/auth.ts` — `logout()` ichidagi `bot_login_token` `removeItem` ikki qatori (o'lik bo'lib qoladi) olib tashlanadi.

## 6. `login.vue` keyingi holati (qisqacha)

- **Script:** widget mount funksiyasi; `loginWithTelegram(payload)`; `onMounted`da `resolveLoginMountAction` asosidagi switch. Bot bilan bog'liq barcha state (`botPollState`, `botTelegramUrl`, `botLinkExpired`, timer'lar) yo'q.
- **Template:** logo + karta; Mini App holatlari (yuklanmoqda / xato); widget konteyneri; `authError`. Bot tugmasi, "havola muddati" tugmasi, "kutmoqda" bloki **yo'q**.
- Styling Tailwind-only (CLAUDE.md §5), matnlar o'zbekcha (CLAUDE.md §6); mavjud dizayn tokenlari saqlanadi.

## 7. Edge-case

- **Birinchi login (widget):** `telegram.post.ts` xush kelibsiz xabarini bot orqali yuboradi (server-initiated) — **o'zgarmaydi**.
- **Bot hali kerak:** oddiy `/start`ga javob va Mini App'ni hostlash uchun webhook/polling qoladi.
- **Widget yuklanmasligi (domen mos emas):** `canUseTelegramWidget` `false` bo'lsa, hozirgidek `missing-bot`/xato holati ko'rsatiladi (zaxira bot oqimi endi yo'q).

## 8. Testlar

- `app/utils/login-flow.test.mjs`:
  - `resolvePostLoginTarget` — mavjud testlar qoladi.
  - `resolveLoginMountAction` — jadval testlari: 4 holat va prioritet (ayniqsa `hasAuthPayload` + `hasSession` birga → `process-auth`).
- `tests/nuxt/auth-store.test.ts` — `logout` o'zgarishidan keyin yiqilmasligini tekshirish.
- Yakunda: `npm run test` + `lint` yashil.

## 9. Qaror qilingan defaultlar / ko'lamdan tashqari

- "Boshqa akkaunt" tugmasi **yo'q** (logout-to-switch yetarli).
- `webhook.post.ts` o'lik kodiga **tegilmaydi** (faqat qayd). `telegram-polling.ts` startda webhook'ni o'chiradi, shuning uchun `webhook.post.ts` prod'da faol emas — bu eski nomuvofiqlik, shu ishda tuzatilmaydi.
- Yangi imkoniyatlar yo'q (remember-me, yangi provayder, SSE va h.k.).

## 10. Xavf va e'tibor

- **Widget in-app webview'da ishlamasligi** — zaxira yo'q. Ongli kelishuv (3.bo'lim).
- **Telegram akkaunt cachelash** — almashtirish Telegram tomonida; biz faqat qaytgan akkauntni hurmat qilamiz (4.bo'lim).
- **Surgical o'zgarish (CLAUDE.md §3):** faqat bot deep-link bilan bog'liq kod o'chadi; `telegram.post.ts`/`telegram-webapp.post.ts` mantig'i va sessiya tegilmaydi.
