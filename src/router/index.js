import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Home",
    component: () => import(/* webpackChunkName: "US" */ "../views/Home.vue"),
    // component: Home,
  },
  {
    path: "/CCG",
    name: "Home",
    component: () => import(/* webpackChunkName: "US" */ "../views/CCG.vue"),
    // component: Home,
  },
];

for (let i = 1; i < 17; i++) {
  routes.push({
    path: "/T" + i,
    name: "T" + i,
    component: () => import(/* webpackChunkName: "US" */ `../views/T${i}.vue`),
    // component: Home,
  });
}

for (let i = 1; i < 4; i++) {
  routes.push({
    path: "/P" + i,
    name: "P" + i,
    component: () => import(/* webpackChunkName: "US" */ `../views/P${i}.vue`),
    // component: Home,
  });
}

const router = new VueRouter({
  routes,
});

export default router;
