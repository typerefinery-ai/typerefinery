<template>
  <div class="container">
    <div class="tab">
      <!-- <button class="tab_link" :class="{ active: activeTab == 'WELCOME' }" @click="onTabClicked('WELCOME')">
                Welcome
            </button> -->
      <button
        class="tab_link"
        :class="{ active: activeTab == 'WELCOME' }"
        @click="onTabClicked('WELCOME')"
      >
        Welcome
      </button>
      <button
        class="tab_link"
        :class="{ active: activeTab == 'SERVICES' }"
        @click="onTabClicked('SERVICES')"
      >
        Services
        <div
          v-if="!this.servicesLoaded"
          class="mt-3 text-white text-sm hover:text-500"
        >
          Installing services...
          <span
            class="pi pi-spin pi-cog"
            role="status"
            aria-hidden="true"
          ></span>
        </div>
        <div v-else class="mt-3 text-sm text-white">
          Required Services installed
          <span class="pi pi-check" role="status" aria-hidden="true"></span>
        </div>
      </button>
      <button
        class="tab_link"
        :class="{ active: activeTab == 'DOCUMENTATION' }"
        @click="onTabClicked('DOCUMENTATION')"
      >
        Documentation
      </button>
      <button
        class="tab_link dashboard"
        v-if="this.servicesLoaded"
        @click="onTabClicked('FINISH')"
      >
        Read to Roll, jump to the app
        <i class="pi pi-arrow-right"></i>
      </button>
    </div>
    <div class="content_container">
      <div class="controller_container">
        <window-controls />
      </div>
      <div class="content">
        <!-- <welcome v-if="activeTab === 'WELCOME'" /> -->
        <welcome
          v-if="activeTab === 'WELCOME'"
          @tabClicked="onTabClicked"
          :isInitialTime="isInitialTime"
        />
        <documentation v-if="activeTab === 'DOCUMENTATION'"></documentation>
        <services-content
          v-if="activeTab === 'SERVICES'"
          @tabClicked="onTabClicked"
          :getServices="getServices"
          :servicesLoaded="servicesLoaded"
          :services="services"
        ></services-content>
      </div>
    </div>
  </div>
</template>

<script>
  import { getModule } from "vuex-module-decorators"
  import { isProxy, toRaw } from "vue"

  import Welcome from "./Tabs/Welcome.vue"
  import Documentation from "./Tabs/Documentation.vue"
  import ServicesContent from "./Tabs/Services.vue"
  import WindowControls from "../Menu/WindowControls.vue"

  import Services from "@/store/Modules/Services"
  const servicesModule = getModule(Services)
  export default {
    name: "ServiceInstallation",
    components: {
      Welcome,
      Documentation,
      ServicesContent,
      WindowControls,
    },
    props: {
      getServices: {
        type: Function,
        required: true,
      },
      servicesStarted: {
        type: Boolean,
        required: true,
      },
    },
    data() {
      return {
        services: [],
        servicesStarted: false,
        loading: false,
        error: false,
        errorMessage: "",
        activeTab: "WELCOME",
        initialTime: "true",
      }
    },
    emits: ["updateMoveToDashboard"],
    computed: {
      servicesLoaded() {
        return servicesModule.data.servicesStarted
      },
      isInitialTime() {
        return this.initialTime
      },
    },
    methods: {
      onTabClicked(tab) {
        this.initialTime = "false"
        if (tab === "FINISH") {
          this.$emit("updateMoveToDashboard", true)
          return
        }
        this.activeTab = tab
      },
    },
  }
</script>

<style scoped lang="scss">
  .controller_container {
    display: flex;
    align-items: center;
    justify-content: right;
    position: fixed;
    z-index: 999;
    background: white;
    float: right;
    right: 0;
  }
  /* Style the tab */
  .container .tab {
    font-family: Roboto, Helvetica Neue Light, Helvetica Neue, Helvetica, Arial,
      Lucida Grande, sans-serif;
    display: flex;
    flex-direction: column;
    justify-content: center;
    float: left;
    border: 1px solid #ccc;
    background-color: #3b82f6;
    width: 30%;
    height: 100vh;
    -webkit-app-region: drag;
  }

  /* Style the buttons that are used to open the tab content */
  .tab button {
    margin-top: 1;
    display: block;
    background-color: inherit;
    color: white;
    padding: 22px 16px;
    width: 100%;
    border: none;
    outline: none;
    text-align: left;
    cursor: pointer;
    transition: 0.3s;
    font-size: 18px;
  }

  /* Change background color of buttons on hover */
  .tab button:hover {
    background-color: #618ed7;
  }

  .tabLinks {
    height: 2vh;
  }

  /* Create an active/current "tab button" class */
  .tab button.active {
    background-color: #2f68c4;
    color: white;
  }

  /* Style the tab content */
  .container .content {
    display: flex;
    float: left;
    width: 70%;
    height: 100vh;
    color: black;
    background: white;
    font-family: Roboto, Helvetica Neue Light, Helvetica Neue, Helvetica, Arial,
      Lucida Grande, sans-serif;
    -webkit-app-region: drag;
  }

  .dashboard {
    background: #1e69e1 !important;
  }

  .dashboard i {
    margin-left: 5px;
  }
</style>
