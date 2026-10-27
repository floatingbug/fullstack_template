import { baseUrl } from './baseUrl.js'
import { clearAccessToken, getAccessToken, refreshAccessToken } from './authSession.js'

/**
 * Zentrale Fetch-Hilfe für alle API-Aufrufe.
 *
 * Hängt automatisch den Access-Token an und erneuert ihn bei `401` einmal
 * über das Refresh-Cookie.
 *
 * @param {string} path Pfad ohne Basis-URL, z. B. `/users/me`
 * @param {object} [options]
 * @param {string} [options.method] HTTP-Methode, Default `GET`
 * @param {unknown} [options.body] Wird als JSON gesendet
 * @param {Record<string, string>} [options.headers] Zusätzliche Header
 * @param {boolean} [options.auth] Access-Token anhängen, Default `true`
 * @param {boolean} [options.retryOnUnauthorized] Bei `401` Refresh + Retry, Default `true`
 * @returns {Promise<unknown>} Geparster JSON-Body oder `null` bei leerer Antwort
 */
export async function apiFetch(
  path,
  { method = 'GET', body, headers = {}, auth = true, retryOnUnauthorized = true, ...rest } = {},
) {
  const hasBody = body !== undefined
  const serializedBody = hasBody ? JSON.stringify(body) : undefined

  async function execute() {
    const token = auth ? getAccessToken() : null

    const response = await fetch(`${baseUrl}${path}`, {
      method,
      credentials: 'include',
      headers: {
        ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body: serializedBody,
      ...rest,
    })

    const isJson = response.headers.get('content-type')?.includes('application/json')
    const data = isJson ? await response.json() : null

    return { response, data }
  }

  let { response, data } = await execute()

  if (response.status === 401 && auth && retryOnUnauthorized) {
    const refreshedToken = await refreshAccessToken()

    if (refreshedToken) {
      ;({ response, data } = await execute())
    } else {
      clearAccessToken()
    }
  }

  if (!response.ok) {
    const error = new Error(data?.message ?? `Request failed with status ${response.status}`)
    error.status = response.status
    error.data = data
    throw error
  }

  return data
}
