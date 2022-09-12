<template>
  <div ref="querywrapper" class="query-view-wrapper h-full">
    <div class="card">
      <div class="card-container text-left">
        <div class="field p-4 pb-2">
          <label for="label">{{ $t(`components.project.name`) }}</label>
          <InputText
            id="label"
            :model-value="label"
            class="w-full"
            type="text"
            @input="handleInput($event, 'label')"
          />
        </div>

        <div class="field m-4 my-2">
          <label for="query">{{ $t(`components.tab.query`) }}</label>
          <div id="query_view_cm" class="shadow-3">
            <codemirror
              :model-value="query"
              placeholder="Add your query here.."
              :style="{ height: '320px' }"
              :autofocus="true"
              :indent-with-tab="true"
              :tab-size="2"
              :extensions="extensions"
              @change="handleQuery"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { Codemirror } from "vue-codemirror"
  import { javascript } from "@codemirror/lang-javascript"
  import { oneDark } from "@codemirror/theme-one-dark"
  import { getModule } from "vuex-module-decorators"
  import InputText from "primevue/inputtext"
  import Projects from "@/store/Modules/Projects"
  import Settings from "@/store/Modules/Settings"
  const projectsModule = getModule(Projects)
  const settingsModule = getModule(Settings)
  export default {
    name: "QueryView",
    components: { InputText, Codemirror },
    props: {
      tab: { type: Object, required: true },
      view: { type: String, required: true },
    },
    computed: {
      extensions() {
        return settingsModule.data.theme === "dark"
          ? [javascript(), oneDark]
          : [javascript()]
      },
      label() {
        const { projectIdx, queryIdx } = this.tab
        return projectsModule.getQuery(projectIdx, queryIdx).label
      },
      query() {
        const { projectIdx, queryIdx } = this.tab
        return projectsModule.getQuery(projectIdx, queryIdx).query
      },
      viewResized() {
        return settingsModule.data.viewResized
      },
    },
    watch: {
      viewResized() {
        setTimeout(() => this.setEditorHeight(), 0)
      },
    },
    mounted() {
      setTimeout(() => this.setEditorHeight(), 0)
    },
    methods: {
      handleInput({ target: { value } }, field) {
        const payload = { field, value, ...this.tab }
        projectsModule.updateQuery(payload)
      },
      handleQuery(code) {
        const payload = { field: "query", value: code, ...this.tab }
        projectsModule.updateQuery(payload)
      },
      setEditorHeight() {
        if (this.view !== "Q") return
        const wrapper = this.$refs.querywrapper
        const editor = document.querySelector("#query_view_cm .cm-editor")
        if (wrapper) {
          editor.style.setProperty("display", "none", "important")
          editor.style.height = wrapper.clientHeight - 143 + "px"
          editor.style.setProperty("display", "flex", "important")
        }
      },
    },
  }
</script>
