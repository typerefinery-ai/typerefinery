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
            v-for="experience in experiences"
            :key="experience.id"
          >
            <Card>
              <template #header>
                <img alt="user header" :src="experience.image" />
              </template>
              <template #title>{{ experience.title }}</template>
              <template #subtitle>{{ experience.subtitle }}</template>
              <template #content>
                <p class="m-0">
                  {{ experience.description }}
                </p>
              </template>
              <template #footer>
                <div class="flex gap-3 mt-1">
                  <Button label="Open" class="w-full"  />
                </div>
              </template>
            </Card>
          </div>
        </div>

        <h1>Config</h1>

        <div class="config">
          <Card>
            <template #content>
              <p class="m-0">
                <!-- icon -->
                <i class="pi pi-spin pi-cog" style="font-size: 2rem"></i>
              </p>
            </template>
          </Card>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { getModule } from "vuex-module-decorators"
  import MenuBar from "@/components/Menu/MenuBar.vue"
  import MainMenu from "@/components/Menu/MainMenu.vue"
  import Settings from "@/store/Modules/Settings"
  import Services from "@/store/Modules/Services"
  import Card from "primevue/card"
  import Button from "primevue/button"
  const settingsModule = getModule(Settings)
  const servicesModule = getModule(Services)
  export default {
    name: "Welcome",
    components: { MenuBar, MainMenu, Card, Button },
    data() {
      return {
        experiences: [
          {
            id: 1,
            title: "Experience 1",
            subtitle: "Subtitle 1",
            description: "Description 1",
            image: "https://via.placeholder.com/100",
          },
          {
            id: 2,
            title: "Experience 2",
            subtitle: "Subtitle 2",
            description: "Description 2",
            image: "https://via.placeholder.com/100",
          },
          {
            id: 3,
            title: "Experience 3",
            subtitle: "Subtitle 3",
            description: "Description 3",
            image: "https://via.placeholder.com/100",
          },
        ],
      }
    },
    mounted() {
      // get all the experiences
      this.getExperiences()
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
        // this.experiences = await servicesModule.getExperiences()
      },
    },
  }
</script>

<style lang="scss" scoped>
  @import "./style.scss";
</style>
