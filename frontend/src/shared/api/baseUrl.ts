const configuredBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

/**
 * Basis-URL des Backends ohne abschließenden Slash.
 * Pfade in `apiFetch` beginnen immer mit `/`.
 */
export const baseUrl = configuredBaseUrl.replace(/\/+$/, '')
