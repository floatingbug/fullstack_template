import { baseUrl } from './baseUrl.js'

let accessToken = null
let refreshPromise = null

/**
 * Access-Token liegt nur im Speicher. Nach einem Reload wird er über das
 * HttpOnly-Refresh-Cookie neu angefordert.
 */
export function getAccessToken() {
  return accessToken
}

export function setAccessToken(token) {
  accessToken = typeof token === 'string' && token ? token : null
}

export function clearAccessToken() {
  accessToken = null
}

async function requestAccessToken() {
  try {
    const response = await fetch(`${baseUrl}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    })

    if (!response.ok) {
      accessToken = null
      return null
    }

    const data = await response.json()
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
export function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = requestAccessToken().finally(() => {
      refreshPromise = null
    })
  }

  return refreshPromise
}
