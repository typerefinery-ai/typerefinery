<template>
  <Dialog
    class="connection-dialog"
    :visible="true"
    modal
    :closable="true"
    :breakpoints="{ '960px': '75vw', '640px': '100vw' }"
  >
    <template #header>
      <span class="p-dialog-title"> New Connections </span>
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
    <div class="field">
      <label for="expand">Projects</label>
      <Dropdown
        :options="projectList"
        v-model="selected"
        optionLabel="name"
        optionValue="key"
        placeholder="Select Project "
        class="p-invalid"
      />
    </div>
    <h3><u>Connections Info</u></h3>
    <div class="field">
      <label for="name">Name</label>
      <InputText id="name" v-model="name" class="p-invalid" />
    </div>
    <div class="field">
      <label for="des">Description</label>
      <InputText id="des" v-model="des" class="p-invalid" />
    </div>
    <div class="field">
      <label for="icon">Icon</label>
      <InputText id="icon" v-model="icon" class="p-invalid" />
    </div>
    <Button label="Submit" @click="handleconnectionstore" />
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
console.log(appProjects.projectList)

export default {
  name: "NewConnections",
  components: {
    Dialog,
    Avatar,
    InputText,
    Button,
    Dropdown,
  },
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
      selectedBoolean: null,
      selected: null,
      value1: [],
      value: [{ name: "True" }, { name: "False" }],
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
    handleconnectionstore() {
      const data = {
        name: this.selected,
        list: {
          name: this.name,
          icon: this.icon,
          description: this.des,
          type: "connection",
        },
      }
      appProjects.addNewConnection(data)
      this.$emit("close")
    },
  },
}
</script>
<style  lang="scss">
.p-float-label {
  margin-bottom: 10px;
}
input {
  width: 80%;
}
.field {
  display: grid;
}
.connection-dialog {
  height: 100vh;
  width: 50vw;
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