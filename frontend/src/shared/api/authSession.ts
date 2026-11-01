import { baseUrl } from './baseUrl'

let accessToken: string | null = null
let refreshPromise: Promise<string | null> | null = null

/**
 * Access-Token liegt nur im Speicher. Nach einem Reload wird er über das
 * HttpOnly-Refresh-Cookie neu angefordert.
 */
export function getAccessToken(): string | null {
  return accessToken
}

export function setAccessToken(token: unknown): void {
  accessToken = typeof token === 'string' && token ? token : null
}

export function clearAccessToken(): void {
  accessToken = null
}

interface RefreshResponse {
  accessToken?: unknown
}

async function requestAccessToken(): Promise<string | null> {
  try {
    const response = await fetch(`${baseUrl}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    })

    if (!response.ok) {
      accessToken = null
      return null
    }

    const data = (await response.json()) as RefreshResponse
    accessToken = typeof data?.accessToken === 'string' ? data.accessToken : null

    return accessToken
  } catch {
    accessToken = null
    return null
  }
}

/**
 * Erneuert den Access-Token über das Refresh-Cookie.
 * Parallele Aufrufe teilen sich einen Request. Gibt `null` zurück,
 * wenn keine gültige Session existiert.
 */
export function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = requestAccessToken().finally(() => {
      refreshPromise = null
    })
  }

  return refreshPromise
}
