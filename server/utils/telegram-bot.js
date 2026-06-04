export function buildMiniAppLoginUrl(appUrl, redirectPath = '/dashboard') {
  const url = new URL('/login', appUrl)
  url.searchParams.set('redirect', redirectPath)
  return url.toString()
}

export function buildPlatformMenuButton(appUrl) {
  return {
    type: 'web_app',
    text: 'Platforma',
    web_app: {
      url: buildMiniAppLoginUrl(appUrl)
    }
  }
}

export async function setTelegramChatMenuButton(botToken, menuButton, chatId) {
  try {
    const body = chatId
      ? { chat_id: chatId, menu_button: menuButton }
      : { menu_button: menuButton }

    const res = await fetch(`https://api.telegram.org/bot${botToken}/setChatMenuButton`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })

    return res.ok
  } catch {
    return false
  }
}
