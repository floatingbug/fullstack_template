import { pinia } from '@/app/pinia.js'
import { useAuthStore } from '@/features/auth/store/authStore.js'
import { safeRedirect } from '@/shared/router/safeRedirect.js'

/**
 * Session beim ersten Navigation wiederherstellen und Routen schützen.
 *
 * - `meta.requiresAuth`: nur für angemeldete User
 * - `meta.guestOnly`: nur für Gäste (Login, Registrierung)
 */
export function installAuthGuard(router) {
  router.beforeEach(async (to) => {
    const authStore = useAuthStore(pinia)

    if (authStore.status === 'unknown') {
      await authStore.restoreSession()
    }

    const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)

    if (requiresAuth && !authStore.isAuthenticated) {
      return {
        name: 'sign-in',
        query: { redirect: to.fullPath },
      }
    }

    const guestOnly = to.matched.some((record) => record.meta.guestOnly)

    if (guestOnly && authStore.isAuthenticated) {
      return { path: safeRedirect(to.query.redirect) }
    }

    return true
  })
}
