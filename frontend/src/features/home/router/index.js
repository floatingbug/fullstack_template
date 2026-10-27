import PublicLayout from '@/app/layouts/PublicLayout.vue'

export default {
  path: '/',
  component: PublicLayout,
  children: [
    {
      path: '',
      name: 'home',
      component: () => import('../ui/views/HomeView.vue'),
    },
  ],
}
