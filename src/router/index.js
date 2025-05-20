import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import StaffSections from '../views/StaffSections.vue'
import MedicalStaff from '../views/MedicalStaff.vue'
import WorkingHours from '../views/WorkingHours.vue'
import Reviewers from '../views/Reviewers.vue'
import ExaminationCommittee from '../views/ExaminationCommittee.vue'
import MedicalCommittees from '../views/MedicalCommittees.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: Login,
      meta: { requiresAuth: false }
    },
    {
      path: '/',
      name: 'home',
      component: () => import('../views/Home.vue'),
      meta: { 
        requiresAuth: true,
        title: 'Dashboard'
      }
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/About.vue'),
      meta: { 
        requiresAuth: true,
        title: 'About'
      }
    },
    {
      path: '/users',
      name: 'users',
      component: () => import('../views/UsersManagement.vue'),
      meta: { 
        requiresAuth: true,
        title: 'إدارة المستخدمين'
      }
    },
    {
      path: '/staff-sections',
      name: 'StaffSections',
      component: StaffSections,
      meta: {
        requiresAuth: true,
        title: 'أقسام الكادر الطبي'
      }
    },
    {
      path: '/medical-staff',
      name: 'MedicalStaff',
      component: MedicalStaff,
      meta: { requiresAuth: true }
    },
    {
      path: '/working-hours',
      name: 'WorkingHours',
      component: WorkingHours,
      meta: { 
        requiresAuth: true,
        title: 'ساعات العمل'
      }
    },
    {
      path: '/reviewers',
      name: 'Reviewers',
      component: Reviewers,
      meta: { 
        requiresAuth: true,
        title: 'المراجعين'
      }
    },
    {
      path: '/examination-committee',
      name: 'ExaminationCommittee',
      component: ExaminationCommittee,
      meta: { 
        requiresAuth: true,
        title: 'الفحص الاولي'
      }
    },
    {
      path: '/medical-committees',
      name: 'MedicalCommittees',
      component: MedicalCommittees,
      meta: { 
        requiresAuth: true,
        title: 'اللجان الطبية'
      }
    }
  ]
})

// Navigation guard
// router.beforeEach((to, from, next) => {
//   const isAuthenticated = localStorage.getItem('token') // You should implement proper authentication
//   if (to.meta.requiresAuth && !isAuthenticated) {
//     next('/login')
//   } else {
//     next()
//   }
// })

export default router
