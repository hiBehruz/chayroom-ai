import { processTelegramUpdate, type TgUpdate } from '#server/utils/process-telegram-update'

export default defineNitroPlugin(() => {
  // Never poll in dev: a local `pnpm dev` would compete with production for the
  // same bot's getUpdates, stealing login updates and minting tokens the prod
  // process can't see. Only the deployed prod server polls.
  if (import.meta.dev) {
    console.log('[telegram-polling] Skipped in dev mode')
    return
  }

  const config = useRuntimeConfig()
  const botToken = config.telegramBotToken as string | undefined

  console.log('[telegram-polling] Plugin loaded, botToken exists:', !!botToken)

  if (!botToken) {
    console.log('[telegram-polling] No bot token found, polling disabled')
    return
  }

  console.log('[telegram-polling] Starting polling...')
  void runPolling(botToken)
})

async function runPolling(botToken: string) {
  console.log('[telegram-polling] Deleting webhook...')

  // Delete any existing webhook so getUpdates works
  await fetch(`https://api.telegram.org/bot${botToken}/deleteWebhook?drop_pending_updates=true`)
    .catch(() => {})

  console.log('[telegram-polling] Starting getUpdates loop...')
  let offset = 0

  while (true) {
    try {
      const url = `https://api.telegram.org/bot${botToken}/getUpdates?offset=${offset}&timeout=25&allowed_updates=["message","callback_query"]`
      const res = await fetch(url)
      if (!res.ok) {
        console.log('[telegram-polling] getUpdates failed with status:', res.status)
        await sleep(5000)
        continue
      }
      const data = await res.json() as { ok: boolean, result: TgUpdate[] }
      if (!data.ok) {
        console.log('[telegram-polling] getUpdates returned ok=false')
        await sleep(5000)
        continue
      }

      if (data.result.length > 0) {
        console.log('[telegram-polling] Received', data.result.length, 'update(s)')
      }

      for (const update of data.result) {
        try {
          console.log('[telegram-polling] Processing update:', update.update_id)
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
