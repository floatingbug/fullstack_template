import { apiFetch } from '@/shared/api/apiFetch.js'

export function signUpApi({ name, email, password }) {
  return apiFetch('/auth/sign-up', {
    method: 'POST',
    body: { name, email, password },
    auth: false,
    retryOnUnauthorized: false,
  })
}
