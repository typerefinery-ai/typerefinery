<template>
  <div ref="algoWrapper" class="transformer-wrapper">
    <div class="code-wrapper shadow-3" :class="{ error: isError }">
      <div class="code-tabs">
        <div class="code-tabs-head">
          <Button
            :label="$t(`components.transformer.editor`)"
            class="p-button-raised shadow-1"
            :class="{ 'p-button-text': activeTab !== 'editor' }"
            @click="handleTabs('editor')"
          />
          <Button
            :label="$t(`components.transformer.console`)"
            :badge="isError ? '1' : ''"
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
        :model-value="errorText"
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
  import Button from "primevue/button"
  import { Codemirror } from "vue-codemirror"
  import { javascript } from "@codemirror/lang-javascript"
  import { oneDark } from "@codemirror/theme-one-dark"
  import AppSettings from "@/store/Modules/AppSettings"
  import AppData from "@/store/Modules/Projects"
  import { getModule } from "vuex-module-decorators"
  const appSettings = getModule(AppSettings)
  const appData = getModule(AppData)
  export default {
    name: "TransformerView",
    components: { Codemirror, Button },
    props: {
      tab: { type: Object, required: true },
    },
    emits: ["render"],
    data() {
      return {
        activeTab: "editor",
      }
    },
    computed: {
      extensions() {
        return appSettings.theme === "dark"
          ? [javascript(), oneDark]
          : [javascript()]
      },
      errorText() {
        const { projectIdx, queryIdx } = this.tab
        return appData.transformerConsoleMessage(projectIdx, queryIdx)
      },
      isError() {
        const { projectIdx, queryIdx } = this.tab
        return appData.transformerError(projectIdx, queryIdx)
      },
      code() {
        const { projectIdx, queryIdx } = this.tab
        return appData.transformerCode(projectIdx, queryIdx)
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
      handleChange(c) {
        const { projectIdx, queryIdx } = this.tab
        const data = { code: c, projectIdx, queryIdx }
        appData.setTransformerCode(data)
      },
      handleTabs(tab) {
        this.activeTab = tab
        appSettings.resizeView()
      },
      setEditorHeight() {
        const wrapper = this.$refs.algoWrapper
        const editor = document.getElementsByClassName("cm-editor")[2]
        if (wrapper) {
          editor.style.setProperty("display", "none", "important")
          editor.style.height = wrapper.clientHeight - 65 + "px"
          editor.style.setProperty("display", "flex", "important")
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
