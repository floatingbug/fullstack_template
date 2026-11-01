import { apiFetch } from '@/shared/api/apiFetch'
import type { SignInResponse } from '@/shared/api/types'

export function signInApi({ nameOrEmail, password }: { nameOrEmail: string; password: string }): Promise<SignInResponse> {
  return apiFetch<SignInResponse>('/auth/sign-in', {
    method: 'POST',
    body: { nameOrEmail, password },
    auth: false,
    retryOnUnauthorized: false,
  })
}
