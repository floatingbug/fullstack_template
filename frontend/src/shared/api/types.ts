/**
 * Übergangsweise handgeschriebene API-Typen.
 * Werden später durch die generierten Typen aus `gen:api` ersetzt.
 */

export interface User {
  id: string
  name: string
  email: string
}

export interface SignInResponse {
  accessToken: string
  user: User
}

export interface MessageResponse {
  message: string
}

export interface ConfirmEmailChangeResponse {
  success: boolean
  newEmail: string | null
  message: string
}
