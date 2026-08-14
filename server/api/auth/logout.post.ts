import { clearFrancisUserSession } from '../../utils/session'

export default defineEventHandler(async (event) => {
  await clearFrancisUserSession(event)
  return { ok: true }
})
