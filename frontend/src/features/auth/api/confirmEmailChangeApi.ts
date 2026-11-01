import { apiFetch } from '@/shared/api/apiFetch'
import type { ConfirmEmailChangeResponse } from '@/shared/api/types'

export function confirmEmailChangeApi(token: string): Promise<ConfirmEmailChangeResponse> {
  return apiFetch<ConfirmEmailChangeResponse>(`/account/confirm-email?token=${encodeURIComponent(token)}`, {
    auth: false,
    retryOnUnauthorized: false,
  })
}
