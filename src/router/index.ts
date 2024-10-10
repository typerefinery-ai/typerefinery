/// <reference types="vite/client" />

import { createRouter, createWebHashHistory } from "vue-router"
import Home from "@/views/Home.vue"
import Workflow from "@/views/Workflow.vue"
// import Chat from "@/components/Chat/index.vue"
// import Maps from "@/components/Maps/index.vue"
import IframeComponent from "@/components/IframeComponent/index.vue"
import Welcome from "@/components/Welcome/index.vue"

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/home/:id",
      name: "home",
      components: {
        default: Home,
        // dialog: Maps,
      },
    },
    {
      path: "/welcome",
      name: "welcome",
      component: Welcome,
    },
    //Routing for experiences
    {
      path: "/experience/:id",
      name: "experience",
      component: IframeComponent,
    },
    // {
    //   path: "/home/chats",
    //   name: "chat",
    //   component: Chat,
    // },
    {
      path: "/workflow",
      name: "workflow",
      component: Workflow,
    },
    {
      path: "/",
      redirect: "/welcome",
    },
  ],
})

export default router
