import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '@/views/auth/LoginView.vue'
import ForgetPasswordView from '@/views/auth/ForgetPasswordView.vue'
import { supabase } from '@/lib/superbase_service'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: {reqiresAuth: true},
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/forget-password',
      name:'forgetPassword',
      component: ForgetPasswordView
    },
  ],
})

// Navigation guard
router.beforeEach( async(to, from, next) => {
  if(to.matched.some(record => record.meta.requireAuth)) {
    const {data: {session}} = await supabase.auth.getSession()
    if(!session) {
      next('/login')
    }else{
      next()
    }
  }
})
export default router
