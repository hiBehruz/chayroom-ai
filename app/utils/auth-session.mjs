export function shouldSyncServerSession(user, hasSubscription) {
  return !user || !hasSubscription
}

export function shouldSyncServerSessionForRoute({ isMiniApp, routePath, user, hasSubscription }) {
  if (isMiniApp) return false
  if (routePath === '/login') return false
  return shouldSyncServerSession(user, hasSubscription)
}
