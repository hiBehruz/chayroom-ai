import { useAdminSession } from '#server/utils/admin-session'

export default defineEventHandler(async (event) => {
  const session = await useAdminSession(event)
  await session.clear()
  return { ok: true }
})
