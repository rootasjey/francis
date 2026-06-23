import { createError, useSession } from 'h3'
import type { H3Event, SessionConfig } from 'h3'

type UserRole = 'user' | 'admin'

type SessionUser = {
  id: string
  email: string
  name?: string | null
  role: UserRole
}

type UserSession = {
  id?: string
  user?: SessionUser
  loggedInAt?: number
}

type UserSessionRequired = UserSession & { user: SessionUser }

function getSessionConfig(): SessionConfig {
  const runtimeConfig = useRuntimeConfig()
  const config = runtimeConfig.session as SessionConfig | undefined

  if (!config?.password) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Missing session password',
    })
  }

  return config
}

export async function getUserSession(event: H3Event): Promise<UserSession> {
  const session = await useSession<UserSession>(event, getSessionConfig())
  return {
    id: session.id || '',
    ...session.data,
  } as UserSession
}

export async function setUserSession(event: H3Event, data: Omit<UserSession, 'id'>): Promise<UserSession> {
  const session = await useSession<UserSession>(event, getSessionConfig())
  await session.update(data)
  return {
    id: session.id || '',
    ...session.data,
    ...data,
  } as UserSession
}

export async function clearUserSession(event: H3Event): Promise<boolean> {
  const session = await useSession<UserSession>(event, getSessionConfig())
  await session.clear()
  return true
}

export async function requireSessionUser(event: H3Event, opts?: { statusCode?: number; message?: string }): Promise<UserSessionRequired> {
  const session = await getUserSession(event)

  if (!session.user) {
    throw createError({
      statusCode: opts?.statusCode ?? 401,
      statusMessage: opts?.message ?? 'Unauthorized',
    })
  }

  return session as UserSessionRequired
}
