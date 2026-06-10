import { sendTelegramMessage } from './telegram'
import { buildMiniAppLoginUrl } from './telegram-bot.js'
import { upsertUserFromTelegram } from './upsertUserFromTelegram'
import { createBotLoginToken } from './bot-login-token'

interface TgFrom {
  id: number
  first_name?: string
  last_name?: string
  username?: string
}

export interface TgUpdate {
  update_id: number
  message?: {
    text?: string
    chat?: { id: number }
    from?: TgFrom
  }
  callback_query?: {
    id: string
    data?: string
    from?: TgFrom
    message?: { chat?: { id: number } }
  }
}

export async function processTelegramUpdate(update: TgUpdate): Promise<void> {
  const config = useRuntimeConfig()
  const message = update.message
  const text = message?.text?.trim()
  const from = message?.from
  const chatId = message?.chat?.id ?? from?.id
  const botToken = config.telegramBotToken as string | undefined

  if (!text || !from || !chatId || !text.startsWith('/start')) return

  const payload = text.slice('/start'.length).trim()

  if (payload === 'login') {
    if (!botToken) return
    const appUrl = (config.public as Record<string, string>).appUrl || 'https://chayroom.uz'
    const dbUser = await upsertUserFromTelegram({
      id: from.id,
      first_name: from.first_name || 'Foydalanuvchi',
      last_name: from.last_name,
      username: from.username
    })
    const token = await createBotLoginToken(dbUser.id)
    await sendTelegramMessage(botToken, chatId, '✅ Tasdiqlandi! Saytga kirish uchun quyidagi tugmani bosing:', {
      reply_markup: {
        inline_keyboard: [[{ text: '🔓 Saytga kirish', url: `${appUrl}/auth/callback?token=${token}` }]]
      }
    })
    return
  }

  if (payload) return

  if (botToken) {
    const appUrl = (config.public as Record<string, string>).appUrl || 'https://chayroom.uz'
    await sendTelegramMessage(botToken, chatId, 'Salom! 👋 Chayroom AI Club platformasini oching:', {
      reply_markup: {
        inline_keyboard: [[{ text: '🚀 Platformani ochish', web_app: { url: buildMiniAppLoginUrl(appUrl) } }]]
      }
    })
  }
}
