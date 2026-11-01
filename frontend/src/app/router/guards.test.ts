import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'

vi.mock('@/shared/api/authSession', () => ({
  getAccessToken: vi.fn(),
  setAccessToken: vi.fn(),
  clearAccessToken: vi.fn(),
  refreshAccessToken: vi.fn(),
}))

vi.mock('@/features/auth/services/authService', () => ({
  getMe: vi.fn(),
}))

import type { User } from '@/shared/api/types'
import * as authService from '@/features/auth/services/authService'
import { pinia } from '@/app/pinia'
import * as authSession from '@/shared/api/authSession'
import { useAuthStore } from '@/features/auth/store/authStore'
import { installAuthGuard } from './guards'

const mockedAuthService = vi.mocked(authService)
const { clearAccessToken, refreshAccessToken } = vi.mocked(authSession)

const Stub = { template: '<div />' }

function createTestRouter() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'home', component: Stub },
      {
        path: '/auth/sign-in',
        name: 'sign-in',
        component: Stub,
        meta: { guestOnly: true },
      },
      {
        path: '/dashboard',
        name: 'dashboard',
        component: Stub,
        meta: { requiresAuth: true },
      },
    ],
  })

  installAuthGuard(router)

  return router
}

describe('Auth-Guard', () => {
  beforeEach(() => {
    const store = useAuthStore(pinia)

    store.$reset()
    vi.clearAllMocks()
    refreshAccessToken.mockResolvedValue(null)
  })

  it('erlaubt öffentliche Routen', async () => {
    const router = createTestRouter()

    await router.push('/')

    expect(router.currentRoute.value.name).toBe('home')
  })

  it('leitet Gäste von geschützten Routen zur Anmeldung', async () => {
    const router = createTestRouter()

    await router.push('/dashboard')

    expect(router.currentRoute.value.name).toBe('sign-in')
    expect(router.currentRoute.value.query.redirect).toBe('/dashboard')
  })

  it('stellt die Session vor der ersten Entscheidung wieder her', async () => {
    refreshAccessToken.mockResolvedValue('token-1')
    mockedAuthService.getMe.mockResolvedValue({ id: '1', name: 'Tommy' } as User)

    const router = createTestRouter()

    await router.push('/dashboard')

    expect(router.currentRoute.value.name).toBe('dashboard')
    expect(useAuthStore(pinia).isAuthenticated).toBe(true)
  })

  it('behandelt fehlgeschlagenes restoreSession als Gast', async () => {
    refreshAccessToken.mockResolvedValue('token-1')
    mockedAuthService.getMe.mockRejectedValue(new Error('unauthorized'))

    const router = createTestRouter()

    await router.push('/dashboard')

    expect(router.currentRoute.value.name).toBe('sign-in')
    expect(clearAccessToken).toHaveBeenCalledTimes(1)
    expect(useAuthStore(pinia).status).toBe('guest')
  })

  it('leitet angemeldete User von Gast-Routen weg', async () => {
    const store = useAuthStore(pinia)
    store.status = 'authenticated'
    store.user = { id: '1', name: 'Tommy' } as User

    const router = createTestRouter()

    await router.push({ name: 'sign-in' })

    expect(router.currentRoute.value.path).toBe('/')
  })

  it('nutzt das Redirect-Ziel für angemeldete User', async () => {
    const store = useAuthStore(pinia)
    store.status = 'authenticated'
    store.user = { id: '1', name: 'Tommy' } as User

    const router = createTestRouter()

    await router.push({ name: 'sign-in', query: { redirect: '/dashboard' } })

    expect(router.currentRoute.value.name).toBe('dashboard')
  })

  it('ignoriert unsichere Redirect-Ziele', async () => {
    const store = useAuthStore(pinia)
    store.status = 'authenticated'
    store.user = { id: '1', name: 'Tommy' } as User

    const router = createTestRouter()

    await router.push({ name: 'sign-in', query: { redirect: '//evil.example' } })

    expect(router.currentRoute.value.path).toBe('/')
  })

  it('stellt die Session nur einmal wieder her', async () => {
    const router = createTestRouter()

    await router.push('/')
    await router.push('/dashboard')

    expect(refreshAccessToken).toHaveBeenCalledTimes(1)
  })
})
