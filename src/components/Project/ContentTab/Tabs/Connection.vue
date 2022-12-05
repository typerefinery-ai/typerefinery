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
              type="text"
              aria-describedby="host"
              placeholder="Eg: localhost"
              :class="{ 'p-invalid': v$.host.$error }"
              @input="handleInput('host', $event.target.value)"
            />
          </div>
        </div>
        <div class="col-6 p-fluid">
          <div class="field">
            <label
              for="port"
              :class="{ 'p-error': v$.port.$invalid && submitted }"
            >
              {{ $t("components.dialog.connections.info.port")
              }}<span class="asterisk">*</span></label
            >
            <!-- <label for="port">
              {{ $t("components.dialog.connections.info.port")
              }}<span class="asterisk">*</span></label
            > -->
            <InputText
              id="port"
              v-model="v$.port.$model"
              :class="{ 'p-invalid': v$.port.$invalid && submitted }"
              aria-describedby="port"
              placeholder="Eg: 1729"
              @input="handleInput('port', $event.target.value, !v$.$invalid)"
            />
            <small
              v-if="
                (v$.port.$invalid && submitted) || v$.port.$pending.$response
              "
              class="p-error"
              >{{
                v$.port.required.$invalid
                  ? v$.port.required.$message.replace("Value", "Port")
                  : v$.port.numeric.$message.replace("Value", "Port")
              }}</small
            >
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
              :placeholder="$t(`components.dialog.connections.db-placeholder`)"
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
              :placeholder="
                $t(`components.dialog.connections.label-placeholder`)
              "
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
              :placeholder="
                $t(`components.dialog.connections.icon-placeholder`)
              "
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
        :label="$t(`components.dialog.projects.info.save`)"
        :disabled="checkTabIfDirty() || Boolean(error) || v$.$invalid"
        class="p-button-raised mr-2"
        @click="saveConnection(!v$.$invalid)"
      />
      <Button
        :label="$t(`components.dialog.projects.info.saveas`)"
        class="p-button-raised"
        @click="handleDialog"
      />
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
<script lang="ts">
  import { getModule } from "vuex-module-decorators"
  import { required, numeric } from "@vuelidate/validators"
  import useVuelidate from "@vuelidate/core"
  import InputText from "primevue/inputtext"
  import Button from "primevue/button"
  import Fieldset from "primevue/fieldset"
  import Dialog from "primevue/dialog"
  import { nanoid } from "nanoid"
  import axios from "@/axios"
  import { errorToast, successToast } from "@/utils/toastService"
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
      dirtyTabs: { type: Object, required: true },
    },
    emits: ["input", "check-tab-if-dirty"],
    setup() {
      return { v$: useVuelidate() }
    },
    data() {
      return {
        host: "localhost",
        port: 1729 as number,
        database: "typerefinery",
        label: "",
        icon: "",
        description: "",
        debounce: null,
        showDialog: false,
        submitted: false,
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
        dirtyStack: new Set(),
      }
    },
    validations() {
      return {
        host: { required },
        port: { required, numeric },
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
      checkTabIfDirty() {
        return !this.dirtyTabs[this.tab.id]
      },
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
      handleInput(key, value, isFormValid) {
        const oldDirtyStackSize = this.dirtyStack.size
        if (this.initialData[key].trim() !== value.trim()) {
          this.dirtyStack.add(key)
          this.submitted = true
          // stop here if form is invalid
          if (!isFormValid) {
            return
          }
        } else {
          if (this.dirtyStack.has(key) === true) {
            this.dirtyStack.delete(key)
          }
        }
        const newDirtyStackSize = this.dirtyStack.size
        if (newDirtyStackSize === 0) {
          this.setFormDirty(false)
        } else {
          if (oldDirtyStackSize === 0) {
            this.setFormDirty(true)
          }
        }
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
              this.error = this.$t(
                "components.dialog.connections.info.connection-error",
                {
                  error: `${value}`,
                }
              )
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
              this.error = this.$t(
                "components.dialog.connections.info.connection-error",
                {
                  error: `${value}`,
                }
              )
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
            this.dialogError = this.$t(
              "components.dialog.connections.info.connection-error",
              {
                error: `${label}`,
              }
            )
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
            this.dialogError = this.$t(
              "components.dialog.connections.info.connection-error",
              {
                error: `${label}`,
              }
            )
            return true
          } else {
            this.dialogError = ""
            return false
          }
        }
      },
      async saveConnection(isFormValid) {
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
          this.submitted = true
          // stop here if form is invalid
          if (!isFormValid) {
            return
          }
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
          this.submitted = true
          // stop here if form is invalid
          if (!isFormValid) {
            return
          }
        }
        //Updating Initial Data
        this.initialData = {
          host: this.v$.host.$model,
          port: this.v$.port.$model,
          database: this.v$.database.$model,
          label: this.v$.label.$model,
          icon: this.icon,
          description: this.description,
        }
        this.setFormDirty(false)
        this.dirtyStack = new Set()
        successToast(
          this,
          this.$t("components.dialog.connections.info.save-connection")
        )
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
              this.setFormDirty(false)
              successToast(
                this,
                this.$t(
                  "components.dialog.connections.info.connection-save-globally"
                )
              )
            }
          } else if (scope === "local") {
            if (!this.checkExists("local", this.connectionName)) {
              await axios.post("/datastore/connection", data)
              projectsModule.addLocalConnection({ projectIdx, data })
              this.showDialog = false
              this.connectionName = ""
              this.setFormDirty(false)
              successToast(
                this,
                this.$t(
                  "components.dialog.connections.info.connection-save-locally"
                )
              )
            }
          }
        } catch (err) {
          console.log(err)
          errorToast(this)
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
