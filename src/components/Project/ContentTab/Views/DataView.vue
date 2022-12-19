<template>
  <div ref="datawrapper" class="data-view-wrapper h-full">
    <div class="refresh-data">
      <Button
        :label="$t('components.data.refresh')"
        :icon="`pi ${loading ? 'pi-spin pi-refresh' : 'pi-refresh'}`"
        :style="{ 'pointer-events': loading ? 'none' : 'auto' }"
        @click="handleRequest"
      />
    </div>
    <div id="data_view_cm" class="shadow-3">
      <codemirror
        :model-value="data"
        placeholder="NO DATA"
        :style="{ height: '60vh' }"
        :autofocus="true"
        :indent-with-tab="true"
        :tab-size="2"
        :extensions="extensions"
        @change="handleData"
      />
    </div>
  </div>
</template>

<script>
  import { getModule } from "vuex-module-decorators"
  import { Codemirror } from "vue-codemirror"
  import { javascript } from "@codemirror/lang-javascript"
  import { oneDark } from "@codemirror/theme-one-dark"
  import * as d3 from "d3"
  import axios from "axios"
  import Button from "primevue/button"
  import Settings from "@/store/Modules/Settings"
  import Projects from "@/store/Modules/Projects"
  const settingsModule = getModule(Settings)
  const projectsModule = getModule(Projects)

  export default {
    name: "DataView",
    components: { Codemirror, Button },
    props: {
      tab: { type: Object, required: true },
      view: { type: String, required: true },
    },
    data() {
      return {
        data: "",
        loading: false,
      }
    },
    computed: {
      extensions() {
        return settingsModule.data.theme === "dark"
          ? [javascript(), oneDark]
          : [javascript()]
      },
      viewResized() {
        return settingsModule.data.viewResized
      },
      path() {
        const { projectIdx, queryIdx } = this.tab
        return projectsModule.getQuery(projectIdx, queryIdx).dataPath
      },
      origin() {
        const { projectIdx, queryIdx } = this.tab
        const endpoint = projectsModule.getQuery(projectIdx, queryIdx).endpoint
        return new URL(endpoint).origin
      },
    },
    watch: {
      viewResized() {
        setTimeout(() => this.setEditorHeight(), 0)
      },
      path() {
        this.getData()
      },
    },
    mounted() {
      setTimeout(() => this.setEditorHeight(), 0)
      this.getData()
    },
    methods: {
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
      async handleRequest() {
        this.loading = true
        this.data = "loading..."
        const response = await projectsModule.runAlgorithm(this.tab)
        if (response.type == "data") {
          this.loading = false
          this.getData()
        } else {
          this.loading = false
        }
      },
      async getData() {
        if (this.path) {
          try {
            this.data = "loading..."
            const { data } = await restapi.get(this.origin + this.path)
            this.data = JSON.stringify(data, null, "\t")
          } catch (err) {
            this.data = "Unable to fetch data"
            console.log(err)
          }
        }
      },
      handleData(data) {
        this.data = data
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
