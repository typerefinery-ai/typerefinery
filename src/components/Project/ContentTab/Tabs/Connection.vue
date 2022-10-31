<template>
  <div class="connection-wrapper">
    <Fieldset
      :legend="$t(`components.dialog.connections.info.database-detail`)"
      class="mb-3"
    >
      <div class="grid formgrid connection-form">
        <div class="col-6 p-fluid">
          <div class="field">
            <label for="host"
              >{{ $t("components.dialog.connections.info.uri")
              }}<span class="asterisk">*</span></label
            >
            <InputText
              id="host"
              v-model.trim="v$.host.$model"
              aria-describedby="host"
              placeholder="Eg: localhost"
              :class="{ 'p-invalid': v$.host.$error }"
              @input="handleInput('host', $event.target.value)"
            />
          </div>
        </div>
        <div class="col-6 p-fluid">
          <div class="field">
            <label for="port">
              {{ $t("components.dialog.connections.info.port")
              }}<span class="asterisk">*</span></label
            >
            <InputText
              id="port"
              v-model.trim="v$.port.$model"
              aria-describedby="port"
              placeholder="Eg: 1729"
              :class="{ 'p-invalid': v$.port.$error }"
              @input="handleInput('port', $event.target.value)"
            />
          </div>
        </div>
        <div class="col-12 p-fluid">
          <div class="field">
            <label for="port"
              >{{ $t("components.dialog.connections.info.database")
              }}<span class="asterisk">*</span></label
            >
            <InputText
              id="database"
              v-model.trim="v$.database.$model"
              aria-describedby="database"
              placeholder="Enter database name"
              :class="{ 'p-invalid': v$.database.$error }"
              @input="handleInput('database', $event.target.value)"
            />
          </div>
        </div>
        <!-- <div class="col-12">
          <Button label="Fetch Databases" class="p-button-raised" />
        </div> -->
      </div>
    </Fieldset>
    <!-- <Fieldset legend="Databases">
      <div class="grid formgrid connection-form">
        <div class="col-12 p-fluid">
          <div class="field">
            <Dropdown
              v-model="selectedDb"
              :options="databases"
              option-label="name"
              placeholder="Select a Database"
            />
          </div>
        </div>
      </div>
    </Fieldset> -->
    <Fieldset
      :legend="$t(`components.dialog.connections.info.connection-detail`)"
    >
      <div class="grid formgrid connection-form">
        <div class="col-12 md:col-6 p-fluid">
          <div class="field">
            <label for="label"
              >{{ $t("components.dialog.connections.info.label")
              }}<span class="asterisk">*</span></label
            >
            <InputText
              id="label"
              :model-value="v$.label.$model"
              aria-describedby="label"
              placeholder="Enter connection label"
              :class="{ 'p-invalid': v$.label.$error }"
              @input="handleLabel($event)"
            />
            <span v-if="error" class="p-error">{{ error }}</span>
          </div>
        </div>
        <div class="col-12 md:col-6 p-fluid">
          <div class="field">
            <label for="icon">
              {{ $t("components.dialog.connections.info.icon") }}</label
            >
            <InputText
              id="icon"
              v-model.trim="icon"
              aria-describedby="icon"
              placeholder="Enter connection icon"
              @input="handleInput('icon', $event.target.value)"
            />
          </div>
        </div>
        <div class="col-12 p-fluid">
          <div class="field">
            <label for="description">{{
              $t("components.dialog.connections.info.description")
            }}</label>
            <InputText
              id="description"
              v-model.trim="description"
              aria-describedby="description"
              :placeholder="
                $t(
                  `components.dialog.connections.info.enter-connection-description`
                )
              "
              @input="handleInput('description', $event.target.value)"
            />
          </div>
        </div>
      </div>
    </Fieldset>
    <div class="col-12 mt-2">
      <Button
        label="Save"
        :disabled="Boolean(error) || v$.$invalid"
        class="p-button-raised mr-2"
        @click="saveConnection"
      />
      <Button label="Save as" class="p-button-raised" @click="handleDialog" />
    </div>
    <!-- Dialog -->
    <Dialog
      v-model:visible="showDialog"
      class="save-connection-dialog"
      modal
      :header="$t(`components.dialog.connections.save-connection-as`)"
      :style="{ width: '400px' }"
    >
      <div class="dialog-content">
        <div class="field">
          <label for="label">{{
            $t("components.dialog.connections.info.label")
          }}</label>
          <InputText
            id="connectionName"
            v-model.trim="connectionName"
            type="text"
            :placeholder="$t(`components.dialog.connections.info.label`)"
          />
          <span v-if="dialogError" class="p-error">{{ dialogError }}</span>
        </div>
        <Button
          class="p-button-raised mr-2"
          :disabled="!connectionName.length"
          :label="$t(`components.dialog.connections.save-as-global`)"
          @click="saveNewConnection('global')"
        />
        <Button
          v-if="isLocal"
          class="p-button-raised p-button-success"
          :disabled="!connectionName.length"
          :label="$t(`components.dialog.connections.save-as-local`)"
          @click="saveNewConnection('local')"
        />
      </div>
    </Dialog>
  </div>
</template>
<script>
  import { getModule } from "vuex-module-decorators"
  import { required } from "@vuelidate/validators"
  import useVuelidate from "@vuelidate/core"
  import InputText from "primevue/inputtext"
  import Button from "primevue/button"
  import Fieldset from "primevue/fieldset"
  import Dialog from "primevue/dialog"
  import { nanoid } from "nanoid"
  import axios from "@/axios"
  // import Dropdown from "primevue/dropdown"
  import Projects from "@/store/Modules/Projects"
  import Connections from "@/store/Modules/Connections"
  const projectsModule = getModule(Projects)
  const connectionsModule = getModule(Connections)
  export default {
    name: "ConnectionContent",
    components: { InputText, Fieldset, Button, Dialog },
    props: {
      tab: { type: Object, required: true },
    },
    emits: ["input"],
    setup() {
      return { v$: useVuelidate() }
    },
    data() {
      return {
        host: "localhost",
        port: 1729,
        database: "typerefinery",
        label: "",
        icon: "",
        description: "",
        debounce: null,
        showDialog: false,
        connectionName: "",
        error: "",
        dialogError: "",
        initialData: {
          icon: "",
          label: "",
          description: "",
          port: "",
          host: "",
          database: "",
        },
      }
    },
    validations() {
      return {
        host: { required },
        port: { required },
        database: { required },
        label: { required },
      }
    },
    computed: {
      isLocal() {
        return Boolean(this.tab.parent)
      },
    },
    mounted() {
      this.setInitialData()
    },
    methods: {
      setInitialData() {
        const { parent, id } = this.tab
        const projects = projectsModule.getProjects
        const projectIdx = projects.findIndex((el) => el.id === parent)
        // const connectionIdx = key.split("-").pop()
        let connection
        if (projectIdx != -1) {
          // local
          const connections = projectsModule.getLocalConnections(projectIdx)
          const connectionIdx = connections.findIndex((el) => el.id === id)
          connection = connections[connectionIdx]
          // const project = projectsModule.getProjects[projectIdx]
          // connection = project.connections.list[connectionIdx]
        } else {
          // global
          const connections = connectionsModule.getGlobalConnections
          const connectionIdx = connections.findIndex((el) => el.id === id)
          connection = connectionsModule.data.list[connectionIdx]
        }
        const { host, port, database, label, icon, description } = connection
        this.v$.host.$model = host
        this.v$.port.$model = port
        this.v$.database.$model = database
        this.v$.label.$model = label
        this.icon = icon
        this.description = description
        this.initialData = {
          icon,
          label,
          description,
          port,
          host,
          database,
        }
      },
      handleInput(key, value) {
        this.setFormDirty(!(this.initialData[key].trim() === value.trim()))
      },
      setFormDirty(val = true) {
        const payload = { id: this.tab.id, isDirty: val }
        this.$emit("input", payload)
      },
      // async handeInput({ target: { value } }, field) {
      //   clearTimeout(this.debounce)
      //   this.debounce = setTimeout(async () => {
      //     const { parent, id } = this.tab
      //     const projects = projectsModule.getProjects
      //     const projectIdx = projects.findIndex((el) => el.id === parent)
      //     if (projectIdx != -1) {
      //       const connections = projectsModule.getLocalConnections(projectIdx)
      //       const connectionIdx = connections.findIndex((el) => el.id === id)
      //       const payload = { field, value, connectionIdx, ...this.tab }
      //       await projectsModule.setConnectionData(payload)
      //     } else {
      //       // global
      //       const connections = connectionsModule.getGlobalConnections
      //       const connectionIdx = connections.findIndex((el) => el.id === id)
      //       const payload = { field, value, connectionIdx, ...this.tab }
      //       await connectionsModule.setGlobalConnection(payload)
      //     }
      //   }, 500)
      // },
      handleDialog() {
        this.showDialog = !this.showDialog
      },
      handleLabel({ target: { value } }) {
        clearTimeout(this.debounce)
        this.debounce = setTimeout(async () => {
          this.v$.label.$model = value.trim()
          this.handleInput("label", value)
          const { parent, id } = this.tab
          const projects = projectsModule.getProjects
          const projectIdx = projects.findIndex((el) => el.id === parent)
          if (projectIdx === -1) {
            const connections = connectionsModule.getGlobalConnections.filter(
              (el) => el.id !== id
            )
            const connectionExists = connections.find(
              (el) => el.label.toLowerCase() === value.toLowerCase().trim()
            )
            if (connectionExists) {
              this.error = `Connection with label "${value}" already exists.`
            } else {
              this.error = ""
            }
          } else {
            const connection = projectsModule
              .getLocalConnections(projectIdx)
              .filter((el) => el.id !== id)
            const connectionExists = connection.find(
              (el) => el.label.toLowerCase() === value.toLowerCase().trim()
            )
            if (connectionExists) {
              this.error = `Connection with label "${value}" already exists.`
            } else {
              this.error = ""
            }
          }
        }, 500)
      },
      checkExists(scope, label) {
        const { parent } = this.tab
        const projects = projectsModule.getProjects
        const projectIdx = projects.findIndex((el) => el.id === parent)
        if (scope === "global") {
          const connections = connectionsModule.getGlobalConnections
          const connectionExists = connections.find(
            (el) => el.label.toLowerCase() === label.toLowerCase().trim()
          )
          if (connectionExists) {
            this.dialogError = `Connection with label "${label}" already exists.`
            return true
          } else {
            this.dialogError = ""
            return false
          }
        } else {
          const connections = projectsModule.getLocalConnections(projectIdx)
          const connectionExists = connections.find(
            (el) => el.label.toLowerCase() === label.toLowerCase().trim()
          )
          if (connectionExists) {
            this.dialogError = `Connection with label "${label}" already exists.`
            return true
          } else {
            this.dialogError = ""
            return false
          }
        }
      },
      async saveConnection() {
        if (this.error) return
        const { parent, id } = this.tab
        const projects = projectsModule.getProjects
        const projectIdx = projects.findIndex((el) => el.id === parent)
        if (projectIdx != -1) {
          const connections = projectsModule.getLocalConnections(projectIdx)
          const connectionIdx = connections.findIndex((el) => el.id === id)
          const data = {
            ...connections[connectionIdx],
            host: this.v$.host.$model,
            port: this.v$.port.$model,
            database: this.v$.database.$model,
            label: this.v$.label.$model,
            icon: this.icon,
            description: this.description,
          }
          await projectsModule.setConnectionData({
            data,
            connectionIdx,
            projectIdx,
          })
          this.setFormDirty(false)
        } else {
          // global
          const connections = connectionsModule.getGlobalConnections
          const connectionIdx = connections.findIndex((el) => el.id === id)
          const data = {
            ...connections[connectionIdx],
            host: this.v$.host.$model,
            port: this.v$.port.$model,
            database: this.v$.database.$model,
            label: this.v$.label.$model,
            icon: this.icon,
            description: this.description,
          }
          const payload = { data, connectionIdx }
          await connectionsModule.setGlobalConnection(payload)
          this.setFormDirty(false)
        }
      },
      async saveNewConnection(scope) {
        const { parent: projectId } = this.tab
        const projects = projectsModule.getProjects
        const projectIdx = projects.findIndex((el) => el.id === projectId)
        const connectionid = nanoid(14)
        const data = {
          label: this.connectionName, // new connection
          id: connectionid,
          projectid: projectId,
          scope: projectIdx == -1 ? "global" : "local",
          type: "connection",
          data: "",
          connectionid,
          host: this.v$.host.$model,
          port: this.v$.port.$model,
          database: this.v$.database.$model,
          icon: this.icon,
          description: this.description,
        }
        try {
          if (scope === "global") {
            if (!this.checkExists("global", this.connectionName)) {
              await axios.post("/datastore/connection", data)
              connectionsModule.addGlobalConnection(data)
              this.showDialog = false
              this.connectionName = ""
            }
          } else if (scope === "local") {
            if (!this.checkExists("local", this.connectionName)) {
              await axios.post("/datastore/connection", data)
              projectsModule.addLocalConnection({ projectIdx, data })
              this.showDialog = false
              this.connectionName = ""
            }
          }
        } catch (err) {
          console.log(err)
        }
      },
    },
    // methods: {
    //   async handeInput({ target: { value } }, field) {
    //     clearTimeout(this.debounce)
    //     this.debounce = setTimeout(async () => {
    //       const payload = { field, value, ...this.tab }
    //       await projectsModule.setConnectionData(payload)
    //     }, 600)
    //   },
    // },
  }
</script>
<style scoped lang="scss">
  .connection-wrapper {
    padding: 1rem 1.75rem;
    .connection-form {
      margin-top: -0.75rem;
    }
    .asterisk {
      position: relative;
      bottom: 3px;
      color: #908b8b;
    }
    .field > label {
      display: block;
    }
    input {
      width: 100%;
    }
  }
  div.save-connection-dialog.p-dialog {
    .p-dialog-content {
      padding-bottom: 1.5rem;
      input {
        width: 100%;
      }
    }
  }
</style>
