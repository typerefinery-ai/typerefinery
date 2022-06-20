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
          <Textarea
            v-model="dependencies"
            :auto-resize="true"
            rows="5"
            cols="30"
          />
        </div>
        <div class="field">
          <label>{{ $t(`components.algorithm.label`) }}</label>
          <Dropdown
            :model-value="selectedAlgorithm"
            :options="algorithms"
            option-label="name"
            option-value="key"
            :placeholder="$t(`components.algorithm.select`)"
            @change="showConfirmDialog"
          />
        </div>
        <div class="field">
          <Button
            :label="$t(`buttons.save-as`)"
            class="p-button-raised p-button-info"
            @click="saveDialog = true"
          />
        </div>
        <Dialog
          v-model:visible="saveDialog"
          modal
          class="save-tranformer-dialog"
          :header="$t(`components.algorithm.save`)"
          :style="{ width: '400px' }"
        >
          <div class="dialog-content">
            <span class="p-float-label">
              <InputText id="name" v-model="algorithmName" type="text" />
              <label for="name">{{ $t(`components.algorithm.name`) }}</label>
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
              :disabled="!algorithmName.length"
              @click="saveAlgorithm"
            />
          </template>
        </Dialog>
      </div>
    </div>
  </div>
</template>

<script>
  import Button from "primevue/button"
  import Dropdown from "primevue/dropdown"
  import Dialog from "primevue/dialog"
  import InputText from "primevue/inputtext"
  import Textarea from "primevue/textarea"
  import { getModule } from "vuex-module-decorators"
  import Algorithm from "@/store/Modules/Algorithm"
  import Projects from "@/store/Modules/Projects"
  const algorithm = getModule(Algorithm)
  const projects = getModule(Projects)

  export default {
    name: "AlgorithmConfig",
    components: {
      Button,
      Dropdown,
      Dialog,
      InputText,
      Textarea,
    },
    emits: ["handle-dependencies"],
    data() {
      return {
        algorithmName: "",
        activeView: "config",
        saveDialog: false,
        selectedAlgorithm: null,
        dependencies: "",
      }
    },
    computed: {
      algorithms() {
        return algorithm.list.map((el) => {
          return { name: el.name, key: el.name }
        })
      },
    },
    methods: {
      handleView(view) {
        this.activeView = view
      },
      showConfirmDialog(a) {
        this.$confirm.require({
          message: this.$t("components.algorithm.confirm-msg"),
          header: this.$t("components.transformer.sure"),
          acceptLabel: this.$t("buttons.yes"),
          rejectLabel: this.$t("buttons.no"),
          icon: "pi pi-exclamation-triangle",
          accept: () => {
            this.setAlgorithmCode(a)
          },
          reject: () => {
            this.$confirm.close()
          },
        })
      },
      setAlgorithmCode(t) {
        const idx = algorithm.list.findIndex((el) => el.name === t.value)
        const code = algorithm.list[idx].code
        const data = { code, projectId: 0, queryId: 0 }
        projects.setAlgoCode(data)
        this.selectedAlgorithm = t.value
      },
      saveAlgorithm() {
        this.saveDialog = false
        const code = projects.list[0].queries.list[0].algorithm.code
        const data = {
          name: this.algorithmName,
          code,
          error: "",
          logs: [],
        }
        algorithm.saveAlgorithm(data)
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
        textarea {
          width: 100%;
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
