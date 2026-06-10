export function resolvePostLoginTarget(selectedPlan, redirectPath) {
  if (redirectPath) {
    if (redirectPath === '/dashboard' && selectedPlan) {
      return { path: '/dashboard', query: { plan: selectedPlan } }
    }

    return { path: redirectPath }
  }

  return { path: '/dashboard' }
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

/**
 * Decide what the login page should do on mount.
 * Order matters: a fresh Telegram auth payload in the URL must win over an
 * existing session so users can switch accounts (otherwise the old cookie
 * short-circuits to a redirect and the new id&hash is ignored).
 *
 * @param {{ isMiniApp: boolean, hasAuthPayload: boolean, hasSession: boolean }} input
 * @returns {'mini-app' | 'process-auth' | 'redirect' | 'show-widget'}
 */
export function resolveLoginMountAction({ isMiniApp, hasAuthPayload, hasSession }) {
  if (isMiniApp) return 'mini-app'
  if (hasAuthPayload) return 'process-auth'
  if (hasSession) return 'redirect'
  return 'show-widget'
}
