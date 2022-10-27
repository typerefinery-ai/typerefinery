<template>
  <Dialog
    v-model:visible="displayModal"
    class="projects-dialog"
    modal
    :breakpoints="{ '960px': '75vw', '640px': '100vw' }"
  >
    <template #header>
      <span class="p-dialog-title">
        {{ $t("components.dialog.projects.header") }}</span
      >
      <p v-if="showError" :style="{ color: '#f44336' }">{{ error }}</p>
      <div class="p-dialog-header-icons">
        <button
          class="p-dialog-header-icon p-dialog-header-close p-link"
          aria-label="close"
          type="button"
          @click="closeDialog"
        >
          <span class="p-dialog-header-close-icon pi pi-times"></span>
        </button>
      </div>
    </template>
    <Panel :header="$t(`components.dialog.projects.panelheader`)">
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
      <!-- <div class="field">
        <label
          for="flowName"
          :class="{ 'p-error': v$.flowName.$invalid && submitted }"
        >
          {{ $t("components.dialog.projects.info.flowName") + "*" }}</label
        >
        <InputText
          id="flowName"
          v-model="v$.flowName.$model"
          :class="{ 'p-invalid': v$.flowName.$invalid && submitted }"
        />
        <small
          v-if="
            (v$.flowName.$invalid && submitted) ||
            v$.flowName.$pending.$response
          "
          class="p-error"
          >{{
            v$.flowName.required.$message.replace("Value", "Flow Id")
          }}</small
        >
      </div> -->
      <!-- Select Project Type -->
      <div class="field">
        <label
          for="expand"
          :class="{ 'p-error': v$.projectType.$invalid && submitted }"
          >{{ $t("components.dialog.projects.project-type") + "*" }}</label
        >
        <Dropdown
          v-model="v$.projectType.$model"
          :options="projectTypeList"
          option-label="label"
          :placeholder="$t(`components.dialog.projects.info.select`)"
          :class="{ 'p-error': v$.projectType.$invalid && submitted }"
        />
        <small
          v-if="
            (v$.projectType.$invalid && submitted) ||
            v$.projectType.$pending.$response
          "
          class="p-error"
          >{{
            v$.projectType.required.$message.replace("Value", "Project type")
          }}</small
        >
      </div>

      <!-- Select Connection -->
      <div class="field">
        <label
          for="expand"
          :class="{ 'p-error': v$.connectionselected.$invalid && submitted }"
          >{{
            $t("components.dialog.connections.info.connection") + "*"
          }}</label
        >
        <Dropdown
          v-model="v$.connectionselected.$model"
          :options="connectionsList"
          option-label="label"
          option-group-label="label"
          option-group-children="items"
          :placeholder="
            $t(`components.dialog.connections.info.select-connection`)
          "
          :class="{ 'p-error': v$.connectionselected.$invalid && submitted }"
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

      <!-- Select Query -->
      <div class="field">
        <label for="expand">{{
          $t("components.dialog.new-query.query") + "*"
        }}</label>
        <Dropdown
          v-model="selected"
          :options="queryList"
          option-label="label"
          option-group-label="label"
          option-group-children="items"
          :placeholder="$t(`components.dialog.new-query.panel1.select-query`)"
        />
      </div>
      <!-- Select Theme -->
      <div class="field">
        <label
          for="expand"
          :class="{ 'p-error': v$.themeselected.$invalid && submitted }"
          >{{ $t("components.dialog.new-theme.theme") + "*" }}</label
        >
        <Dropdown
          v-model="v$.themeselected.$model"
          :options="themesList"
          option-label="label"
          option-group-label="label"
          option-group-children="items"
          :placeholder="$t(`components.dialog.new-theme.info.select-theme`)"
          :class="{ 'p-error': v$.themeselected.$invalid && submitted }"
        />
        <small
          v-if="
            (v$.themeselected.$invalid && submitted) ||
            v$.themeselected.$pending.$response
          "
          class="p-error"
          >{{
            v$.themeselected.required.$message.replace("Value", "Theme")
          }}</small
        >
      </div>
    </Panel>
    <template #footer>
      <Button
        :label="$t(`components.dialog.projects.info.cancel`)"
        icon="pi pi-times"
        class="p-button-text"
        @click="closeDialog"
      />
      <Button
        :label="$t(`components.dialog.projects.info.save`)"
        :icon="`pi ${loading ? 'pi-spin pi-spinner' : 'pi-check'}`"
        :style="{ 'pointer-events': loading ? 'none' : 'auto' }"
        autofocus
        @click="handleProjectstore(!v$.$invalid)"
      />
    </template>
  </Dialog>
</template>
<script>
  import { getModule } from "vuex-module-decorators"
  import { required } from "@vuelidate/validators"
  import { useVuelidate } from "@vuelidate/core"
  import { nanoid } from "nanoid"
  import { oneDark } from "@codemirror/theme-one-dark"
  import { javascript } from "@codemirror/lang-javascript"
  import * as electronHelpers from "@/utils/electron"
  import axios from "axios"
  import Dialog from "primevue/dialog"
  import Dropdown from "primevue/dropdown"
  import Panel from "primevue/panel"
  import InputText from "primevue/inputtext"
  import Button from "primevue/button"
  import Projects from "@/store/Modules/Projects"
  import Settings from "@/store/Modules/Settings"
  import Services from "@/store/Modules/Services"
  import Themes from "@/store/Modules/Theme"
  import Connections from "@/store/Modules/Connections"
  import Queries from "@/store/Modules/Queries"
  const queriesModule = getModule(Queries)
  const settingsModule = getModule(Settings)
  const connectionsModule = getModule(Connections)
  const servicesModule = getModule(Services)
  const projectsModule = getModule(Projects)
  const themesModule = getModule(Themes)
  export default {
    name: "NewProject",
    components: {
      Dialog,
      Panel,
      InputText,
      Button,
      Dropdown,
    },
    props: {
      projectdialog: { type: Boolean, default: false },
    },
    emits: ["close"],
    setup: () => ({ v$: useVuelidate() }),
    data() {
      return {
        type: "",
        name: "Project",
        expanded: "",
        description: "",
        icon: "",
        database: "typerefinery",
        port: "1729",
        host: "localhost",
        query: "match\n   $a isa thing;",
        // flowName: "",
        display: true,
        submitted: false,
        projectTypeList: [
          { label: "Default", key: "default" },
          { label: "Custom", key: "custom" },
        ],
        projectType: { label: "Default", key: "default" },
        connectionselected: {
          label: "Global Connection",
          key: "defaultconnection",
          scope: "global",
        },
        themeselected: {
          label: "Global Theme",
          key: "defaulttheme",
          scope: "global",
        },
        selected: {
          label: "Global Query",
          key: "defaultquery",
          scope: "global",
        },
        displayModal: true,
        loading: false,
        showError: false,
        error: "Something went wrong!",
        themecode: `{\n  "attribute": {\n    "colorlist": "Oranges",\n    "cindex": 7,\n    "tcolorlist": "Greys",\n    "tindex": 0\n  },\n  "entity": {\n    "colorlist": "Blue-Green",\n    "cindex": 7,\n    "tcolorlist": "Greys",\n    "tindex": 0\n  },\n  "relation": {\n    "colorlist": "Blue-Green",\n    "cindex": 6,\n    "tcolorlist": "Greys",\n    "tindex": 7\n  },\n  "shadow": {\n    "colorlist": "Yellows",\n    "cindex": 2,\n    "tcolorlist": "Greys",\n    "tindex": 7\n  }\n}`,
        serviceStopped: false,
        serviceStarted: false,
      }
    },
    // setup: () => ({ v$: useVuelidate() }),
    validations() {
      return {
        name: { required },
        host: { required },
        port: { required },
        database: { required },
        connectionselected: { required },
        themeselected: { required },
        selected: { required },
        projectType: { required },
        // flowName: { required },
      }
    },
    computed: {
      extensions() {
        return settingsModule.data.theme === "dark"
          ? [javascript(), oneDark]
          : [javascript()]
      },
      connectionsList() {
        return [
          {
            label: "Global",
            items: connectionsModule.getGlobalConnections.map((el) => {
              return { label: el.label, key: el.id, scope: el.scope }
            }),
          },
        ]
      },
      themesList() {
        return [
          {
            label: "Global",
            items: themesModule.getGlobalThemes.map((el) => {
              return { label: el.label, key: el.id, scope: el.scope }
            }),
          },
        ]
      },
      queryList() {
        return [
          {
            label: "Global",
            items: queriesModule.getGlobalQueries.map((el) => {
              return { label: el.label, key: el.id, scope: el.scope }
            }),
          },
        ]
      },
      isElectron() {
        return electronHelpers.isElectron()
      },
    },
    methods: {
      closeDialog() {
        this.$emit("close")
      },
      async handleProjectstore(isFormValid) {
        const projectId = nanoid(14)

        this.submitted = true
        // stop here if form is invalid
        if (!isFormValid) {
          return
        }
        this.loading = true
        this.serviceStarted = false
        this.serviceStopped = false
        if (this.projectType.key === "custom") {
          this.createFlow(projectId)
        } else if (this.projectType.key === "default") {
          const defaultFlowId = nanoid(13)
          await this.insertFlowData(projectId, defaultFlowId)
        }
      },
      async createFlow(projectId) {
        try {
          const payload = {
            icon: "fa fa-satellite",
            url: "https://localhost",
            name: "Workflow",
            group: "typerefinery",
            reference: projectId,
            version: "1.0",
            author: "typerefinery",
            color: "#61C83B",
            readme: "Typerefinery flow",
          }
          const url = "http://localhost:8000/flow/create"
          const { data } = await axios.post(url, payload)
          this.createInitialData(projectId, data.id)
        } catch (err) {
          console.log(err)
          this.loading = false
          this.showError = true
        }
      },
      async insertFlowData(projectid, flowid) {
        try {
          const date = new Date().toISOString()
          const payload = { flowid, projectid, date }
          const url = "http://localhost:8000/flow/createsample"
          await axios.post(url, payload)
          servicesModule.stopService("totaljs-flow")
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'api' does not exist on type 'Window & typeof globalThis'
          window.api?.response("sendServiceStatus", ({ id, output }) => {
            const isFlow = id === "totaljs-flow"
            if (isFlow && output === "60" && !this.serviceStopped) {
              servicesModule.startService("totaljs-flow")
              this.serviceStopped = true
            } else if (isFlow && output === "120" && !this.serviceStarted) {
              this.createInitialData(projectid, flowid)
              this.serviceStarted = true
            }
          })
          // JUST FOR WEB VERSION
          if (!this.isElectron) {
            this.createInitialData(projectid, flowid)
          }
        } catch (error) {
          console.log(error)
        }
      },
      async createInitialData(projectid, flowid) {
        const connectionData = connectionsModule.getGlobalConnections.find(
          (el) => el.id === this.connectionselected.key
        )
        const queryData = queriesModule.getGlobalQueries.find(
          (el) => el.id === this.selected.key
        )
        const themeData = themesModule.getGlobalThemes.find(
          (el) => el.id === this.themeselected.key
        )
        try {
          // create project, connection & query
          const project = {
            projectid,
            label: this.name,
            description: this.description,
            icon: this.icon,
            data: "",
            flowid: flowid,
          }
          const connection = {
            ...connectionData,
            connectionid: projectid + "_con",
            id: projectid + "_con",
            projectid,
            scope: "local",
            label: "Local Connection",
          }
          const theme = {
            ...themeData,
            themeid: projectid + "_theme",
            id: projectid + "_theme",
            projectid,
            scope: "local",
            label: "Local Theme",
          }
          const query = {
            ...queryData,
            queryid: projectid + "_query",
            id: projectid + "_query",
            projectid,
            label: "Local Query",
            connectionid: projectid + "_con",
            scope: "local",
          }
          const baseURL = "http://localhost:8000/datastore/"
          await axios.all([
            axios.post(`${baseURL}project`, project),
            axios.post(`${baseURL}connection`, connection),
            axios.post(`${baseURL}query`, query),
            axios.post(`${baseURL}theme`, theme),
          ])
          const payload = {
            projectid,
            flowid,
            connection,
            query,
            theme,
          }
          await this.createData(payload)
        } catch (err) {
          console.log(err)
          this.loading = false
          this.showError = true
        }
      },
      createData(payload) {
        const { projectid, flowid, connection, query, theme } = payload
        const projectData = {
          type: "project",
          id: projectid,
          label: this.name,
          description: this.description,
          icon: this.icon,
          connections: {
            type: "connections",
            icon: "",
            list: [connection],
          },
          queries: {
            type: "queries",
            icon: "",
            list: [query],
          },
          themes: { type: "themes", icon: "", list: [theme] },
          wirings: {
            type: "wirings",
            icon: "",
            list: [
              {
                type: "wiring",
                id: flowid,
                label: "Workflow",
                icon: "workflow",
                description: "",
              },
            ],
            outputs: {
              type: "outputs",
              icon: "",
              list: [],
            },
          },
        }
        projectsModule.addNewProject(projectData)
        this.$emit("close")
        this.loading = false
        this.showError = false
      },
    },
  }
</script>
<style lang="scss">
  .projects-dialog {
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
    .p-dialog-header {
      padding: 1.25rem 1.8rem;
      .p-dialog-header-icons:last-of-type {
        display: none;
      }
    }
  }
</style>
