import { createRouter, createWebHistory } from "vue-router"
import Template from "../views/Template.vue"
import POC1 from "../views/POC1.vue"
import Home from "../views/Home.vue"

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/home/:id",
      name: "home",
      component: Home,
    },
    {
      path: "/",
      redirect: "/home/project",
    },
    {
      path: "/template",
      name: "template",
      component: Template,
    },
    {
      path: "/poc1",
      name: "poc1",
      component: POC1,
    },
    {
      path: "/about",
      name: "about",
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import("../views/About.vue"),
    },
  ],
})

export default router
