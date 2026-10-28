import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'

import App from '../App.vue'
import router from '../app/router'
import i18n from '../app/i18n'
import { pinia } from '../app/pinia'
import { useAuthStore } from '../features/auth/store/authStore.js'
import { refreshAccessToken } from '../shared/api/authSession.js'
import { setTheme } from '../shared/theme/theme.js'

vi.mock('../shared/api/authSession.js', () => ({
  getAccessToken: vi.fn(() => null),
  setAccessToken: vi.fn(),
  clearAccessToken: vi.fn(),
  refreshAccessToken: vi.fn(),
}))

async function mountAt(path = '/') {
  await router.push(path)
  await router.isReady()

  return mount(App, {
    global: { plugins: [pinia, router, i18n] },
  })
}

describe('App', () => {
  beforeEach(() => {
    const authStore = useAuthStore(pinia)

    authStore.$reset()
    authStore.status = 'guest'

    refreshAccessToken.mockReset()
    refreshAccessToken.mockResolvedValue(null)

    setTheme('system')
  })

  it('rendert das PublicLayout mit Startseite', async () => {
    const wrapper = await mountAt('/')

    expect(wrapper.text()).toContain(i18n.global.t('app.name'))
    expect(wrapper.text()).toContain(i18n.global.t('home.title'))

    wrapper.unmount()
  })

  it('navigiert zur Anmeldung', async () => {
    const wrapper = await mountAt('/')

    const buttons = wrapper.findAll('button')
    const signIn = buttons.find((button) => button.text() === i18n.global.t('auth.signIn'))

    expect(signIn).toBeDefined()

    await signIn.trigger('click')

    await vi.waitFor(() => {
      expect(router.currentRoute.value.name).toBe('sign-in')
    })

    expect(wrapper.find('.auth-layout').exists()).toBe(true)
    expect(wrapper.find('.topbar-container').exists()).toBe(false)

    wrapper.unmount()
  })

  it('zeigt die 404-Seite für unbekannte Pfade', async () => {
    const wrapper = await mountAt('/gibt-es-nicht')

    expect(router.currentRoute.value.name).toBe('not-found')
    expect(wrapper.text()).toContain(i18n.global.t('notFound.title'))

    wrapper.unmount()
  })

  it('schaltet das Farbschema in der Topbar', async () => {
    const wrapper = await mountAt('/')

    const darkButton = wrapper.find('[data-theme-value="dark"]')

    expect(darkButton.exists()).toBe(true)

    await darkButton.trigger('click')

    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(window.localStorage.getItem('theme')).toBe('dark')
    expect(darkButton.attributes('aria-pressed')).toBe('true')

    wrapper.unmount()
  })
})
