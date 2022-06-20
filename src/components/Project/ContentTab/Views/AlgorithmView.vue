<template>
  <div ref="wrapper" class="transformer-wrapper">
    <div class="code-wrapper shadow-3" :class="{ error: isError }">
      <div class="code-tabs">
        <div class="code-tabs-head">
          <Button
            :label="$t(`components.transformer.editor`)"
            class="p-button-raised shadow-1"
            :class="{ 'p-button-text': tab !== 'editor' }"
            @click="handleTabs('editor')"
          />
          <Button
            :label="$t(`components.transformer.console`)"
            :badge="isError ? '1' : ''"
            badge-class="p-badge-danger"
            class="p-button-raised shadow-1"
            :class="{ 'p-button-text': tab !== 'console' }"
            @click="handleTabs('console')"
          />
        </div>
      </div>
      <codemirror
        v-if="tab == 'editor'"
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
  import Button from "primevue/button"
  import { Codemirror } from "vue-codemirror"
  import { javascript } from "@codemirror/lang-javascript"
  import { oneDark } from "@codemirror/theme-one-dark"
  import AppSettings from "@/store/Modules/AppSettings"
  import Projects from "@/store/Modules/Projects"
  import { getModule } from "vuex-module-decorators"
  const appSettings = getModule(AppSettings)
  const projects = getModule(Projects)
  export default {
    name: "AlgorithmView",
    components: { Codemirror, Button },
    emits: ["render"],
    data() {
      return {
        tab: "editor",
        consoleText: "",
      }
    },
    computed: {
      extensions() {
        return appSettings.theme === "dark"
          ? [javascript(), oneDark]
          : [javascript()]
      },
      isError() {
        return false
      },
      viewResized() {
        return appSettings.viewResized
      },
      code() {
        return projects.algorithmCode(0, 0)
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
        const data = { code: c, projectId: 0, queryId: 0 }
        projects.setAlgoCode(data)
      },
      handleTabs(tab) {
        this.tab = tab
        appSettings.resizeView()
      },
      setEditorHeight() {
        const wrapper = this.$refs.wrapper
        const editor = document.getElementsByClassName("cm-editor")[0]
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
