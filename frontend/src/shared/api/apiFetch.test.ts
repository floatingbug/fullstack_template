import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('./authSession', () => ({
  getAccessToken: vi.fn(),
  refreshAccessToken: vi.fn(),
  clearAccessToken: vi.fn(),
}))

import { apiFetch } from './apiFetch'
import { baseUrl } from './baseUrl'
import * as authSession from './authSession'

const { clearAccessToken, getAccessToken, refreshAccessToken } = vi.mocked(authSession)
const fetchMock = vi.fn() as any

function jsonResponse(status: number, body?: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: {
      get: () => (body === undefined ? null : 'application/json'),
    },
    json: vi.fn(async () => body),
  } as unknown as Response
}

describe('apiFetch', () => {
  beforeEach(() => {
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
    getAccessToken.mockReset()
    getAccessToken.mockReturnValue(null)
    refreshAccessToken.mockReset()
    refreshAccessToken.mockResolvedValue(null)
    clearAccessToken.mockReset()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('hängt den Access-Token an und liefert JSON', async () => {
    getAccessToken.mockReturnValue('token-1')
    fetchMock.mockResolvedValueOnce(jsonResponse(200, { id: '1' }))

    const data = await apiFetch('/users/me')

    expect(data).toEqual({ id: '1' })
    expect(fetchMock).toHaveBeenCalledTimes(1)

    const [url, options] = fetchMock.mock.calls[0]

    expect(url).toBe(`${baseUrl}/users/me`)
    expect(options.method).toBe('GET')
    expect(options.credentials).toBe('include')
    expect(options.headers.Authorization).toBe('Bearer token-1')
    expect(options.body).toBeUndefined()
  })

  it('sendet einen JSON-Body ohne Token bei auth: false', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(200, { ok: true }))

    await apiFetch('/auth/sign-in', {
      method: 'POST',
      body: { nameOrEmail: 'test', password: 'secret' },
      auth: false,
    })

    const [, options] = fetchMock.mock.calls[0]

    expect(options.headers['Content-Type']).toBe('application/json')
    expect(options.headers.Authorization).toBeUndefined()
    expect(options.body).toBe(JSON.stringify({ nameOrEmail: 'test', password: 'secret' }))
  })

  it('erneuert den Token bei 401 und wiederholt den Request einmal', async () => {
    getAccessToken.mockReturnValueOnce('old-token').mockReturnValueOnce('new-token')
    fetchMock
      .mockResolvedValueOnce(jsonResponse(401, { message: 'expired' }))
      .mockResolvedValueOnce(jsonResponse(200, { id: '1' }))
    refreshAccessToken.mockResolvedValue('new-token')

    const data = await apiFetch('/users/me')

    expect(data).toEqual({ id: '1' })
    expect(refreshAccessToken).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(fetchMock.mock.calls[1][1].headers.Authorization).toBe('Bearer new-token')
  })

  it('wiederholt ohne refreshOnUnauthorized nicht', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(401, { message: 'expired' }))

    await expect(apiFetch('/users/me', { retryOnUnauthorized: false })).rejects.toMatchObject({
      status: 401,
    })

    expect(refreshAccessToken).not.toHaveBeenCalled()
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('wiederholt ohne auth nicht', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(401, { message: 'expired' }))

    await expect(apiFetch('/auth/sign-in', { auth: false })).rejects.toMatchObject({
      status: 401,
    })

    expect(refreshAccessToken).not.toHaveBeenCalled()
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('verwirft den Token, wenn der Refresh fehlschlägt', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(401, { message: 'expired' }))
    refreshAccessToken.mockResolvedValue(null)

    await expect(apiFetch('/users/me')).rejects.toMatchObject({ status: 401 })

    expect(clearAccessToken).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('liefert bei leerer Antwort null', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(204, undefined))

    await expect(apiFetch('/auth/sign-out', { method: 'POST' })).resolves.toBeNull()
  })

  it('wirft Fehler mit Status und Body', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(409, { message: 'Conflict' }))

    await expect(apiFetch('/users')).rejects.toMatchObject({
      message: 'Conflict',
      status: 409,
      data: { message: 'Conflict' },
    })
  })

  it('nutzt bei Fehlern ohne JSON einen generischen Text', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 500,
      headers: { get: () => null },
    })

    await expect(apiFetch('/users')).rejects.toMatchObject({
      message: 'Request failed with status 500',
      status: 500,
      data: null,
    })
  })
})
