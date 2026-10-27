import { apiFetch } from '@/shared/api/apiFetch.js'

export function signInApi({ nameOrEmail, password }) {
  return apiFetch('/auth/sign-in', {
    method: 'POST',
    body: { nameOrEmail, password },
    auth: false,
    retryOnUnauthorized: false,
  })
}
