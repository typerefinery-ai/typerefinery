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
        projectType: { label: "Default", key: "default" },
        displayModal: true,
        loading: false,
        showError: false,
        error: "Something went wrong!",
        themecode: `{\n    "attribute": {\n        "colour": "#7f2704",\n        "tcolour": "white",\n        "label_name": true,\n        "label_value": true,\n        "corner": 5,\n        "split_line": true,\n        "tsize": "10px"\n    },\n    "entity": {\n        "colour": "#08306b",\n        "tcolour": "white",\n        "label_name": true,\n        "label_iid": true,\n        "iid_shorten": true,\n        "corner": 5,\n        "split_line": true,\n        "tsize": "10px"\n    },\n    "relation": {\n        "colour": "#006d2c",\n        "tcolour": "black",\n        "label_name": true,\n        "label_iid": true,\n        "label_offset": 0,\n        "radius": 5,\n        "iid_shorten": true,\n        "split_line": true,\n        "tsize": "10px"\n    },\n    "shadow": {\n        "colour": "#fdae6b",\n        "tcolour": "black"\n    },\n    "edges": {\n        "colour": "black",\n        "stroke": "1px",\n        "arrow": true,\n        "acolour": "black",\n        "labels": true,\n        "split_line": true,\n        "tsize": "10px"\n    },\n    "tooltip": {\n        "fill": "white",\n        "stroke": "1px",\n        "scolour": "black",\n        "corner": 5,\n        "tcolour": "black",\n        "tsize": "11px",\n        "padding": "10px"\n    },\n    "d3sim": {\n        "linkdistance": 150,\n        "charge": -200\n    },\n    "super": {\n        "radius": 25,\n        "label_name": true,\n        "label_iid": true,\n        "iid_shorten": true,\n        "split_line": true,\n        "tsize": "10px"\n    },\n    "tt_description": {\n        "title": true,\n        "name": true,\n        "role": true,\n        "value": true,\n        "boldtitle": true,\n        "subtitle": true,\n        "type": true,\n        "g_G_name": true,\n        "g_role": true,\n        "v_G_name": true,\n        "v_Value": true,\n        "where": true,\n        "number": true\n    }\n}`,
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
        let projectIdx = projectsModule.getProjects.findIndex((el) => el.id)
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
        let projectIdx = projectsModule.getProjects.findIndex((el) => el.id)
        return [
          {
            label: "Global",
            items: queriesModule.getGlobalQueries.map((el) => {
              return { label: el.label, key: el.id, scope: el.scope }
            }),
          },
        ]
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
        await this.createFlow(projectId)
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
          const defaultFlowId = nanoid(14)
          if (this.projectType.key === "custom") {
            this.createInitialData(projectId, data.id)
          } else if (this.projectType.key === "default") {
            this.insertFlowData(projectId, defaultFlowId)
          }
        } catch (err) {
          console.log(err)
          this.loading = false
          this.showError = true
        }
      },
      async insertFlowData(projectid, flowid) {
        try {
          const payload = { flowid }
          const url = "http://localhost:8000/flow/createsample"
          await axios.post(url, payload)
          await servicesModule.restartService("totaljs-flow")
          await this.createInitialData(projectid, flowid)
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
            projectid,
            scope: "local",
          }
          const theme = {
            ...themeData,
            id: projectid + "_theme",
            projectid: projectid,
            scope: "local",
            themeid: projectid + "_theme",
            theme: JSON.parse(JSON.stringify(this.themecode)),
          }
          const query = {
            ...queryData,
            queryid: projectid + "_query",
            projectid,
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
          await this.createData(projectid, flowid)
        } catch (err) {
          console.log(err)
          this.loading = false
          this.showError = true
        }
      },
      createData(projectid, flowid) {
        const connection = {
          type: "connection",
          id: projectid + "_con",
          label: "Connection",
          icon: "Connection",
          scope: "local",
          description: "",
          port: this.port,
          host: this.host,
          database: this.database,
        }
        const theme = {
          label: "Theme",
          id: projectid + "_theme",
          projectid: projectid,
          scope: "local",
          type: "theme",
          data: "string",
          icon: "",
          themeid: projectid + "_theme",
          description: "",
          theme: JSON.parse(JSON.stringify(this.themecode)),
        }
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
            list: [
              {
                type: "query",
                id: projectid + "_query",
                label: "Query",
                icon: "Query",
                description: "",
                query: this.query,
                connectionid: projectid + "_con",
                data: "",
                scope: "local",
              },
            ],
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
