import { answerTelegramCallbackQuery, sendTelegramMessage } from '../../utils/telegram'
import { buildMiniAppLoginUrl } from '../../utils/telegram-bot.js'
import {
  BOT_LOGIN_SUCCESS_MESSAGE,
  buildAuthenticatedBotLoginEntry,
  botLoginKey,
  BOT_LOGIN_TTL_MS,
  type BotLoginEntry
} from '../../utils/bot-login'

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
  callback_query?: {
    id: string
    data?: string
    from?: TgFrom
    message?: {
      chat?: { id: number }
    }
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
  const callbackQuery = update?.callback_query
  const text = message?.text?.trim()
  const from = message?.from
  const chatId = message?.chat?.id ?? from?.id
  const botToken = config.telegramBotToken

  if (callbackQuery?.id && botToken) {
    await answerTelegramCallbackQuery(botToken, callbackQuery.id, {
      text: 'Kirish allaqachon tasdiqlangan. Saytga qayting.',
      show_alert: false
    })
    return { ok: true }
  }

  if (!text || !from || !chatId || !text.startsWith('/start')) {
    return { ok: true }
  }

  const payload = text.slice('/start'.length).trim()

  // Bot-login deep link: /start login_<token>
  if (payload.startsWith('auth_')) {
    const token = payload.slice('auth_'.length)
    const storage = useStorage('cache')
    const key = botLoginKey(token)
    const entry = await storage.getItem<BotLoginEntry>(key)

    if (!entry) {
      console.warn('[bot-login] entry not found for token', token)
    } else if (entry.status !== 'pending') {
      console.warn('[bot-login] entry already used, status:', entry.status)
    } else if (entry.exp <= Date.now()) {
      console.warn('[bot-login] entry expired')
    } else if (!botToken) {
      console.error('[bot-login] botToken not configured')
    }

    if (entry && entry.status === 'pending' && entry.exp > Date.now() && botToken) {
      await storage.setItem(key, buildAuthenticatedBotLoginEntry({
        id: from.id,
        first_name: from.first_name || 'Foydalanuvchi',
        last_name: from.last_name,
        username: from.username
      }, entry.exp), { ttl: Math.ceil(BOT_LOGIN_TTL_MS / 1000) })
      const appUrl = config.public.appUrl || 'https://chayroom.uz'
      await sendTelegramMessage(botToken, chatId, BOT_LOGIN_SUCCESS_MESSAGE, {
        reply_markup: {
          inline_keyboard: [[{ text: '🌐 Chayroom.uz ga qaytish', url: `${appUrl}/auth/bot-callback?token=${token}` }]]
        }
      })
    } else if (botToken) {
      await sendTelegramMessage(botToken, chatId, '⚠️ Kirish havolasi eskirgan. Saytda qaytadan urinib ko\'ring.')
    }
    return { ok: true }
  }

  // Unknown payload (e.g. Telegram OAuth sends /start telegramauth_xxx) — ignore silently
  if (payload) {
    return { ok: true }
  }

  // Plain /start (no payload) — greet with the platform button
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
