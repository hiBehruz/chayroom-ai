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
    return res.ok
  } catch {
    return false
  }
}
