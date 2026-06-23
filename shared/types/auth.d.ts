declare module '#auth-utils' {
  interface User {
    id: string
    email: string
    name?: string | null
    role: 'user' | 'admin'
  }

  interface UserSession {
    loggedInAt: number
  }
}

export {}
