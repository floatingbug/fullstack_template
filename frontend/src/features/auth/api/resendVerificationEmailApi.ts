import { apiFetch } from '@/shared/api/apiFetch'
import type { MessageResponse } from '@/shared/api/types'

export function resendVerificationEmailApi(email: string): Promise<MessageResponse> {
  return apiFetch<MessageResponse>('/auth/verify-email/resend', {
    method: 'POST',
    body: { email },
    auth: false,
    retryOnUnauthorized: false,
  })
}
