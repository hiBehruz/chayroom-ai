import { answerTelegramCallbackQuery, sendTelegramMessage } from './telegram'
import { buildMiniAppLoginUrl } from './telegram-bot.js'
import {
  buildBotLoginSuccessMessage,
  buildAuthenticatedBotLoginEntry,
  botLoginKey,
  canCompleteBotLogin,
  isValidBotLoginToken,
  type BotLoginEntry
} from './bot-login'

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
  const callbackQuery = update.callback_query
  const text = message?.text?.trim()
  const from = message?.from
  const chatId = message?.chat?.id ?? from?.id
  const botToken = config.telegramBotToken as string | undefined

  if (callbackQuery?.id && botToken) {
    await answerTelegramCallbackQuery(botToken, callbackQuery.id, {
      text: 'Kirish allaqachon tasdiqlangan. Saytga qayting.',
      show_alert: false
    })
    return
  }

  if (!text || !from || !chatId || !text.startsWith('/start')) return

  const payload = text.slice('/start'.length).trim()

  if (payload.startsWith('auth_')) {
    const token = payload.slice('auth_'.length)
    if (!isValidBotLoginToken(token)) return

    const storage = useStorage('cache')
    const key = botLoginKey(token)
    console.log('[bot-login] /start received, key:', key)
    const entry = await storage.getItem<BotLoginEntry>(key)
    console.log('[bot-login] entry lookup result:', entry ? `status=${entry.status}` : 'NOT FOUND')

    if (entry?.status === 'authenticated') {
      console.warn('[bot-login] entry already used, status:', entry.status)
    } else if (!botToken) {
      console.error('[bot-login] botToken not configured')
    }

    if ((!entry || canCompleteBotLogin(entry, from.id)) && botToken) {
      await storage.setItem(
        key,
        buildAuthenticatedBotLoginEntry(
          { id: from.id, first_name: from.first_name || 'Foydalanuvchi', last_name: from.last_name, username: from.username }
        )
      )
      const { text: successText, options: successOptions } = buildBotLoginSuccessMessage()
      await sendTelegramMessage(botToken, chatId, successText, successOptions)
    } else if (botToken) {
      await sendTelegramMessage(botToken, chatId, '⚠️ Kirish havolasi eskirgan. Saytda qaytadan urinib ko\'ring.')
    }
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
