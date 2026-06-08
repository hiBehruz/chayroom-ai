export function resolvePostLoginTarget(selectedPlan, redirectPath) {
  if (redirectPath) {
    if (redirectPath === '/dashboard' && selectedPlan) {
      return { path: '/dashboard', query: { plan: selectedPlan } }
    }

    return { path: redirectPath }
  }

  return { path: '/profile' }
}

export function buildBotLoginStartRequest(requestId = Date.now()) {
  return {
    url: '/api/auth/telegram/start',
    options: {
      method: /** @type {const} */ ('POST'),
      cache: /** @type {RequestCache} */ ('no-store'),
      headers: {
        'cache-control': 'no-store',
        'pragma': 'no-cache'
      },
      query: { _: String(requestId) }
    }
  }
}

const BOT_LOGIN_TOKEN_KEY = 'bot_login_token'

export function isSafariUserAgent(userAgent) {
  const ua = String(userAgent || '')
  return /Safari\//.test(ua) && !/Chrome\/|CriOS\/|FxiOS\/|EdgiOS\//.test(ua)
}

export function resolveBotLoginLaunchUrl({ url }) {
  return url
}

export function storePendingBotLoginToken({ sessionStorage, localStorage }, token) {
  if (!token) return

  sessionStorage?.setItem(BOT_LOGIN_TOKEN_KEY, token)
  localStorage?.setItem(BOT_LOGIN_TOKEN_KEY, token)
}

export function readPendingBotLoginToken({ sessionStorage, localStorage }) {
  return sessionStorage?.getItem(BOT_LOGIN_TOKEN_KEY) || localStorage?.getItem(BOT_LOGIN_TOKEN_KEY) || null
}

export function resolvePendingBotLoginToken({ queryToken, sessionStorage, localStorage }) {
  return queryToken || readPendingBotLoginToken({ sessionStorage, localStorage })
}

export function clearPendingBotLoginToken({ sessionStorage, localStorage }) {
  sessionStorage?.removeItem(BOT_LOGIN_TOKEN_KEY)
  localStorage?.removeItem(BOT_LOGIN_TOKEN_KEY)
}
