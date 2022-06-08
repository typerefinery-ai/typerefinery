<template>
  <Dialog
    class="connection-dialog"
    :visible="true"
    modal
    :closable="true"
    :breakpoints="{ '960px': '75vw', '640px': '100vw' }"
  >
    <template #header>
      <span class="p-dialog-title">
        {{ $t("components.dialog.connections.header") }}
      </span>
      <div class="p-dialog-header-icons">
        <button
          class="p-dialog-header-icon p-dialog-header-close p-link"
          aria-label="close"
          type="button"
          @click="conncetioncloseDialog"
        >
          <span class="p-dialog-header-close-icon pi pi-times"></span>
        </button>
      </div>
    </template>
    <Panel :header="$t(`components.dialog.connections.info.panelheader`)">
      <div class="field">
        <label
          for="expand"
          :class="{ 'p-error': v$.selected.$invalid && submitted }"
          >{{ $t("components.dialog.connections.info.project") }}</label
        >
        <Dropdown
          :options="projectList"
          v-model="v$.selected.$model"
          optionLabel="name"
          optionValue="key"
          :placeholder="$t(`components.dialog.connections.info.select`)"
          :class="{ 'p-error': v$.selected.$invalid && submitted }"
        />
        <small
          v-if="
            (v$.selected.$invalid && submitted) ||
            v$.selected.$pending.$response
          "
          class="p-error"
          >{{
            v$.selected.required.$message.replace("Value", "Project")
          }}</small
        >
      </div>
    </Panel>
    <Panel
      :header="$t(`components.dialog.connections.info.panel2header`)"
      class="panel2"
    >
      <div class="field">
        <label
          for="name"
          :class="{ 'p-error': v$.name.$invalid && submitted }"
          >{{ $t("components.dialog.connections.info.name") }}</label
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
        <label
          for="description"
          :class="{ 'p-error': v$.description.$invalid && submitted }"
        >
          {{ $t("components.dialog.projects.info.description") + "*" }}</label
        >
        <InputText
          id="description"
          v-model="v$.description.$model"
          :class="{ 'p-invalid': v$.description.$invalid && submitted }"
        />
        <small
          v-if="
            (v$.description.$invalid && submitted) ||
            v$.description.$pending.$response
          "
          class="p-error"
          >{{
            v$.description.required.$message.replace("Value", "Description")
          }}</small
        >
      </div>
      <div class="field">
        <label for="icon" :class="{ 'p-error': v$.icon.$invalid && submitted }">
          {{ $t("components.dialog.projects.info.icon") + "*" }}</label
        >
        <InputText
          id="icon"
          v-model="v$.icon.$model"
          :class="{ 'p-invalid': v$.icon.$invalid && submitted }"
        />
        <small
          v-if="(v$.icon.$invalid && submitted) || v$.icon.$pending.$response"
          class="p-error"
          >{{ v$.icon.required.$message.replace("Value", "Icon") }}</small
        >
      </div>
    </Panel>
    <template #footer>
      <Button
        :label="$t(`components.dialog.new-transformer.footer.cancel`)"
        icon="pi pi-times"
        class="p-button-text"
        @click="conncetioncloseDialog"
      />
      <Button
        :label="$t(`components.dialog.new-transformer.footer.save`)"
        icon="pi pi-check"
        autofocus
        @click="handleconnectionstore(!v$.$invalid)"
      />
    </template>
  </Dialog>
</template>

<script>
  import Dialog from "primevue/dialog"
  import Avatar from "primevue/avatar"
  import Dropdown from "primevue/dropdown"
  import InputText from "primevue/inputtext"
  import Button from "primevue/button"
  import Panel from "primevue/panel"
  import Projects from "@/store/Modules/Projects"
  import { getModule } from "vuex-module-decorators"
  import { required } from "@vuelidate/validators"
  import { useVuelidate } from "@vuelidate/core"
  const appProjects = getModule(Projects)
  console.log(appProjects.projectList)

  export default {
    name: "NewConnections",
    components: {
      Dialog,
      Avatar,
      Panel,
      InputText,
      Button,
      Dropdown,
    },
    setup: () => ({ v$: useVuelidate() }),
    props: {
      connectiondialog: { type: Boolean, default: false },
    },
    data() {
      return {
        type: "Connection",
        name: "",
        expanded: "",
        description: "",
        icon: "",
        display: true,
        selected: null,
        submitted: false,
      }
    },
    validations() {
      return {
        name: { required },
        description: { required },
        icon: { required },
        selected: { required },
      }
    },
    computed: {
      projectList() {
        return appProjects.projectList
      },
    },
    emits: ["close"],
    methods: {
      conncetioncloseDialog() {
        this.$emit("close")
      },
      handleconnectionstore(isFormValid) {
        const data = {
          name: this.selected,
          list: {
            name: this.name,
            icon: this.icon,
            description: this.description,
            type: "connection",
          },
        }
        this.submitted = true

        // stop here if form is invalid

        if (!isFormValid) {
          return
        }
        appProjects.addNewConnection(data)
        this.$emit("close")
      },
    },
  }
</script>
<style lang="scss">
  .connection-dialog {
    height: 100vh;
    width: 40vw;
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
    .panel2 {
      margin-top: 10px;
    }
    .p-dialog-header {
      padding: 1.25rem 1.8rem;

      .p-dialog-header-icons:last-of-type {
        display: none;
      }
    }
  }
</style>
