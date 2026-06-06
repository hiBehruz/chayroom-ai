import { getSubscriptionState } from '../../utils/user-session'

export default defineEventHandler(async (event) => {
  const { user, hasSubscription, subscription } = await getSubscriptionState(event)

  if (!user) {
    return { user: null, hasSubscription: false, subscription: null }
  }

  return {
    user: {
      id: user.id,
      telegramId: Number(user.telegramId),
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      photoUrl: user.photoUrl,
      role: user.role
    },
    hasSubscription,
    subscription: subscription
      ? {
          period: subscription.period,
          expiresAt: subscription.expiresAt.toISOString(),
          cancelledAt: subscription.cancelledAt ? subscription.cancelledAt.toISOString() : null
        }
      : null
  }
})
