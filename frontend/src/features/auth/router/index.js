import AuthLayout from '@/app/layouts/AuthLayout.vue'

export default {
  path: '/auth',
  component: AuthLayout,
  children: [
    {
      path: 'sign-in',
      name: 'sign-in',
      component: () => import('../ui/views/AuthPlaceholderView.vue'),
    },
    {
      path: 'sign-up',
      name: 'sign-up',
      component: () => import('../ui/views/AuthPlaceholderView.vue'),
    },
  ],
}
