import { createPendingBotLoginToken } from '#server/utils/bot-login-token'

export default defineEventHandler(async () => {
  const config = useRuntimeConfig()
  const botUsername = config.public.telegramBotUsername
  if (!botUsername) {
    throw createError({ statusCode: 500, statusMessage: 'bot username not configured' })
  }

  const token = await createPendingBotLoginToken()
  return {
    token,
    url: `https://t.me/${botUsername}?start=auth_${token}`
  }
})
