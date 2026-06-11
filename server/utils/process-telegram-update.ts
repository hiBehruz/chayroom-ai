import { sendTelegramMessage } from './telegram'
import { buildMiniAppLoginUrl } from './telegram-bot.js'
import { authenticateBotLoginToken } from './bot-login-token'

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

  if (payload.startsWith('auth_')) {
    if (!botToken) return
    const token = payload.slice('auth_'.length)
    const ok = await authenticateBotLoginToken(token, {
      id: from.id,
      first_name: from.first_name || 'Foydalanuvchi',
      last_name: from.last_name,
      username: from.username
    })
    await sendTelegramMessage(botToken, chatId, ok
      ? '✅ Tasdiqlandi! Saytga qayting — bir necha soniyada avtomatik kirasiz. 🚀'
      : '⚠️ Havola eskirgan. Saytga qaytib qaytadan urinib ko\'ring.')
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
