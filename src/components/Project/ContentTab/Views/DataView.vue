<template>
  <div ref="datawrapper" class="data-view-wrapper h-full">
    <div class="refresh-data">
      <Button label="Refresh" icon="pi pi-refresh" />
    </div>
    <div id="data_view_cm" class="shadow-3">
      <codemirror
        :model-value="data"
        placeholder="Code goes here..."
        :style="{ height: '60vh' }"
        :autofocus="true"
        :indent-with-tab="true"
        :tab-zize="2"
        :extensions="extensions"
        @change="handleChange"
      />
    </div>
  </div>
</template>

<script>
  import { Codemirror } from "vue-codemirror"
  import GRAPH_DATA from "@/components/Transformer/D3/miserables.json"
  import Button from "primevue/button"
  import { javascript } from "@codemirror/lang-javascript"
  import { oneDark } from "@codemirror/theme-one-dark"
  import AppSettings from "@/store/Modules/AppSettings"
  import { getModule } from "vuex-module-decorators"
  const appSettings = getModule(AppSettings)
  // FIXME: add new line character to it
  const data = JSON.stringify(GRAPH_DATA)

  export default {
    name: "DataView",
    components: { Codemirror, Button },
    props: {
      view: { type: String, required: true },
    },
    data() {
      return {
        data: data,
      }
    },
    computed: {
      extensions() {
        return appSettings.theme === "dark"
          ? [javascript(), oneDark]
          : [javascript()]
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
      handleChange(data) {
        this.data = data
      },
      setEditorHeight() {
        if (this.view !== "D") return
        const wrapper = this.$refs.datawrapper
        const editor = document.querySelector("#data_view_cm .cm-editor")
        if (wrapper) {
          editor.style.setProperty("display", "none", "important")
          editor.style.height = wrapper.clientHeight - 75 + "px"
          editor.style.setProperty("display", "flex", "important")
        }
      },
    },
  }
</script>

<style scoped lang="scss">
  .data-view-wrapper {
    padding: 1rem;

    .refresh-data {
      text-align: right;
      margin-bottom: 1rem;
    }
  }
</style>
