import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

async function loadTheme() {
  return import('./theme.js')
}

describe('theme', () => {
  beforeEach(() => {
    vi.resetModules()
    window.localStorage.clear()
    delete document.documentElement.dataset.theme
  })

  afterEach(() => {
    delete document.documentElement.dataset.theme
    window.localStorage.clear()
  })

  it('nutzt ohne gespeicherten Wert den Systemmodus', async () => {
    const { theme, THEMES } = await loadTheme()

    expect(THEMES).toEqual(['light', 'dark', 'system'])
    expect(theme.value).toBe('system')
  })

  it('liest einen gespeicherten Modus', async () => {
    window.localStorage.setItem('theme', 'dark')

    const { theme } = await loadTheme()

    expect(theme.value).toBe('dark')
  })

  it('ignoriert ungültige gespeicherte Werte', async () => {
    window.localStorage.setItem('theme', 'neon')

    const { theme } = await loadTheme()

    expect(theme.value).toBe('system')
  })

  it('setzt data-theme und speichert die Auswahl', async () => {
    const { setTheme, theme } = await loadTheme()

    setTheme('light')

    expect(theme.value).toBe('light')
    expect(document.documentElement.dataset.theme).toBe('light')
    expect(window.localStorage.getItem('theme')).toBe('light')

    setTheme('dark')

    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(window.localStorage.getItem('theme')).toBe('dark')
  })

  it('ignoriert unbekannte Modi', async () => {
    const { setTheme, theme } = await loadTheme()

    setTheme('neon')

    expect(theme.value).toBe('system')
  })

  it('wendet den Modus beim Start an und folgt anderen Tabs', async () => {
    window.localStorage.setItem('theme', 'dark')

    const { initTheme, theme } = await loadTheme()
    const cleanup = initTheme()

    expect(document.documentElement.dataset.theme).toBe('dark')

    window.dispatchEvent(new StorageEvent('storage', { key: 'theme', newValue: 'light' }))

    expect(theme.value).toBe('light')
    expect(document.documentElement.dataset.theme).toBe('light')

    window.dispatchEvent(new StorageEvent('storage', { key: 'other', newValue: 'dark' }))

    expect(theme.value).toBe('light')

    cleanup()
  })

  it('reagiert nach dem Aufräumen nicht mehr auf Storage-Events', async () => {
    const { initTheme, theme } = await loadTheme()
    const cleanup = initTheme()

    cleanup()

    window.dispatchEvent(new StorageEvent('storage', { key: 'theme', newValue: 'dark' }))

    expect(theme.value).toBe('system')
  })
})
