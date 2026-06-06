export async function sendTelegramMessage(
  botToken: string,
  chatId: string | number,
  text: string,
  options: Record<string, unknown> = {}
): Promise<boolean> {
  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML', ...options })
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      console.error('[telegram] sendMessage failed', { chatId, status: res.status, body })
    }
    return res.ok
  } catch (err) {
    console.error('[telegram] sendMessage error', { chatId, err })
    return false
  }
}

export async function answerTelegramCallbackQuery(
  botToken: string,
  callbackQueryId: string,
  options: Record<string, unknown> = {}
): Promise<boolean> {
  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ callback_query_id: callbackQueryId, ...options })
    })
    return res.ok
  } catch {
    return false
  }
}
