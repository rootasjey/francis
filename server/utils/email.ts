import type { H3Event } from 'h3'

type EmailPayload = {
  to: string
  subject: string
  html: string
  text: string
}

type EmailBinding = {
  send(payload: EmailPayload & { from: { email: string; name?: string } }): Promise<unknown>
}

function getEmailBinding(event: H3Event): EmailBinding | undefined {
  const env = event.context.cloudflare?.env as { EMAIL?: unknown } | undefined
  return env?.EMAIL as EmailBinding | undefined
}

function getFromAddress(): string {
  return useRuntimeConfig().emailFromAddress || 'Francis <francis@verbatims.cc>'
}

function getSiteUrl(): string {
  return useRuntimeConfig().public.siteUrl || 'https://francis.verbatims.cc'
}

function parseFromAddress(value: string): { email: string; name?: string } {
  const match = value.match(/^(.*?)\s*<([^>]+)>$/)
  if (match) return { name: match[1].trim(), email: match[2].trim() }
  return { email: value.trim() }
}

export async function sendEmail(event: H3Event, payload: EmailPayload): Promise<void> {
  const binding = getEmailBinding(event)
  if (!binding) {
    if (import.meta.dev) {
      console.log(`\n[DEV] Email to ${payload.to}\nFrom: ${getFromAddress()}\nSubject: ${payload.subject}\n${payload.text}\n`)
      return
    }
    throw createError({ statusCode: 500, statusMessage: 'Email service not configured' })
  }

  try {
    await binding.send({ from: parseFromAddress(getFromAddress()), ...payload })
  } catch (error) {
    console.error('Failed to send email:', error)
    throw createError({ statusCode: 500, statusMessage: 'Failed to send email' })
  }
}

export async function sendVerificationEmail(event: H3Event, to: string, token: string): Promise<void> {
  const url = `${getSiteUrl()}/verify-email?token=${encodeURIComponent(token)}`
  await sendEmail(event, {
    to,
    subject: 'Verify your Francis email',
    html: `<div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 16px"><h2>Verify your email address</h2><p>Welcome to Francis. Verify your email address to secure your account.</p><p><a href="${url}" style="display:inline-block;background:#111827;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none">Verify email</a></p><p style="color:#6b7280;font-size:14px">This link expires in 24 hours.</p></div>`,
    text: `Verify your Francis email:\n${url}\n\nThis link expires in 24 hours.`,
  })
}

export async function sendPasswordResetEmail(event: H3Event, to: string, token: string): Promise<void> {
  const url = `${getSiteUrl()}/reset-password?token=${encodeURIComponent(token)}`
  await sendEmail(event, {
    to,
    subject: 'Reset your Francis password',
    html: `<div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 16px"><h2>Reset your password</h2><p>We received a request to reset your Francis password.</p><p><a href="${url}" style="display:inline-block;background:#111827;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none">Reset password</a></p><p style="color:#6b7280;font-size:14px">This link expires in one hour. If you did not request this, you can ignore this email.</p></div>`,
    text: `Reset your Francis password:\n${url}\n\nThis link expires in one hour. If you did not request this, you can ignore this email.`,
  })
}
