import { getFrancisUserSession } from '../../utils/session'

export default defineEventHandler(async (event) => {
  const session = await getFrancisUserSession(event)
  return { user: session.user || null }
})
