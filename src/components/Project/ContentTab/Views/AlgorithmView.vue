<template>
  <div ref="algowrapper" class="transformer-wrapper">
    <div class="grid">
      <div class="col-12">
        <div class="p-inputgroup">
          <InputText v-model="endpoint" />
          <Button
            :icon="`pi ${loading ? 'pi-spin pi-spinner' : 'pi-play'}`"
            class="p-button-primary"
            :style="{ 'pointer-events': loading ? 'none' : 'auto' }"
            @click="handleRequest"
          />
        </div>
      </div>
    </div>
    <div
      id="algo_view_cm"
      class="code-wrapper shadow-3"
      :class="{ error: error }"
    >
      <div class="code-tabs">
        <div class="code-tabs-head">
          <Button
            :label="$t(`components.transformer.editor`)"
            class="p-button-raised shadow-1"
            :class="{ 'p-button-text': activeTab !== 'editor' }"
            @click="handleTabs('editor')"
          />
          <Button
            :label="consoleLabel"
            :badge="error ? '1' : ''"
            badge-class="p-badge-danger"
            class="p-button-raised shadow-1"
            :class="{ 'p-button-text': activeTab !== 'console' }"
            @click="handleTabs('console')"
          />
        </div>
      </div>
      <codemirror
        v-if="activeTab == 'editor'"
        :model-value="code"
        placeholder="Code goes here..."
        :style="{ height: '70vh' }"
        :autofocus="true"
        :indent-with-tab="true"
        :tab-zize="2"
        :extensions="extensions"
        @change="handleChange"
      />
      <codemirror
        v-else
        :model-value="consoleText"
        :disabled="true"
        :style="{ height: '350px' }"
        :autofocus="true"
        :indent-with-tab="true"
        :tab-zize="2"
        :extensions="extensions"
      />
    </div>
  </div>
</template>

<script>
  import axios from "axios"
  import Button from "primevue/button"
  import { Codemirror } from "vue-codemirror"
  import { python } from "@codemirror/lang-python"
  import { oneDark } from "@codemirror/theme-one-dark"
  import AppSettings from "@/store/Modules/AppSettings"
  import AppData from "@/store/Modules/Projects"
  import { getModule } from "vuex-module-decorators"
  const appSettings = getModule(AppSettings)
  const appData = getModule(AppData)
  export default {
    name: "AlgorithmView",
    components: { Codemirror, Button },
    props: {
      tab: { type: Object, required: true },
      view: { type: String, required: true },
    },
    emits: ["render"],
    data() {
      return {
        activeTab: "editor",
        consoleText: "",
        endpoint: "http://localhost:8000/algorithm",
        loading: false, // query
        error: false,
      }
    },
    computed: {
      extensions() {
        return appSettings.theme === "dark" ? [python(), oneDark] : [python()]
      },
      consoleLabel() {
        let label = this.$t("components.transformer.console")
        if (!this.error && this.consoleText.length) {
          return label + " - " + this.consoleText.split(/\r\n|\r|\n/).length
        }
        return label
      },
      viewResized() {
        return appSettings.viewResized
      },
      code() {
        const { projectIdx, queryIdx } = this.tab
        return appData.algorithmCode(projectIdx, queryIdx)
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
      handleChange(c) {
        const { projectIdx, queryIdx } = this.tab
        const data = { code: c, projectIdx, queryIdx }
        appData.setAlgoCode(data)
      },
      handleTabs(tab) {
        this.activeTab = tab
        appSettings.resizeView()
      },
      setEditorHeight() {
        if (this.view !== "A") return
        const wrapper = this.$refs.algowrapper
        const editor = document.querySelector("#algo_view_cm .cm-editor")
        if (wrapper) {
          editor.style.setProperty("display", "none", "important")
          editor.style.height = wrapper.clientHeight - 108 + "px"
          editor.style.setProperty("display", "flex", "important")
        }
      },
      setQueryState(loading, error, text) {
        this.loading = loading
        this.error = error
        this.consoleText = text
      },
      async handleRequest() {
        this.setQueryState(true, false, "")
        try {
          const { projectIdx, queryIdx } = this.tab
          const query = appData.query(projectIdx, queryIdx)
          const payload = {
            dbhost: query.connection.host,
            dbport: query.connection.port,
            dbdatabase: query.database,
            dbquery: query.query,
            algorithm: this.code,
            algorithmrequirements: "argparse\nloguru",
            returnoutput: "log",
          }
          const response = await axios.post(this.endpoint, payload)
          const path = response.headers["output.url"].replace(
            "/output",
            ".output"
          )
          const data = { path, projectIdx, queryIdx }
          appData.setQueryDataPath(data)
          this.setQueryState(false, false, response.data)
        } catch (error) {
          this.setQueryState(false, true, error.message)
          console.log(error)
        }
      },
    },
  }
</script>

<style scoped lang="scss">
  .transformer-wrapper {
    padding: 1rem;
    height: 100%;

    .code-wrapper {
      &.error {
        border: 2px solid var(--red-400);
      }

      .code-tabs {
        &-head {
          display: flex;

          button {
            flex: 1;
            border-radius: 0;
            box-shadow: none;

            &:active,
            &:focus {
              background: var(--primary-color);
            }
          }
        }
      }
    }
  }
</style>
