import test from 'node:test'
import assert from 'node:assert/strict'

import { shouldSyncServerSession } from './auth-session.mjs'

test('shouldSyncServerSession syncs when the session user is missing despite a stale subscription cookie', () => {
  assert.equal(shouldSyncServerSession(null, true), true)
})

test('shouldSyncServerSession skips sync only when user and subscription are already restored', () => {
  assert.equal(shouldSyncServerSession({ id: 42 }, true), false)
  assert.equal(shouldSyncServerSession({ id: 42 }, false), true)
})
