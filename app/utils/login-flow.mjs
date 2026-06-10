export function resolvePostLoginTarget(selectedPlan, redirectPath) {
  if (redirectPath) {
    if (redirectPath === '/dashboard' && selectedPlan) {
      return { path: '/dashboard', query: { plan: selectedPlan } }
    }

    return { path: redirectPath }
  }

  return { path: '/dashboard' }
}

/**
 * Decide what the login page should do on mount.
 * Order matters: a fresh Telegram auth payload in the URL must win over an
 * existing session so users can switch accounts (otherwise the old cookie
 * short-circuits to a redirect and the new id&hash is ignored).
 *
 * @param {{ isMiniApp: boolean, hasAuthPayload: boolean, hasSession: boolean }} input
 * @returns {'mini-app' | 'process-auth' | 'redirect' | 'show-widget'}
 */
export function resolveLoginMountAction({ isMiniApp, hasAuthPayload, hasSession }) {
  if (isMiniApp) return 'mini-app'
  if (hasAuthPayload) return 'process-auth'
  if (hasSession) return 'redirect'
  return 'show-widget'
}
