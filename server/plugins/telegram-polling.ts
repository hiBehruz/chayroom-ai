import { processTelegramUpdate, type TgUpdate } from '#server/utils/process-telegram-update'

export default defineNitroPlugin(() => {
  const config = useRuntimeConfig()
  const botToken = config.telegramBotToken as string | undefined
  if (!botToken) return

  void runPolling(botToken)
})

async function runPolling(botToken: string) {
  // Delete any existing webhook so getUpdates works
  await fetch(`https://api.telegram.org/bot${botToken}/deleteWebhook?drop_pending_updates=true`)
    .catch(() => {})

  let offset = 0

  while (true) {
    try {
      const url = `https://api.telegram.org/bot${botToken}/getUpdates?offset=${offset}&timeout=25&allowed_updates=["message","callback_query"]`
      const res = await fetch(url)
      if (!res.ok) {
        await sleep(5000)
        continue
      }
      const data = await res.json() as { ok: boolean, result: TgUpdate[] }
      if (!data.ok) {
        await sleep(5000)
        continue
      }
      for (const update of data.result) {
        try {
          await processTelegramUpdate(update)
        } catch (e) {
          console.error('[telegram-polling] error processing update:', e)
        }
        offset = update.update_id + 1
      }
    } catch (e) {
      console.error('[telegram-polling] fetch error:', e)
      await sleep(5000)
    }
  }
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
