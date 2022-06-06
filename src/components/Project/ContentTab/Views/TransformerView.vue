<template>
  <div class="transformer-wrapper">
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
        :style="{ height: '350px' }"
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
        @change="handleChange"
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
  import Transformer from "@/store/Modules/Transformer"
  import { getModule } from "vuex-module-decorators"
  const appSettings = getModule(AppSettings)
  const transformer = getModule(Transformer)
  export default {
    name: "TransformerView",
    components: { Codemirror, Button },
    emits: ["render"],
    data() {
      return {
        tab: "editor",
      }
    },
    computed: {
      extensions() {
        return appSettings.theme === "dark"
          ? [javascript(), oneDark]
          : [javascript()]
      },
      errorText() {
        return transformer.consoleMessage
      },
      isError() {
        return transformer.error
      },
      code() {
        return transformer.code
      },
    },
    methods: {
      handleChange(c) {
        transformer.setCode(c)
      },
      handleTabs(tab) {
        this.tab = tab
      },
    },
  }
</script>

<style scoped lang="scss">
  .transformer-wrapper {
    padding: 1rem;

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
