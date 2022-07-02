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
        <div class="field">
          <h3>Commands</h3>
          <div class="help">
            <code>log()</code>
            <span>{{ $t("components.transformer.help.commands.log") }}</span>
          </div>
        </div>
        <div class="field">
          <h3 class="field">Frameworks</h3>
          <div class="help">
            <code>d3.&lt;&gt;</code>
            <span>{{ $t("components.transformer.help.frameworks.d3") }}</span>
          </div>
          <div class="help">
            <code>webCola.&lt;&gt;</code>
            <span>{{
              $t("components.transformer.help.frameworks.webCola")
            }}</span>
          </div>
        </div>
        <div class="field">
          <h3 class="field">Variables</h3>
          <div class="help">
            <code>SERVICE_OUTPUT_JSON</code>
            <span>{{
              $t("components.transformer.help.variables.SERVICE_OUTPUT_JSON")
            }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import Button from "primevue/button"
  import Dropdown from "primevue/dropdown"
  import MultiSelect from "primevue/multiselect"
  import Dialog from "primevue/dialog"
  import InputText from "primevue/inputtext"
  import { getModule } from "vuex-module-decorators"
  import Transformer from "@/store/Modules/Transformer"
  import AppData from "@/store/Modules/Projects"
  const transformer = getModule(Transformer)
  const appData = getModule(AppData)

  export default {
    name: "TransformerConfig",
    components: {
      MultiSelect,
      Button,
      Dropdown,
      Dialog,
      InputText,
    },
    props: {
      tab: { type: Object, required: true },
    },
    emits: ["handle-dependencies"],
    data() {
      return {
        transformerName: "",
        activeView: "config",
        saveDialog: false,
        // selectedTransformer: null,
        selectedDependencies: null,
        dependencies: [
          { name: "D3", code: "d3" },
          { name: "WebCola", code: "webcola" },
        ],
      }
    },
    computed: {
      transformer() {
        const { projectIdx, queryIdx } = this.tab
        const transformer =
          appData.list[0].list[projectIdx].queries.list[queryIdx].transformer
        return {
          key: transformer.id,
          label: transformer.label,
          scope: transformer.scope,
        }
      },
      transformers() {
        const { projectIdx } = this.tab
        return appData.transformersList(projectIdx)
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
        console.log(d)
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
        if (value.scope == "local") {
          transformer = appData.list[0].list[
            this.tab.projectIdx
          ].transformers.list.find((el) => el.id == value.key)
        } else {
          transformer = appData.list[2].list.find((el) => {
            return el.id == value.key
          })
        }
        const payload = { key: "transformer", value: transformer, ...this.tab }
        appData.updateQuery(payload)
      },
      saveTransformer(scope) {
        this.saveDialog = false
        const transformer =
          appData.list[0].list[this.tab.projectIdx].queries.list[
            this.tab.queryIdx
          ].transformer
        const id = Math.random()
          .toString(36)
          .replace(/[^a-z]+/g, "")
          .substr(2, 10)
        let data = {
          data: {
            ...transformer,
            id,
            label: this.transformerName,
          },
        }
        if (scope == "local") {
          data.projectIdx = this.tab.projectIdx
          data.data.scope = "local"
        } else {
          data.projectIdx = -1
          data.data.scope = "global"
        }
        appData.addNewTransformer(data)
        this.transformerName = ""
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
