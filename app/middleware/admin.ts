export default defineNuxtRouteMiddleware(async () => {
  const session = useUserSession()

  if (!session.loggedIn.value) {
    await session.fetch()
  }

  if (!session.loggedIn.value) {
    return navigateTo('/login')
  }

  if (session.user.value?.role !== 'admin') {
    return navigateTo('/dashboard')
  }
})
