import { ref } from 'vue'

export const THEMES = ['light', 'dark', 'system']
export const DEFAULT_THEME = 'system'

const STORAGE_KEY = 'theme'

function isTheme(value) {
  return THEMES.includes(value)
}

function readStoredTheme() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    return isTheme(stored) ? stored : DEFAULT_THEME
  } catch {
    return DEFAULT_THEME
  }
}

function readInitialTheme() {
  const fromDocument = document.documentElement.dataset.theme
  return isTheme(fromDocument) ? fromDocument : readStoredTheme()
}

/**
 * Aktueller Modus. Der Inline-Script in index.html setzt data-theme bereits
 * vor dem ersten Paint; hier wird der Wert nur noch reaktiv abgebildet.
 */
export const theme = ref(readInitialTheme())

function applyTheme(value) {
  document.documentElement.dataset.theme = value
}

function persistTheme(value) {
  try {
    window.localStorage.setItem(STORAGE_KEY, value)
  } catch {
    // Ohne Storage funktioniert der Modus weiterhin für die aktuelle Sitzung.
  }
}

export function setTheme(value) {
  if (!isTheme(value)) {
    return
  }

  theme.value = value
  applyTheme(value)
  persistTheme(value)
}

function onStorage(event) {
  if (event.key !== STORAGE_KEY) {
    return
  }

  const nextTheme = isTheme(event.newValue) ? event.newValue : DEFAULT_THEME

  theme.value = nextTheme
  applyTheme(nextTheme)
}

/**
 * Wendet den gespeicherten Modus an und hält ihn zwischen Tabs synchron.
 * Gibt eine Aufräumfunktion für Tests zurück.
 */
export function initTheme() {
  setTheme(theme.value)
  window.addEventListener('storage', onStorage)

  return () => window.removeEventListener('storage', onStorage)
}
