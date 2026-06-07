import { processTelegramUpdate, type TgUpdate } from '../../utils/process-telegram-update'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)

  const secret = getHeader(event, 'x-telegram-bot-api-secret-token')
  if (!config.telegramWebhookSecret || secret !== config.telegramWebhookSecret) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid webhook secret' })
  }

  const update = await readBody<TgUpdate>(event)
  await processTelegramUpdate(update)
  return { ok: true }
})
