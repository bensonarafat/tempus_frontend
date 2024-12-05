import { createRouter, createWebHistory } from 'vue-router'
import { authGuard, adminGuard, guestGuard } from './guards'
import HomeView from '../views/HomeView.vue'

// Auth
import LoginView from '@/views/auth/LoginView.vue'
import ForgotPasswordView from '@/views/auth/ForgotPasswordView.vue'

import DashboardView from '@/views/DashboardView.vue'
import SettingsView from '@/views/SettingsView.vue'

// Category
import CategoryAddView from '@/views/category/CategoryAddView.vue'
import CategoryManageView from '@/views/category/CategoryManageView.vue'
import CategoryEditView from '@/views/category/CategoryEditView.vue'

// Event
import AddEventView from '@/views/events/AddEventView.vue'
import ManageEventView from '@/views/events/ManageEventView.vue'
import AddPeopleView from '@/views/events/people/AddPeopleView.vue'
import ManagePeopleView from '@/views/events/people/ManagePeopleView.vue'

// Resources
import AddResourceView from '@/views/resources/AddResourceView.vue'
import ManageResourceView from '@/views/resources/ManageResourceView.vue'

// Users
import AddUserView from '@/views/users/AddUserView.vue'
import ManageUserView from '@/views/users/ManageUserView.vue'
import AddRoleView from '@/views/users/roles/AddRoleView.vue'
import ManageRolesView from '@/views/users/roles/ManageRolesView.vue'

// Profile
import ChangePasswordView from '@/views/profile/ChangePasswordView.vue'
import ProfileView from '@/views/profile/ProfileView.vue'

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

    // Auth
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      beforeEnter: guestGuard,
    },
    {
      path: '/forgot-password',
      name: 'forgotPassword',
      component: ForgotPasswordView,
      beforeEnter: guestGuard,
    },
    {
      path: '/settings',
      name: 'settings',
      component: SettingsView,
      beforeEnter: authGuard,
    },

    // Category

    {
      path: '/category/add',
      name: 'categoryAdd',
      component: CategoryAddView,
      beforeEnter: authGuard,
    },
    {
      path: '/category/manage',
      name: 'categoryManage',
      component: CategoryManageView,
      beforeEnter: authGuard,
    },
    {
      path: '/category/edit/:id/:slug',
      name: 'editCategory',
      component: CategoryEditView,
      beforeEnter: authGuard,
    },

    // Events
    {
      path: '/event/add',
      name: 'eventAdd',
      component: AddEventView,
      beforeEnter: authGuard,
    },
    {
      path: '/event/manage',
      name: 'eventManage',
      component: ManageEventView,
      beforeEnter: authGuard,
    },

    {
      path: '/event/people/add',
      name: 'peopleAdd',
      component: AddPeopleView,
      beforeEnter: authGuard,
    },

    {
      path: '/event/people',
      name: 'peopleManage',
      component: ManagePeopleView,
      beforeEnter: authGuard,
    },
    {
      path: '/resources/add',
      name: 'addResources',
      component: AddResourceView,
      beforeEnter: authGuard,
    },
    {
      path: '/resources',
      name: 'resourceManage',
      component: ManageResourceView,
      beforeEnter: authGuard,
    },
    {
      path: '/users/manage',
      name: 'usersManage',
      component: ManageUserView,
      beforeEnter: authGuard,
    },
    {
      path: '/users/add',
      name: 'usersAdd',
      component: AddUserView,
      beforeEnter: authGuard,
    },
    {
      path: '/users/roles',
      name: 'usersRoles',
      component: ManageRolesView,
      beforeEnter: authGuard,
    },
    {
      path: '/users/roles/add',
      name: 'usersRolesAdd',
      component: AddRoleView,
      beforeEnter: authGuard,
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfileView,
      beforeEnter: authGuard,
    },
    {
      path: '/profile/change-password',
      name: 'profileChangePassword',
      component: ChangePasswordView,
      beforeEnter: authGuard,
    },
  ],
})

export default router
