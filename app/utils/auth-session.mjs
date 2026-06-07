export function shouldSyncServerSession(user, hasSubscription) {
  return !user || !hasSubscription
}
