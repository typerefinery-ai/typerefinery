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
            {{ $t(`components.setting.${setting.id}`) }}
          </li>
        </ul>
      </div>
      <div class="menu-content">
        <h4 v-if="selected == 'general'">
          {{ $t("components.setting.general-settings") }}
        </h4>
        <profile-setting v-if="selected == 'profile'" :field="path.tabField" />
        <h4 v-if="selected == 'privacy'">
          {{ $t("components.setting.privacy-settings") }}
        </h4>
      </div>
    </div>
  </Dialog>
</template>

<script>
  import Dialog from "primevue/dialog"
  import { getModule } from "vuex-module-decorators"
  import ProfileSetting from "./ProfileSetting.vue"
  import AppSettings from "@/store/Modules/AppSettings"
  const appSettings = getModule(AppSettings)

  export default {
    name: "Settings",
    components: { Dialog, ProfileSetting },
    emits: ["hide"],
    computed: {
      selected() {
        return appSettings.settingPath?.split("/")[0]
      },
      settings() {
        return appSettings.settings
      },
      path() {
        const path = appSettings.settingPath?.split("/")
        return {
          tab: path[0],
          tabField: path[1],
        }
      },
    },
    methods: {
      closeDialog() {
        appSettings.toggleSettingsDialog()
      },
      changeTab(id) {
        this.selected = id
        appSettings.setSettingPath(id)
      },
    },
  }
</script>

<style lang="scss">
  @import "./Settings.scss";
</style>
