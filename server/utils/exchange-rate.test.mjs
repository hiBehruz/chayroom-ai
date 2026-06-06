import test from 'node:test'
import assert from 'node:assert/strict'

import { fetchUsdRate } from './exchange-rate.ts'

test('fetchUsdRate returns parsed USD rate from upstream payload', async () => {
  const rate = await fetchUsdRate(async () => ({
    ok: true,
    json: async () => [
      { Ccy: 'EUR', Rate: '14200.10' },
      { Ccy: 'USD', Rate: '12750.55' }
    ]
  }))

  assert.equal(rate, 12750.55)
})

test('fetchUsdRate returns null when upstream fetch fails', async () => {
  const rate = await fetchUsdRate(async () => {
    throw new Error('network down')
  })

  assert.equal(rate, null)
})

test('fetchUsdRate returns null for invalid upstream payload', async () => {
  const rate = await fetchUsdRate(async () => ({
    ok: true,
    json: async () => ({ nope: true })
  }))

  assert.equal(rate, null)
})
