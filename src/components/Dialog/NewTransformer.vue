<template>
  <Dialog
    class="transformer-dialog"
    :visible="true"
    modal
    :closable="true"
    :breakpoints="{ '960px': '75vw', '640px': '100vw' }"
  >
    <template #header>
      <span class="p-dialog-title">
       {{ $t("components.dialog.new-transformer.header") }}</span
      >
      <div class="p-dialog-header-icons">
        <button
          class="p-dialog-header-icon p-dialog-header-close p-link"
          aria-label="close"
          type="button"
          @click="transformercloseDialog"
        >
          <span class="p-dialog-header-close-icon pi pi-times"></span>
        </button>
      </div>
    </template>
    <Panel :header="$t(`components.dialog.new-transformer.panel1.header`)">
      <div class="field">
        <label for="expand">
         {{ $t("components.dialog.new-transformer.panel1.label1") }}</label
        >
        <Dropdown
          v-model="projectselected"
          :options="projectList"
          option-label="name"
          option-value="key"
           :placeholder="$t(`components.dialog.new-transformer.panel1.select`)"
          @change="collectProject"
          class="p-invalid"
        />
      </div>
    </Panel>
    <!-- <h3><u>Query Info</u></h3> -->
    <!-- <div class="field">
      <label for="type"> Type</label>
      <InputText id="type" v-model="type" />
    </div> -->
    <Panel
     :header="$t(`components.dialog.new-transformer.panel2.header`)"
      class="panel2"
    >
      <div class="field">
        <label for="name">{{
          $t("components.dialog.new-transformer.panel2.name")
        }}</label>
        <InputText id="name" v-model="name" class="p-invalid"/>
      </div>
      <div class="field">
        <label>{{
          $t("components.dialog.new-transformer.panel2.description")
        }}</label>
        <InputText v-model="des" class="p-invalid"/>
      </div>
       <div class="field">
        <label for="icon">{{
          $t("components.dialog.new-transformer.panel2.icon")
        }}</label>
        <InputText id="icon" v-model="icon" class="p-invalid" />
      </div>
    </Panel>
    <!-- <Button label="Submit" @click="handleconnectionstore" /> -->
    <template #footer>
      <Button
        :label="$t(`components.dialog.new-transformer.footer.cancel`)"
        icon="pi pi-times"
        class="p-button-text"
        @click="transformercloseDialog"
      />
      <Button
        :label="$t(`components.dialog.new-transformer.footer.save`)"
        icon="pi pi-check"
        autofocus
        @click="handletransformerstore"
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
    name: "NewTransformer",
    components: {
      Dialog,
      InputText,
      Button,
      Panel,
      Dropdown,
    },
    props: {
      transformerdialog: { type: Boolean, default: false },
    },
    emits: ["close"],
    data() {
      return {
        type: "",
        name: "",
        expanded: "",
        description: "",
        icon: "",
        display: true,
        projectselected: null,
      }
    },
    computed: {
      projectList() {
        return appProjects.projectList
      },
    },
    methods: {
      collectProject() {
        console.log(this.projectselected)
        appProjects.selectedProject(this.projectselected)
      },
      transformercloseDialog() {
        this.$emit("close")
      },
      handletransformerstore() {
        const data = {
          name: this.projectselected,
          list: {
            name: this.name,
            description: this.des,
            icon: this.icon,
            type: "transformer",   
          },
        }
        appProjects.addNewTransformer(data)
        this.$emit("close")
      },
    },
  }
</script>
<style lang="scss">
  html.t-light .p-panel .p-panel-header {
    background-color: #f8f9fa;
  }
  .transformer-dialog {
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