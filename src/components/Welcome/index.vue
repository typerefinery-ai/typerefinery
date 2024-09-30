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
            class="experience"
            v-for="experience in experiencesList"
            :key="experience.id"
          >
            <Card>
              <template #header>
                <i :class="experience.icon" style="font-size: 2.5rem"></i>
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
          <div class="service" v-for="service in serviceList" :key="service.id">
            <Card>
              <template #title>{{ service.title }}</template>
              <template #content>
                <p class="m-0">
                  {{ service.description }}
                </p>
              </template>
              <template #footer>
                <div class="flex gap-3 mt-1">
                  <Button label="Open" class="w-full" />
                </div>
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
                <Button outlined class="border-2" @click="openSettings($event)">
                  <tune-icon v-tooltip="$t(`tooltips.settings`)" :size="50" />
                </Button>
              </template>
            </Card>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { isProxy, toRaw } from "vue"
  import { getModule } from "vuex-module-decorators"
  import MenuBar from "@/components/Menu/MenuBar.vue"
  import MainMenu from "@/components/Menu/MainMenu.vue"
  import Card from "primevue/card"
  import Button from "primevue/button"
  import TuneIcon from "vue-material-design-icons/Tune.vue"

  import Settings from "@/store/Modules/Settings"
  const settingsModule = getModule(Settings)

  import Services from "@/store/Modules/Services"
  const servicesModule = getModule(Services)

  export default {
    name: "Welcome",
    components: { MenuBar, MainMenu, Card, Button, TuneIcon },
    data() {
      return {
        experiences: [],
        services: [
          {
            id: 1,
            title: "Service 1",
            description: "Description 1",
          },
          {
            id: 2,
            title: "Service 2",
            description: "Description 2",
          },
          {
            id: 3,
            title: "Service 3",
            description: "Description 3",
          },
        ],
        showMainOverlayMenu: false,
        mainMenuVisible: true,
      }
    },
    computed: {
      experiencesList() {
        return this.experiences.filter((item) => item.id !== "welcome")
      },
      serviceList() {
        console.log("serviceList", servicesModule.serviceList)
        return servicesModule.serviceList
      },
    },
    async mounted() {
      // get all the experiences
      this.experiences = await this.getExperiences()

      // get all the services
      this.services = await this.getServices()
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
      handleClick(event) {
        console.log(event)
      },
    },
  }
</script>

<style lang="scss" scoped>
  @import "./style.scss";
</style>
