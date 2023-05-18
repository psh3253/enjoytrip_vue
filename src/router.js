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
        },
        {
            path: '/posts',
            component: () => import('./components/PostList.vue')
        },
        {
            path: '/posts/create',
            component: () => import('./components/PostCreate.vue')
        },
        {
            path: '/posts/:id',
            component: () => import('./components/PostDetails.vue')
        },
        {
            path: '/posts/:id/update',
            component: () => import('./components/PostUpdate.vue')
        },
        {
            path: '/hot-places',
            component: () => import('./components/HotPlaceList.vue')
        },
        {
            path: '/hot-places/create',
            component: () => import('./components/HotPlaceCreate.vue')
        },
        {
            path: '/hot-places/:id',
            component: () => import('./components/HotPlaceDetails.vue')
        }, {
            path: '/hot-places/:id/update',
            component: () => import('./components/HotPlaceUpdate.vue')
        }
    ]
});