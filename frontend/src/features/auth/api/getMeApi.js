import { apiFetch } from '@/shared/api/apiFetch.js'

export function getMeApi() {
  return apiFetch('/users/me')
}
