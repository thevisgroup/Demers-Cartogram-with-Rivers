import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../views/Home.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/ccg",
    name: "CCG",
    component: () => import(/* webpackChunkName: "US" */ "../views/CCG.vue"),
  },
  {
    path: "/ccg2",
    name: "CCG2",
    component: () => import(/* webpackChunkName: "US" */ "../views/CCG2.vue"),
  },
];

const router = new VueRouter({
  routes,
});

export default router;
