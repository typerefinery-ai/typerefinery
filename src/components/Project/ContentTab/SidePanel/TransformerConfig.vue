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
            v-model="selectedDependencies"
            class="mb-2"
            :options="dependencies"
            option-label="name"
            :placeholder="$t(`components.transformer.select-dependencies`)"
          />
        </div>
        <div class="field">
          <label>{{ $t(`components.transformer.transformer`) }}</label>
          <Dropdown
            v-model="selectedTransformer"
            option-label="name"
            option-value="code"
            :placeholder="$t(`components.transformer.select`)"
          />
        </div>
        <div class="field">
          <Button
            :label="$t(`components.transformer.save`)"
            class="p-button-raised p-button-info"
            @click="displayModal = true"
          />
        </div>
        <Dialog
          v-model:visible="displayModal"
          modal
          class="save-tranformer-dialog"
          :header="$t(`components.transformer.save`)"
          :style="{ width: '400px' }"
        >
          <div class="dialog-content">
            <span class="p-float-label">
              <InputText id="name" v-model="value2" type="text" />
              <label for="name">{{ $t(`components.transformer.name`) }}</label>
            </span>
          </div>
          <template #footer>
            <Button
              :label="$t(`buttons.cancel`)"
              icon="pi pi-times"
              class="p-button-text"
              @click="displayModal = false"
            />
            <Button
              :label="$t(`buttons.save`)"
              icon="pi pi-check"
              autofocus
              @click="displayModal = false"
            />
          </template>
        </Dialog>
      </div>
      <div v-if="activeView === 'help'" class="help">
        <code>log()</code>
        <span>{{ $t("help.log") }}</span>
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
  export default {
    name: "TransformerConfig",
    components: { MultiSelect, Button, Dropdown, Dialog, InputText },
    data() {
      return {
        value2: "",
        activeView: "config",
        displayModal: false,
        selectedTransformer: null,
        selectedDependencies: null,
        dependencies: [
          { name: "D3", code: "d3" },
          { name: "WebCola", code: "webcola" },
        ],
      }
    },
    methods: {
      handleView(view) {
        this.activeView = view
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
