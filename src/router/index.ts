import { createRouter, createWebHistory } from 'vue-router'
import { authGuard, adminGuard, guestGuard } from './guards'
import HomeView from '../views/HomeView.vue'
import LoginView from '@/views/auth/LoginView.vue'
import ForgotPasswordView from '@/views/auth/ForgotPasswordView.vue'
import DashboardView from '@/views/DashboardView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.VITE_BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      beforeEnter: authGuard,
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      beforeEnter: guestGuard,
    },
    {
      path: '/forgot-password',
      name:'forgotPassword',
      component: ForgotPasswordView,
      beforeEnter: guestGuard,
    },
  ],
})

// Navigation guard
router.beforeEach( async(to, from, next) => {
  console.log(`Navigating from ${from.path} to ${to.path}`)
  next()
})
export default router
