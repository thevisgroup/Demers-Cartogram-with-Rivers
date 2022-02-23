import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../views/Home.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Home",
    component: () => import(/* webpackChunkName: "US" */ "../views/CCG.vue"),
    // component: Home,
  },
  {
    path: "/ccg",
    name: "CCG",
    component: () => import(/* webpackChunkName: "US" */ "../views/CCG.vue"),
  },
];

const router = new VueRouter({
  routes,
});

export default router;
