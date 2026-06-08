import test from 'node:test'
import assert from 'node:assert/strict'

import { shouldSyncServerSession, shouldSyncServerSessionForRoute } from './auth-session.mjs'

test('shouldSyncServerSession syncs when the session user is missing despite a stale subscription cookie', () => {
  assert.equal(shouldSyncServerSession(null, true), true)
})

test('shouldSyncServerSession skips sync only when user and subscription are already restored', () => {
  assert.equal(shouldSyncServerSession({ id: 42 }, true), false)
  assert.equal(shouldSyncServerSession({ id: 42 }, false), true)
})

test('shouldSyncServerSessionForRoute skips mini app and login route, but syncs public web routes when needed', () => {
  assert.equal(shouldSyncServerSessionForRoute({ isMiniApp: true, routePath: '/', user: null, hasSubscription: false }), false)
  assert.equal(shouldSyncServerSessionForRoute({ isMiniApp: false, routePath: '/login', user: null, hasSubscription: false }), false)
  assert.equal(shouldSyncServerSessionForRoute({ isMiniApp: false, routePath: '/', user: null, hasSubscription: false }), true)
  assert.equal(shouldSyncServerSessionForRoute({ isMiniApp: false, routePath: '/', user: { id: 42 }, hasSubscription: true }), false)
})
