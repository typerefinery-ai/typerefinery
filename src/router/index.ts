import { createRouter, createWebHashHistory } from "vue-router"
import Home from "../views/Home.vue"

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
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
  ],
})

export default router
