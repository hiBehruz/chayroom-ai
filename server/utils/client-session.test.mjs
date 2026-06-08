import test from 'node:test'
import assert from 'node:assert/strict'

import { buildClientSessionUser, clientCookieOptions } from './client-session.ts'

test('buildClientSessionUser maps database user to cx-user cookie payload', () => {
  assert.deepEqual(
    buildClientSessionUser({
      id: 7,
      telegramId: '42',
      firstName: 'Ali',
      lastName: 'Valiyev',
      username: 'ali',
      photoUrl: 'https://example.com/a.png',
      role: 'ADMIN'
    }),
    {
      id: 42,
      telegramId: 42,
      first_name: 'Ali',
      last_name: 'Valiyev',
      username: 'ali',
      photo_url: 'https://example.com/a.png',
      role: 'ADMIN',
      hash: 'session'
    }
  )
})

test('clientCookieOptions matches the browser auth cookie lifetime', () => {
  assert.deepEqual(clientCookieOptions(), {
    maxAge: 30 * 24 * 60 * 60,
    sameSite: 'lax',
    path: '/'
  })
})
