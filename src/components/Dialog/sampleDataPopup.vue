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
    props: {
      sampledata: { type: Boolean, default: false },
    },
    data() {
      return {
        displayBasic: true,
        loading: false,
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
          const { data } = await axios.post(url, payload)

          this.createInitialData(projectId, data.id)
        } catch (err) {
          console.log(err)
        }
      },

      async createInitialData(projectid, flowid) {
        try {
          // create project, connection & query
          const project = {
            projectid,
            name: "project",
            description: "",
            icon: "icon",
            data: "",
            flowid: "",
          }
          const connection = {
            connectionid: projectid + "_con",
            projectid,
            label: "Connection",
            icon: "Connection",
            type: "connection",
            scope: "local",
            description: "",
            port: "7129",
            host: "localhost",
            database: "typerefinery",
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
            query: "sssssssssssss",
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
          port: "7129",
          host: "localhost",
          database: "typerefinery",
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
          themes: themesData,
          wirings: {
            type: "wirings",
            icon: "",
            list: [
              {
                type: "wiring",
                id: "fsfkt001xx41d",
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
