<template>
  <div class="theme-container">
    <div class="grid formgrid theme-form">
      <div class="col-6 p-fluid">
        <div class="field">
          <label for="label">{{ $t("components.tabtheme.label") }}*</label>
          <InputText
            id="label"
            :model-value="label"
            aria-describedby="label"
            :placeholder="$t(`components.tabtheme.theme-name`)"
            @input="handleLabel($event)"
          />
          <span v-if="error" class="p-error">{{ error }}</span>
        </div>
      </div>
      <div class="col-6 p-fluid">
        <div class="field">
          <label for="icon">{{ $t("components.tabtheme.icon") }}</label>
          <InputText
            id="icon"
            v-model.trim="icon"
            aria-describedby="label"
            :placeholder="$t(`components.tabtheme.icon-placeholder`)"
            @input="handleInput('icon', $event.target.value)"
          />
        </div>
      </div>
      <div class="col-12 p-fluid">
        <div class="field">
          <label for="description">{{ $t("components.tabtheme.des") }}</label>
          <InputText
            id="description"
            v-model.trim="description"
            aria-describedby="label"
            :placeholder="$t(`components.tabtheme.des-placeholder`)"
            @input="handleInput('description', $event.target.value)"
          />
        </div>
      </div>
      <div class="col-12 p-fluid">
        <div class="field">
          <label for="icon">{{ $t("components.tabtheme.theme") }}</label>
          <div class="shadow-3">
            <codemirror
              v-model="code"
              :placeholder="$t(`components.tabtheme.code-placeholder`)"
              :style="{ height: '250px' }"
              :autofocus="true"
              :indent-with-tab="true"
              :tab-size="2"
              :extensions="extensions"
              @change="handleInput('code', $event)"
            />
          </div>
        </div>
      </div>
      <div class="col-12">
        <Button
          :label="$t(`components.dialog.projects.info.save`)"
          :disabled="checkTabIfDirty() || Boolean(error) || !label.length"
          class="p-button-raised mr-2"
          @click="saveTheme"
        />
        <Button
          :label="$t(`components.dialog.projects.info.saveas`)"
          class="p-button-raised"
          @click="handleDialog"
        />
      </div>
    </div>
    <Dialog
      v-model:visible="showDialog"
      class="save-theme-dialog"
      modal
      :header="$t(`components.tabtheme.save-theme-as`)"
      :style="{ width: '400px' }"
    >
      <div class="dialog-content">
        <div class="field">
          <label for="label">{{ $t("components.tabtheme.label") }}</label>
          <InputText
            id="themeName"
            v-model.trim="themeName"
            type="text"
            :placeholder="$t(`components.tabtheme.theme-name`)"
          />
          <span v-if="dialogError" class="p-error">{{ dialogError }}</span>
        </div>
        <Button
          class="p-button-raised mr-2"
          :disabled="!themeName.length"
          :label="$t(`components.tabtheme.save-as-global`)"
          @click="saveNewTheme('global')"
        />
        <Button
          v-if="isLocal"
          class="p-button-raised p-button-success"
          :disabled="!themeName.length"
          :label="$t(`components.tabtheme.save-as-local`)"
          @click="saveNewTheme('local')"
        />
      </div>
    </Dialog>
  </div>
</template>
<script>
  import { getModule } from "vuex-module-decorators"
  import { Codemirror } from "vue-codemirror"
  import { javascript } from "@codemirror/lang-javascript"
  import { oneDark } from "@codemirror/theme-one-dark"
  import { nanoid } from "nanoid"
  import Dialog from "primevue/dialog"
  import Button from "primevue/button"
  import Settings from "@/store/Modules/Settings"
  import Projects from "@/store/Modules/Projects"
  import InputText from "primevue/inputtext"
  import Themes from "@/store/Modules/Theme"
  import { errorToast, successToast } from "@/utils/toastService"
  import restapi from "@/utils/restapi"
  const settingsModule = getModule(Settings)
  const projectsModule = getModule(Projects)
  const themesModule = getModule(Themes)
  export default {
    name: "ThemeContent",
    components: {
      Button,
      Codemirror,
      InputText,
      Dialog,
    },
    props: {
      tab: { type: Object, required: true },
      dirtyTabs: { type: Object, required: true },
    },
    emits: ["input", "check-tab-if-dirty"],
    data() {
      return {
        code: "",
        debounce: null,
        label: "",
        icon: "",
        description: "",
        showDialog: false,
        themeName: "",
        dialogError: "",
        error: "",
        initialData: {
          label: "",
          code: "",
          description: "",
          icon: "",
        },
        dirtyStack: new Set(),
      }
    },
    computed: {
      extensions() {
        return settingsModule.data.theme === "dark"
          ? [javascript(), oneDark]
          : [javascript()]
      },
      isLocal() {
        return Boolean(this.tab.parent)
      },
    },
    mounted() {
      this.setInitialData()
    },
    methods: {
      checkTabIfDirty() {
        return !this.dirtyTabs[this.tab.id]
      },
      handleInput(key, value) {
        const oldDirtyStackSize = this.dirtyStack.size
        if (this.initialData[key].trim() !== value.trim()) {
          this.dirtyStack.add(key)
        } else {
          if (this.dirtyStack.has(key) === true) {
            this.dirtyStack.delete(key)
          }
        }
        const newDirtyStackSize = this.dirtyStack.size
        if (newDirtyStackSize === 0) {
          this.setFormDirty(false)
        } else {
          if (oldDirtyStackSize === 0) {
            this.setFormDirty(true)
          }
        }
      },
      setFormDirty(val = true) {
        const payload = { id: this.tab.id, isDirty: val }
        this.$emit("input", payload)
      },
      setInitialData() {
        const { parent, id } = this.tab
        const projects = projectsModule.getProjects
        const projectIdx = projects.findIndex((el) => el.id === parent)
        let themeData
        if (projectIdx != -1) {
          // local
          const themes = projectsModule.getLocalThemes(projectIdx)
          const themeIdx = themes.findIndex((el) => el.id === id)
          themeData = themes[themeIdx]
          // const project = projectsModule.getProjects[projectIdx]
          // connection = project.connections.list[connectionIdx]
        } else {
          // global
          const themes = themesModule.getGlobalThemes
          const themeIdx = themes.findIndex((el) => el.id === id)
          themeData = themesModule.data.list[themeIdx]
        }
        // const { theme } = themeData
        // this.code = theme
        const { theme, label, icon, description } = themeData
        this.code = theme
        this.label = label
        this.icon = icon
        this.description = description
        this.initialData = {
          code: theme,
          label,
          icon,
          description,
        }
      },
      async saveTheme() {
        if (this.error) return
        const { parent, id } = this.tab
        const projects = projectsModule.getProjects
        const projectIdx = projects.findIndex((el) => el.id === parent)
        if (projectIdx != -1) {
          const themes = projectsModule.getLocalThemes(projectIdx)
          const themeIdx = themes.findIndex((el) => el.id === id)
          const data = {
            ...themes[themeIdx],
            label: this.label,
            icon: this.icon,
            description: this.description,
            theme: this.code,
          }
          await projectsModule.setThemeData({ data, themeIdx, projectIdx })
        } else {
          // global
          const themes = themesModule.getGlobalThemes
          const themeIdx = themes.findIndex((el) => el.id === id)
          const data = {
            ...themes[themeIdx],
            label: this.label,
            icon: this.icon,
            description: this.description,
            theme: this.code,
          }
          const payload = { data, themeIdx }
          await themesModule.setGlobalTheme(payload)
        }
        //Updating Initial Data
        this.initialData = {
          code: this.code,
          label: this.label,
          icon: this.icon,
          description: this.description,
        }
        this.setFormDirty(false)
        this.dirtyStack = new Set()
        successToast(this, this.$t("components.tabtheme.save-theme"))
      },
      handleLabel({ target: { value } }) {
        clearTimeout(this.debounce)
        this.debounce = setTimeout(async () => {
          this.label = value.trim()
          this.handleInput("label", value)
          const { parent, id } = this.tab
          const projects = projectsModule.getProjects
          const projectIdx = projects.findIndex((el) => el.id === parent)
          if (projectIdx === -1) {
            const themes = themesModule.getGlobalThemes.filter(
              (el) => el.id !== id
            )
            const themeExists = themes.find(
              (el) => el.label.toLowerCase() === value.toLowerCase().trim()
            )
            if (themeExists) {
              this.error = this.$t("components.tabtheme.theme-error", {
                error: `${value}`,
              })
            } else {
              this.error = ""
            }
          } else {
            const themes = projectsModule
              .getLocalThemes(projectIdx)
              .filter((el) => el.id !== id)
            const themeExists = themes.find(
              (el) => el.label.toLowerCase() === value.toLowerCase().trim()
            )
            if (themeExists) {
              this.error = this.error = this.$t(
                "components.tabtheme.theme-error",
                {
                  error: `${value}`,
                }
              )
            } else {
              this.error = ""
            }
          }
        }, 500)
      },
      checkExists(scope, label) {
        const { parent } = this.tab
        const projects = projectsModule.getProjects
        const projectIdx = projects.findIndex((el) => el.id === parent)
        if (scope === "global") {
          const themes = themesModule.getGlobalThemes
          const themeExists = themes.find(
            (el) => el.label.toLowerCase() === label.toLowerCase().trim()
          )
          if (themeExists) {
            this.dialogError = this.error = this.$t(
              "components.tabtheme.theme-error",
              {
                error: `${label}`,
              }
            )
            return true
          } else {
            this.dialogError = ""
            return false
          }
        } else {
          const themes = projectsModule.getLocalThemes(projectIdx)
          const themeExists = themes.find(
            (el) => el.label.toLowerCase() === label.toLowerCase().trim()
          )
          if (themeExists) {
            this.dialogError = this.error = this.$t(
              "components.tabtheme.theme-error",
              {
                error: `${label}`,
              }
            )
            return true
          } else {
            this.dialogError = ""
            return false
          }
        }
      },
      handleDialog() {
        this.showDialog = !this.showDialog
      },
      async saveNewTheme(scope) {
        const { parent: projectId } = this.tab
        const projects = projectsModule.getProjects
        const projectIdx = projects.findIndex((el) => el.id === projectId)
        const themeId = nanoid(14)
        const data = {
          label: this.themeName, // new theme
          id: themeId,
          projectid: projectId,
          scope: projectIdx == -1 ? "global" : "local",
          type: "theme",
          data: "",
          icon: this.icon,
          themeid: themeId,
          description: this.description,
          theme: this.code,
        }
        try {
          if (scope === "global") {
            if (!this.checkExists("global", this.themeName)) {
              await restapi.post("/datastore/theme", data)
              themesModule.addGlobalTheme(data)
              this.showDialog = false
              this.themeName = ""
              this.setFormDirty(false)
              successToast(
                this,
                this.$t("components.tabtheme.theme-save-globally")
              )
            }
          } else if (scope === "local") {
            if (!this.checkExists("local", this.themeName)) {
              await restapi.post("/datastore/theme", data)
              projectsModule.addLocalTheme({ projectIdx, data })
              this.showDialog = false
              this.themeName = ""
              this.setFormDirty(false)
              successToast(
                this,
                this.$t("components.tabtheme.theme-save-locally")
              )
            }
          }
        } catch (err) {
          console.log(err)
          errorToast(this)
        }
      },
    },
  }
</script>
<style lang="scss">
  .theme-container {
    padding: 2rem 1.75rem;
    .theme-form {
      margin-top: -0.75rem;
    }
  }
  div.save-theme-dialog.p-dialog {
    .p-dialog-content {
      padding-bottom: 1.5rem;
      input {
        width: 100%;
      }
    }
  }
</style>
