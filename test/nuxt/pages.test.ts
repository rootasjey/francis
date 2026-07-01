import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'

describe('about page', () => {
  it('should render the about heading', async () => {
    const mod = await import('../../app/pages/about')
    const page = await mountSuspended(mod.default)
    expect(page.text()).toContain('About')
  })

  it('should render project links', async () => {
    const mod = await import('../../app/pages/about')
    const page = await mountSuspended(mod.default)
    expect(page.text()).toContain('Verbatims')
    expect(page.text()).toContain('Zima Blue')
    expect(page.text()).toContain('GitHub')
  })
})
