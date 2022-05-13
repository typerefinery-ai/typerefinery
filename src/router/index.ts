import { createRouter, createWebHashHistory } from "vue-router"
import Home from "../views/Home.vue"
import Maps from "../components/Maps/index.vue"

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/home/:id",
      name: "home",
      components: {
        default: Home,
        dialog: Maps,
      },
    },
    {
      path: "/",
      redirect: "/home/project",
    },
  ],
})

export default router
