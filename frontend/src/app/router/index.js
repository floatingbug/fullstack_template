import { createRouter, createWebHistory } from 'vue-router'

import authRoutes from '@/features/auth/router'
import homeRoutes from '@/features/home/router'
import notFoundRoutes from '@/features/not-found/router'
// Weitere Feature-Router hier importieren, z. B.:
// import recipeRoutes from '@/features/recipe/router'

import { installAuthGuard } from './guards.js'

const routes = [
  homeRoutes,
  authRoutes,
  // Feature-Router mit geschützten Seiten setzen `meta: { requiresAuth: true }`.
  notFoundRoutes,
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

installAuthGuard(router)

export default router
