import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'

import App from '../App.vue'
import router from '../app/router'
import i18n from '../app/i18n'

async function mountApp() {
  await router.push('/')
  await router.isReady()

  return mount(App, {
    global: { plugins: [createPinia(), router, i18n] },
  })
}

describe('App', () => {
  it('rendert das PublicLayout mit Startseite', async () => {
    const wrapper = await mountApp()

    expect(wrapper.text()).toContain(i18n.global.t('app.name'))
    expect(wrapper.text()).toContain(i18n.global.t('home.title'))
  })

  it('navigiert zur Anmeldung', async () => {
    const wrapper = await mountApp()

    const buttons = wrapper.findAll('button')
    const signIn = buttons.find((button) => button.text() === i18n.global.t('auth.signIn'))

    expect(signIn).toBeDefined()

    await signIn.trigger('click')

    await vi.waitFor(() => {
      expect(router.currentRoute.value.name).toBe('sign-in')
    })

    expect(wrapper.find('.auth-layout').exists()).toBe(true)
    expect(wrapper.find('.topbar-container').exists()).toBe(false)
  })
})
