<template>
  <div class="theme-container">
    <div class="field">
      <div id="query_view_cm" class="shadow-3">
        <codemirror
          :model-value="code"
          placeholder="Add your theme here.."
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
</template>

<script>
  import { getModule } from "vuex-module-decorators"
  import Dropdown from "primevue/dropdown"
  import { Codemirror } from "vue-codemirror"
  import { javascript } from "@codemirror/lang-javascript"
  import { oneDark } from "@codemirror/theme-one-dark"
  import Settings from "@/store/Modules/Settings"
  import Projects from "@/store/Modules/Projects"
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
    },
    props: {
      tab: { type: Object, required: true },
    },
    data() {
      return {
        code: "",
        debounce: null,
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
        const { parentIdx: projectIdx, key } = this.tab
        const themeIdx = key.split("-").pop()
        let themeData
        if (projectIdx != null || projectIdx != undefined) {
          // local
          const themes = projectsModule.getLocalThemes(projectIdx)
          themeData = themes[themeIdx]
          // const project = projectsModule.getProjects[projectIdx]
          // connection = project.connections.list[connectionIdx]
        } else {
          // global
          themeData = themesModule.data.list[themeIdx]
        }
        const { theme } = themeData
        this.code = theme
      },
      async handleInputCode(value, field) {
        clearTimeout(this.debounce)
        this.debounce = setTimeout(async () => {
          const { parentIdx: projectIdx, key: id } = this.tab
          const themeIdx = id.split("-").pop()
          if (projectIdx != null || projectIdx != undefined) {
            const payload = { field, value, themeIdx, ...this.tab }
            await projectsModule.setThemeData(payload)
          } else {
            // global
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
    padding: 1rem;

    .p-dropdown {
      max-width: 100%;
      width: 100%;
      display: flex;

      border-bottom: 1px solid var(--surface-border);
      flex-flow: wrap;
    }
  }
</style>
