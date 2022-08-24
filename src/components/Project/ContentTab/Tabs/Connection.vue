<template>
  <div class="connection-wrapper">
    <Fieldset legend="Database Details" class="mb-3">
      <div class="grid formgrid connection-form">
        <div class="col-12 p-fluid">
          <div class="field">
            <label for="host">Host<span class="asterisk">*</span></label>
            <InputText
              id="host"
              v-model="v$.host.$model"
              aria-describedby="host"
              placeholder="Eg: localhost"
              :class="{ 'p-invalid': v$.host.$error }"
              @input="handleInput($event, 'host')"
            />
          </div>
        </div>
        <div class="col-12 p-fluid">
          <div class="field">
            <label for="port">Port<span class="asterisk">*</span></label>
            <InputText
              id="port"
              v-model="v$.port.$model"
              aria-describedby="port"
              placeholder="Eg: 1729"
              :class="{ 'p-invalid': v$.port.$error }"
              @input="handleInput($event, 'port')"
            />
          </div>
        </div>
        <div class="col-12 p-fluid">
          <div class="field">
            <label for="port"
              >Database Name<span class="asterisk">*</span></label
            >
            <InputText
              id="database"
              v-model="v$.database.$model"
              aria-describedby="database"
              placeholder="Enter database name"
              :class="{ 'p-invalid': v$.database.$error }"
              @input="handleInput($event, 'database')"
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

    <Fieldset legend="Connection Details">
      <div class="grid formgrid connection-form">
        <div class="col-12 md:col-6 p-fluid">
          <div class="field">
            <label for="label">Label<span class="asterisk">*</span></label>
            <InputText
              id="label"
              v-model="v$.label.$model"
              aria-describedby="label"
              placeholder="Enter connection label"
              :class="{ 'p-invalid': v$.label.$error }"
              @input="handleInput($event, 'label')"
            />
          </div>
        </div>
        <div class="col-12 md:col-6 p-fluid">
          <div class="field">
            <label for="icon">Icon</label>
            <InputText
              id="icon"
              v-model="icon"
              aria-describedby="icon"
              placeholder="Enter connection icon"
              @input="handleInput($event, 'icon')"
            />
          </div>
        </div>
        <div class="col-12 p-fluid">
          <div class="field">
            <label for="description">Description</label>
            <InputText
              id="description"
              v-model="description"
              aria-describedby="description"
              placeholder="Enter connection description"
              @input="handleInput($event, 'description')"
            />
          </div>
        </div>
      </div>
    </Fieldset>
  </div>
</template>

<script>
  import { getModule } from "vuex-module-decorators"
  import { required } from "@vuelidate/validators"
  import useVuelidate from "@vuelidate/core"
  import InputText from "primevue/inputtext"
  // import Button from "primevue/button"
  import Fieldset from "primevue/fieldset"
  // import Dropdown from "primevue/dropdown"
  import Projects from "@/store/Modules/Projects"
  import Connections from "@/store/Modules/Connections"
  const projectsModule = getModule(Projects)
  const connectionsModule = getModule(Connections)
  export default {
    name: "ConnectionContent",
    components: { InputText, Fieldset },
    props: {
      tab: { type: Object, required: true },
    },
    setup() {
      return { v$: useVuelidate() }
    },
    data() {
      return {
        host: "localhost",
        port: 1729,
        database: "typerefinery",
        label: "Connection 1",
        icon: "",
        description: "",
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
    mounted() {
      this.setInitialData()
    },
    methods: {
      setInitialData() {
        const { parentIdx: projectIdx, key } = this.tab
        const connectionIdx = key.split("-").pop()
        let connection

        if (projectIdx != null || projectIdx != undefined) {
          // local
          const project = projectsModule.getProjects[projectIdx]
          connection = project.connections.list[connectionIdx]
        } else {
          // global
          connection = connectionsModule.data.list[connectionIdx]
        }

        const { host, port, database, label, icon, description } = connection
        this.v$.host.$model = host
        this.v$.port.$model = port
        this.v$.database.$model = database
        this.v$.label.$model = label
        this.icon = icon
        this.description = description
      },
      handleInput({ target: { value } }, key) {
        const { parentIdx: projectIdx, key: id } = this.tab
        const connectionIdx = id.split("-").pop()
        if (projectIdx != null || projectIdx != undefined) {
          const payload = { key, value, projectIdx, connectionIdx }
          projectsModule.updateConnection(payload)
        } else {
          // global
          const payload = { key, value, connectionIdx }
          connectionsModule.updateGlobalConnection(payload)
        }
      },
    },
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
</style>
