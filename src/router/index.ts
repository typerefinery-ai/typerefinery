/// <reference types="vite/client" />

import { createRouter, createWebHashHistory } from "vue-router"
import Home from "@/views/Home.vue"
import Workflow from "@/views/Workflow.vue"
// import Chat from "@/components/Chat/index.vue"
import InitialScreen from "@/views/InitialScreen/index.vue"
import IframeComponent from "@/components/IframeComponent/index.vue"

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
      path: "/initial",
      name: "initial",
      component: InitialScreen,
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
      redirect: "/home/project",
    },
  ],
})

export default router
