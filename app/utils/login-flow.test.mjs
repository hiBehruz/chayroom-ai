import { test } from 'vitest'
import assert from 'node:assert/strict'

import { resolveLoginMountAction, resolvePostLoginTarget } from './login-flow.mjs'

test('resolvePostLoginTarget sends users to dashboard by default', () => {
  assert.deepEqual(resolvePostLoginTarget('', ''), { path: '/dashboard' })
})

test('resolvePostLoginTarget preserves redirect query when provided', () => {
  assert.equal(resolvePostLoginTarget('', '/materials').path, '/materials')
})

test('resolvePostLoginTarget keeps selected plan only for dashboard redirects', () => {
  assert.deepEqual(resolvePostLoginTarget('pro', ''), { path: '/dashboard' })
  assert.deepEqual(resolvePostLoginTarget('pro', '/dashboard'), { path: '/dashboard', query: { plan: 'pro' } })
})

test('resolveLoginMountAction prefers mini-app above everything', () => {
  assert.equal(
    resolveLoginMountAction({ isMiniApp: true, hasAuthPayload: true, hasSession: true }),
    'mini-app'
  )
})

test('resolveLoginMountAction processes a fresh auth payload before an existing session', () => {
  assert.equal(
    resolveLoginMountAction({ isMiniApp: false, hasAuthPayload: true, hasSession: true }),
    'process-auth'
  )
})

test('resolveLoginMountAction redirects when only a session exists', () => {
  assert.equal(
    resolveLoginMountAction({ isMiniApp: false, hasAuthPayload: false, hasSession: true }),
    'redirect'
  )
})

test('resolveLoginMountAction shows the widget when nothing is present', () => {
  assert.equal(
    resolveLoginMountAction({ isMiniApp: false, hasAuthPayload: false, hasSession: false }),
    'show-widget'
  )
})
