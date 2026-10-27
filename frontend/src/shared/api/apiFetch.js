const baseUrl = (import.meta.env.VITE_API_URL ?? 'http://localhost:3000').replace(/\/+$/, '')

/**
 * Zentrale Fetch-Hilfe für alle API-Aufrufe.
 *
 * @param {string} path Pfad ohne Basis-URL, z. B. `/users/me`
 * @param {object} [options]
 * @param {string} [options.method] HTTP-Methode, Default `GET`
 * @param {unknown} [options.body] Wird als JSON gesendet
 * @param {Record<string, string>} [options.headers] Zusätzliche Header (z. B. Authorization)
 * @returns {Promise<unknown>} Geparster JSON-Body oder `null` bei leerer Antwort
 */
export async function apiFetch(path, { method = 'GET', body, headers = {}, ...rest } = {}) {
  const hasBody = body !== undefined

  const response = await fetch(`${baseUrl}${path}`, {
    method,
    credentials: 'include',
    headers: {
      ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
    body: hasBody ? JSON.stringify(body) : undefined,
    ...rest,
  })

  const isJson = response.headers.get('content-type')?.includes('application/json')
  const data = isJson ? await response.json() : null

  if (!response.ok) {
    const error = new Error(data?.message ?? `Request failed with status ${response.status}`)
    error.status = response.status
    error.data = data
    throw error
  }

  return data
}
