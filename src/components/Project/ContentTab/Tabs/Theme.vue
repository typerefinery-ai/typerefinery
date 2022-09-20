<template>
  <div class="theme-container">
    <div class="field">
      <label for="label">{{ $t(`components.theme.theme`) }}</label>
      <div class="field">
        <Dropdown
          :model-value="selectedTheme"
          :options="themes"
          option-label="label"
          placeholder="Select a theme"
          @change="handleTheme"
          @input="handleInput($event)"
        />
      </div>
    </div>
    <div class="field">
      <div id="query_view_cm" class="shadow-3">
        <codemirror
          :model-value="theme"
          placeholder="Add your theme here.."
          :style="{ height: '400px' }"
          :autofocus="true"
          :indent-with-tab="true"
          :tab-size="2"
          :extensions="extensions"
          @change="handleInputCode($event)"
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
  // import Themes from "@/store/Modules/Themes"
  import axios from "axios"
  const settingsModule = getModule(Settings)
  const projectsModule = getModule(Projects)
  // const themeModule = getModule(Themes)
  export default {
    name: "ThemeContent",
    components: {
      Dropdown,
      Codemirror,
    },
    props: {
      tab: { type: Object, required: true },
    },
    data() {
      return {
        selectedTheme: { label: "webcola_flatly", key: "webcola_flatly" },
      }
    },
    computed: {
      extensions() {
        return settingsModule.data.theme === "dark"
          ? [javascript(), oneDark]
          : [javascript()]
      },
      themes() {
        const { parentIdx: projectIdx } = this.tab
        const themes = projectsModule.getProjects[projectIdx].themes
        const output = []
        for (let theme in themes.list[0].data) {
          output.push({ label: theme, key: theme })
        }
        return output
      },
      theme() {
        const { parentIdx: projectIdx } = this.tab
        const themes = projectsModule.getProjects[projectIdx].themes
        const output = JSON.stringify(
          themes.list[0].data[this.selectedTheme.key],
          null,
          "\t"
        )
        return output
      },
    },
    methods: {
      handleInputCode(editor) {
        // console.log("project-tab", this.tab)
        // console.log(editor.target)
        const payload = {
          selectedtheme: this.selectedTheme,
          code: editor,
          ...this.tab,
        }
        console.log("theme1", payload)
        // projectsModule.updateTheme(JSON.stringify(payload))
        projectsModule.setThemeData(JSON.stringify(payload))
      },
      handleTheme({ value }) {
        // console.log(themeModule.getThemes)
        this.selectedTheme = value
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
