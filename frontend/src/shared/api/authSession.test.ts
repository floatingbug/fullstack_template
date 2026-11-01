import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const fetchMock = vi.fn() as any

async function loadSession(): Promise<typeof import('./authSession')> {
  return import('./authSession')
}

describe('authSession', () => {
  beforeEach(() => {
    vi.resetModules()
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('hält den Access-Token nur im Speicher', async () => {
    const { getAccessToken, setAccessToken, clearAccessToken } = await loadSession()

    expect(getAccessToken()).toBeNull()

    setAccessToken('token-1')
    expect(getAccessToken()).toBe('token-1')

    setAccessToken('')
    expect(getAccessToken()).toBeNull()

    setAccessToken('token-2')
    clearAccessToken()
    expect(getAccessToken()).toBeNull()
  })

  it('erneuert den Token über das Refresh-Cookie', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ accessToken: 'token-1' }),
    })

    const { getAccessToken, refreshAccessToken } = await loadSession()

    await expect(refreshAccessToken()).resolves.toBe('token-1')
    expect(getAccessToken()).toBe('token-1')
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/auth/refresh'),
      expect.objectContaining({ method: 'POST', credentials: 'include' }),
    )
  })

  it('verwirft den Token bei einer Fehlerantwort', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    })

    const { getAccessToken, setAccessToken, refreshAccessToken } = await loadSession()

    setAccessToken('old-token')

    await expect(refreshAccessToken()).resolves.toBeNull()
    expect(getAccessToken()).toBeNull()
  })

  it('gibt bei Netzwerkfehlern null zurück', async () => {
    fetchMock.mockRejectedValueOnce(new Error('offline'))

    const { setAccessToken, getAccessToken, refreshAccessToken } = await loadSession()

    setAccessToken('old-token')

    await expect(refreshAccessToken()).resolves.toBeNull()
    expect(getAccessToken()).toBeNull()
  })

  it('teilt parallele Refreshes', async () => {
    let resolveFetch!: (value: any) => void

    fetchMock.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveFetch = resolve
      }),
    )

    const { refreshAccessToken } = await loadSession()

    const first = refreshAccessToken()
    const second = refreshAccessToken()

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(first).toBe(second)

    resolveFetch({
      ok: true,
      json: async () => ({ accessToken: 'token-1' }),
    })

    await expect(first).resolves.toBe('token-1')
    await expect(second).resolves.toBe('token-1')
  })
})
