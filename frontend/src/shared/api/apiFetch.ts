import { baseUrl } from './baseUrl'
import { clearAccessToken, getAccessToken, refreshAccessToken } from './authSession'

export interface ApiFetchOptions extends Omit<RequestInit, 'body' | 'headers' | 'method'> {
  /** HTTP-Methode, Default `GET` */
  method?: string
  /** Wird als JSON gesendet */
  body?: unknown
  /** Zusätzliche Header */
  headers?: Record<string, string>
  /** Access-Token anhängen, Default `true` */
  auth?: boolean
  /** Bei `401` Refresh + Retry, Default `true` */
  retryOnUnauthorized?: boolean
}

export class ApiError extends Error {
  readonly status: number
  readonly data: unknown

  constructor(message: string, status: number, data: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

interface ApiResult {
  response: Response
  data: any
}

/**
 * Zentrale Fetch-Hilfe für alle API-Aufrufe.
 *
 * Hängt automatisch den Access-Token an und erneuert ihn bei `401` einmal
 * über das Refresh-Cookie.
 */
export async function apiFetch<T = unknown>(
  path: string,
  {
    method = 'GET',
    body,
    headers = {},
    auth = true,
    retryOnUnauthorized = true,
    ...rest
  }: ApiFetchOptions = {},
): Promise<T> {
  const hasBody = body !== undefined
  const serializedBody = hasBody ? JSON.stringify(body) : undefined

  async function execute(): Promise<ApiResult> {
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
    throw new ApiError(
      data?.message ?? `Request failed with status ${response.status}`,
      response.status,
      data,
    )
  }

  return data as T
}
