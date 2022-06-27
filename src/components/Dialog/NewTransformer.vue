<template>
  <Dialog
    v-model:visible="displayModal"
    class="transformer-dialog"
    modal
    :closable="true"
    :breakpoints="{ '960px': '75vw', '640px': '100vw' }"
  >
    <template #header>
      <span v-if="selectedEditNode" class="p-dialog-title"
        >{{ $t("components.dialog.new-transformer.updated-header") }}
      </span>
      <span v-else class="p-dialog-title">
        {{ $t("components.dialog.new-transformer.header") }}</span
      >
      <div class="p-dialog-header-icons">
        <button
          class="p-dialog-header-icon p-dialog-header-close p-link"
          aria-label="close"
          type="button"
          @click="transformercloseDialog"
        >
          <span class="p-dialog-header-close-icon pi pi-times"></span>
        </button>
      </div>
    </template>
    <Panel :header="$t(`components.dialog.new-transformer.panel1.header`)">
      <div class="field">
        <label
          for="expand"
          :class="{ 'p-error': v$.projectselected.$invalid && submitted }"
        >
          {{ $t("components.dialog.new-transformer.panel1.label1") }}</label
        >
        <Dropdown
          v-model="v$.projectselected.$model"
          :options="projectList"
          option-label="name"
          option-value="key"
          :placeholder="$t(`components.dialog.new-transformer.panel1.select`)"
          :class="{ 'p-error': v$.projectselected.$invalid && submitted }"
          @change="collectProject"
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
      :header="$t(`components.dialog.new-transformer.panel2.header`)"
      class="panel2"
    >
      <div class="field">
        <label
          for="name"
          :class="{ 'p-error': v$.name.$invalid && submitted }"
          >{{ $t("components.dialog.projects.info.name") + "*" }}</label
        >
        <InputText
          id="name"
          v-model="v$.name.$model"
          :class="{ 'p-invalid': v$.name.$invalid && submitted }"
        />
        <small
          v-if="(v$.name.$invalid && submitted) || v$.name.$pending.$response"
          class="p-error"
          >{{ v$.name.required.$message.replace("Value", "Name") }}</small
        >
      </div>
      <div class="field">
        <label
          for="description"
          :class="{ 'p-error': v$.description.$invalid && submitted }"
        >
          {{ $t("components.dialog.projects.info.description") + "*" }}</label
        >
        <InputText
          id="description"
          v-model="v$.description.$model"
          :class="{ 'p-invalid': v$.description.$invalid && submitted }"
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
          {{ $t("components.dialog.projects.info.icon") + "*" }}</label
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
    </Panel>
    <!-- <Button label="Submit" @click="handleconnectionstore" /> -->
    <template #footer>
      <Button
        :label="$t(`components.dialog.new-transformer.footer.cancel`)"
        icon="pi pi-times"
        class="p-button-text"
        @click="transformercloseDialog"
      />
      <Button
        v-if="selectedEditNode"
        :label="$t(`components.dialog.new-transformer.footer.update`)"
        icon="pi pi-check"
        autofocus
        @click="handleEditedTransformerStore(!v$.$invalid)"
      />
      <Button
        v-else
        :label="$t(`components.dialog.new-transformer.footer.save`)"
        icon="pi pi-check"
        autofocus
        @click="handletransformerstore(!v$.$invalid)"
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
  import { required } from "@vuelidate/validators"
  import { useVuelidate } from "@vuelidate/core"
  import Projects from "@/store/Modules/Projects"
  import { getModule } from "vuex-module-decorators"
  const appProjects = getModule(Projects)

  //   console.log(appProjects.projectList)

  export default {
    name: "NewTransformer",
    components: {
      Dialog,
      InputText,
      Button,
      Panel,
      Dropdown,
    },
    props: {
      transformerdialog: { type: Boolean, default: false },
    },
    emits: ["close"],
    setup: () => ({ v$: useVuelidate() }),
    data() {
      return {
        type: "",
        name: "",
        expanded: "",
        description: "",
        icon: "",
        display: true,
        projectselected: null,
        submitted: false,
        displayModal: true,
        selectedEditNode: false,
        transformerIndex: null,
        projectIndex: null,
      }
    },
    validations() {
      return {
        projectselected: { required },
        name: { required },
        description: { required },
        icon: { required },
      }
    },
    computed: {
      projectList() {
        return appProjects.projectList
      },
    },
    mounted() {
      if (appProjects.editNode) {
        const nodeData = appProjects.editNode.split("/")
        this.selectedEditNode = true
        // set project
        const projects = appProjects.list
        const projectIdx = appProjects.projectList.findIndex(
          (el) => el.name == nodeData[0]
        )
        this.projectIndex = projectIdx
        this.v$.projectselected.$model = projects[projectIdx].name

        // transformer index
        const TransformerIdx = projects[projectIdx].transformers.list.findIndex(
          (el) => el.name == nodeData[1]
        )
        this.transformerIndex = TransformerIdx

        //transformer data
        const transformer = projects[projectIdx].transformers.list.find(
          (el) => el.name == nodeData[1]
        )
        this.v$.name.$model = transformer.name
        this.v$.description.$model = transformer.description
        this.v$.icon.$model = transformer.icon
      }
    },
    methods: {
      collectProject() {
        appProjects.selectedProject(this.projectselected)
      },
      transformercloseDialog() {
        this.$emit("close")
        appProjects.reseteditNode()
      },
      handleEditedTransformerStore(isFormValid) {
        const data = {
          transformerId: this.transformerIndex,
          projectId: this.projectIndex,
          name: this.v$.projectselected.$model,
          list: {
            name: this.v$.name.$model,
            description: this.v$.description.$model,
            icon: this.v$.icon.$model,
            type: "transformer",
          },
        }
        this.submitted = true
        // stop here if form is invalid
        if (!isFormValid) {
          return
        }
        appProjects.editTransformer(data)
        this.$emit("close")
      },
      handletransformerstore(isFormValid) {
        const projectIdx = appProjects.projectList.findIndex(
          (el) => el.name == this.projectselected
        )
        const data = {
          name: this.projectselected,
          projectid: projectIdx,

          list: {
            name: this.name,
            description: this.description,
            icon: this.icon,
            type: "transformer",
          },
        }
        this.submitted = true
        // stop here if form is invalid
        if (!isFormValid) {
          return
        }
        appProjects.addNewTransformer(data)
        this.$emit("close")
      },
    },
  }
</script>
<style lang="scss">
  html.t-light .p-panel .p-panel-header {
    background-color: #f8f9fa;
  }
  .transformer-dialog {
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
