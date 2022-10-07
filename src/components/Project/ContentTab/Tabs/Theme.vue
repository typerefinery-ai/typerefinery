<template>
  <div class="theme-container">
    <div class="grid formgrid theme-form">
      <div class="col-12 p-fluid">
        <div class="field">
          <label for="label">{{ $t("components.tabtheme.label") }}</label>
          <InputText
            id="label"
            v-model="label"
            aria-describedby="label"
            :placeholder="$t(`components.tabtheme.label-placeholder`)"
            @input="handleInputLabel($event, 'label')"
          />
        </div>
      </div>
      <div class="col-12 p-fluid">
        <div class="field">
          <label for="icon">{{ $t("components.tabtheme.icon") }}</label>
          <InputText
            id="icon"
            v-model="icon"
            aria-describedby="label"
            :placeholder="$t(`components.tabtheme.icon-placeholder`)"
            @input="handleInputLabel($event, 'icon')"
          />
        </div>
      </div>
      <div class="col-12 p-fluid">
        <div class="field">
          <label for="description">{{ $t("components.tabtheme.des") }}</label>
          <InputText
            id="description"
            v-model="description"
            aria-describedby="label"
            :placeholder="$t(`components.tabtheme.des-placeholder`)"
            @input="handleInputLabel($event, 'description')"
          />
        </div>
      </div>
      <div class="col-12 p-fluid">
        <div class="field">
          <label for="icon">{{ $t("components.tabtheme.theme") }}</label>
          <div id="query_view_cm" class="shadow-3">
            <codemirror
              :model-value="code"
              :placeholder="$t(`components.tabtheme.code-placeholder`)"
              :style="{ height: '400px' }"
              :autofocus="true"
              :indent-with-tab="true"
              :tab-size="2"
              :extensions="extensions"
              @change="handleInputCode($event, 'theme')"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { getModule } from "vuex-module-decorators"
  import Dropdown from "primevue/dropdown"
  import { Codemirror } from "vue-codemirror"
  import { javascript } from "@codemirror/lang-javascript"
  import { oneDark } from "@codemirror/theme-one-dark"
  import Settings from "@/store/Modules/Settings"
  import Projects from "@/store/Modules/Projects"
  import InputText from "primevue/inputtext"
  import Themes from "@/store/Modules/Theme"
  import axios from "axios"
  const settingsModule = getModule(Settings)
  const projectsModule = getModule(Projects)
  const themesModule = getModule(Themes)
  export default {
    name: "ThemeContent",
    components: {
      // Dropdown,
      Codemirror,
      InputText,
    },
    props: {
      tab: { type: Object, required: true },
    },
    data() {
      return {
        code: "",
        debounce: null,
        label: "",
        icon: "",
        description: "",
      }
    },
    computed: {
      extensions() {
        return settingsModule.data.theme === "dark"
          ? [javascript(), oneDark]
          : [javascript()]
      },
    },
    mounted() {
      this.setInitialData()
    },
    methods: {
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
      },
      async handleInputLabel({ target: { value } }, field) {
        clearTimeout(this.debounce)
        this.debounce = setTimeout(async () => {
          const { parent, id } = this.tab
          const projects = projectsModule.getProjects
          const projectIdx = projects.findIndex((el) => el.id === parent)
          if (projectIdx != -1) {
            const themes = projectsModule.getLocalThemes(projectIdx)
            const themeIdx = themes.findIndex((el) => el.id === id)
            const payload = { field, value, themeIdx, ...this.tab }
            await projectsModule.setThemeData(payload)
          } else {
            // global
            const themes = themesModule.getGlobalThemes
            const themeIdx = themes.findIndex((el) => el.id === id)
            const payload = { field, value, themeIdx, ...this.tab }
            await themesModule.setGlobalTheme(payload)
          }
        }, 500)
      },
      async handleInputCode(value, field) {
        clearTimeout(this.debounce)
        this.debounce = setTimeout(async () => {
          const { parent, id } = this.tab
          const projects = projectsModule.getProjects
          const projectIdx = projects.findIndex((el) => el.id === parent)
          if (projectIdx != -1) {
            const themes = projectsModule.getLocalThemes(projectIdx)
            const themeIdx = themes.findIndex((el) => el.id === id)
            const payload = { field, value, themeIdx, ...this.tab }
            await projectsModule.setThemeData(payload)
          } else {
            // global
            const themes = themesModule.getGlobalThemes
            const themeIdx = themes.findIndex((el) => el.id === id)
            const payload = { field, value, themeIdx, ...this.tab }
            await themesModule.setGlobalTheme(payload)
          }
        }, 500)
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
</style>
