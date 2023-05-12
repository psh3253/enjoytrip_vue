import {createRouter, createWebHistory} from "vue-router";

export default createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            component: () => import('./components/Home.vue')
        },
        {
            path: '/login',
            component: () => import('./components/Login.vue')
        },
        {
            path: '/join',
            component: () => import('./components/Join.vue')
        },
        {
            path: '/tour-info',
            component: () => import('./components/TourInfo.vue')
        }
    ]
});