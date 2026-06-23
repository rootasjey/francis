function bytesToHex(bytes: Uint8Array): string {
  let hex = ''
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, '0')
  }
  return hex
}

export function generateApiKey(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32))
  return `fcs_${bytesToHex(bytes)}`
}

export async function hashKey(raw: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(raw)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return bytesToHex(new Uint8Array(hash))
}

export function keyPrefix(raw: string): string {
  return raw.slice(0, 7)
}

export function normalizeKey(raw?: string | null): string | null {
  if (!raw) return null
  const trimmed = raw.trim()
  if (!trimmed) return null

  if (trimmed.toLowerCase().startsWith('bearer ')) {
    return trimmed.slice(7).trim()
  }

  return trimmed
}
