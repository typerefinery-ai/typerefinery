<template>
  <div>
    <Dialog
      v-model:visible="displayBasic"
      header="SampleData"
      :modal="true"
      :closable="true"
      :style="{ width: '350px' }"
    >
      <div class="confirmation-content">
        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
        <span>Click on proceed to load sample data.</span>
      </div>

      <template #footer>
        <Button
          :label="$t(`components.dialog.projects.info.cancel`)"
          icon="pi pi-times"
          class="p-button-text"
          @click="closeBasic"
        />
        <Button
          label="Proceed"
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
        themecode: `{\n    "attribute": {\n        "colour": "#7f2704",\n        "tcolour": "white",\n        "label_name": true,\n        "label_value": true,\n        "corner": 5,\n        "split_line": true,\n        "tsize": "10px"\n    },\n    "entity": {\n        "colour": "#08306b",\n        "tcolour": "white",\n        "label_name": true,\n        "label_iid": true,\n        "iid_shorten": true,\n        "corner": 5,\n        "split_line": true,\n        "tsize": "10px"\n    },\n    "relation": {\n        "colour": "#006d2c",\n        "tcolour": "black",\n        "label_name": true,\n        "label_iid": true,\n        "label_offset": 0,\n        "radius": 5,\n        "iid_shorten": true,\n        "split_line": true,\n        "tsize": "10px"\n    },\n    "shadow": {\n        "colour": "#fdae6b",\n        "tcolour": "black"\n    },\n    "edges": {\n        "colour": "black",\n        "stroke": "1px",\n        "arrow": true,\n        "acolour": "black",\n        "labels": true,\n        "split_line": true,\n        "tsize": "10px"\n    },\n    "tooltip": {\n        "fill": "white",\n        "stroke": "1px",\n        "scolour": "black",\n        "corner": 5,\n        "tcolour": "black",\n        "tsize": "11px",\n        "padding": "10px"\n    },\n    "d3sim": {\n        "linkdistance": 150,\n        "charge": -200\n    },\n    "super": {\n        "radius": 25,\n        "label_name": true,\n        "label_iid": true,\n        "iid_shorten": true,\n        "split_line": true,\n        "tsize": "10px"\n    },\n    "tt_description": {\n        "title": true,\n        "name": true,\n        "role": true,\n        "value": true,\n        "boldtitle": true,\n        "subtitle": true,\n        "type": true,\n        "g_G_name": true,\n        "g_role": true,\n        "v_G_name": true,\n        "v_Value": true,\n        "where": true,\n        "number": true\n    }\n}`,
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
        }
      },

      createData(projectid) {
        const connection = {
          type: "connection",
          id: projectid + "_con",
          label: "Connection",
          icon: "Connection",
          scope: "local",
          description: "",
          port: "7129",
          host: "localhost",
          database: "typerefinery",
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
          label: "Project",
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
                label: "Query",
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
      },
    },
  }
</script>
<style scoped lang="scss">
  p {
    margin: 0;
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
