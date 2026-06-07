import test from 'node:test'
import assert from 'node:assert/strict'

import {
  clearPendingBotLoginToken,
  isSafariUserAgent,
  readPendingBotLoginToken,
  resolveBotLoginLaunchUrl,
  resolvePostLoginTarget,
  storePendingBotLoginToken
} from './login-flow.mjs'

test('resolvePostLoginTarget sends users to profile by default', () => {
  assert.deepEqual(resolvePostLoginTarget('', ''), { path: '/profile' })
})

test('resolvePostLoginTarget preserves redirect query when provided', () => {
  assert.equal(resolvePostLoginTarget('', '/materials').path, '/materials')
})

test('resolvePostLoginTarget keeps selected plan only for dashboard redirects', () => {
  assert.deepEqual(resolvePostLoginTarget('pro', ''), { path: '/profile' })
  assert.deepEqual(resolvePostLoginTarget('pro', '/dashboard'), { path: '/dashboard', query: { plan: 'pro' } })
})

test('resolveBotLoginLaunchUrl sends Safari directly to Telegram with the fresh token', () => {
  assert.equal(
    resolveBotLoginLaunchUrl({
      url: 'https://t.me/chayroomai_bot?start=auth_abc',
      tgUrl: 'tg://resolve?domain=chayroomai_bot&start=auth_abc',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1'
    }),
    'tg://resolve?domain=chayroomai_bot&start=auth_abc'
  )
})

test('isSafariUserAgent detects mobile Safari only', () => {
  assert.equal(
    isSafariUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1'),
    true
  )
  assert.equal(
    isSafariUserAgent('Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36'),
    false
  )
})

test('resolveBotLoginLaunchUrl keeps tg links outside Safari', () => {
  assert.equal(
    resolveBotLoginLaunchUrl({
      url: 'https://t.me/chayroomai_bot?start=auth_abc',
      tgUrl: 'tg://resolve?domain=chayroomai_bot&start=auth_abc',
      userAgent: 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36'
    }),
    'tg://resolve?domain=chayroomai_bot&start=auth_abc'
  )
})

test('pending bot login token survives session storage loss and repeated reads', () => {
  const sessionStorage = createStorage()
  const localStorage = createStorage()

  storePendingBotLoginToken({ sessionStorage, localStorage }, 'token-123')
  sessionStorage.clear()

  assert.equal(readPendingBotLoginToken({ sessionStorage, localStorage }), 'token-123')
  assert.equal(readPendingBotLoginToken({ sessionStorage, localStorage }), 'token-123')
})

test('pending bot login token is removed only after login finishes', () => {
  const sessionStorage = createStorage()
  const localStorage = createStorage()

  storePendingBotLoginToken({ sessionStorage, localStorage }, 'token-123')
  clearPendingBotLoginToken({ sessionStorage, localStorage })

  assert.equal(sessionStorage.getItem('bot_login_token'), null)
  assert.equal(localStorage.getItem('bot_login_token'), null)
})

function createStorage() {
  const data = new Map()

  return {
    getItem(key) {
      return data.has(key) ? data.get(key) : null
    },
    setItem(key, value) {
      data.set(key, String(value))
    },
    removeItem(key) {
      data.delete(key)
    },
    clear() {
      data.clear()
    }
  }
}
