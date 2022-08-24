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
        <label for="query">{{
          $t("components.dialog.new-query.panel2.query")
        }}</label>
        <!--  <InputText
          id="query"
          v-model="v$.query.$model"
          :class="{ 'p-invalid': v$.query.$invalid && submitted }"
        /> -->
        <codemirror
          v-model="query"
          placeholder="Code goes here..."
          :style="{ height: '20vh' }"
          :autofocus="true"
          :indent-with-tab="true"
          :tab-size="2"
          :extensions="extensions"
        />
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
      <!-- <div class="field">
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
      <div class="field">
        <label
          for="expand"
          :class="{ 'p-error': v$.algorithmselected.$invalid && submitted }"
          >{{ $t("components.dialog.new-query.panel2.algorithm") }}</label
        >
        <Dropdown
          v-model="v$.algorithmselected.$model"
          :options="algorithmList"
          option-label="label"
          option-group-label="label"
          option-group-children="items"
          :placeholder="$t(`components.dialog.new-query.panel2.selectAlgo1`)"
          :class="{ 'p-error': v$.algorithmselected.$invalid && submitted }"
          @change="handleAlgorithm"
        />
        <small
          v-if="
            (v$.algorithmselected.$invalid && submitted) ||
            v$.algorithmselected.$pending.$response
          "
          class="p-error"
          >{{
            v$.algorithmselected.required.$message.replace("Value", "Algorithm")
          }}</small
        >
      </div> -->
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
  import { required } from "@vuelidate/validators"
  import { useVuelidate } from "@vuelidate/core"
  import { Codemirror } from "vue-codemirror"
  import { javascript } from "@codemirror/lang-javascript"
  import { oneDark } from "@codemirror/theme-one-dark"
  import { getModule } from "vuex-module-decorators"
  import { getRandomId } from "@/utils"
  import Dialog from "primevue/dialog"
  import Dropdown from "primevue/dropdown"
  import InputText from "primevue/inputtext"
  import Button from "primevue/button"
  import Panel from "primevue/panel"
  import Projects from "@/store/Modules/Projects"
  import Settings from "@/store/Modules/Settings"
  import Connections from "@/store/Modules/Connections"
  // import Algorithms from "@/store/Modules/Algorithms"
  // import Transformers from "@/store/Modules/Transformers"
  const settingsModule = getModule(Settings)
  const projectsModule = getModule(Projects)
  const connectionsModule = getModule(Connections)
  // const transformersModule = getModule(Transformers)
  // const algorithmsModule = getModule(Algorithms)

  export default {
    name: "NewQuery",
    components: {
      Dialog,
      InputText,
      Button,
      Panel,
      Dropdown,
      Codemirror,
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
        // tranformerselected: null,
        // algorithmselected: null,
        // transformdata: null,
        connectiondata: null,
        submitted: false,
        displayModal: true,
        // algorithmdata: null,
      }
    },
    validations() {
      return {
        projectselected: { required },
        connectionselected: { required },
        name: { required },
        description: { required },
        icon: { required },
        // tranformerselected: { required },
        // algorithmselected: { required },
      }
    },
    computed: {
      projectList() {
        return projectsModule.getProjects.map((el) => ({
          label: el.label,
          key: el.id,
        }))
      },
      connectionList() {
        let projectIdx = projectsModule.getProjects.findIndex(
          (el) => el.id == this.projectselected
        )
        const localConnections =
          projectIdx == -1 ? [] : projectsModule.getLocalConnections(projectIdx)
        return [
          {
            label: "Global",
            code: "global",
            items: connectionsModule.getGlobalConnections.map((el) => {
              return { label: el.label, key: el.id, scope: el.scope }
            }),
          },
          {
            label: "Local",
            code: "local",
            items: localConnections.map((el) => {
              return { label: el.label, key: el.id, scope: el.scope }
            }),
          },
        ]
      },
      // transformerList() {
      //   let projectIdx = projectsModule.getProjects.findIndex(
      //     (el) => el.id == this.projectselected
      //   )
      //   const localTransformers =
      //     projectIdx == -1
      //       ? []
      //       : projectsModule.getLocalTransformers(projectIdx)
      //   return [
      //     {
      //       label: "Global",
      //       code: "global",
      //       items: transformersModule.getGlobalTransformers.map((el) => {
      //         return { label: el.label, key: el.id, scope: el.scope }
      //       }),
      //     },
      //     {
      //       label: "Local",
      //       code: "local",
      //       items: localTransformers.map((el) => {
      //         return { label: el.label, key: el.id, scope: el.scope }
      //       }),
      //     },
      //   ]
      // },
      // algorithmList() {
      //   let projectIdx = projectsModule.getProjects.findIndex(
      //     (el) => el.id == this.projectselected
      //   )
      //   const localAlgorithms =
      //     projectIdx == -1 ? [] : projectsModule.getLocalAlgorithms(projectIdx)
      //   return [
      //     {
      //       label: "Global",
      //       code: "global",
      //       items: algorithmsModule.getGlobalAlgorithms.map((el) => {
      //         return { label: el.label, key: el.id, scope: el.scope }
      //       }),
      //     },
      //     {
      //       label: "Local",
      //       code: "local",
      //       items: localAlgorithms.map((el) => {
      //         return { label: el.label, key: el.id, scope: el.scope }
      //       }),
      //     },
      //   ]
      // },
      extensions() {
        return settingsModule.data.theme === "dark"
          ? [javascript(), oneDark]
          : [javascript()]
      },
    },
    methods: {
      querycloseDialog() {
        this.$emit("close")
      },
      handleConnection({ value }) {
        const projectIdx = projectsModule.getProjects.findIndex(
          (el) => el.id == this.projectselected
        )
        let connection
        if (value.scope == "local") {
          connection = projectsModule
            .getLocalConnections(projectIdx)
            .find((el) => el.id == value.key)
        } else {
          connection = connectionsModule.getGlobalConnections.find((el) => {
            return el.id == value.key
          })
        }
        this.connectiondata = connection
      },
      // handleTransformer(el) {
      //   this.setTransformerCode(el.value)
      // },
      // handleAlgorithm(el) {
      //   this.setAlgorithmCode(el.value)
      // },
      // setTransformerCode(value) {
      //   const projectIdx = projectsModule.getProjects.findIndex(
      //     (el) => el.id == this.projectselected
      //   )
      //   let transformercode
      //   if (value.scope == "local") {
      //     transformercode = projectsModule
      //       .getLocalTransformers(projectIdx)
      //       .find((el) => el.id == value.key)
      //   } else {
      //     transformercode = transformersModule.getGlobalTransformers.find(
      //       (el) => {
      //         return el.id == value.key
      //       }
      //     )
      //   }
      //   this.transformdata = transformercode
      // },
      // setAlgorithmCode(value) {
      //   const projectIdx = projectsModule.getProjects.findIndex(
      //     (el) => el.id == this.projectselected
      //   )
      //   let algorithmcode
      //   if (value.scope == "local") {
      //     algorithmcode = projectsModule
      //       .getLocalAlgorithms(projectIdx)
      //       .find((el) => el.id == value.key)
      //   } else {
      //     algorithmcode = algorithmsModule.getGlobalAlgorithms.find((el) => {
      //       return el.id == value.key
      //     })
      //   }
      //   this.algorithmdata = algorithmcode
      // },
      handlequerystore(isFormValid) {
        const projectIdx = projectsModule.getProjects.findIndex(
          (el) => el.id == this.projectselected
        )
        const data = {
          projectIdx: projectIdx,
          data: {
            label: this.name,
            id: getRandomId(),
            description: this.description,
            connection: this.connectiondata,
            icon: this.icon,
            query: this.query,
            type: "query",
            // transformer: this.transformdata,
            // algorithm: this.algorithmdata,
            dataPath: "",
            endpoint: "",
            database: "",
          },
        }
        this.submitted = true
        if (!isFormValid) {
          return
        }
        projectsModule.addNewQuery(data)
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
    .p-panel.p-component {
      .p-panel-content {
        padding-top: 5px;
      }
    }
    .p-dropdown {
      width: 100%;
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
      width: 100%;
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
