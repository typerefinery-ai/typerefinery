import { createRouter, createWebHashHistory } from "vue-router"
import Home from "../views/Home.vue"
import Chat from "../components/Chat/index.vue"

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/home/:id",
      name: "home",
      component: Home,
    },
    {
      path: "/home/chats",
      name: "chat",
      component: Chat,
    },
    {
      path: "/",
      redirect: "/home/project",
    },
  ],
})

export default router
