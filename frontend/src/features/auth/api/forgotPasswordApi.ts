import { apiFetch } from '@/shared/api/apiFetch'
import type { MessageResponse } from '@/shared/api/types'

export function forgotPasswordApi(email: string): Promise<MessageResponse> {
  return apiFetch<MessageResponse>('/auth/forgot-password', {
    method: 'POST',
    body: { email },
    auth: false,
    retryOnUnauthorized: false,
  })
}
