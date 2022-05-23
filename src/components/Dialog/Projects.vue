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
      <InputText id="type" v-model="type" />
    </div>
    <div class="field">
      <label for="name">
          {{ $t("components.dialog.projects.info.name") }}</label
      >
      <InputText id="name" v-model="name" />
    </div>
    <div class="field">
      <label for="expand">
        {{ $t("components.dialog.projects.info.expanded") }}</label
      >
      <Dropdown
        :options="value"
        optionLabel="name"
        placeholder="Select "
        v-model="selectedBoolean"
        optionValue="code"
      />
    </div>
    <div class="field">
      <label for="des">
         {{ $t("components.dialog.projects.info.description") }}</label
      >
      <InputText id="des" v-model="des" />
    </div>
    <div class="field">
      <label for="icon">
        {{ $t("components.dialog.projects.info.icon") }}</label
      >
      <InputText id="icon" v-model="icon" />
    </div>
    <Button label="Submit" @click="handleProjectstore" />
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
      this.type = ""
      this.name = ""
      this.expand = ""
      this.des = ""
      this.icon = ""
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
.projects-dialog {
  height: 100vh;
  width: 50vw;

  .p-dialog-content {
    height: 100%;
  }

  .p-dialog-header {
    padding: 1.25rem 1.8rem;

    .p-dialog-header-icons:last-of-type {
      display: none;
    }
  }

  .content_wrapper {
    display: flex;
    height: 100%;

    .menu-list {
      flex: 1;

      ul {
        list-style: none;
        cursor: pointer;

        li {
          padding: 0.5rem 0.75rem;
          color: var(--text-color);
          border-radius: 0.25rem;
          transition: box-shadow 0.2s;
          display: flex;
          align-items: center;

          &.selected {
            background: var(--surface-300);
          }

          &:not(:last-of-type) {
            margin-bottom: 0.25rem;
          }

          i {
            color: var(--text-color-secondary);
            margin-right: 0.5rem;
          }
        }
      }
    }

    .menu-content {
      flex: 2;
      padding: 0.5rem 1rem;
      overflow: auto;

      .user_info-wrapper {
        width: 80%;
        display: flex;
        align-items: center;
        margin-bottom: 1rem;

        .avatar-wrapper {
          width: 70px;
          height: 70px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--surface-300);
          border-radius: 50%;
          margin-right: 1rem;

          i {
            font-size: 2rem;
            color: var(--text-color-secondary);
          }
        }

        .user_info {
          &-name {
            margin-bottom: 0.25rem;
            font-weight: bold;
          }
        }
      }
    }
  }
}
</style>
