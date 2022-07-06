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
              :tab-zize="2"
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
  import InputText from "primevue/inputtext"
  //   import Textarea from "primevue/textarea"
  import AppData from "@/store/Modules/Projects"
  import Settings from "@/store/Modules/AppSettings"
  import { getModule } from "vuex-module-decorators"
  const appData = getModule(AppData)
  const appSettings = getModule(Settings)
  export default {
    name: "QueryView",
    components: { InputText, Codemirror },
    props: {
      tab: { type: Object, required: true },
      view: { type: String, required: true },
    },
    computed: {
      extensions() {
        return appSettings.theme === "dark"
          ? [javascript(), oneDark]
          : [javascript()]
      },
      label() {
        const { projectIdx, queryIdx } = this.tab
        return appData.list[0].list[projectIdx].queries.list[queryIdx].label
      },
      query() {
        const { projectIdx, queryIdx } = this.tab
        return appData.list[0].list[projectIdx].queries.list[queryIdx].query
      },
      viewResized() {
        return appSettings.viewResized
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
      handleInput({ target: { value } }, key) {
        const payload = { key, value, ...this.tab }
        appData.updateQuery(payload)
      },
      handleQuery(code) {
        const payload = { key: "query", value: code, ...this.tab }
        appData.updateQuery(payload)
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
