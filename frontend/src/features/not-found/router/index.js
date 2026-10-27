import PublicLayout from '@/app/layouts/PublicLayout.vue'

export default {
  path: '/',
  component: PublicLayout,
  children: [
    {
      path: ':pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../ui/views/NotFoundView.vue'),
    },
  ],
}
