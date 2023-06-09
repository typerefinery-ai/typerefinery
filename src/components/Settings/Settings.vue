<template>
  <Dialog
    class="settings-dialog"
    header="Settings"
    :closable="false"
    modal
    :visible="true"
    :breakpoints="{ '960px': '75vw', '640px': '100vw' }"
  >
    <template #header>
      <span class="p-dialog-title">{{
        $t("components.setting.settings")
      }}</span>
      <div class="p-dialog-header-icons">
        <button
          class="p-dialog-header-icon p-dialog-header-close p-link"
          aria-label="close"
          type="button"
          @click="closeDialog"
        >
          <span class="p-dialog-header-close-icon pi pi-times"></span>
        </button>
      </div>
    </template>
    <div class="content_wrapper">
      <div class="menu-list">
        <ul>
          <li
            v-for="setting in settings"
            :key="setting.id"
            :class="{ selected: selected == setting.id }"
            @click="changeTab(setting.id)"
          >
            <i :class="setting.icon"></i>
            {{ $t(`components.setting.section.${setting.id}`) }}
          </li>
        </ul>
      </div>
      <div class="menu-content">
        <!-- section content -->
        <!-- general -->
        <general-info v-if="selected == 'general'" />
        <!-- profile -->
        <profile-info v-if="selected == 'profile'" :field="path.tabField" />

        <!-- privacy -->
        <h4 v-if="selected == 'privacy'">
          {{ $t("components.setting.privacy-settings") }}
        </h4>
        <!-- services -->
        <services-list
          v-if="selected == 'services'"
          :variant="'table'"
          :field="path.tabField"
        />
        <!-- config tab -->
        <config v-if="selected == 'config'" :field="path.tabField" />
      </div>
    </div>
  </Dialog>
</template>

<script>
  import { getModule } from "vuex-module-decorators"
  import Dialog from "primevue/dialog"
  import ProfileInfo from "./Profile.vue"
  import GeneralInfo from "./General.vue"
  import ServicesList from "../Services"
  import Config from "./Config.vue"
  import Settings from "@/store/Modules/Settings"
  import Services from "@/store/Modules/Services"
  const settingsModule = getModule(Settings)
  const servicesModule = getModule(Services)

  export default {
    name: "Settings",
    components: { Dialog, ProfileInfo, GeneralInfo, ServicesList, Config },
    emits: ["hide"],
    data() {
      return {
        selected: settingsModule.data.settingPath?.split("/")[0],
      }
    },
    computed: {
      settings() {
        return settingsModule.data.settings
      },
      path() {
        const path = settingsModule.data.settingPath?.split("/")
        return {
          tab: path[0], // used to navigate to a tab
          tabField: path[1], // used to navigate to a field in the tab
        }
      },
    },
    mounted() {
      console.log("path", this.path)
    },
    methods: {
      closeDialog() {
        settingsModule.toggleSettingsDialog()
      },
      changeTab(id) {
        this.selected = id
        servicesModule.setSelectedServices(null)
        settingsModule.setSettingPath(id)
      },
    },
  }
</script>

<style lang="scss">
  @import "./Settings.scss";
</style>
