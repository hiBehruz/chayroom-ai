import { randomBytes } from 'node:crypto'
import type { BotLoginEntry } from '#server/utils/bot-login'
import { botLoginKey } from '#server/utils/bot-login'

export default defineEventHandler(async (event) => {
  setResponseHeaders(event, {
    'cache-control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'pragma': 'no-cache',
    'expires': '0'
  })

  const config = useRuntimeConfig(event)
  const botUsername = config.public.telegramBotUsername
  if (!botUsername) {
    throw createError({ statusCode: 500, statusMessage: 'Bot username not configured' })
  }

  const token = randomBytes(24).toString('base64url')
  const entry: BotLoginEntry = { status: 'pending' }

  const storage = useStorage('cache')
  await storage.setItem(botLoginKey(token), entry)

  const botId = config.telegramBotToken ? config.telegramBotToken.split(':')[0] : ''

  return {
    token,
    botId,
    url: `https://t.me/${botUsername}?start=auth_${token}`,
    tgUrl: `tg://resolve?domain=${botUsername}&start=auth_${token}`
  }
})
