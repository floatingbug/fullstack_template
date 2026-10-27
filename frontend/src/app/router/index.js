import { createRouter, createWebHistory } from 'vue-router'

import authRoutes from '@/features/auth/router'
import homeRoutes from '@/features/home/router'
// Weitere Feature-Router hier importieren, z. B.:
// import recipeRoutes from '@/features/recipe/router'

const routes = [
  homeRoutes,
  authRoutes,
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
