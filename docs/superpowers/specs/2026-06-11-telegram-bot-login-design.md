# Bot orqali kirish (token-callback) — Dizayn

**Sana:** 2026-06-11
**Holat:** Tasdiqlangan (implementatsiya rejasidan oldin)

## 1. Kontekst va muammo

`2026-06-10-telegram-login-stabilization` ishida bot deep-link login **polling**i tufayli olib tashlangan edi (Bug A: iOS Safari fondagi tabni muzlatadi, polling to'xtaydi, asl tab yetim qoladi). Hozir brauzerda yagona yo'l — Telegram Login Widget, Telegram ichida esa Mini App.

Talab: bot orqali kirishni **qaytarish**, lekin Bug A'ni qaytarmasdan. Yechim — **polling yo'q**. Bot foydalanuvchiga bir martalik token bilan havola yuboradi; foydalanuvchi havolani bosgan tabda sessiya server tomonidan o'rnatiladi. Asl `/login` tab hech narsani kutmaydi va poll qilmaydi.

Bu olib tashlangan oqimning **yaxshi yarmini** (token → callback → sessiya) qaytaradi, **yomon yarmini** (start/status polling) qoldirmaydi.

## 2. Maqsad va muvaffaqiyat mezoni

**Maqsad:** bot orqali, polling'siz, xavfsiz (httpOnly) kirishni qo'shish; mavjud widget/mini-app oqimlariga tegmaslik.

**Muvaffaqiyat mezoni:**

1. `/login`da "Telegram bot orqali kirish" tugmasi bor; bosilganda `t.me/<bot>?start=login` ochiladi.
2. Botda `/start login` → bot foydalanuvchini upsert qiladi, bir martalik token yaratadi, "Saytga kirish" URL-tugmali xabar yuboradi.
3. Tugma havolasi (`/auth/callback?token=...`) brauzerda ochilganda: server tokenni tekshiradi va **httpOnly JWT sessiya** o'rnatadi, sahifa profilni store'ga yozib `/dashboard`ga o'tadi.
4. Asl `/login` tab **poll qilmaydi**; faqat yo'l-yo'riq matnini ko'rsatadi.
5. JWT JS'ga ko'rinmaydi (faqat httpOnly cookie). localStorage'da token yo'q.
6. Widget va Mini App oqimlari o'zgarmaydi. `npm run test` va `lint` o'tadi.

## 3. Oqim (uchma-uch)

```text
/login (asl tab)
  │  "Telegram bot orqali kirish" bosildi
  │  → t.me/<bot>?start=login ochiladi (yangi tab/ilova)
  │  → asl tab: yo'l-yo'riq matni (poll YO'Q)
  ▼
Telegram bot:  /start login
  │  processTelegramUpdate (server ichida, polling)
  │  → upsertUserFromTelegram(from)              // telegram_id, username, ism
  │  → createBotLoginToken(user.id)  (TTL 10 daqiqa, bir martalik)
  │  → sendTelegramMessage: [🔓 Saytga kirish] url=<appUrl>/auth/callback?token=TOKEN
  ▼
Brauzer:  GET /auth/callback?token=TOKEN   (Vue sahifa — token YEMIRILMAYDI)
  │  onMounted → POST /api/auth/bot-callback { token }
  ▼
Server:  POST /api/auth/bot-callback
  │  → format guard → consumeBotLoginToken(token)  // o'qiydi VA o'chiradi
  │  → DB'dan user → setSessionCookie (httpOnly JWT, 7 kun)
  │  → { user, hasSubscription, subscription } qaytaradi   // me.get.ts shakli
  ▼
Brauzer:  store'ni to'ldiradi (setUserSession + activateSubscription) → / (bosh sahifa)
```

**Eslatma (xavfsizlik):** token faqat **POST**da yemiriladi. `/auth/callback` GET sahifasini ochish (yoki link-skaner/preview) tokenni iste'mol qilmaydi — shu sabab page+POST tanlandi, GET-redirect server route emas.

## 4. Komponentlar

### Yangi fayllar

- **`server/utils/bot-login-token.ts`** — bir martalik token helper:
  - `createBotLoginToken(userId: number): Promise<string>` — 32 baytli tasodifiy token (base64url), `useStorage('cache')`ga `{ userId, exp }` yozadi, `{ ttl: 600 }`. Token qaytaradi.
  - `consumeBotLoginToken(token: string): Promise<number | null>` — `getItem` + `removeItem` (bir martalik); `exp` o'tgan bo'lsa `null`. `userId` yoki `null`.
  - `isValidBotLoginToken(token: string): boolean` — `^[A-Za-z0-9_-]{32,128}$`.
  - Kalit: `bot-login:${token}`.
- **`server/api/auth/bot-callback.post.ts`** — `telegram.post.ts` namunasi (HMAC o'rniga token):
  - `readBody<{ token }>`; format guard → 400.
  - `consumeBotLoginToken` → `null` bo'lsa `401` (eskirgan/yaroqsiz).
  - DB'dan user (id bo'yicha); yo'q bo'lsa `401`.
  - `setSessionCookie(event, userToJwtPayload(user))` (httpOnly, 7 kun).
  - Subscription tekshiruvi (me.get.ts mantig'i) → `{ user, hasSubscription, subscription }` qaytaradi.
  - `cx-user`/`cx-sub`ni **server o'rnatmaydi** (widget oqimidagidek — store o'rnatadi).
- **`app/pages/auth/callback.vue`** — callback sahifasi:
  - `onMounted`: `route.query.token`ni oladi; yo'q bo'lsa `/login?error=invalid`.
  - `POST /api/auth/bot-callback { token }`.
  - Muvaffaqiyat: `authStore.setUserSession({ id: telegramId, ... , hash: 'session' })` + `activateSubscription`/`clearSubscription` (login() dagi mapping), so'ng `navigateTo('/')`.
  - Xato (401): `/login?error=expired`.
  - Almashtirish paytida "Kirilmoqda..." holati (Tailwind, o'zbekcha).

### O'zgartiriladigan fayllar

- **`server/utils/process-telegram-update.ts`** — `/start login` tarmog'i:
  - `payload === 'login'` bo'lsa: `upsertUserFromTelegram(from)` → `createBotLoginToken(user.id)` → URL-tugmali xabar (`{ text: '🔓 Saytga kirish', url: \`${appUrl}/auth/callback?token=${token}\` }`).
  - Boshqa payload → hozirgidek e'tiborsiz; bo'sh `/start` → hozirgi welcome **o'zgarmaydi**.
- **`app/pages/login.vue`** — tugma + yo'l-yo'riq:
  - Widget ostida "yoki" ajratgich + `<a :href="botDeepLink" target="_blank">` "Telegram bot orqali kirish" tugmasi. `botDeepLink = https://t.me/${telegramBotUsername}?start=login`.
  - Bosilganda `botInitiated = true` → yo'l-yo'riq matni: "Botga o'tdingiz. Bot yuborgan 'Saytga kirish' tugmasini bosing." **Poll yo'q.**
  - Mavjud widget/mini-app mantig'i va dizayn tokenlari saqlanadi (Tailwind-only).
- **`server/utils/session-cookie.ts`** — `MAX_AGE` `2 kun` → `7 kun`.
- **`server/utils/jwt.ts`** — `setExpirationTime('2d')` → `'7d'`. (Sessiya umri = cookie maxAge **va** JWT exp ikkisi 7 kun.)

## 5. Sessiya va xavfsizlik

- **httpOnly JWT** (`chayroom_session`) — mavjud mexanizm; JWT JS'ga ko'rinmaydi. localStorage'da hech narsa saqlanmaydi.
- **Bir martalik token** — iste'molda o'chiriladi; TTL 10 daqiqa (Redis `ttl`); `exp` qo'shimcha tekshiriladi (TTL'siz drayverlar uchun zaxira). 32 baytli tasodifiy → taxmin qilib bo'lmaydi.
- **Trust chegarasi:** bot server ichida ishlaydi (`telegram-polling.ts` → `processTelegramUpdate`), shuning uchun bot→backend ichki HTTP (`POST /auth/telegram`) **yo'q** — token to'g'ridan-to'g'ri yaratiladi. Brauzer→server sakrash bir martalik token bilan himoyalangan.
- **7 kunlik sessiya** umumiy `setSessionCookie`/`signJwt`da — widget va mini-app oqimlariga **ham** tegishli (atayin, barchasi bir xil bo'lsin).

## 6. Account-switch

Callback yangi `setSessionCookie` chaqiradi → eski sessiya **almashtiriladi**. Boshqa akkaunt havolasi ochilsa, o'sha akkauntga o'tiladi. Atayin almashtirish uchun `/profile`dagi "Chiqish" (mavjud).

## 7. Edge-case

- **Token eskirgan/ishlatilgan:** `consume` → `null` → `401` → `/login?error=expired` (sahifa xabar ko'rsatadi).
- **Yaroqsiz format:** `400` → `/login?error=invalid`.
- **Asl tab:** poll qilmaydi; foydalanuvchi callback tabda kiradi. Asl tab "yo'l-yo'riq" holatida qoladi (zararsiz).
- **Bot tokeni yo'q (dev):** handler hozirgidek no-op.
- **Link-preview/skaner:** GET sahifa tokenni yemirmaydi (faqat POST). Inline tugma URL'lari Telegram'da preview qilinmaydi.

## 8. Testlar

- `server/utils/bot-login-token` — `isValidBotLoginToken` (sof); `create`→`consume` roundtrip; ikkinchi `consume` `null`; `exp` o'tgan → `null` (storage bilan).
- Integratsiya `POST /api/auth/bot-callback` — yaroqli token → `200` + `Set-Cookie: chayroom_session` + to'g'ri payload; yaroqsiz/eskirgan → `401`.
- `processTelegramUpdate` — `/start login` → upsert + URL-tugmali xabar (mock `sendTelegramMessage`); bo'sh `/start` → welcome o'zgarmaganini tekshirish.
- Yakun: `npm run test` + `lint` yashil.

## 9. Ko'lamdan tashqari / qaror qilingan defaultlar

- `language_code` saqlanmaydi (auth uchun kerak emas).
- Alohida bot servisi / `POST /auth/telegram` (bot→backend) — yo'q (bot in-process).
- Widget/Mini App olib tashlanmaydi — uchchala usul birga ishlaydi.
- `webhook.post.ts` o'lik kodiga tegilmaydi (polling startda webhook'ni o'chiradi).
- Redirect: `/` (chayroom.uz bosh sahifa, foydalanuvchi so'roviga ko'ra). Widget/Mini App esa `/dashboard`da qoladi. Bot login `plan`/`redirect` query'sini saqlamaydi (alohida tabda yakunlanadi).
- "Boshqa akkaunt" tugmasi yo'q (logout-to-switch yetarli).

## 10. Xavf va e'tibor

- **7 kunlik sessiya** barcha usullarga ta'sir qiladi — bu atayin (izchillik).
- **Surgical (CLAUDE.md §3):** faqat bot-login bilan bog'liq yangi kod + sessiya umri o'zgaradi; `telegram.post.ts`/`telegram-webapp.post.ts` mantig'iga tegilmaydi.
- **Til (CLAUDE.md §6):** barcha yangi UI matni o'zbekcha ("Telegram bot orqali kirish", "Saytga kirish", "Kirilmoqda...").
