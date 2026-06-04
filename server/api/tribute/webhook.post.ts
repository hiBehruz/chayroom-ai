import { eq } from 'drizzle-orm'
import { db } from '../../db'
import { users, subscriptions } from '../../db/schema'
import { verifyTributeSignature } from '../../utils/tribute-signature'

interface TributePayload {
  subscription_id: number
  period: string
  telegram_user_id: number
  expires_at: string
}

interface TributeEvent {
  name: 'new_subscription' | 'renewed_subscription' | 'cancelled_subscription'
  payload: TributePayload
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const apiKey = config.tributeApiKey

  if (!apiKey) {
    throw createError({ statusCode: 500, statusMessage: 'Tribute API key not configured' })
  }

  const rawBody = await readRawBody(event, 'utf-8')
  if (!rawBody) {
    throw createError({ statusCode: 400, statusMessage: 'Empty body' })
  }

  const signature = getHeader(event, 'trbt-signature') ?? ''
  if (!verifyTributeSignature(rawBody, signature, apiKey)) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid signature' })
  }

  const body = JSON.parse(rawBody) as TributeEvent
  const { name, payload } = body

  if (!payload?.telegram_user_id || !payload?.subscription_id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing required payload fields' })
  }

  const telegramId = String(payload.telegram_user_id)
  const [user] = await db.select().from(users).where(eq(users.telegramId, telegramId)).limit(1)

  if (!user) {
    console.warn('[tribute] webhook for unknown telegram_user_id', payload.telegram_user_id)
    return { ok: true, matched: false }
  }

  const expiresAt = new Date(payload.expires_at)

  if (name === 'new_subscription') {
    const [existing] = await db.select().from(subscriptions)
      .where(eq(subscriptions.tributeSubscriptionId, payload.subscription_id))
      .limit(1)

    if (existing) {
      await db.update(subscriptions).set({
        status: 'ACTIVE',
        expiresAt,
        period: payload.period,
        cancelledAt: null,
        updatedAt: new Date()
      }).where(eq(subscriptions.id, existing.id))
    } else {
      await db.insert(subscriptions).values({
        userId: user.id,
        status: 'ACTIVE',
        expiresAt,
        tributeSubscriptionId: payload.subscription_id,
        period: payload.period
      })
    }
  } else if (name === 'renewed_subscription') {
    await db.update(subscriptions).set({
      status: 'ACTIVE',
      expiresAt,
      cancelledAt: null,
      updatedAt: new Date()
    }).where(eq(subscriptions.tributeSubscriptionId, payload.subscription_id))
  } else if (name === 'cancelled_subscription') {
    await db.update(subscriptions).set({
      cancelledAt: new Date(),
      updatedAt: new Date()
    }).where(eq(subscriptions.tributeSubscriptionId, payload.subscription_id))
  }

  return { ok: true }
})
