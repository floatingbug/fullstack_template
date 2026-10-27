import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

async function loadSession() {
  return import('./authSession.js')
}

describe('authSession', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.stubGlobal('fetch', vi.fn())
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
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ accessToken: 'token-1' }),
    })

    const { getAccessToken, refreshAccessToken } = await loadSession()

    await expect(refreshAccessToken()).resolves.toBe('token-1')
    expect(getAccessToken()).toBe('token-1')
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/auth/refresh'),
      expect.objectContaining({ method: 'POST', credentials: 'include' }),
    )
  })

  it('verwirft den Token bei einer Fehlerantwort', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    })

    const { getAccessToken, setAccessToken, refreshAccessToken } = await loadSession()

    setAccessToken('old-token')

    await expect(refreshAccessToken()).resolves.toBeNull()
    expect(getAccessToken()).toBeNull()
  })

  it('gibt bei Netzwerkfehlern null zurück', async () => {
    fetch.mockRejectedValueOnce(new Error('offline'))

    const { setAccessToken, getAccessToken, refreshAccessToken } = await loadSession()

    setAccessToken('old-token')

    await expect(refreshAccessToken()).resolves.toBeNull()
    expect(getAccessToken()).toBeNull()
  })

  it('teilt parallele Refreshes', async () => {
    let resolveFetch

    fetch.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveFetch = resolve
      }),
    )

    const { refreshAccessToken } = await loadSession()

    const first = refreshAccessToken()
    const second = refreshAccessToken()

    expect(fetch).toHaveBeenCalledTimes(1)
    expect(first).toBe(second)

    resolveFetch({
      ok: true,
      json: async () => ({ accessToken: 'token-1' }),
    })

    await expect(first).resolves.toBe('token-1')
    await expect(second).resolves.toBe('token-1')
  })
})
