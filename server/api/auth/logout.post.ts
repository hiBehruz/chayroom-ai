import { useUserSession } from '../../utils/user-session'

export default defineEventHandler(async (event) => {
  const session = await useUserSession(event)
  await session.clear()
  return { ok: true }
})
