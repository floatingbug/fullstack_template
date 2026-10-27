import AuthLayout from '@/app/layouts/AuthLayout.vue'

export default {
  path: '/auth',
  component: AuthLayout,
  children: [
    {
      path: 'sign-in',
      name: 'sign-in',
      component: () => import('../ui/views/SignInView.vue'),
      meta: { guestOnly: true },
    },
    {
      path: 'sign-up',
      name: 'sign-up',
      component: () => import('../ui/views/SignUpView.vue'),
      meta: { guestOnly: true },
    },
    {
      path: 'forgot-password',
      name: 'forgot-password',
      component: () => import('../ui/views/ForgotPasswordView.vue'),
      meta: { guestOnly: true },
    },
    {
      path: 'reset-password',
      name: 'reset-password',
      component: () => import('../ui/views/ResetPasswordView.vue'),
    },
    {
      path: 'verify-email',
      name: 'verify-email',
      component: () => import('../ui/views/VerifyEmailView.vue'),
    },
    {
      path: 'confirm-email-change',
      name: 'confirm-email-change',
      component: () => import('../ui/views/ConfirmEmailChangeView.vue'),
    },
  ],
}
