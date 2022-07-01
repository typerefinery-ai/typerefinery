<template>
  <Dialog
    v-model:visible="displayModal"
    class="transformer-dialog"
    modal
    :closable="true"
    :breakpoints="{ '960px': '75vw', '640px': '100vw' }"
  >
    <template #header>
      <!-- add here header -->
      <span v-if="selectedEditNode" class="p-dialog-title"
        >{{ $t("components.dialog.new-transformer.updated-header") }}
      </span>
      <span v-else class="p-dialog-title">
        {{ $t("components.dialog.new-transformer.header") }}
      </span>
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
        <label for="expand">{{
          $t("components.dialog.new-transformer.panel1.label1")
        }}</label>
        <Dropdown
          v-model="selected"
          :options="projectList"
          option-label="label"
          option-value="key"
          :placeholder="$t(`components.dialog.new-transformer.panel1.select`)"
        />
        <!--  <small
          v-if="
            (v$.selected.$invalid && submitted) ||
            v$.selected.$pending.$response
          "
          class="p-error"
          >{{
            v$.selected.required.$message.replace("Value", "Project")
          }}</small
        > -->
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
  //import Avatar from "primevue/avatar"
  import Dropdown from "primevue/dropdown"
  import InputText from "primevue/inputtext"
  import Button from "primevue/button"
  import Panel from "primevue/panel"
  import Projects from "@/store/Modules/Projects"
  import { getModule } from "vuex-module-decorators"
  import { required } from "@vuelidate/validators"
  import { useVuelidate } from "@vuelidate/core"
  const appData = getModule(Projects)

  export default {
    name: "NewTransformers",
    components: {
      Dialog,
      Panel,
      InputText,
      Button,
      Dropdown,
    },
    props: {
      transformerdialog: { type: Boolean, default: false },
    },
    emits: ["close"],
    setup: () => ({ v$: useVuelidate() }),
    data() {
      return {
        type: "Transformer",
        name: "",
        expanded: "",
        description: "",
        icon: "",
        display: true,
        selected: null,
        submitted: false,
        displayModal: true,
        selectedEditNode: false,
        transformersIndex: null,
        projectsIndex: null,
        updateData: null,
        lengthData: null,
      }
    },
    validations() {
      return {
        name: { required },
        description: { required },
        icon: { required },
        // selected: { required },
      }
    },
    computed: {
      projectList() {
        return appData.projectsList
      },
    },
    mounted() {
      if (appData.treeNodePath) {
        const nodeData = appData.treeNodePath.split("/")

        // For local
        this.lengthData = nodeData
        if (nodeData.length == 2) {
          this.selectedEditNode = true

          // set project
          const projects = appData.list[0].list
          const projectIndex = appData.list[0].list.findIndex(
            (el) => el.id == nodeData[0]
          )
          this.projectsIndex = projectIndex
          this.selected = projects[projectIndex].id
          // transformer index
          const transformerIndex = projects[
            projectIndex
          ].transformers.list.findIndex((el) => el.id == nodeData[1])

          this.transformersIndex = transformerIndex

          // for transformer data
          const transformer = projects[projectIndex].transformers.list.find(
            (el) => el.id == nodeData[1]
          )
          this.v$.name.$model = transformer.label
          this.v$.description.$model = transformer.description
          this.v$.icon.$model = transformer.icon
        } else {
          this.selectedEditNode = true
          // set transformer
          const transformerIndex = appData.list[2].list.findIndex(
            (el) => el.id == nodeData[0]
          )
          this.transformersIndex = transformerIndex
          // for transformer data
          const transformer = appData.list[2].list.find(
            (el) => el.id == nodeData[0]
          )
          this.v$.name.$model = transformer.label
          this.v$.description.$model = transformer.description
          this.v$.icon.$model = transformer.icon
        }
      }
    },
    methods: {
      transformercloseDialog() {
        appData.resetTreeNodePath()
        this.$emit("close")
        //clear store here for editnode
      },
      //update dialog
      handleEditedTransformerStore(isFormValid) {
        let data
        if (this.lengthData.length == 1) {
          data = {
            transformerIdx: this.transformersIndex,
            projectIdx: -1,
            data: {
              ...appData.list[2].list[this.transformersIndex],
              // name: this.v$.name.$model,
              label: this.v$.name.$model,
              icon: this.v$.icon.$model,
              description: this.v$.description.$model,
              type: "transformer",
            },
          }
        } else {
          data = {
            transformerIdx: this.transformersIndex,
            projectIdx: this.projectsIndex,
            data: {
              ...appData.list[0].list[this.projectsIndex].transformers.list[
                this.transformersIndex
              ],
              label: this.v$.name.$model,
              icon: this.v$.icon.$model,
              description: this.v$.description.$model,
              type: "transformer",
            },
          }
        }
        this.updateData = data

        this.submitted = true
        // stop here if form is invalid
        if (!isFormValid) {
          return
        }

        appData.editTransformer(data)
        this.transformercloseDialog()
      },

      // new dialog
      handletransformerstore(isFormValid) {
        const projectIndex = appData.list[0].list.findIndex(
          (el) => el.id == this.selected
        )
        const data = {
          name: this.selected,
          projectIdx: projectIndex,
          data: {
            // name: this.name,
            label: this.name,
            icon: this.icon,
            description: this.description,
            type: "transformer",
            id: Math.random()
              .toString(36)
              .replace(/[^a-z]+/g, "")
              .substr(2, 10),
          },
        }
        this.submitted = true
        // stop here if form is invalid
        if (!isFormValid) {
          return
        }
        appData.addNewTransformer(data)
        this.$emit("close")
      },
    },
  }
</script>
<style lang="scss">
  .transformer-dialog {
    height: 100vh;
    width: 40vw;
    .p-dropdown {
      width: 80%;
    }
    input {
      width: 80%;
    }
    .field {
      display: grid;
    }
    .p-dialog-content {
      height: 100%;
    }
    .panel2 {
      margin-top: 10px;
    }
    .p-dialog-header {
      padding: 1.25rem 1.8rem;

      .p-dialog-header-icons:last-of-type {
        display: none;
      }
    }
  }
</style>
