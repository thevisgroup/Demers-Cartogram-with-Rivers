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
        path: '/riverless',
        name: 'Riverless',
        component: () => import(/* webpackChunkName: "US" */ '../views/riverless.vue'),
        // component: Home,
    },
];

const router = new VueRouter({
    routes,
});

export default router;
