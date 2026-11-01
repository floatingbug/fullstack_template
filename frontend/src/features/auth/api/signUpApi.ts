import { apiFetch } from '@/shared/api/apiFetch'
import type { MessageResponse } from '@/shared/api/types'

export function signUpApi({ name, email, password }: { name: string; email: string; password: string }): Promise<MessageResponse> {
  return apiFetch<MessageResponse>('/auth/sign-up', {
    method: 'POST',
    body: { name, email, password },
    auth: false,
    retryOnUnauthorized: false,
  })
}
