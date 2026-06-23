import { onMounted } from 'vue'

const STORAGE_KEY = 'francis_admin_token'

export function useAdminToken() {
  const token = useState<string>('admin-token', () => '')
  const loaded = useState<boolean>('admin-token-loaded', () => false)

  onMounted(() => {
    if (loaded.value) return
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) token.value = stored
    loaded.value = true
  })

  function setToken(value: string) {
    token.value = value
    localStorage.setItem(STORAGE_KEY, value)
  }

  return { token, setToken }
}
