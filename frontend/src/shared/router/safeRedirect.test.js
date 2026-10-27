import { describe, expect, it } from 'vitest'

import { safeRedirect } from './safeRedirect.js'

describe('safeRedirect', () => {
  it('akzeptiert interne Pfade', () => {
    expect(safeRedirect('/dashboard')).toBe('/dashboard')
    expect(safeRedirect('/recipes?page=2')).toBe('/recipes?page=2')
  })

  it('verwirft externe und protocol-relative Ziele', () => {
    expect(safeRedirect('https://example.com')).toBe('/')
    expect(safeRedirect('//example.com')).toBe('/')
    expect(safeRedirect('/\\example.com')).toBe('/')
    expect(safeRedirect('dashboard')).toBe('/')
  })

  it('nutzt den übergebenen Fallback', () => {
    expect(safeRedirect(undefined, '/home')).toBe('/home')
    expect(safeRedirect(null, '/home')).toBe('/home')
    expect(safeRedirect(42, '/home')).toBe('/home')
  })
})
