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
            :model-value="selectedTransformer"
            :options="transformers"
            option-label="name"
            option-value="key"
            :placeholder="$t(`components.transformer.select`)"
            @change="handleTransformer"
          />
        </div>
        <div class="field">
          <Button
            :label="$t(`components.transformer.save`)"
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
          </div>
          <template #footer>
            <Button
              :label="$t(`buttons.cancel`)"
              icon="pi pi-times"
              class="p-button-text"
              @click="saveDialog = false"
            />
            <Button
              :label="$t(`buttons.save`)"
              icon="pi pi-check"
              autofocus
              :disabled="!transformerName.length"
              @click="saveTransformer"
            />
          </template>
        </Dialog>
      </div>
      <div v-if="activeView === 'help'" class="help">
        <code>log()</code>
        <span>{{ $t("help.log") }}</span>
      </div>
      <ConfirmDialog></ConfirmDialog>
    </div>
  </div>
</template>

<script>
  import Button from "primevue/button"
  import Dropdown from "primevue/dropdown"
  import MultiSelect from "primevue/multiselect"
  import ConfirmDialog from "primevue/confirmdialog"
  import Dialog from "primevue/dialog"
  import InputText from "primevue/inputtext"
  import { getModule } from "vuex-module-decorators"
  import Transformer from "@/store/Modules/Transformer"
  import Projects from "@/store/Modules/Projects"
  const transformer = getModule(Transformer)
  const projects = getModule(Projects)

  export default {
    name: "TransformerConfig",
    components: {
      MultiSelect,
      Button,
      Dropdown,
      Dialog,
      InputText,
      ConfirmDialog,
    },
    emits: ["handle-dependencies"],
    data() {
      return {
        transformerName: "",
        activeView: "config",
        saveDialog: false,
        selectedTransformer: null,
        selectedDependencies: null,
        dependencies: [
          { name: "D3", code: "d3" },
          { name: "WebCola", code: "webcola" },
        ],
      }
    },
    computed: {
      transformers() {
        return transformer.list.map((el) => {
          return { name: el.name, key: el.name }
        })
      },
    },
    methods: {
      handleView(view) {
        this.activeView = view
      },
      handleDependency(d) {
        this.selectedDependencies = d.value
        const dependencies = d.value.map((el) => el.code)
        this.$emit("handle-dependencies", dependencies)
      },
      handleTransformer(t) {
        this.showConfirmDialog(t)
      },
      showConfirmDialog(t) {
        this.$confirm.require({
          message: this.$t("components.transformer.confirm-msg"),
          header: this.$t("components.transformer.sure"),
          acceptLabel: this.$t("buttons.yes"),
          rejectLabel: this.$t("buttons.no"),
          icon: "pi pi-exclamation-triangle",
          accept: () => {
            this.setTransformerCode(t)
          },
          reject: () => {
            return
          },
        })
      },
      setTransformerCode(t) {
        const idx = transformer.list.findIndex((el) => el.name === t.value)
        const code = transformer.list[idx].code
        const data = { code, projectId: 0, queryId: 0 }
        projects.setCode(data)
        this.selectedTransformer = t.value
      },
      saveTransformer() {
        this.saveDialog = false
        const code = projects.list[0].queries.list[0].transformer.code
        const data = {
          name: this.transformerName,
          code,
          error: "",
          logs: [],
        }
        transformer.saveTransformer(data)
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
          font-weight: bold;
          border-right: 1px solid var(--surface-border);
          padding: 8px 16px;
          color: var(--text-color);
          font-size: 12px;
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
