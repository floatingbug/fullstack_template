import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import i18n from '@/app/i18n'
import { setTheme, theme } from '@/shared/theme/theme.js'
import ThemeToggle from './ThemeToggle.vue'

function mountToggle() {
  return mount(ThemeToggle, {
    global: { plugins: [i18n] },
  })
}

describe('ThemeToggle', () => {
  beforeEach(() => {
    window.localStorage.clear()
    setTheme('system')
  })

  afterEach(() => {
    setTheme('system')
    window.localStorage.clear()
  })

  it('zeigt die drei Modi und markiert den aktiven', () => {
    const wrapper = mountToggle()
    const buttons = wrapper.findAll('button')

    expect(buttons).toHaveLength(3)
    expect(buttons.map((button) => button.attributes('data-theme-value'))).toEqual([
      'light',
      'dark',
      'system',
    ])
    expect(buttons[0].attributes('aria-pressed')).toBe('false')
    expect(buttons[1].attributes('aria-pressed')).toBe('false')
    expect(buttons[2].attributes('aria-pressed')).toBe('true')
  })

  it('beschriftet die Gruppe und die Schaltflächen', () => {
    const wrapper = mountToggle()

    expect(wrapper.attributes('aria-label')).toBe(i18n.global.t('theme.label'))
    expect(wrapper.find('[data-theme-value="light"]').attributes('aria-label')).toBe(
      i18n.global.t('theme.light'),
    )
    expect(wrapper.find('[data-theme-value="dark"]').attributes('aria-label')).toBe(
      i18n.global.t('theme.dark'),
    )
    expect(wrapper.find('[data-theme-value="system"]').attributes('aria-label')).toBe(
      i18n.global.t('theme.system'),
    )
  })

  it('wechselt den Modus und speichert ihn', async () => {
    const wrapper = mountToggle()

    await wrapper.find('[data-theme-value="dark"]').trigger('click')

    expect(theme.value).toBe('dark')
    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(window.localStorage.getItem('theme')).toBe('dark')
    expect(wrapper.find('[data-theme-value="dark"]').attributes('aria-pressed')).toBe('true')
  })

  it('kann zurück auf System wechseln', async () => {
    setTheme('light')

    const wrapper = mountToggle()

    await wrapper.find('[data-theme-value="system"]').trigger('click')

    expect(theme.value).toBe('system')
    expect(document.documentElement.dataset.theme).toBe('system')
  })
})
