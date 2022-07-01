<template>
  <Dialog
    v-model:visible="displayModal"
    class="query-dialog"
    modal
    :closable="true"
    :breakpoints="{ '960px': '75vw', '640px': '100vw' }"
  >
    <template #header>
      <span class="p-dialog-title">
        {{ $t("components.dialog.new-query.header") }}</span
      >
      <div class="p-dialog-header-icons">
        <button
          class="p-dialog-header-icon p-dialog-header-close p-link"
          aria-label="close"
          type="button"
          @click="querycloseDialog"
        >
          <span class="p-dialog-header-close-icon pi pi-times"></span>
        </button>
      </div>
    </template>
    <Panel :header="$t(`components.dialog.new-query.panel1.header`)">
      <div class="field">
        <label
          for="expand"
          :class="{ 'p-error': v$.projectselected.$invalid && submitted }"
        >
          {{ $t("components.dialog.new-query.panel1.label1") }}</label
        >
        <Dropdown
          v-model="v$.projectselected.$model"
          :options="projectList"
          option-label="label"
          option-value="key"
          :placeholder="$t(`components.dialog.new-query.panel1.select1`)"
          :class="{ 'p-error': v$.projectselected.$invalid && submitted }"
        />
        <small
          v-if="
            (v$.projectselected.$invalid && submitted) ||
            v$.projectselected.$pending.$response
          "
          class="p-error"
          >{{
            v$.projectselected.required.$message.replace("Value", "Project")
          }}</small
        >
      </div>
      <div class="field">
        <label
          for="expand"
          :class="{ 'p-error': v$.connectionselected.$invalid && submitted }"
          >{{ $t("components.dialog.new-query.panel1.label2") }}</label
        >
        <Dropdown
          v-model="v$.connectionselected.$model"
          :options="connectionList"
          option-label="label"
          option-group-label="label"
          option-group-children="items"
          :placeholder="$t(`components.dialog.new-query.panel1.select2`)"
          :class="{ 'p-error': v$.connectionselected.$invalid && submitted }"
          @change="handleConnection"
        />
        <small
          v-if="
            (v$.connectionselected.$invalid && submitted) ||
            v$.connectionselected.$pending.$response
          "
          class="p-error"
          >{{
            v$.connectionselected.required.$message.replace(
              "Value",
              "Connection"
            )
          }}</small
        >
      </div>
    </Panel>
    <Panel
      :header="$t(`components.dialog.new-query.panel2.header`)"
      class="panel2"
    >
      <div class="field">
        <label
          for="name"
          :class="{ 'p-error': v$.name.$invalid && submitted }"
          >{{ $t("components.dialog.new-query.panel2.name") }}</label
        >
        <InputText
          id="name"
          v-model="v$.name.$model"
          :class="{ 'p-error': v$.name.$invalid && submitted }"
        />
        <small
          v-if="(v$.name.$invalid && submitted) || v$.name.$pending.$response"
          class="p-error"
          >{{ v$.name.required.$message.replace("Value", "Name") }}</small
        >
      </div>

      <div class="field">
        <label :class="{ 'p-error': v$.description.$invalid && submitted }">{{
          $t("components.dialog.new-query.panel2.description")
        }}</label>
        <InputText
          v-model="v$.description.$model"
          :class="{ 'p-error': v$.description.$invalid && submitted }"
        />
        <small
          v-if="
            (v$.description.$invalid && submitted) ||
            v$.description.$pending.$response
          "
          class="p-error"
          >{{
            v$.description.required.$message.replace("Value", "Description")
          }}</small
        >
      </div>
      <div class="field">
        <label for="icon" :class="{ 'p-error': v$.icon.$invalid && submitted }">
          {{ $t("components.dialog.projects.info.icon") }}</label
        >
        <InputText
          id="icon"
          v-model="v$.icon.$model"
          :class="{ 'p-invalid': v$.icon.$invalid && submitted }"
        />
        <small
          v-if="(v$.icon.$invalid && submitted) || v$.icon.$pending.$response"
          class="p-error"
          >{{ v$.icon.required.$message.replace("Value", "Icon") }}</small
        >
      </div>

      <div class="field">
        <label
          for="query"
          :class="{ 'p-error': v$.query.$invalid && submitted }"
          >{{ $t("components.dialog.new-query.panel2.query") }}</label
        >
        <InputText
          id="query"
          v-model="v$.query.$model"
          :class="{ 'p-invalid': v$.query.$invalid && submitted }"
        />
        <small
          v-if="(v$.query.$invalid && submitted) || v$.query.$pending.$response"
          class="p-error"
          >{{ v$.query.required.$message.replace("Value", "Query") }}</small
        >
      </div>
      <div class="field">
        <label
          for="expand"
          :class="{ 'p-error': v$.tranformerselected.$invalid && submitted }"
          >{{ $t("components.dialog.new-query.panel2.transformer") }}</label
        >
        <Dropdown
          v-model="v$.tranformerselected.$model"
          :options="transformerList"
          option-label="label"
          option-group-label="label"
          option-group-children="items"
          :placeholder="$t(`components.dialog.new-query.panel2.select1`)"
          :class="{ 'p-error': v$.tranformerselected.$invalid && submitted }"
          @change="handleTransformer"
        />
        <small
          v-if="
            (v$.tranformerselected.$invalid && submitted) ||
            v$.tranformerselected.$pending.$response
          "
          class="p-error"
          >{{
            v$.tranformerselected.required.$message.replace(
              "Value",
              "Transformer"
            )
          }}</small
        >
      </div>
    </Panel>
    <template #footer>
      <Button
        :label="$t(`components.dialog.new-query.footer.cancel`)"
        icon="pi pi-times"
        class="p-button-text"
        @click="querycloseDialog"
      />
      <Button
        :label="$t(`components.dialog.new-query.footer.save`)"
        icon="pi pi-check"
        autofocus
        @click="handlequerystore(!v$.$invalid)"
      />
    </template>
  </Dialog>
</template>

<script>
  import Dialog from "primevue/dialog"
  import Dropdown from "primevue/dropdown"
  import InputText from "primevue/inputtext"
  import Button from "primevue/button"
  import Panel from "primevue/panel"
  import AppData from "@/store/Modules/Projects"
  import { getModule } from "vuex-module-decorators"
  const appData = getModule(AppData)
  import { required } from "@vuelidate/validators"
  import { useVuelidate } from "@vuelidate/core"

  export default {
    name: "NewQuery",
    components: {
      Dialog,
      InputText,
      Button,
      Panel,
      Dropdown,
    },
    props: {
      querydialog: { type: Boolean, default: false },
    },
    emits: ["close"],
    setup: () => ({ v$: useVuelidate() }),
    data() {
      return {
        type: "Query",
        name: "",
        expanded: "",
        description: "",
        icon: "",
        query: "",
        display: true,
        projectselected: null,
        connectionselected: null,
        tranformerselected: null,
        transformdata: null,
        connectiondata: null,
        submitted: false,
        displayModal: true,
      }
    },
    validations() {
      return {
        projectselected: { required },
        connectionselected: { required },
        name: { required },
        description: { required },
        icon: { required },
        query: { required },
        tranformerselected: { required },
      }
    },
    computed: {
      projectList() {
        return appData.projectsList
      },
      connectionList() {
          let projectIdx= appData.list[0].list.findIndex(
          (el) => el.id == this.projectselected
        )      
        return projectIdx== -1? []:appData.connectionsList(projectIdx)
      },
      transformerList() {
         let projectIdx= appData.list[0].list.findIndex(
          (el) => el.id == this.projectselected
        )    
        return projectIdx== -1? []:appData.transformersList(projectIdx)
      },
    },
    methods: {
      querycloseDialog() {
        this.$emit("close")
      },
      handleConnection(el) {
        this.connectiondata = el.value.key
      },
      handleTransformer(el) {
        this.setTransformerCode(el.value)
      },
      setTransformerCode(value) {
        const projectIdx = appData.list[0].list.findIndex(
          (el) => el.id == this.projectselected
        )
        let transformercode
        if (value.scope == "local") {
          transformercode = appData.list[0].list[
            projectIdx
          ].transformers.list.find((el) => el.id == value.key)
        } else {
          transformercode = appData.list[2].list.find((el) => {
            return el.id == value.key
          })
        }
        this.transformdata = transformercode
      },
      handlequerystore(isFormValid) {
        const projectIdx = appData.list[0].list.findIndex(
          (el) => el.id == this.projectselected
        )
        const data = {
          projectIdx: projectIdx,
          data: {
            name: this.name,
            label: this.name,
            id: Math.random()
              .toString(36)
              .replace(/[^a-z]+/g, "")
              .substr(2, 10),
            description: this.description,
            connection: this.connectiondata,
            icon: this.icon,
            query: this.query,
            type: "query",
            tranformer: this.transformdata,
            dataPath: "",
          },
        }
        this.submitted = true
        if (!isFormValid) {
          return
        }
        appData.addNewQuery(data)
        this.$emit("close")
      },
    },
  }
</script>
<style lang="scss">
  html.t-light .p-panel .p-panel-header {
    background-color: #f8f9fa;
  }
  .query-dialog {
    height: 100vh;
    width: 40vw;
    .p-dropdown {
      width: 80%;
    }
    .field {
      display: grid;
    }
    .panel2 {
      margin-top: 10px;
    }
    .p-float-label {
      margin-bottom: 10px;
    }
    input {
      width: 80%;
    }
    .p-dialog-content {
      height: 100%;
    }

    .p-dialog-header {
      padding: 1.25rem 1.8rem;

      .p-dialog-header-icons:last-of-type {
        display: none;
      }
    }
  }
</style>
