import { apiFetch } from '@/shared/api/apiFetch'
import type { User } from '@/shared/api/types'

export function getMeApi(): Promise<User> {
  return apiFetch<User>('/users/me')
}
