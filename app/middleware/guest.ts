export default defineNuxtRouteMiddleware(async () => {
  const session = useUserSession()

  if (!session.loggedIn.value) {
    await session.fetch()
  }

  if (session.loggedIn.value) {
    const role = session.user.value?.role
    return navigateTo(role === 'admin' ? '/admin' : '/dashboard')
  }
})
