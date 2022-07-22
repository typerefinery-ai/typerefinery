<template>
  <div class="config-container">
    <div class="config-container-head">
      <Button
        :label="$t(`components.graph.config`)"
        class="p-button-raised"
        :class="{
          'p-button-text p-button-plain': activeView !== 'config',
        }"
        @click="handleView('config')"
      />
      <Button
        :label="$t(`components.graph.help`)"
        class="p-button-raised"
        :class="{
          'p-button-text p-button-plain': activeView !== 'help',
        }"
        @click="handleView('help')"
      />
    </div>
    <div class="config-container-content">
      <div v-if="activeView === 'config'">
        <div class="field">
          <label>{{ $t(`components.transformer.dependencies`) }}</label>
          <MultiSelect
            :model-value="selectedDependencies"
            class="mb-2"
            :options="dependencies"
            option-label="name"
            :placeholder="$t(`components.transformer.select-dependencies`)"
            @change="handleDependency"
          />
        </div>
        <div class="field">
          <label>{{ $t(`components.transformer.transformer`) }}</label>
          <Dropdown
            :model-value="transformer"
            :options="transformers"
            option-label="label"
            option-group-label="label"
            option-group-children="items"
            :placeholder="$t(`components.transformer.select`)"
            @change="handleTransformer"
          />
        </div>
        <div class="field">
          <Button
            :label="$t(`components.transformer.buttons.save-as`)"
            class="p-button-raised p-button-info"
            @click="saveDialog = true"
          />
        </div>
        <Dialog
          v-model:visible="saveDialog"
          modal
          class="save-tranformer-dialog"
          :header="$t(`components.transformer.save`)"
          :style="{ width: '400px' }"
        >
          <div class="dialog-content">
            <span class="p-float-label">
              <InputText id="name" v-model="transformerName" type="text" />
              <label for="name">{{ $t(`components.transformer.name`) }}</label>
            </span>
            <Button
              class="p-button-raised mr-2"
              :disabled="!transformerName.length"
              :label="$t(`components.transformer.buttons.save-as-global`)"
              @click="saveTransformer('global')"
            />
            <Button
              class="p-button-raised p-button-success"
              :disabled="!transformerName.length"
              :label="$t(`components.transformer.buttons.save-as-local`)"
              @click="saveTransformer('local')"
            />
          </div>
          <template #footer>
            <Button
              :label="$t(`components.transformer.buttons.cancel`)"
              icon="pi pi-times"
              class="p-button-text"
              @click="saveDialog = false"
            />
          </template>
        </Dialog>
      </div>
      <div v-if="activeView === 'help'">
        <component :is="markdownFile"></component>
      </div>
    </div>
  </div>
</template>

<script>
  import { getModule } from "vuex-module-decorators"
  import { getRandomId } from "@/utils"
  import Button from "primevue/button"
  import Dropdown from "primevue/dropdown"
  import MultiSelect from "primevue/multiselect"
  import Dialog from "primevue/dialog"
  import InputText from "primevue/inputtext"
  import MarkdownEn from "../Markdown/TransformHelpEng.md"
  import MarkdownHi from "../Markdown/TransformHelpHindi.md"
  import "../../../../styles/_markdown.css"
  import Projects from "@/store/Modules/Projects"
  import Transformers from "@/store/Modules/Transformers"
  import Settings from "@/store/Modules/Settings"
  const projectsModule = getModule(Projects)
  const transformersModule = getModule(Transformers)
  const settingsModule = getModule(Settings)

  export default {
    name: "TransformerConfig",
    components: {
      MultiSelect,
      Button,
      Dropdown,
      Dialog,
      InputText,
      MarkdownEn,
      MarkdownHi,
    },
    props: {
      tab: { type: Object, required: true },
    },
    emits: ["handle-dependencies"],
    data() {
      return {
        markdownFile: "",
        transformerName: "",
        activeView: "config",
        saveDialog: false,
        dependencies: [
          { name: "d3", code: "d3" },
          { name: "webcola", code: "webcola" },
        ],
      }
    },
    computed: {
      language() {
        return settingsModule.data.language
      },
      transformer() {
        const { projectIdx: pI, queryIdx: qI } = this.tab
        const transformer = projectsModule.getQuery(pI, qI).transformer
        return {
          key: transformer.id,
          label: transformer.label,
          scope: transformer.scope,
        }
      },
      transformers() {
        const { projectIdx } = this.tab
        return [
          {
            label: "Local",
            code: "local",
            items: projectsModule.getLocalTransformers(projectIdx).map((el) => {
              return { label: el.label, key: el.id, scope: el.scope }
            }),
          },
          {
            label: "Global",
            code: "global",
            items: transformersModule.getGlobalTransformers.map((el) => {
              return { label: el.label, key: el.id, scope: el.scope }
            }),
          },
        ]
      },
      selectedDependencies() {
        const { projectIdx: pI, queryIdx: qI } = this.tab
        const transformer = projectsModule.getQuery(pI, qI).transformer
        return transformer.dependencies.map((el) => ({ name: el, code: el }))
      },
    },
    watch: {
      language(value) {
        this.handleMarkdown(value)
      },
    },
    mounted() {
      this.handleMarkdown(this.language)
      const { projectIdx: pI, queryIdx: qI } = this.tab
      const transformer = projectsModule.getQuery(pI, qI).transformer
      this.$emit("handle-dependencies", transformer.dependencies)
    },
    methods: {
      handleView(view) {
        this.activeView = view
      },
      handleDependency(d) {
        // save locallly
        const dependencies = d.value.map((el) => el.code)
        this.$emit("handle-dependencies", dependencies)
        // save to store
        const { projectIdx, queryIdx } = this.tab
        const query = projectsModule.getQuery(projectIdx, queryIdx)
        const transformer = { ...query.transformer }
        transformer.dependencies = dependencies
        const payload = { key: "transformer", value: transformer, ...this.tab }
        projectsModule.updateQuery(payload)
      },
      handleTransformer(el) {
        this.showConfirmDialog(el)
      },
      showConfirmDialog(el) {
        this.$confirm.require({
          message: this.$t("components.transformer.confirm-msg"),
          header: this.$t("components.transformer.sure"),
          acceptLabel: this.$t("components.transformer.buttons.yes"),
          rejectLabel: this.$t("components.transformer.buttons.no"),
          icon: "pi pi-exclamation-triangle",
          accept: () => {
            this.setTransformerCode(el.value)
          },
          reject: () => {
            this.$confirm.close()
          },
        })
      },
      setTransformerCode(value) {
        let transformer
        const { projectIdx } = this.tab
        if (value.scope == "local") {
          transformer = projectsModule
            .getLocalTransformers(projectIdx)
            .find((el) => el.id == value.key)
        } else {
          transformer = transformersModule.getGlobalTransformers.find((el) => {
            return el.id == value.key
          })
        }
        const payload = { key: "transformer", value: transformer, ...this.tab }
        projectsModule.updateQuery(payload)
      },
      saveTransformer(scope) {
        this.saveDialog = false
        const { projectIdx: pI, queryIdx: qI } = this.tab
        const transformer = projectsModule.getQuery(pI, qI).transformer
        let data = {
          data: {
            ...transformer,
            id: getRandomId(),
            label: this.transformerName,
          },
        }
        if (scope == "local") {
          data.projectIdx = this.tab.projectIdx
          data.data.scope = "local"
          projectsModule.addLocalTransformer(data)
        } else {
          data.data.scope = "global"
          transformersModule.addGlobalTransformer(data)
        }
        this.transformerName = ""
      },
      handleMarkdown(language) {
        if (language == "en") this.markdownFile = "MarkdownEn"
        else if (language == "hi") this.markdownFile = "MarkdownHi"
      },
    },
  }
</script>

<style lang="scss">
  .config-container {
    &-head {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 10px;
      border-bottom: 1px solid var(--surface-border);
      flex-flow: wrap;

      button {
        margin-right: 5px;
      }
    }
    &-content {
      display: block;
      margin: 1rem;

      .field {
        label {
          display: block;
        }
      }
      .help {
        display: flex;
        align-items: center;
        border: 1px solid var(--surface-border);
        border-radius: 4px;

        code {
          flex: 1;
          font-weight: bold;
          border-right: 1px solid var(--surface-border);
          padding: 8px 16px;
          color: var(--text-color);
          font-size: 12px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        span {
          flex: 1;
          padding: 8px;
          text-align: center;
          font-size: 13px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }

      .p-multiselect,
      .p-dropdown {
        max-width: 100%;
        width: 100%;
      }
    }
  }

  div.save-tranformer-dialog.p-dialog {
    .p-dialog-content {
      padding-top: 10px;
      padding-bottom: 0.5rem;

      input {
        width: 100%;
      }
    }
  }
</style>
