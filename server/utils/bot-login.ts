export interface BotLoginUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  photo_url?: string
}

export interface BotLoginEntry {
  status: 'pending' | 'authenticated'
  user?: BotLoginUser
}

export const BOT_LOGIN_SUCCESS_MESSAGE
  = '✅ Kirish muvaffaqiyatli amalga oshirildi!\n\nChayroom.uz saytiga qayting va foydalanishda davom eting. 🚀'

export function buildBotLoginSuccessMessage(): { text: string, options: Record<string, unknown> } {
  return {
    text: BOT_LOGIN_SUCCESS_MESSAGE,
    options: {}
  }
}

export function buildPendingBotLoginPage(token: string): string {
  const statusUrl = `/api/auth/bot-login/status?token=${encodeURIComponent(token)}`

  return `<!doctype html>
<html lang="uz">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Kirish tasdiqlanmoqda</title>
    <style>
      body { margin: 0; font-family: Arial, sans-serif; background: #fffdf9; color: #14161f; }
      main { min-height: 100vh; display: grid; place-items: center; padding: 24px; }
      .card { width: min(420px, 100%); background: #f7f5ef; border-radius: 24px; padding: 28px; text-align: center; }
      .title { font-size: 24px; font-weight: 800; margin: 0 0 12px; }
      .text { font-size: 15px; line-height: 1.6; color: #6f7480; margin: 0; }
    </style>
  </head>
  <body>
    <main>
      <section class="card">
        <h1 class="title">Kirish tasdiqlanmoqda</h1>
        <p class="text">Bir necha soniya kuting. Tasdiq kelishi bilan profilingiz avtomatik ochiladi.</p>
      </section>
    </main>
    <script>
      const statusUrl = ${JSON.stringify(statusUrl)};
      const poll = async () => {
        try {
          const res = await fetch(statusUrl, { credentials: 'include', cache: 'no-store' });
          const data = await res.json();
          if (data.status === 'authenticated') {
            window.location.replace('/profile');
            return;
          }
          if (data.status === 'expired') {
            window.location.replace('/login?error=expired');
            return;
          }
        } catch {}
        window.setTimeout(poll, 1500);
      };
      poll();
    </script>
  </body>
</html>`
}

export function buildAuthenticatedBotLoginEntry(
  user: Pick<BotLoginUser, 'id' | 'first_name'> & Partial<Pick<BotLoginUser, 'last_name' | 'username' | 'photo_url'>>
): BotLoginEntry {
  return {
    status: 'authenticated',
    user: {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      username: user.username,
      photo_url: user.photo_url
    }
  }
}

export function canCompleteBotLogin(entry: BotLoginEntry | null, telegramUserId: number): boolean {
  if (!entry) return false
  if (entry.status === 'pending') return true
  return entry.user?.id === telegramUserId
}

export function isValidBotLoginToken(token: string): boolean {
  return /^[A-Za-z0-9_-]{24,128}$/.test(token)
}

export function getBotLoginRedirectTarget(): string {
  return '/profile'
}

export function botLoginKey(token: string) {
  return `botlogin:${token}`
}

export function buildBotLoginConfirmData(token: string) {
  return `confirm_login_${token}`
}

export function parseBotLoginConfirmData(data: string) {
  const prefix = 'confirm_login_'
  if (!data.startsWith(prefix)) return null
  const token = data.slice(prefix.length)
  return token || null
}
