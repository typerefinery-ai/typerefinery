<template>
  <Dialog
    v-model:visible="displayModal"
    class="algorithm-dialog"
    modal
    :closable="true"
    :breakpoints="{ '960px': '75vw', '640px': '100vw' }"
  >
    <template #header>
      <!-- add here header -->
      <span v-if="selectedEditNode" class="p-dialog-title"
        >{{ $t("components.dialog.new-algorithm.updated-header") }}
      </span>
      <span v-else class="p-dialog-title">
        {{ $t("components.dialog.new-algorithm.header") }}
      </span>
      <div class="p-dialog-header-icons">
        <button
          class="p-dialog-header-icon p-dialog-header-close p-link"
          aria-label="close"
          type="button"
          @click="algorithmcloseDialog"
        >
          <span class="p-dialog-header-close-icon pi pi-times"></span>
        </button>
      </div>
    </template>
    <Panel :header="$t(`components.dialog.new-algorithm.panel1.header`)">
      <div class="field">
        <label for="expand">{{
          $t("components.dialog.new-algorithm.panel1.label1")
        }}</label>
        <Dropdown
          v-model="selected"
          :options="projectList"
          option-label="label"
          option-value="key"
          :placeholder="$t(`components.dialog.new-algorithm.panel1.select`)"
        />
      </div>
    </Panel>
    <Panel
      :header="$t(`components.dialog.new-algorithm.panel2.header`)"
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
      <div class="field">
        <label
          for="query"
          :class="{ 'p-error': v$.query.$invalid && submitted }"
        >
          {{ $t("components.dialog.new-algorithm.panel2.query") + "*" }}</label
        >
        <codemirror
          v-model="query"
          class="codemirror"
          placeholder="Code goes here..."
          :style="{ height: '20vh' }"
          :indent-with-tab="true"
          :tab-size="2"
          :extensions="extensions"
        />

        <small
          v-if="(v$.query.$invalid && submitted) || v$.query.$pending.$response"
          class="p-error"
          >{{ v$.query.required.$message.replace("Value", "Query") }}</small
        >
      </div>
    </Panel>
    <template #footer>
      <Button
        :label="$t(`components.dialog.new-algorithm.footer.cancel`)"
        icon="pi pi-times"
        class="p-button-text"
        @click="algorithmcloseDialog"
      />
      <Button
        v-if="selectedEditNode"
        :label="$t(`components.dialog.new-algorithm.footer.update`)"
        icon="pi pi-check"
        autofocus
        @click="handleEditedAlgorithmStore(!v$.$invalid)"
      />
      <Button
        v-else
        :label="$t(`components.dialog.new-algorithm.footer.save`)"
        icon="pi pi-check"
        autofocus
        @click="handleAlgorithmStore(!v$.$invalid)"
      />
    </template>
  </Dialog>
</template>

<script>
  import { getModule } from "vuex-module-decorators"
  import { required } from "@vuelidate/validators"
  import { useVuelidate } from "@vuelidate/core"
  import { oneDark } from "@codemirror/theme-one-dark"
  import { Codemirror } from "vue-codemirror"
  import { javascript } from "@codemirror/lang-javascript"
  import { getRandomId } from "@/utils"
  import Dialog from "primevue/dialog"
  import Dropdown from "primevue/dropdown"
  import InputText from "primevue/inputtext"
  import Button from "primevue/button"
  import Panel from "primevue/panel"
  import Projects from "@/store/Modules/Projects"
  import Settings from "@/store/Modules/Settings"
  import Algorithms from "@/store/Modules/Algorithms"
  import AppData from "@/store/Modules/AppData"
  const settingsModule = getModule(Settings)
  const projectsModule = getModule(Projects)
  const algorithmsModule = getModule(Algorithms)
  const appDataModule = getModule(AppData)

  export default {
    name: "NewAlgorithms",
    components: {
      Dialog,
      Panel,
      InputText,
      Button,
      Dropdown,
      Codemirror,
    },
    props: {
      algorithmdialog: { type: Boolean, default: false },
    },
    emits: ["close"],
    setup: () => ({ v$: useVuelidate() }),
    data() {
      return {
        type: "Algorithm",
        name: "",
        expanded: "",
        description: "",
        icon: "",
        query: "",
        display: true,
        selected: null,
        submitted: false,
        displayModal: true,
        selectedEditNode: false,
        algorithmsIndex: null,
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
        query: { required },
      }
    },
    computed: {
      projectList() {
        return projectsModule.getProjects.map((el) => ({
          label: el.label,
          key: el.id,
        }))
      },
      extensions() {
        return settingsModule.data.theme === "dark"
          ? [javascript(), oneDark]
          : [javascript()]
      },
    },
    mounted() {
      if (appDataModule.data.treeNodePath) {
        const nodeData = appDataModule.data.treeNodePath.split("/")

        // Check for local and global
        this.lengthData = nodeData
        if (nodeData.length == 2) {
          this.selectedEditNode = true

          // set project
          const projects = projectsModule.getProjects
          const projectIndex = projects.findIndex((el) => el.id == nodeData[0])
          this.projectsIndex = projectIndex
          this.selected = projects[projectIndex].id
          // algorithm index
          const algorithmIndex = projects[
            projectIndex
          ].algorithms.list.findIndex((el) => el.id == nodeData[1])

          this.algorithmsIndex = algorithmIndex

          // for algorithm data
          const algorithm =
            projects[projectIndex].algorithms.list[algorithmIndex]
          this.v$.name.$model = algorithm.label
          this.v$.description.$model = algorithm.description
          this.v$.icon.$model = algorithm.icon
          this.v$.query.$model = algorithm.query
        } else {
          this.selectedEditNode = true
          // set algorithm
          const algorithmIndex = algorithmsModule.getGlobalAlgorithms.findIndex(
            (el) => el.id == nodeData[0]
          )
          this.algorithmsIndex = algorithmIndex
          // for algorithm data
          const algorithm = algorithmsModule.getGlobalAlgorithms[algorithmIndex]
          this.v$.name.$model = algorithm.label
          this.v$.description.$model = algorithm.description
          this.v$.icon.$model = algorithm.icon
          this.v$.query.$model = algorithm.query
        }
      }
    },
    methods: {
      algorithmcloseDialog() {
        appDataModule.resetTreeNodePath()
        this.$emit("close")
      },
      //update dialog
      handleEditedAlgorithmStore(isFormValid) {
        let data
        if (this.lengthData.length == 1) {
          data = {
            algorithmIdx: this.algorithmsIndex,
            data: {
              ...algorithmsModule.getGlobalAlgorithms[this.algorithmsIndex],
              label: this.v$.name.$model,
              icon: this.v$.icon.$model,
              code: this.v$.query.$model,
              description: this.v$.description.$model,
              type: "algorithm",
              scope: "global",
            },
          }
          algorithmsModule.editGlobalAlgorithm(data)
        } else {
          data = {
            algorithmIdx: this.algorithmsIndex,
            projectIdx: this.projectsIndex,
            data: {
              ...projectsModule.getLocalAlgorithms[this.algorithmsIndex],
              label: this.v$.name.$model,
              icon: this.v$.icon.$model,
              description: this.v$.description.$model,
              query: this.v$.query.$model,
              type: "algorithm",
              scope: "local",
            },
          }
          projectsModule.editLocalAlgorithm(data)
        }

        this.submitted = true
        // stop here if form is invalid
        if (!isFormValid) {
          return
        }
        this.algorithmcloseDialog()
      },

      // new dialog
      handleAlgorithmStore(isFormValid) {
        const projectIndex = projectsModule.getProjects.findIndex(
          (el) => el.id == this.selected
        )
        const data = {
          projectIdx: projectIndex,
          data: {
            label: this.name,
            icon: this.icon,
            description: this.description,
            query: this.query,
            type: "algorithm",
            id: getRandomId(),
            logs: [""],
            error: "",
            scope: projectIndex == -1 ? "global" : "local",
          },
        }
        this.submitted = true
        // stop here if form is invalid
        if (!isFormValid) {
          return
        }
        if (projectIndex == -1) {
          algorithmsModule.addGlobalAlgorithm(data.data)
        } else {
          projectsModule.addLocalAlgorithm(data)
        }
        this.$emit("close")
      },
    },
  }
</script>
<style lang="scss">
  .algorithm-dialog {
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
    input {
      width: 100%;
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
