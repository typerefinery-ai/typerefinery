<template>
  <div>
    <Dialog
      v-model:visible="displayBasic"
      :modal="true"
      :closable="true"
      :style="{ width: '350px' }"
    >
      <template #header>
        <span class="p-dialog-title">
          {{ $t("components.dialog.sample-data.header") }}</span
        >
        <p v-if="showError" :style="{ color: '#f44336' }">{{ error }}</p>
      </template>
      <div class="confirmation-content">
        <i class="pi pi-exclamation-triangle mr-3 customDataicon" />
        <span>{{ $t(`components.dialog.sample-data.info`) }}</span>
      </div>

      <template #footer>
        <Button
          :label="$t(`components.dialog.sample-data.cancel`)"
          icon="pi pi-times"
          class="p-button-text"
          @click="closeBasic"
        />
        <Button
          :label="$t(`components.dialog.sample-data.proceed`)"
          :icon="`pi ${loading ? 'pi-spin pi-spinner' : 'pi-check'}`"
          autofocus
          @click="getSampleData"
        />
      </template>
    </Dialog>
  </div>
</template>
<script>
  import { getModule } from "vuex-module-decorators"
  import Dialog from "primevue/dialog"
  import Button from "primevue/button"
  import axios from "axios"
  import Projects from "@/store/Modules/Projects"
  import { nanoid } from "nanoid"
  const projectsModule = getModule(Projects)
  import themesData from "@/data/theme.json"
  export default {
    name: "SampleDataPopup",
    components: {
      Dialog,
      Button,
    },
    data() {
      return {
        displayBasic: true,
        loading: false,
        themecode: `"{\n  "attribute": {\n    "colorlist": "Oranges",\n    "cindex": 7,\n    "tcolorlist": "Greys",\n    "tindex": 0\n  },\n  "entity": {\n    "colorlist": "Blue-Green",\n    "cindex": 7,\n    "tcolorlist": "Greys",\n    "tindex": 0\n  },\n  "relation": {\n    "colorlist": "Blue-Green",\n    "cindex": 6,\n    "tcolorlist": "Greys",\n    "tindex": 7\n  },\n  "shadow": {\n    "colorlist": "Yellows",\n    "cindex": 2,\n    "tcolorlist": "Greys",\n    "tindex": 7\n  }\n}"`,
        showError: false,
        error: "Something went wrong!",
      }
    },
    methods: {
      closeBasic() {
        this.displayBasic = !this.displayBasic
      },
      getSampleData() {
        const projectId = nanoid(14)
        this.loading = true
        this.createFlow(projectId)
        return
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
          await axios.post(url, payload)

          this.createInitialData(projectId)
        } catch (err) {
          console.log(err)
          this.loading = false
          this.showError = true
        }
      },

      async createInitialData(projectid) {
        try {
          // create project, connection & query
          const project = {
            projectid,
            label: "Sample Project",
            description: "",
            icon: "icon",
            data: "",
            flowid: "fsfkt001xx41d", // sample flow id
          }
          const connection = {
            connectionid: projectid + "_con",
            projectid,
            label: "Sample Connection",
            icon: "Connection",
            type: "connection",
            scope: "local",
            description: "",
            port: "1729",
            host: "localhost",
            database: "typerefinery",
          }
          const query = {
            queryid: projectid + "_query",
            projectid,
            connectionid: projectid + "_con",
            scope: "local",
            icon: "query",
            label: "Sample Query",
            description: "",
            type: "query",
            query:
              "match $a isa log, has logName 'L1';\n$b isa event, has eventName $c;\n$d (owner: $a, item: $b) isa trace,\nhas traceId $e, has index $f;\noffset 0; limit 10;",
            data: "",
          }
          const theme = {
            id: projectid + "_theme",
            label: "Theme",
            projectid: projectid,
            scope: "local",
            type: "theme",
            data: "string",
            icon: "",
            themeid: projectid + "_theme",
            description: "",
            theme: JSON.parse(JSON.stringify(this.themecode)),
          }
          const baseURL = "http://localhost:8000/datastore/"
          await axios.all([
            axios.post(`${baseURL}project`, project),
            axios.post(`${baseURL}connection`, connection),
            axios.post(`${baseURL}query`, query),
            axios.post(`${baseURL}theme`, theme),
          ])
          await this.createData(projectid)
        } catch (err) {
          console.log(err)
          this.loading = false
          this.showError = true
        }
      },

      createData(projectid) {
        const connection = {
          type: "connection",
          id: projectid + "_con",
          label: "Sample Connection",
          icon: "Connection",
          scope: "local",
          description: "",
          port: "1729",
          host: "localhost",
          database: "typerefinery",
        }
        const theme = {
          label: "Sample Theme",
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
          label: "Sample Project",
          description: "",
          icon: "icon",
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
                label: "Sample Query",
                icon: "Query",
                description: "",
                query: "this.query",
                connectionid: projectid + "_con",
              },
            ],
          },
          // themes: themesData,
          themes: { type: "themes", icon: "", list: [theme] },
          wirings: {
            type: "wirings",
            icon: "",
            list: [
              {
                type: "wiring",
                id: "fsfkt001xx41d", // sample flow id
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
        this.displayBasic = !this.displayBasic
        this.loading = false
        this.showError = false
      },
    },
  }
</script>
<style scoped lang="scss">
  p {
    margin: 0;
  }
  .customDataicon {
    font-size: 2rem;
  }
  .confirmation-content {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .p-dialog .p-button {
    min-width: 6rem;
  }
</style>
