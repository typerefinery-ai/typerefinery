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
    </Panel>
    <Panel header="Connections" class="mt-3">
      <div class="field">
        <label for="uri" :class="{ 'p-error': v$.host.$invalid && submitted }">
          {{ $t("components.dialog.connections.info.uri") + "*" }}</label
        >
        <InputText
          id="uri"
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
          >{{ v$.port.required.$message.replace("Value", "Port") }}</small
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
    <Panel
      :header="$t(`components.dialog.new-query.panel2.query`)"
      class="mt-3"
    >
      <div class="field">
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
  import { Codemirror } from "vue-codemirror"
  import { oneDark } from "@codemirror/theme-one-dark"
  import { javascript } from "@codemirror/lang-javascript"
  import axios from "axios"
  import Dialog from "primevue/dialog"
  import Panel from "primevue/panel"
  import InputText from "primevue/inputtext"
  import Button from "primevue/button"
  import Projects from "@/store/Modules/Projects"
  import Settings from "@/store/Modules/Settings"
  const settingsModule = getModule(Settings)
  const projectsModule = getModule(Projects)
  import themesData from "@/data/theme.json"

  export default {
    name: "NewProject",
    components: {
      Dialog,
      Panel,
      InputText,
      Button,
      Codemirror,
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
        displayModal: true,
        loading: false,
        showError: false,
        error: "Something went wrong!",
      }
    },
    // setup: () => ({ v$: useVuelidate() }),
    validations() {
      return {
        name: { required },
        host: { required },
        port: { required },
        database: { required },
        // flowName: { required },
      }
    },
    computed: {
      extensions() {
        return settingsModule.data.theme === "dark"
          ? [javascript(), oneDark]
          : [javascript()]
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

          this.createInitialData(projectId, data.id)
        } catch (err) {
          console.log(err)
          this.loading = false
          this.showError = true
        }
      },

      async createInitialData(projectid, flowid) {
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
            connectionid: projectid + "_con",
            projectid,
            label: "Connection",
            icon: "Connection",
            type: "connection",
            scope: "local",
            description: "",
            port: this.port,
            host: this.host,
            database: this.database,
          }
          const query = {
            queryid: projectid + "_query",
            projectid,
            connectionid: projectid + "_con",
            scope: "local",
            icon: "query",
            label: "Query",
            description: "",
            type: "query",
            query: this.query,
            data: "",
          }
          const baseURL = "http://localhost:8000/datastore/"
          await axios.all([
            axios.post(`${baseURL}project`, project),
            axios.post(`${baseURL}connection`, connection),
            axios.post(`${baseURL}query`, query),
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
              },
            ],
          },
          themes: themesData,
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
    .p-dialog-header {
      padding: 1.25rem 1.8rem;
      .p-dialog-header-icons:last-of-type {
        display: none;
      }
    }
  }
</style>
