import { apiFetch } from '@/shared/api/apiFetch'
import type { MessageResponse } from '@/shared/api/types'

export function verifyEmailApi(token: string): Promise<MessageResponse> {
  return apiFetch<MessageResponse>(`/auth/verify-email?token=${encodeURIComponent(token)}`, {
    auth: false,
    retryOnUnauthorized: false,
  })
}
