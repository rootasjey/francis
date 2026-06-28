import { getConfigMap } from '~~/server/utils/config'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  return await getConfigMap(event)
})
