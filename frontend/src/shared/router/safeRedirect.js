/**
 * Akzeptiert nur interne Pfade als Redirect-Ziel.
 * Verhindert Open Redirects über `//fremde-domain` oder `/\fremde-domain`.
 */
export function safeRedirect(value, fallback = '/') {
  if (typeof value !== 'string') {
    return fallback
  }

  if (!value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) {
    return fallback
  }

  return value
}
