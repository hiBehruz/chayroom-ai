export function resolvePostLoginTarget(selectedPlan, redirectPath) {
  if (redirectPath) {
    if (redirectPath === '/dashboard' && selectedPlan) {
      return { path: '/dashboard', query: { plan: selectedPlan } }
    }

    return { path: redirectPath }
  }

  return { path: '/profile' }
}

const BOT_LOGIN_TOKEN_KEY = 'bot_login_token'

export function isSafariUserAgent(userAgent) {
  const ua = String(userAgent || '')
  return /Safari\//.test(ua) && !/Chrome\/|CriOS\/|FxiOS\/|EdgiOS\//.test(ua)
}

export function resolveBotLoginLaunchUrl({ url, tgUrl, userAgent }) {
  if (!tgUrl) return url

  return isSafariUserAgent(userAgent) ? url : tgUrl
}

export function storePendingBotLoginToken({ sessionStorage, localStorage }, token) {
  if (!token) return

  sessionStorage?.setItem(BOT_LOGIN_TOKEN_KEY, token)
  localStorage?.setItem(BOT_LOGIN_TOKEN_KEY, token)
}

export function readPendingBotLoginToken({ sessionStorage, localStorage }) {
  const token = sessionStorage?.getItem(BOT_LOGIN_TOKEN_KEY) || localStorage?.getItem(BOT_LOGIN_TOKEN_KEY) || null

  if (token) {
    sessionStorage?.removeItem(BOT_LOGIN_TOKEN_KEY)
    localStorage?.removeItem(BOT_LOGIN_TOKEN_KEY)
  }

  return token
}
