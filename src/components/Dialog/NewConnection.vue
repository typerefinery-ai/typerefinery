<template>
  <Dialog
    v-model:visible="displayModal"
    class="connection-dialog"
    modal
    :closable="true"
    :breakpoints="{ '960px': '75vw', '640px': '100vw' }"
  >
    <template #header>
      <!-- add here header -->
      <span v-if="selectedEditNode" class="p-dialog-title"
        >{{ $t("components.dialog.connections.updated-header") }}
      </span>
      <span v-else class="p-dialog-title">
        {{ $t("components.dialog.connections.header") }}
      </span>
      <div class="p-dialog-header-icons">
        <button
          class="p-dialog-header-icon p-dialog-header-close p-link"
          aria-label="close"
          type="button"
          @click="connectioncloseDialog"
        >
          <span class="p-dialog-header-close-icon pi pi-times"></span>
        </button>
      </div>
    </template>
    <Panel :header="$t(`components.dialog.connections.info.panelheader`)">
      <div class="field">
        <label for="expand">{{
          $t("components.dialog.connections.info.project")
        }}</label>
        <Dropdown
          v-model="selected"
          :options="projectList"
          option-label="label"
          option-value="key"
          :placeholder="$t(`components.dialog.connections.info.select`)"
        />
      </div>
    </Panel>
    <Panel
      :header="$t(`components.dialog.connections.info.panel2header`)"
      class="panel2"
    >
      <div class="field">
        <label for="name" :class="{ 'p-error': v$.name.$invalid && submitted }"
          >{{ $t("components.dialog.connections.info.name") }}*</label
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
          {{ $t("components.dialog.projects.info.description") }}</label
        >
        <InputText id="description" v-model="description" />
      </div>
      <div class="field">
        <label for="icon">
          {{ $t("components.dialog.projects.info.icon") }}</label
        >
        <InputText id="icon" v-model="icon" />
      </div>
      <div class="field">
        <label for="host" :class="{ 'p-error': v$.host.$invalid && submitted }">
          {{ $t("components.dialog.connections.info.uri") + "*" }}</label
        >
        <InputText
          id="host"
          v-model="v$.host.$model"
          :class="{ 'p-invalid': v$.host.$invalid && submitted }"
        />
        <small
          v-if="(v$.host.$invalid && submitted) || v$.host.$pending.$response"
          class="p-error"
          >{{ v$.host.required.$message.replace("Value", "Host") }}</small
        >
      </div>
      <div class="field">
        <label for="port" :class="{ 'p-error': v$.port.$invalid && submitted }">
          {{ $t("components.dialog.connections.info.port") + "*" }}</label
        >
        <InputText
          id="port"
          v-model="v$.port.$model"
          :class="{ 'p-invalid': v$.port.$invalid && submitted }"
        />
        <small
          v-if="(v$.port.$invalid && submitted) || v$.port.$pending.$response"
          class="p-error"
          >{{
            v$.port.required.$invalid
              ? v$.port.required.$message.replace("Value", "Port")
              : v$.port.numeric.$message.replace("Value", "Port")
          }}</small
        >
      </div>
      <div class="field">
        <label
          for="database"
          :class="{ 'p-error': v$.database.$invalid && submitted }"
        >
          {{ $t("components.dialog.connections.info.database") + "*" }}</label
        >
        <InputText
          id="database"
          v-model="v$.database.$model"
          :class="{ 'p-invalid': v$.database.$invalid && submitted }"
        />
        <small
          v-if="
            (v$.database.$invalid && submitted) ||
            v$.database.$pending.$response
          "
          class="p-error"
          >{{
            v$.database.required.$message.replace("Value", "Database")
          }}</small
        >
      </div>
    </Panel>
    <template #footer>
      <Button
        :label="$t(`components.dialog.new-transformer.footer.cancel`)"
        icon="pi pi-times"
        class="p-button-text"
        @click="connectioncloseDialog"
      />
      <!-- <Button
        v-if="selectedEditNode"
        :label="$t(`components.dialog.new-transformer.footer.update`)"
        icon="pi pi-check"
        autofocus
        @click="handleEditedConnectionStore(!v$.$invalid)"
      /> -->
      <Button
        :label="$t(`components.dialog.new-transformer.footer.save`)"
        icon="pi pi-check"
        autofocus
        @click="handleconnectionstore(!v$.$invalid)"
      />
    </template>
  </Dialog>
</template>

<script>
  import { getModule } from "vuex-module-decorators"
  import { required, numeric } from "@vuelidate/validators"
  import { useVuelidate } from "@vuelidate/core"
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
  import { errorToast, successToast } from "@/utils/toastService"
  const projectsModule = getModule(Projects)
  const connectionsModule = getModule(Connections)
  const appDataModule = getModule(AppData)

  export default {
    name: "NewConnections",
    components: {
      Dialog,
      Panel,
      InputText,
      Button,
      Dropdown,
    },
    props: {
      connectiondialog: { type: Boolean, default: false },
    },
    emits: ["close"],
    setup: () => ({ v$: useVuelidate() }),
    data() {
      return {
        name: "",
        expanded: "",
        description: "",
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
        host: { required },
        port: { required, numeric },
        database: { required },
      }
    },
    computed: {
      projectList() {
        return projectsModule.getProjects.map((el) => ({
          label: el.label,
          key: el.id,
        }))
      },
    },
    mounted() {
      if (appDataModule.data.treeNodePath) {
        const nodeData = appDataModule.data.treeNodePath.split("/")

        // local
        this.lengthData = nodeData
        if (nodeData.length == 2) {
          // check header and save button
          this.selectedEditNode = true

          // set project
          const projects = projectsModule.getProjects
          const projectIndex = projects.findIndex((el) => el.id == nodeData[0])

          this.projectsIndex = projectIndex
          this.selected = projects[projectIndex].id
          // connection index
          const connectionIndex = projects[
            projectIndex
          ].connections.list.findIndex((el) => el.id == nodeData[1])

          this.connectionsIndex = connectionIndex
          // for connection data
          const connection =
            projects[projectIndex].connections.list[connectionIndex]
          this.v$.name.$model = connection.label
          this.v$.description.$model = connection.description
          this.v$.icon.$model = connection.icon
          this.v$.host.$model = connection.host
          this.v$.port.$model = connection.port
          this.v$.database.$model = connection.database
        } else {
          this.selectedEditNode = true
          // set connection
          const connectionIndex =
            connectionsModule.getGlobalConnections.findIndex(
              (el) => el.id == nodeData[0]
            )
          this.connectionsIndex = connectionIndex
          // for connection data
          const connection =
            connectionsModule.getGlobalConnections[connectionIndex]
          this.v$.name.$model = connection.label
          this.v$.description.$model = connection.description
          this.v$.icon.$model = connection.icon
          this.v$.host.$model = connection.host
          this.v$.port.$model = connection.port
          this.v$.database.$model = connection.database
        }
      }
    },
    methods: {
      connectioncloseDialog() {
        appDataModule.resetTreeNodePath()
        this.$emit("close")
      },
      //update dialog
      // handleEditedConnectionStore(isFormValid) {
      //   let data
      //   if (this.lengthData.length == 1) {
      //     data = {
      //       connectionIdx: this.connectionsIndex,
      //       data: {
      //         ...connectionsModule.getGlobalConnections[this.connectionsIndex],
      //         label: this.v$.name.$model,
      //         icon: this.v$.icon.$model,
      //         host: this.v$.host.$model,
      //         port: this.v$.port.$model,
      //         database: this.v$.database.$model,
      //         description: this.v$.description.$model,
      //         type: "connection",
      //         scope: "local",
      //       },
      //     }
      //     connectionsModule.editGlobalConnection(data)
      //   } else {
      //     data = {
      //       connectionIdx: this.connectionsIndex,
      //       projectIdx: this.projectsIndex,
      //       data: {
      //         ...projectsModule.getProjects[this.projectsIndex].connections
      //           .list[this.connectionsIndex],
      //         label: this.v$.name.$model,
      //         host: this.v$.host.$model,
      //         port: this.v$.port.$model,
      //         database: this.v$.database.$model,
      //         icon: this.v$.icon.$model,
      //         description: this.v$.description.$model,
      //         type: "connection",
      //         scope: "global",
      //       },
      //     }
      //     projectsModule.editLocalConnection(data)
      //   }
      //   this.updateData = data
      //   this.submitted = true
      //   // stop here if form is invalid
      //   if (!isFormValid) {
      //     return
      //   }

      //   this.connectioncloseDialog()
      // },

      // new dialog
      async handleconnectionstore(isFormValid) {
        const projectIndex = projectsModule.getProjects.findIndex(
          (el) => el.id == this.selected
        )
        const id = nanoid(14)
        const data = {
          projectIdx: projectIndex,
          data: {
            label: this.name,
            host: this.host,
            port: this.port,
            database: this.database,
            icon: this.icon,
            description: this.description,
            type: "connection",
            id,
            scope: projectIndex == -1 ? "global" : "local",
          },
        }
        this.submitted = true
        // stop here if form is invalid
        if (!isFormValid) {
          return
        }
        try {
          const payload = {
            connectionid: id,
            projectid: this.selected,
            scope: projectIndex == -1 ? "global" : "local",
            label: this.name,
            host: this.host,
            port: this.port,
            database: this.database,
            icon: this.icon,
            description: this.description,
            type: "connection",
          }
          await axios.post("/datastore/connection", payload)
          if (projectIndex == -1) {
            connectionsModule.addGlobalConnection(data.data)
          } else {
            projectsModule.addLocalConnection(data)
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
  .connection-dialog {
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
