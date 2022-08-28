import Vue from 'vue';
import VueRouter from 'vue-router';

Vue.use(VueRouter);

const routes = [
    {
        path: '/',
        name: 'Home',
        component: () => import(/* webpackChunkName: "US" */ '../views/CCG.vue'),
        // component: Home,
    },
    {
        path: '/T1',
        name: 'T1',
        component: () => import(/* webpackChunkName: "US" */ '../views/T1.vue'),
        // component: Home,
    },
];

const router = new VueRouter({
    routes,
});

export default router;
