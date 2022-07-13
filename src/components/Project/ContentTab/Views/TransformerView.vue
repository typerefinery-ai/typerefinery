<template>
  <div ref="transwrapper" class="transformer-wrapper">
    <div
      id="trans_view_cm"
      class="code-wrapper shadow-3"
      :class="{ error: isError }"
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
        :tab-size="2"
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
        :tab-size="2"
        :extensions="extensions"
      />
    </div>
  </div>
</template>

<script>
  import { Codemirror } from "vue-codemirror"
  import { javascript } from "@codemirror/lang-javascript"
  import { oneDark } from "@codemirror/theme-one-dark"
  import { getModule } from "vuex-module-decorators"
  import Button from "primevue/button"
  import Settings from "@/store/Modules/Settings"
  import Projects from "@/store/Modules/Projects"
  const settingsModule = getModule(Settings)
  const projectsModule = getModule(Projects)
  export default {
    name: "TransformerView",
    components: { Codemirror, Button },
    props: {
      tab: { type: Object, required: true },
      view: { type: String, required: true },
    },
    emits: ["render"],
    data() {
      return {
        activeTab: "editor",
      }
    },
    computed: {
      extensions() {
        return settingsModule.data.theme === "dark"
          ? [javascript(), oneDark]
          : [javascript()]
      },
      errorText() {
        const { projectIdx, queryIdx } = this.tab
        return projectsModule.getTransformerConsoleMessage(projectIdx, queryIdx)
      },
      isError() {
        const { projectIdx, queryIdx } = this.tab
        return projectsModule.getTransformerError(projectIdx, queryIdx)
      },
      code() {
        const { projectIdx, queryIdx } = this.tab
        return projectsModule.getTransformerCode(projectIdx, queryIdx)
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
      handleChange(c) {
        const { projectIdx, queryIdx } = this.tab
        const data = { code: c, projectIdx, queryIdx }
        projectsModule.setTransformerCode(data)
      },
      handleTabs(tab) {
        this.activeTab = tab
        settingsModule.resizeView()
      },
      setEditorHeight() {
        if (this.view !== "T") return
        const wrapper = this.$refs.transwrapper
        const editor = document.querySelector("#trans_view_cm .cm-editor")
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
