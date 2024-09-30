<template>
  <div>
    <div class="app">
      <div class="header" :class="{ 'menu-hidden': !mainMenuVisible }">
        <main-menu
          :main-menu-visible="mainMenuVisible"
          :sub-menu-visible="false"
          @toggle="toggleMainMenu"
        />
        <menu-bar
          :menu-bar-visible="mainMenuVisible"
          @toggle="toggleMainMenu"
        />
      </div>
      <!-- content -->
      <div class="welcome-container">
        <!-- show list of experiences -->
        <h1>Experiences</h1>
        <div class="experiences">
          <div
            v-for="experience in experiencesList"
            :key="experience.id"
            class="experience"
          >
            <Card>
              <template #header>
                <i :class="experience.icon"></i>
              </template>
              <template #title>{{ experience.label }}</template>
              <template #content>
                <p class="m-0">
                  {{ experience.description }}
                </p>
              </template>
              <template #footer>
                <div class="flex gap-3 mt-1">
                  <Button
                    label="Open"
                    class="w-full"
                    @click="openUrl(experience.to)"
                  />
                </div>
              </template>
            </Card>
          </div>
        </div>

        <h1>Services</h1>

        <div class="services">
          <div v-for="service in serviceList" :key="service.id" class="service">
            <Card :status="service.status">
              <template #header>
                <i :class="service.icon" :visible="service.icon"></i>
              </template>
              <template #title>{{ service.name }}</template>
              <template #content>
                <p class="m-0">
                  {{ service.description }}
                </p>
              </template>
            </Card>
          </div>
        </div>

        <h1>Config</h1>

        <div class="configs">
          <div class="config">
            <Card>
              <template #title>Settings</template>
              <template #content>
                <Button outlined @click="openSettings($event)">
                  <tune-icon v-tooltip="$t(`tooltips.settings`)" :size="50" />
                </Button>
              </template>
            </Card>
          </div>
        </div>

        <settings v-if="settingsDialogVisible" />
        <Toast />
      </div>
    </div>
  </div>
</template>

<script>
  import { getModule } from "vuex-module-decorators"
  import MenuBar from "@/components/Menu/MenuBar.vue"
  import MainMenu from "@/components/Menu/MainMenu.vue"
  import Card from "primevue/card"
  import Button from "primevue/button"
  import TuneIcon from "vue-material-design-icons/Tune.vue"
  import Toast from "primevue/toast"
  import Settings from "@/components/Settings/Settings.vue"

  import SettingsStore from "@/store/Modules/Settings"
  const settingsModule = getModule(SettingsStore)

  import Services from "@/store/Modules/Services"
  const servicesModule = getModule(Services)

  export default {
    name: "Welcome",
    components: { Settings, Toast, MenuBar, MainMenu, Card, Button, TuneIcon },
    data() {
      return {
        experiences: [],
        services: [
          {
            id: 1,
            name: "Service 1",
            description: "Description 1",
            type: "",
            status: 1,
            url: "",
            icon: "",
            enabled: true,
          },
          {
            id: 2,
            name: "Service 2",
            description: "Description 2",
            type: "",
            status: 120,
            url: "",
            icon: "",
            enabled: true,
          },
          {
            id: 3,
            name: "Service 3",
            description: "Description 3",
            type: "",
            status: -1,
            url: "",
            icon: "",
            enabled: true,
          },
        ],
        showMainOverlayMenu: false,
        mainMenuVisible: true,
      }
    },
    computed: {
      settingsDialogVisible() {
        return settingsModule.data.settingsDialogVisible
      },
      focusMode() {
        return settingsModule.data.focus
      },
      experiencesList() {
        return this.experiences.filter((item) => item.id !== "welcome")
      },
      serviceList() {
        return this.services
        // return this.services.filter((item) => item.enabled == true)
      },
      serviceStatusColorList() {
        console.log(
          "serviceStatusColorList",
          servicesModule.serviceStatusColorList
        )
        return servicesModule.serviceStatusColorList
      },
      serviceTypeList() {
        console.log("serviceTypeList", servicesModule.serviceTypeList)
        return servicesModule.serviceTypeList
      },
      serviceStatusList() {
        console.log("serviceStatusList", servicesModule.serviceStatusList)
        return servicesModule.serviceStatusList
      },
    },
    async mounted() {
      // get all the experiences
      this.experiences = await this.getExperiences()

      // get all the services
      // this.services = await this.getServices()
    },
    methods: {
      //Onload object tag
      onObjLoad() {
        this.loading = false
      },
      toggleMainMenu() {
        this.mainMenuVisible = !this.mainMenuVisible
      },
      // get all the experiences
      async getExperiences() {
        console.log("get experiences")
        return settingsModule.data.listOfMenu
      },
      // get all the services
      async getServices() {
        console.log("get services")
        return await servicesModule.getServices()
      },
      openSettings(event) {
        console.log("open settings")
        settingsModule.openSettingsDialog("general")
      },
      openUrl(url) {
        console.log("open url", url)
        this.$router.push(url)
      },
      openService(url) {
        console.log("open service", url)
        window.open(url, "_blank")
      },
    },
  }
</script>

<style lang="scss" scoped>
  @import "./style.scss";

  .service-status {
    margin-left: auto;
    margin-right: 1rem;
    height: 1rem;
    width: 1rem;
    padding-left: 1rem;
    background-color: gray;
    border-radius: 50%;
    display: inline-block;

    //TODO: turn this into a computed property
    &[status="-10"] {
      background-color: v-bind("serviceStatusColorList['error']");
    }
    &[status="-1"] {
      background-color: v-bind("serviceStatusColorList['error']");
    }
    &[status="0"] {
      background-color: v-bind("serviceStatusColorList['disabled']");
    }
    &[status="1"] {
      background-color: v-bind("serviceStatusColorList['available']");
    }
    &[status="10"] {
      background-color: v-bind("serviceStatusColorList['available']");
    }
    &[status="11"] {
      background-color: v-bind("serviceStatusColorList['available']");
    }
    &[status="14"] {
      background-color: v-bind("serviceStatusColorList['installing']");
    }
    &[status="15"] {
      background-color: v-bind("serviceStatusColorList['installing']");
    }
    &[status="20"] {
      background-color: v-bind("serviceStatusColorList['installing']");
    }
    &[status="25"] {
      background-color: v-bind("serviceStatusColorList['installing']");
    }
    &[status="30"] {
      background-color: v-bind("serviceStatusColorList['installed']");
    }
    &[status="50"] {
      background-color: v-bind("serviceStatusColorList['available']");
    }
    &[status="65"] {
      background-color: v-bind("serviceStatusColorList['stopping']");
    }
    &[status="70"] {
      background-color: v-bind("serviceStatusColorList['stopping']");
    }
    &[status="75"] {
      background-color: v-bind("serviceStatusColorList['stopping']");
    }
    &[status="80"] {
      background-color: v-bind("serviceStatusColorList['stopped']");
    }
    &[status="90"] {
      background-color: v-bind("serviceStatusColorList['starting']");
    }
    &[status="100"] {
      background-color: v-bind("serviceStatusColorList['starting']");
    }
    &[status="104"] {
      background-color: v-bind("serviceStatusColorList['starting']");
    }
    &[status="105"] {
      background-color: v-bind("serviceStatusColorList['starting']");
    }
    &[status="120"] {
      background-color: v-bind("serviceStatusColorList['started']");
    }
    &[status="200"] {
      background-color: v-bind("serviceStatusColorList['completedwerror']");
    }
    &[status="220"] {
      background-color: v-bind("serviceStatusColorList['completed']");
    }
  }

  .p-card {
    &[status="-10"] {
      background-color: v-bind("serviceStatusColorList['error']");
    }
    &[status="-1"] {
      background-color: v-bind("serviceStatusColorList['error']");
    }
    &[status="0"] {
      background-color: v-bind("serviceStatusColorList['disabled']");
    }
    &[status="1"] {
      background-color: v-bind("serviceStatusColorList['available']");
    }
    &[status="10"] {
      background-color: v-bind("serviceStatusColorList['available']");
    }
    &[status="11"] {
      background-color: v-bind("serviceStatusColorList['available']");
    }
    &[status="14"] {
      background-color: v-bind("serviceStatusColorList['installing']");
    }
    &[status="15"] {
      background-color: v-bind("serviceStatusColorList['installing']");
    }
    &[status="20"] {
      background-color: v-bind("serviceStatusColorList['installing']");
    }
    &[status="25"] {
      background-color: v-bind("serviceStatusColorList['installing']");
    }
    &[status="30"] {
      background-color: v-bind("serviceStatusColorList['installed']");
    }
    &[status="50"] {
      background-color: v-bind("serviceStatusColorList['available']");
    }
    &[status="65"] {
      background-color: v-bind("serviceStatusColorList['stopping']");
    }
    &[status="70"] {
      background-color: v-bind("serviceStatusColorList['stopping']");
    }
    &[status="75"] {
      background-color: v-bind("serviceStatusColorList['stopping']");
    }
    &[status="80"] {
      background-color: v-bind("serviceStatusColorList['stopped']");
    }
    &[status="90"] {
      background-color: v-bind("serviceStatusColorList['starting']");
    }
    &[status="100"] {
      background-color: v-bind("serviceStatusColorList['starting']");
    }
    &[status="104"] {
      background-color: v-bind("serviceStatusColorList['starting']");
    }
    &[status="105"] {
      background-color: v-bind("serviceStatusColorList['starting']");
    }
    &[status="120"] {
      background-color: v-bind("serviceStatusColorList['started']");
    }
    &[status="200"] {
      background-color: v-bind("serviceStatusColorList['completedwerror']");
    }
    &[status="220"] {
      background-color: v-bind("serviceStatusColorList['completed']");
    }
  }
</style>
