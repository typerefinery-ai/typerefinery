<template>
  <Dialog
    v-model:visible="displayModal"
    class="theme-dialog"
    modal
    :closable="true"
    :breakpoints="{ '960px': '75vw', '640px': '100vw' }"
  >
    <template #header>
      <!-- add here header -->
      <span v-if="selectedEditNode" class="p-dialog-title"
        >{{ $t("components.dialog.new-theme.updated-header") }}
      </span>
      <span v-else class="p-dialog-title">
        {{ $t("components.dialog.new-theme.header") }}
      </span>
      <div class="p-dialog-header-icons">
        <button
          class="p-dialog-header-icon p-dialog-header-close p-link"
          aria-label="close"
          type="button"
          @click="themecloseDialog"
        >
          <span class="p-dialog-header-close-icon pi pi-times"></span>
        </button>
      </div>
    </template>
    <Panel :header="$t(`components.dialog.new-theme.info.panelheader`)">
      <div class="field">
        <label for="expand">{{
          $t("components.dialog.new-theme.info.project")
        }}</label>
        <Dropdown
          v-model="selected"
          :options="projectList"
          option-label="label"
          option-value="key"
          :placeholder="$t(`components.dialog.new-theme.info.select`)"
        />
      </div>
    </Panel>
    <Panel
      :header="$t(`components.dialog.new-theme.info.panel2header`)"
      class="panel2"
    >
      <div class="field">
        <label
          for="name"
          :class="{ 'p-error': v$.name.$invalid && submitted }"
          >{{ $t("components.dialog.new-theme.info.name") + "*" }}</label
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
        <label for="description">
          {{ $t("components.dialog.new-theme.info.description") }}</label
        >
        <InputText id="description" v-model="description" />
      </div>
      <div class="field">
        <label for="icon">
          {{ $t("components.dialog.new-theme.info.icon") }}</label
        >
        <InputText id="icon" v-model="icon" />
      </div>
      <div class="field">
        <label for="query">{{
          $t("components.dialog.new-theme.info.code")
        }}</label>
        <codemirror
          v-model="themecode"
          placeholder="Code goes here.."
          :style="{ height: '20vh' }"
          :autofocus="true"
          :indent-with-tab="true"
          :tab-size="2"
          :extensions="extensions"
        />
      </div>
    </Panel>
    <template #footer>
      <Button
        :label="$t(`components.dialog.new-transformer.footer.cancel`)"
        icon="pi pi-times"
        class="p-button-text"
        @click="themecloseDialog"
      />
      <Button
        v-if="selectedEditNode"
        :label="$t(`components.dialog.new-transformer.footer.update`)"
        icon="pi pi-check"
        autofocus
        @click="handleEditedConnectionStore(!v$.$invalid)"
      />
      <Button
        v-else
        :label="$t(`components.dialog.new-transformer.footer.save`)"
        icon="pi pi-check"
        autofocus
        @click="handlethemestore(!v$.$invalid)"
      />
    </template>
  </Dialog>
</template>

<script>
  import { getModule } from "vuex-module-decorators"
  import { required } from "@vuelidate/validators"
  import { useVuelidate } from "@vuelidate/core"
  import { getRandomId } from "@/utils"
  import { Codemirror } from "vue-codemirror"
  import { javascript } from "@codemirror/lang-javascript"
  import { oneDark } from "@codemirror/theme-one-dark"
  import { nanoid } from "nanoid"
  import axios from "@/axios"
  import Dialog from "primevue/dialog"
  import Dropdown from "primevue/dropdown"
  import InputText from "primevue/inputtext"
  import Button from "primevue/button"
  import Panel from "primevue/panel"
  import Projects from "@/store/Modules/Projects"
  import Connections from "@/store/Modules/Connections"
  import AppData from "@/store/Modules/AppData"
  const projectsModule = getModule(Projects)
  const connectionsModule = getModule(Connections)
  const appDataModule = getModule(AppData)
  import Settings from "@/store/Modules/Settings"
  const settingsModule = getModule(Settings)
  import Themes from "@/store/Modules/Theme"
  import { errorToast, successToast } from "@/utils/toastService"
  const themesModule = getModule(Themes)

  export default {
    name: "NewThemes",
    components: {
      Dialog,
      Panel,
      InputText,
      Button,
      Dropdown,
      Codemirror,
    },
    props: {
      themedialog: { type: Boolean, default: false },
    },
    emits: ["close"],
    setup: () => ({ v$: useVuelidate() }),
    data() {
      return {
        name: "",
        expanded: "",
        description: "",
        themecode: "",
        icon: "",
        host: "",
        port: "",
        database: "",
        display: true,
        selected: null,
        submitted: false,
        displayModal: true,
        selectedEditNode: false,
        connectionsIndex: null,
        projectsIndex: null,
        updateData: null,
        lengthData: null,
      }
    },
    validations() {
      return {
        name: { required },
        // description: { required },
        // icon: { required },
        // host: { required },
        // port: { required },
        // database: { required },
      }
    },
    computed: {
      extensions() {
        return settingsModule.data.theme === "dark"
          ? [javascript(), oneDark]
          : [javascript()]
      },
      projectList() {
        return projectsModule.getProjects.map((el) => ({
          label: el.label,
          key: el.id,
        }))
      },
    },
    // mounted() {
    //   if (appDataModule.data.treeNodePath) {
    //     const nodeData = appDataModule.data.treeNodePath.split("/")

    //     // local
    //     this.lengthData = nodeData
    //     if (nodeData.length == 2) {
    //       // check header and save button
    //       this.selectedEditNode = true

    //       // set project
    //       const projects = projectsModule.getProjects
    //       const projectIndex = projects.findIndex((el) => el.id == nodeData[0])

    //       this.projectsIndex = projectIndex
    //       this.selected = projects[projectIndex].id
    //       // connection index
    //       const connectionIndex = projects[
    //         projectIndex
    //       ].connections.list.findIndex((el) => el.id == nodeData[1])

    //       this.connectionsIndex = connectionIndex
    //       // for connection data
    //       const connection =
    //         projects[projectIndex].connections.list[connectionIndex]
    //       this.v$.name.$model = connection.label
    //       this.v$.description.$model = connection.description
    //       this.v$.icon.$model = connection.icon
    //       this.v$.host.$model = connection.host
    //       this.v$.port.$model = connection.port
    //       this.v$.database.$model = connection.database
    //     } else {
    //       this.selectedEditNode = true
    //       // set connection
    //       const connectionIndex =
    //         connectionsModule.getGlobalConnections.findIndex(
    //           (el) => el.id == nodeData[0]
    //         )
    //       this.connectionsIndex = connectionIndex
    //       // for connection data
    //       const connection =
    //         connectionsModule.getGlobalConnections[connectionIndex]
    //       this.v$.name.$model = connection.label
    //       this.v$.description.$model = connection.description
    //       this.v$.icon.$model = connection.icon
    //       this.v$.host.$model = connection.host
    //       this.v$.port.$model = connection.port
    //       this.v$.database.$model = connection.database
    //     }
    //   }
    // },
    methods: {
      themecloseDialog() {
        appDataModule.resetTreeNodePath()
        this.$emit("close")
      },

      // new dialog
      async handlethemestore(isFormValid) {
        const projectIndex = projectsModule.getProjects.findIndex(
          (el) => el.id == this.selected
        )
        const id = nanoid(14)
        const data = {
          projectIdx: projectIndex,
          data: {
            label: this.name,
            id: id,
            projectid: this.selected,
            scope: projectIndex == -1 ? "global" : "local",
            type: "theme",
            data: "string",
            icon: this.icon,
            themeid: id,
            description: this.description,
            theme: this.themecode,
          },
        }
        this.submitted = true
        // stop here if form is invalid
        if (!isFormValid) {
          return
        }
        try {
          const payload = {
            id: id,
            label: this.name,
            projectid: this.selected,
            scope: projectIndex == -1 ? "global" : "local",
            type: "theme",
            data: "string",
            icon: this.icon,
            themeid: id,
            description: this.description,
            theme: this.themecode,
          }
          await axios.post("/datastore/theme", payload)
          if (projectIndex == -1) {
            themesModule.addGlobalTheme(data.data)
          } else {
            projectsModule.addLocalTheme(data)
          }
          successToast(this, "Successfully Created!")
        } catch (err) {
          console.log(err)
          errorToast(this)
        }

        this.$emit("close")
      },
    },
  }
</script>
<style lang="scss">
  .theme-dialog {
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
