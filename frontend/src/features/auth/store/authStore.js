import { defineStore } from 'pinia'

import { clearAccessToken, refreshAccessToken, setAccessToken } from '@/shared/api/authSession.js'
import * as authService from '../services/authService.js'
import { getAuthErrorKey } from '../services/authErrors.js'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    status: 'unknown',
    loading: false,
    errorKey: null,
    noticeKey: null,
    signUpComplete: false,
    pendingVerificationEmail: '',
    forgotComplete: false,
    confirmedEmail: null,
    signInForm: {
      nameOrEmail: '',
      password: '',
    },
    signUpForm: {
      name: '',
      email: '',
      password: '',
      passwordConfirm: '',
    },
    forgotForm: {
      email: '',
    },
    resetForm: {
      password: '',
      passwordConfirm: '',
    },
  }),

  getters: {
    isAuthenticated: (state) => state.status === 'authenticated',
  },

  actions: {
    setError(key) {
      this.errorKey = key
      this.noticeKey = null
    },

    clearError() {
      this.errorKey = null
    },

    setNotice(key) {
      this.noticeKey = key
      this.errorKey = null
    },

    async restoreSession() {
      if (this.status !== 'unknown') {
        return this.status
      }

      const token = await refreshAccessToken()

      if (!token) {
        this.user = null
        this.status = 'guest'
        return this.status
      }

      try {
        this.user = await authService.getMe()
        this.status = 'authenticated'
      } catch {
        clearAccessToken()
        this.user = null
        this.status = 'guest'
      }

      return this.status
    },

    async signIn({ nameOrEmail, password }) {
      this.loading = true
      this.errorKey = null
      this.noticeKey = null

      try {
        const result = await authService.signIn({ nameOrEmail, password })

        setAccessToken(result.accessToken)
        this.user = result.user
        this.status = 'authenticated'
        this.signInForm.password = ''

        return true
      } catch (error) {
        this.errorKey = getAuthErrorKey(error, 'signIn')
        return false
      } finally {
        this.loading = false
      }
    },

    async signUp({ name, email, password }) {
      this.loading = true
      this.errorKey = null
      this.noticeKey = null
      this.signUpComplete = false

      try {
        await authService.signUp({ name, email, password })

        this.signUpComplete = true
        this.pendingVerificationEmail = email
        this.signUpForm.password = ''
        this.signUpForm.passwordConfirm = ''

        return true
      } catch (error) {
        this.errorKey = getAuthErrorKey(error, 'signUp')
        return false
      } finally {
        this.loading = false
      }
    },

    async signOut() {
      this.loading = true

      try {
        await authService.signOut()
      } catch {
        // Local logout must work even if the request fails.
      } finally {
        clearAccessToken()
        this.user = null
        this.status = 'guest'
        this.pendingVerificationEmail = ''
        this.signUpComplete = false
        this.loading = false
      }
    },

    async resendVerification(email) {
      this.loading = true
      this.errorKey = null
      this.noticeKey = null

      try {
        await authService.resendVerificationEmail(email)
        this.noticeKey = 'auth.verificationSent'
        return true
      } catch (error) {
        this.errorKey = getAuthErrorKey(error, 'resendVerification')
        return false
      } finally {
        this.loading = false
      }
    },

    async requestPasswordReset(email) {
      this.loading = true
      this.errorKey = null
      this.noticeKey = null
      this.forgotComplete = false

      try {
        await authService.forgotPassword(email)
        this.forgotComplete = true
        return true
      } catch (error) {
        this.errorKey = getAuthErrorKey(error, 'forgotPassword')
        return false
      } finally {
        this.loading = false
      }
    },

    async resetPassword({ token, password }) {
      this.loading = true
      this.errorKey = null
      this.noticeKey = null

      try {
        await authService.resetPassword({ token, password })

        this.resetForm.password = ''
        this.resetForm.passwordConfirm = ''
        this.noticeKey = 'auth.resetSuccess'

        return true
      } catch (error) {
        this.errorKey = getAuthErrorKey(error, 'resetPassword')
        return false
      } finally {
        this.loading = false
      }
    },

    async verifyEmail(token) {
      this.loading = true
      this.errorKey = null

      try {
        await authService.verifyEmail(token)
        this.noticeKey = 'auth.verifyEmailSuccess'
        return true
      } catch (error) {
        this.errorKey = getAuthErrorKey(error, 'verifyEmail')
        return false
      } finally {
        this.loading = false
      }
    },

    async confirmEmailChange(token) {
      this.loading = true
      this.errorKey = null
      this.confirmedEmail = null

      try {
        const result = await authService.confirmEmailChange(token)

        this.confirmedEmail = result?.newEmail ?? null
        this.noticeKey = 'auth.confirmEmailSuccess'

        if (this.isAuthenticated) {
          await this.refreshUser()
        }

        return true
      } catch (error) {
        this.errorKey = getAuthErrorKey(error, 'confirmEmailChange')
        return false
      } finally {
        this.loading = false
      }
    },

    async refreshUser() {
      if (!this.isAuthenticated) {
        return
      }

      try {
        this.user = await authService.getMe()
      } catch {
        // Keep the current user; the next navigation/refresh will retry.
      }
    },
  },
})
