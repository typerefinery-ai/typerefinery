<template>
  <Dialog
    class="projects-dialog"
    :closable="false"
    modal
    :visible="true"
    :breakpoints="{ '960px': '75vw', '640px': '100vw' }"
  >
    <template #header>
      <span class="p-dialog-title">
        {{ $t("components.dialog.projects.header") }}</span
      >
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
        :label="$t(`components.dialog.projects.info.cancel`)"
        icon="pi pi-times"
        class="p-button-text"
        @click="closeDialog"
      />
      <Button
        :label="$t(`components.dialog.projects.info.save`)"
        icon="pi pi-check"
        autofocus
        @click="handleProjectstore(!v$.$invalid)"
      />
    </template>
  </Dialog>
</template>

<script>
  import Dialog from "primevue/dialog"
  import Dropdown from "primevue/dropdown"
  import Panel from "primevue/panel"
  import InputText from "primevue/inputtext"
  import Button from "primevue/button"
  import Projects from "@/store/Modules/Projects"
  import { getModule } from "vuex-module-decorators"
  import { required } from "@vuelidate/validators"
  import { useVuelidate } from "@vuelidate/core"
  const appProjects = getModule(Projects)

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
    setup: () => ({ v$: useVuelidate() }),
    data() {
      return {
        type: "",
        name: "",
        expanded: "",
        description: "",
        icon: "",
        display: true,
        submitted: false,
      }
    },
    validations() {
      return {
        name: { required },
        description: { required },
        icon: { required },
      }
    },
    emits: ["close"],
    methods: {
      closeDialog() {
        this.$emit("close")
      },
      handleProjectstore(isFormValid) {
        const data = {
          type: "project",
          name: this.name,
          description: this.des,
          icon: this.icon,
          queries: {
            type: "queries",
            expanded: true,
            list: [
              {
                name: "query ",
                description: "",
                type: "query",
                connection: "connection 2",
                icon: "connection",
                query: "",
                transformer: "transformer 1",
              },
            ],
          },
          connections: {
            type: "connections",
            expanded: true,
            icon: "connection",
            list: [
              {
                name: "connection ",
                title: "connection 1",
                icon: "connection",
                description: "",
                type: "connection",
              },
            ],
          },

          transformers: {
            type: "transformers",
            list: [
              {
                name: "Transformer ",
                title: "Transformer 1",
                icon: "connection",
                description: "",
                type: "transformer",
              },
            ],
          },
        }
        this.submitted = true

        // stop here if form is invalid

        if (!isFormValid) {
          return
        }

        appProjects.addToList(data)
        this.$emit("close")
      },
    },
  }
</script>
<style lang="scss">
  .dropdown1 {
    width: 100% !important;
  }
  input {
    width: 80%;
  }
  .field {
    display: grid;
  }
  .projects-dialog {
    height: 100vh;
    width: 40vw;
    .p-dropdown {
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
