import { test } from 'vitest'
import assert from 'node:assert/strict'

import { buildMiniAppLoginUrl, buildPlatformMenuButton } from './telegram-bot.js'

test('buildMiniAppLoginUrl points Telegram users through mini-app login bootstrap', () => {
  assert.equal(
    buildMiniAppLoginUrl('https://chayroom.uz'),
    'https://chayroom.uz/login?redirect=%2Fdashboard'
  )
})

test('buildPlatformMenuButton creates a Telegram web_app menu button', () => {
  assert.deepEqual(buildPlatformMenuButton('https://chayroom.uz'), {
    type: 'web_app',
    text: 'Platforma',
    web_app: {
      url: 'https://chayroom.uz/login?redirect=%2Fdashboard'
    }
  })
})
