import test from 'node:test'
import assert from 'node:assert/strict'

import { resolvePostLoginTarget } from './login-flow.mjs'

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
