/// <reference types="vite/client" />

import { createRouter, createWebHashHistory } from "vue-router"
import Home from "../views/Home.vue"
import Chat from "../components/Chat/index.vue"
import Maps from "../components/Maps/index.vue"
import Login from "../components/Pages/Login.vue"
import SignUp from "../components/Pages/SignUp.vue"

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/sign-up",
      name: "SignUp",
      component: SignUp,
    },
    {
      path: "/",
      name: "Login",
      component: Login,
    },
    {
      path: "/home/:id",
      name: "home",
      components: {
        default: Home,
        dialog: Maps,
      },
    },
    {
      path: "/home/chats",
      name: "chat",
      component: Chat,
    },
    // {
    //   path: "/",
    //   redirect: "/home/project",
    // },
  ],
})

export default router
