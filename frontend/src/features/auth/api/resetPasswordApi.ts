import { apiFetch } from '@/shared/api/apiFetch'
import type { MessageResponse } from '@/shared/api/types'

export function resetPasswordApi({ token, password }: { token: string; password: string }): Promise<MessageResponse> {
  return apiFetch<MessageResponse>('/auth/reset-password', {
    method: 'POST',
    body: { token, password },
    auth: false,
    retryOnUnauthorized: false,
  })
}
