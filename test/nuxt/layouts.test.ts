import { describe, expect, it, beforeEach } from 'vitest'
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'

const mockColorMode = {
  preference: 'light',
}

mockNuxtImport('useColorMode', () => () => mockColorMode)

const mockSession = {
  loggedIn: { value: false },
  user: { value: null },
}

mockNuxtImport('useUserSession', () => () => mockSession)

beforeEach(() => {
  mockSession.loggedIn.value = false
  mockColorMode.preference = 'light'
})

async function mountLayout() {
  const mod = await import('../../app/layouts/default')
  return mountSuspended(mod.default)
}

describe('default layout', () => {
  it('should render the logo and title', async () => {
    const layout = await mountLayout()
    expect(layout.text()).toContain('Francis')
  })

  it('should show Sign in when not logged in', async () => {
    const layout = await mountLayout()
    expect(layout.text()).toContain('Sign in')
  })

  it('should show Console when logged in', async () => {
    mockSession.loggedIn.value = true
    const layout = await mountLayout()
    expect(layout.text()).toContain('Console')
  })

  it('should render footer text', async () => {
    const layout = await mountLayout()
    expect(layout.text()).toContain('Status')
    expect(layout.text()).toContain('francis.verbatims.cc')
  })

  it('should render navigation items', async () => {
    const layout = await mountLayout()
    expect(layout.text()).toContain('Features')
    expect(layout.text()).toContain('Documentation')
    expect(layout.text()).toContain('Pricing')
    expect(layout.text()).toContain('Purpose')
    expect(layout.text()).toContain('About')
  })
})
