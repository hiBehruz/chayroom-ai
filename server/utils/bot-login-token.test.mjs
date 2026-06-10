import { test } from 'vitest'
import assert from 'node:assert/strict'

import { isValidBotLoginToken } from './bot-login-token.ts'

test('isValidBotLoginToken accepts base64url tokens of allowed length', () => {
  assert.equal(isValidBotLoginToken('a'.repeat(43)), true)
  assert.equal(isValidBotLoginToken('A1_-b'.padEnd(32, 'x')), true)
  assert.equal(isValidBotLoginToken('a'.repeat(128)), true)
})

test('isValidBotLoginToken rejects short, long, or malformed tokens', () => {
  assert.equal(isValidBotLoginToken(''), false)
  assert.equal(isValidBotLoginToken('short'), false)
  assert.equal(isValidBotLoginToken('a'.repeat(31)), false)
  assert.equal(isValidBotLoginToken('a'.repeat(129)), false)
  assert.equal(isValidBotLoginToken('has spaces'), false)
  assert.equal(isValidBotLoginToken('has!@#chars'.padEnd(40, 'x')), false)
})
