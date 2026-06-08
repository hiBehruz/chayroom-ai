import { test } from 'vitest'
import assert from 'node:assert/strict'
import { createHmac } from 'node:crypto'

import { verifyTributeSignature } from './tribute-signature.ts'

const SECRET = 'test-api-key'
const body = JSON.stringify({ name: 'new_subscription', payload: { subscription_id: 1 } })
const validSig = createHmac('sha256', SECRET).update(body).digest('hex')

test('verifyTributeSignature accepts valid signature', () => {
  assert.equal(verifyTributeSignature(body, validSig, SECRET), true)
})

test('verifyTributeSignature rejects tampered body', () => {
  const tampered = body + 'x'
  assert.equal(verifyTributeSignature(tampered, validSig, SECRET), false)
})

test('verifyTributeSignature rejects missing signature', () => {
  assert.equal(verifyTributeSignature(body, '', SECRET), false)
})

test('verifyTributeSignature rejects wrong-length signature', () => {
  assert.equal(verifyTributeSignature(body, 'deadbeef', SECRET), false)
})
