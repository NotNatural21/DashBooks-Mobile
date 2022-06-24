import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
    {
        path: '',
        redirect: '/folder/DashBoard'
    },
    {
        path: '/folder/DashBoard',
        name: 'DashBoard',
        component: () => import ('../views/HomeView.vue')
    },
    {
        path: '/folder/Settings',
        name: 'Settings',
        component: () => import ('../views/SettingsView.vue')
    },
    {
        path: '/folder/Projects',
        name: 'Projects',
        component: () => import ('../views/ProjectView.vue')
    },
    {
        path: '/TimeSheets',
        name: 'TimeSheets',
        component: () => import ('../views/TimeSheetsView.vue')
    },
    {
        path: '/folder/Invoicing',
        name: 'Invoicing',
        component: () => import ('../views/InvoiceView.vue')
    },
    {
        path: '/folder/Records',
        name: 'Records',
        component: () => import ('../views/RecordView.vue')
    },
    {
        path: '/folder/Help',
        name: 'Help',
        component: () => import ('../views/HelpView.vue')
    },
]

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes
})

export default router
