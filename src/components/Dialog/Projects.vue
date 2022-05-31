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
    <div class="field">
      <label for="type">
        {{ $t("components.dialog.projects.info.type") }}</label
      >
      <InputText id="type" v-model="type" class="p-invalid"/>
    </div>
    <div class="field">
      <label for="name">
          {{ $t("components.dialog.projects.info.name") }}</label
      >
      <InputText id="name" v-model="name" class="p-invalid"/>
    </div>
    <div class="field dropdown1">
      <label for="expand">
        {{ $t("components.dialog.projects.info.expanded") }}</label
      >
      <Dropdown
        :options="value"
        optionLabel="name"
        :placeholder="$t(`components.dialog.projects.info.select`)"
        v-model="selectedBoolean"
        optionValue="code"
        class="p-invalid"
      />
    </div>
    <div class="field">
      <label for="des">
         {{ $t("components.dialog.projects.info.description") }}</label
      >
      <InputText id="des" v-model="des" class="p-invalid"/>
    </div>
    <div class="field">
      <label for="icon">
        {{ $t("components.dialog.projects.info.icon") }}</label
      >
      <InputText id="icon" v-model="icon" class="p-invalid"/>
    </div>
    <Button :label="$t(`components.dialog.projects.info.submit`)" @click="handleProjectstore" />
  </Dialog>
</template>

<script>
import Dialog from "primevue/dialog"
import Avatar from "primevue/avatar"
import Dropdown from "primevue/dropdown"
import InputText from "primevue/inputtext"
import Button from "primevue/button"
import Projects from "@/store/Modules/Projects"
import { getModule } from "vuex-module-decorators"
const appProjects = getModule(Projects)

export default {
  name: "NewProject",
  components: {
    Dialog,
    Avatar,
    InputText,
    Button,
    Dropdown,
  },
  props: {
    projectdialog: { type: Boolean, default: false },
  },
  data() {
    return {
      type: "",
      name: "",
      expanded: "",
      description: "",
      icon: "",
      display: true,
      selectedBoolean: null,
      value: [
        { name: "True", code: "NY" },
        { name: "False", code: "ZM" },
      ],
    }
  },
  emits: ["close"],
  methods: {
    closeDialog() {
      this.$emit("close")
    },
    handleProjectstore() {
      const data = {
        type: this.type,
        name: this.name,
        expanded: this.expand,
        description: this.des,
        icon: this.icon,
      }
      appProjects.addToList(data)
      this.$emit("close")
    },
  },
}
</script>
<style  lang="scss">
.dropdown1{
  width: 100% !important;;
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
  .p-dropdown{
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
