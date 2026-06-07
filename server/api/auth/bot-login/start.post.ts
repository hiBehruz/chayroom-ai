import { randomBytes } from 'node:crypto'
import type { BotLoginEntry } from '../../../utils/bot-login'
import { botLoginKey, BOT_LOGIN_TTL_MS } from '../../../utils/bot-login'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const botUsername = config.public.telegramBotUsername
  if (!botUsername) {
    throw createError({ statusCode: 500, statusMessage: 'Bot username not configured' })
  }

  const token = randomBytes(24).toString('base64url')
  const entry: BotLoginEntry = { status: 'pending', exp: Date.now() + BOT_LOGIN_TTL_MS }

  const storage = useStorage('cache')
  await storage.setItem(botLoginKey(token), entry, { ttl: Math.ceil(BOT_LOGIN_TTL_MS / 1000) })

  const botId = config.telegramBotToken ? config.telegramBotToken.split(':')[0] : ''

  return {
    token,
    botId,
    url: `https://t.me/${botUsername}?start=auth_${token}`
  }
})
