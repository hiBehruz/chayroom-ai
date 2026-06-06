import { sendTelegramMessage } from '../../utils/telegram'
import { buildMiniAppLoginUrl } from '../../utils/telegram-bot.js'
import { botLoginKey, BOT_LOGIN_TTL_MS, type BotLoginEntry } from '../../utils/bot-login'

interface TgFrom {
  id: number
  first_name?: string
  last_name?: string
  username?: string
}

interface TgUpdate {
  message?: {
    text?: string
    chat?: { id: number }
    from?: TgFrom
  }
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)

  // Only Telegram (which echoes our secret) may post here
  const secret = getHeader(event, 'x-telegram-bot-api-secret-token')
  if (!config.telegramWebhookSecret || secret !== config.telegramWebhookSecret) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid webhook secret' })
  }

  const update = await readBody<TgUpdate>(event)
  const message = update?.message
  const text = message?.text?.trim()
  const from = message?.from
  const chatId = message?.chat?.id ?? from?.id
  const botToken = config.telegramBotToken

  if (!text || !from || !chatId || !text.startsWith('/start')) {
    return { ok: true }
  }

  const payload = text.slice('/start'.length).trim()

  // Bot-login deep link: /start login_<token>
  if (payload.startsWith('login_')) {
    const token = payload.slice('login_'.length)
    const storage = useStorage('cache')
    const key = botLoginKey(token)
    const entry = await storage.getItem<BotLoginEntry>(key)

    if (entry && entry.status === 'pending' && entry.exp > Date.now()) {
      const authed: BotLoginEntry = {
        status: 'authenticated',
        exp: entry.exp,
        user: {
          id: from.id,
          first_name: from.first_name || 'Foydalanuvchi',
          last_name: from.last_name,
          username: from.username
        }
      }
      await storage.setItem(key, authed, { ttl: Math.ceil(BOT_LOGIN_TTL_MS / 1000) })
      if (botToken) {
        await sendTelegramMessage(botToken, chatId, '✅ Kirish tasdiqlandi! Brauzerga qaytishingiz mumkin.')
      }
    } else if (botToken) {
      await sendTelegramMessage(botToken, chatId, '⚠️ Kirish havolasi eskirgan. Saytda qaytadan urinib ko\'ring.')
    }
    return { ok: true }
  }

  // Plain /start — greet with the platform button
  if (botToken) {
    const appUrl = config.public.appUrl || 'https://chayroom.uz'
    await sendTelegramMessage(botToken, chatId, 'Salom! 👋 Chayroom AI Club platformasini oching:', {
      reply_markup: {
        inline_keyboard: [[{ text: '🚀 Platformani ochish', web_app: { url: buildMiniAppLoginUrl(appUrl) } }]]
      }
    })
  }

  return { ok: true }
})
