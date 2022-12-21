<template>
  <div>
    <Dialog
      v-model:visible="displayBasic"
      :modal="true"
      :closable="false"
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
  import restapi from "@/utils/restapi"
  import Projects from "@/store/Modules/Projects"
  import Services from "@/store/Modules/Services"
  const projectsModule = getModule(Projects)
  const servicesModule = getModule(Services)
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
        themecode: `{\n  "attribute": {\n    "colorlist": "Oranges",\n    "cindex": 7,\n    "tcolorlist": "Greys",\n    "tindex": 0\n  },\n  "entity": {\n    "colorlist": "Blue-Green",\n    "cindex": 7,\n    "tcolorlist": "Greys",\n    "tindex": 0\n  },\n  "relation": {\n    "colorlist": "Blue-Green",\n    "cindex": 6,\n    "tcolorlist": "Greys",\n    "tindex": 7\n  },\n  "shadow": {\n    "colorlist": "Yellows",\n    "cindex": 2,\n    "tcolorlist": "Greys",\n    "tindex": 7\n  }\n}`,
        showError: false,
        error: "Something went wrong!",
      }
    },
    methods: {
      closeBasic() {
        projectsModule.closeSampleDataPopup()
      },
      getSampleData() {
        const projectId = "s_project"
        this.loading = true
        this.createSampleFlow(projectId)
        return
      },
      async createSampleFlow(projectId) {
        try {
          const payload = {
            name: "string",
            overwrite: true,
          }
          const url = "/flow/createsample"
          await restapi.post(url, payload)
          await servicesModule.restartService("totaljs-flow")
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
            label: "S_Connection",
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
            label: "S_Query",
            description: "",
            type: "query",
            query:
              "match $a isa log, has logName 'L1';\n$b isa event, has eventName $c;\n$d (owner: $a, item: $b) isa trace,\nhas traceId $e, has index $f;\noffset 0; limit 10;",
            data: "",
          }
          const theme = {
            id: projectid + "_theme",
            label: "S_Theme",
            projectid: projectid,
            scope: "local",
            type: "theme",
            data: "string",
            icon: "",
            themeid: projectid + "_theme",
            description: "",
            theme: JSON.parse(JSON.stringify(this.themecode)),
          }
          const baseURL = "/datastore/"
          await Promise.all([
            restapi.post(`${baseURL}project`, project),
            restapi.post(`${baseURL}connection`, connection),
            restapi.post(`${baseURL}query`, query),
            restapi.post(`${baseURL}theme`, theme),
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
          label: "S_Connection",
          icon: "Connection",
          scope: "local",
          description: "",
          port: "1729",
          host: "localhost",
          database: "typerefinery",
        }
        const theme = {
          label: "S_Theme",
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
                label: "S_Query",
                icon: "Query",
                description: "",
                query:
                  "match $a isa log, has logName 'L1';\n$b isa event, has eventName $c;\n$d (owner: $a, item: $b) isa trace,\nhas traceId $e, has index $f;\noffset 0; limit 10;",
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
        projectsModule.closeSampleDataPopup()
        this.loading = false
        this.showError = false
        window.location.reload()
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
