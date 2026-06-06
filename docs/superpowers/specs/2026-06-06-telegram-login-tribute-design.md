# Telegram Login and Tribute Subscription Design

## Goal

`Kirish` bosilganda oraliq login sahifasini ko'rsatmasdan Telegram'ning rasmiy avtorizatsiya oynasini ochish. Muvaffaqiyatli login qilinganida xavfsiz sayt sessiyasi yaratish, bot orqali o'zbekcha tasdiq xabarini yuborish va foydalanuvchining Tribute obunasini profilida to'g'ri ko'rsatish.

## User Flow

1. Mehmon saytdagi `Kirish` tugmasini bosadi.
2. Sayt foydalanuvchini Telegram'ning rasmiy Web Login oynasiga yo'naltiradi.
3. Foydalanuvchi telefon raqamini kiritadi va Telegram ichida kirishni tasdiqlaydi.
4. Telegram foydalanuvchini `chayroom.uz` callback manziliga qaytaradi.
5. Server Telegram bergan avtorizatsiya ma'lumotlarini kriptografik tekshiradi.
6. Server foydalanuvchini Telegram ID bo'yicha yaratadi yoki yangilaydi va himoyalangan sessiya cookie'sini beradi.
7. Bot foydalanuvchiga quyidagi xabarni yuboradi:

   `✅ Siz chayroom.uz saytida muvaffaqiyatli avtorizatsiyadan o'tdingiz.`

   `Saytga qayting, kirish allaqachon bajarildi.`

8. Foydalanuvchi `/dashboard` sahifasiga yoki login boshlanishidan oldin so'ralgan ichki sahifaga qaytadi.
9. Profil serverdagi Tribute obuna holatini ko'rsatadi.

## Architecture

Telegram Login yangi OpenID Connect Authorization Code Flow va PKCE orqali ulanadi. Login boshlanishi server endpointida yaratiladi: server `state`, `nonce`, PKCE verifier va challenge hosil qilib, qisqa muddatli `httpOnly` cookie'larda kerakli ma'lumotlarni saqlaydi va Telegram authorization URL'iga redirect qiladi.

Callback endpoint `state` qiymatini tekshiradi, authorization code'ni Telegram token endpointida almashtiradi va qaytgan ID tokenni Telegram JWKS kalitlari bilan tekshiradi. Tekshiruvda imzo, `iss`, `aud`, `exp` va `nonce` majburiy bo'ladi. Faqat shundan keyin Telegram foydalanuvchi ma'lumotlari bazaga yoziladi.

Sayt sessiyasi foydalanuvchi boshqara oladigan JSON cookie o'rniga server imzolagan, `httpOnly`, `secure` va `sameSite=lax` cookie orqali yuritiladi. Mijoz `/api/auth/me` orqali foydalanuvchi va obuna holatini oladi.

## Login Entry Points

Navigatsiyadagi desktop, mobile va ochiladigan menyu `Kirish` tugmalari yangi `/api/auth/telegram/start` endpointiga o'tadi. Himoyalangan sahifaga kirishga urinish va kurs darsiga kirish ham shu oqimdan foydalanadi, bunda xavfsiz ichki `redirect` qiymati saqlanadi.

`redirect` faqat `/` bilan boshlanadigan lokal yo'l bo'lishi mumkin. Tashqi URL qabul qilinmaydi. Bu open redirect hujumini oldini oladi.

Mavjud `/login` sahifasi eski havolalar uchun compatibility route bo'lib qoladi va Telegram login start endpointiga redirect qiladi. Development rejimida mavjud dev login alohida, faqat development muhitida ishlaydi.

## Bot Message

Bot tasdiq xabarini har bir muvaffaqiyatli Telegram web loginidan keyin yuboradi. Xabar faqat Telegram login to'liq tekshirilgan va sayt sessiyasi yaratilganidan keyin jo'natiladi.

Bot foydalanuvchiga yozishi uchun login so'rovida `telegram:bot_access` permission so'raladi. Foydalanuvchi bu ruxsatni bermasa ham saytga login yakunlanadi; faqat bot xabari yuborilmasligi mumkin.

Bot xabari:

```text
✅ Siz chayroom.uz saytida muvaffaqiyatli avtorizatsiyadan o'tdingiz.
Saytga qayting, kirish allaqachon bajarildi.
```

## Tribute Subscription Matching

Tribute webhook Telegram ID'ni yagona bog'lovchi identifikator sifatida ishlatadi.

Hozirgi webhook noma'lum Telegram ID kelganda obunani tashlab yuboradi. Yangi oqimda webhook foydalanuvchi hali saytga kirmagan bo'lsa, minimal placeholder user yaratadi va obunani shu userga bog'laydi. Keyingi Telegram loginida ism, username va profil rasmi yangilanadi.

Obuna holatlari:

- `ACTIVE` va `expiresAt` kelajakda bo'lsa: profil `Faol`.
- Obuna topilmasa yoki muddati tugagan bo'lsa: profil `Obunasiz`.
- Tribute bekor qilish hodisasi kelib, to'langan muddat tugamagan bo'lsa: profil `Bekor qilingan`, lekin kirish muddati oxirigacha saqlanadi.
- Admin foydalanuvchi mavjud qoidaga ko'ra to'liq kirishga ega.

Webhook hodisalari idempotent bo'ladi. Bir xil Tribute subscription ID qayta kelsa yangi yozuv ochilmaydi, mavjud yozuv yangilanadi.

## Data Model

Placeholder user yaratish uchun `users.firstName` vaqtincha Telegram ID yoki neytral qiymat bilan to'ldiriladi; muvaffaqiyatli login uni haqiqiy Telegram profil ma'lumoti bilan almashtiradi. Yangi alohida pending-subscription jadvali kiritilmaydi, chunki mavjud `users.telegramId` unique ustuni Tribute va login ma'lumotlarini birlashtirish uchun yetarli.

Subscription lookup eng so'nggi `expiresAt` bo'yicha bajariladi. Login javobi va `/api/auth/me` bir xil server yordamchi funksiyasidan foydalanadi, shunda profil va kirish nazorati turlicha natija bermaydi.

## Error Handling

- Telegram sozlamalari yetishmasa foydalanuvchi o'zbekcha konfiguratsiya xatosi sahifasini ko'radi.
- Telegram avtorizatsiyasi rad etilsa yoki callback yaroqsiz bo'lsa sessiya yaratilmaydi va qayta urinish tugmasi ko'rsatiladi.
- Bot xabarini yuborish xatosi loginni bekor qilmaydi.
- Tribute webhook noto'g'ri imzo bilan kelsa `401` qaytaradi va hech qanday ma'lumot yozmaydi.
- Token almashish yoki JWKS tekshiruvi muvaffaqiyatsiz bo'lsa Telegram ma'lumoti bazaga yozilmaydi.

## Configuration

Production muhitida quyidagilar talab qilinadi:

- Telegram Web Login Client ID
- Telegram Web Login Client Secret
- Telegram bot token
- `https://chayroom.uz/api/auth/telegram/callback` Telegram BotFather Web Login allowed redirect URI
- `https://chayroom.uz` allowed origin
- Tribute API key va mavjud webhook URL

Secret qiymatlar faqat private runtime config'da saqlanadi. Client secret va bot token mijoz bundle'iga chiqmaydi.

## Testing

Unit testlar quyidagilarni qoplaydi:

- login start URL PKCE, state, nonce va kerakli scope'larni yaratadi;
- callback noto'g'ri state, issuer, audience, expiry, nonce yoki signature'ni rad etadi;
- faqat lokal redirect yo'llari qabul qilinadi;
- Tribute noma'lum Telegram ID uchun user va subscription yaratadi;
- takroriy webhook mavjud subscription'ni yangilaydi;
- bekor qilingan, ammo muddati tugamagan obuna kirishni saqlaydi;
- muddati tugagan yoki mavjud bo'lmagan obuna `Obunasiz` bo'ladi;
- bot tasdiq matni aynan tasdiqlangan o'zbekcha matnga teng.

Integratsion tekshiruv productionga yaqin HTTPS domenida Telegram oynasini ochish, telefon orqali tasdiqlash, callback, bot xabari va profil obuna holatini qo'lda tekshirishni o'z ichiga oladi.

## Out of Scope

- Sayt ichida o'z telefon raqami va SMS kod formasini yaratish.
- Telegram mobil yoki desktop ilovasining login interfeysini nusxalash.
- Tribute orqali to'lov sahifalarini qayta loyihalash.
- Botdagi boshqa komandalar va mavjud platforma menyusini o'zgartirish.
