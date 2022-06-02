<template>
  <Dialog
    class="query-dialog"
    :visible="true"
    modal
    :closable="true"
    :breakpoints="{ '960px': '75vw', '640px': '100vw' }"
  >
    <template #header>
      <span class="p-dialog-title">
        {{ $t("components.dialog.new-query.header") }}</span
      >
      <div class="p-dialog-header-icons">
        <button
          class="p-dialog-header-icon p-dialog-header-close p-link"
          aria-label="close"
          type="button"
          @click="querycloseDialog"
        >
          <span class="p-dialog-header-close-icon pi pi-times"></span>
        </button>
      </div>
    </template>
    <Panel :header="$t(`components.dialog.new-query.panel1.header`)">
      <div class="field">
        <label for="expand">
          {{ $t("components.dialog.new-query.panel1.label1") }}</label
        >
        <Dropdown
          v-model="projectselected"
          :options="projectList"
          option-label="name"
          option-value="key"
         :placeholder="$t(`components.dialog.new-query.panel1.select1`)"
          @change="collectProject"
        />
      </div>
      <div class="field">
        <label for="expand">{{
          $t("components.dialog.new-query.panel1.label2")
        }}</label>
        <Dropdown
          v-model="connectionselected"
          :options="connectionList"
          option-label="name"
          option-value="key"
           :placeholder="$t(`components.dialog.new-query.panel1.select2`)"
        />
      </div>
    </Panel>
    <!-- <h3><u>Query Info</u></h3> -->
    <!-- <div class="field">
      <label for="type"> Type</label>
      <InputText id="type" v-model="type" />
    </div> -->
    <Panel
      :header="$t(`components.dialog.new-query.panel2.header`)"
      class="panel2"
    >
      <div class="field">
        <label for="name">{{
          $t("components.dialog.new-query.panel2.name")
        }}</label>
        <InputText id="name" v-model="name" />
      </div>
      <div class="field">
        <label>{{
          $t("components.dialog.new-query.panel2.description")
        }}</label>
        <InputText v-model="des" />
      </div>
      <div class="field">
        <label for="icon">{{
          $t("components.dialog.new-query.panel2.icon")
        }}</label>
        <InputText id="icon" v-model="icon" />
      </div>

      <div class="field">
        <label for="query">{{
          $t("components.dialog.new-query.panel2.query")
        }}</label>
        <InputText id="query" v-model="query" />
      </div>
      <div class="field">
        <label for="expand">{{
          $t("components.dialog.new-query.panel2.transformer")
        }}</label>
        <Dropdown
          v-model="tranformerselected"
          :options="transformerList"
          option-label="name"
          option-value="name"
           :placeholder="$t(`components.dialog.new-query.panel2.select1`)"
        />
      </div>
    </Panel>
    <!-- <Button label="Submit" @click="handleconnectionstore" /> -->
    <template #footer>
      <Button
        :label="$t(`components.dialog.new-query.footer.cancel`)"
        icon="pi pi-times"
        class="p-button-text"
        @click="querycloseDialog"
      />
      <Button
        :label="$t(`components.dialog.new-query.footer.save`)"
        icon="pi pi-check"
        autofocus
        @click="handleconnectionstore"
      />
    </template>
  </Dialog>
</template>

<script>
import Dialog from "primevue/dialog"
import Dropdown from "primevue/dropdown"
import InputText from "primevue/inputtext"
import Button from "primevue/button"
import Panel from "primevue/panel"
import Projects from "@/store/Modules/Projects"
import { getModule } from "vuex-module-decorators"
const appProjects = getModule(Projects)
//   console.log(appProjects.projectList)

export default {
  name: "NewConnections",
  components: {
    Dialog,
    InputText,
    Button,
    Panel,
    Dropdown,
  },
  props: {
    querydialog: { type: Boolean, default: false },
  },
  emits: ["close"],
  data() {
    return {
      type: "Query",
      name: "",
      expanded: "",
      description: "",
      icon: "",
      display: true,
      selectedBoolean: null,
      projectselected: null,
      connectionselected: null,
      tranformerselected: null,
    }
  },
  computed: {
    projectList() {
      return appProjects.projectList
    },
    connectionList() {
      // if(this.projectselected===this.projectList.name){
      console.log(appProjects.connectionList)
      return appProjects.connectionList
      // }
    },
    transformerList()
    {
      return appProjects.transformerList
    }
  },
  methods: {
    collectProject() {
      console.log(this.projectselected)
      appProjects.selectedProject(this.projectselected)
    },
    querycloseDialog() {
      this.$emit("close")
    },
    handleconnectionstore() {
      const data = {
        name: this.projectselected,
        list: {
          name: this.name,
          description: this.des,
          connection: this.connectionselected,
          icon: this.icon,
          query: this.query,
          type: "query",
          tranformer: this.tranformerselected,
        },
      }
      appProjects.addNewQuery(data)
      this.$emit("close")
    },
  },
}
</script>
<style lang="scss">
html.t-light .p-panel .p-panel-header {
  background-color: #f8f9fa;
}
.query-dialog {
  height: 100vh;
  width: 40vw;
  .p-dropdown {
    width: 80%;
  }
  .field {
    display: grid;
  }
  .panel2 {
    margin-top: 10px;
  }
  .p-float-label {
    margin-bottom: 10px;
  }
  input {
    width: 80%;
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
