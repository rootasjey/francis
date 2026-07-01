import { describe, expect, it, beforeEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { defineComponent } from 'vue'

function createWrapper() {
  return defineComponent({
    setup() {
      const { token, setToken } = useAdminToken()
      return { token, setToken }
    },
    template: '<div/>',
  })
}

beforeEach(() => {
  localStorage.clear()
  const loaded = useState('admin-token-loaded')
  loaded.value = false
})

describe('useAdminToken', () => {
  it('should start with empty token', async () => {
    const wrapper = await mountSuspended(createWrapper())
    expect(wrapper.vm.token).toBe('')
  })

  it('should set token and persist to localStorage', async () => {
    const wrapper = await mountSuspended(createWrapper())
    wrapper.vm.setToken('test-token')
    expect(wrapper.vm.token).toBe('test-token')
    expect(localStorage.getItem('francis_admin_token')).toBe('test-token')
  })

  it('should load token from localStorage on mount', async () => {
    localStorage.setItem('francis_admin_token', 'stored-token')
    const wrapper = await mountSuspended(createWrapper())
    expect(wrapper.vm.token).toBe('stored-token')
  })

  it('should overwrite existing token with setToken', async () => {
    localStorage.setItem('francis_admin_token', 'old-token')
    const wrapper = await mountSuspended(createWrapper())
    wrapper.vm.setToken('new-token')
    expect(wrapper.vm.token).toBe('new-token')
    expect(localStorage.getItem('francis_admin_token')).toBe('new-token')
  })
})
