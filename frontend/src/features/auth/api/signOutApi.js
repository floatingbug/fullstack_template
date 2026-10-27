import { apiFetch } from '@/shared/api/apiFetch.js'

export function signOutApi() {
  return apiFetch('/auth/sign-out', { method: 'POST' })
}
