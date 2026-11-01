import { apiFetch } from '@/shared/api/apiFetch'

export function signOutApi(): Promise<null> {
  return apiFetch<null>('/auth/sign-out', { method: 'POST' })
}
