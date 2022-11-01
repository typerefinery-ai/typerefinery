<template>
  <div class="project-container">
    <Fieldset :legend="$t(`components.tab.project.header`)" class="mb-3">
      <div class="grid formgrid project-form">
        <div class="col-12 p-fluid">
          <div class="field">
            <label for="label"
              >{{ $t(`components.tab.project.name`)
              }}<span class="asterisk">*</span></label
            >
            <InputText
              id="label"
              :value="label"
              :placeholder="project.label"
              class="w-full"
              type="text"
              @input="handleLabel($event)"
            />
            <span v-if="error" class="p-error">{{ error }}</span>
            <!-- <small v-if="validname" class="p-error"
              >This Project name already taken...Try another</small
            > -->
          </div>
        </div>
        <div class="col-12 p-fluid">
          <div class="field">
            <label for="des"
              >{{ $t(`components.tab.project.description`)
              }}<span class="asterisk">*</span></label
            >
            <InputText
              id="description"
              v-model="project.description"
              class="w-full"
              type="text"
              @input="handleInput('description', $event.target.value)"
            />
          </div>
        </div>
        <div class="col-12 p-fluid">
          <div class="field">
            <label for="icon"
              >{{ $t(`components.tab.project.icon`)
              }}<span class="asterisk">*</span></label
            >
            <InputText
              id="icon"
              v-model="project.icon"
              class="w-full"
              type="text"
              @input="handleInput('icon', $event.target.value)"
            />
          </div>
        </div>
      </div>
    </Fieldset>
    <Button
      :label="$t(`components.dialog.projects.info.save`)"
      :disabled="checkTabIfDirty() || Boolean(error) || !label.length"
      icon="pi pi-check"
      autofocus
      @click="saveProject"
    />
  </div>
</template>
<script>
  import { getModule } from "vuex-module-decorators"
  import Button from "primevue/button"
  import InputText from "primevue/inputtext"
  import Fieldset from "primevue/fieldset"
  import Projects from "@/store/Modules/Projects"
  import { errorToast, successToast } from "@/utils/toastService"
  const projectsModule = getModule(Projects)
  export default {
    name: "ProjectContent",
    components: {
      InputText,
      Fieldset,
      Button,
    },
    props: {
      tab: { type: Object, required: true },
      dirtyTabs: { type: Object, required: true },
    },
    emits: ["input", "check-tab-if-dirty"],
    data() {
      return {
        debounce: null,
        disabled: true,
        label: "",
        icon: "",
        description: "",
        error: "",
        initialData: {
          icon: "",
          label: "",
          description: "",
        },
        //submitted: false,
      }
    },
    computed: {
      project() {
        const { id } = this.tab
        const projectIdx = projectsModule.getProjects.findIndex(
          (el) => el.id == id
        )
        const projectdata = projectsModule.getProjects[projectIdx]
        return projectdata
      },
      // projectName() {
      //   return this.project.label
      // },
    },
    mounted() {
      this.setInitialData()
    },
    methods: {
      checkTabIfDirty() {
        return !this.dirtyTabs[this.tab.id]
      },
      setInitialData() {
        const { id } = this.tab
        const projectIdx = projectsModule.getProjects.findIndex(
          (el) => el.id == id
        )
        const projectData = projectsModule.getProjects[projectIdx]
        const { label, icon, description } = projectData
        this.label = label
        this.icon = icon
        this.description = description
        this.initialData = {
          label,
          icon,
          description,
        }
      },
      handleInput(key, value) {
        this.setFormDirty(!(this.initialData[key].trim() === value.trim()))
      },
      setFormDirty(val = true) {
        const payload = { id: this.tab.id, isDirty: val }
        this.$emit("input", payload)
      },
      async saveProject() {
        if (this.error) return
        const { id } = this.tab
        const projects = projectsModule.getProjects
        const projectIdx = projects.findIndex((el) => el.id == id)
        const projectData = projectsModule.getProjects[projectIdx]
        const data = {
          ...projectData,
          label: this.label,
          icon: this.icon,
          description: this.description,
        }
        this.project.label = this.label
        await projectsModule.setProjectData(data)
        this.setFormDirty(false)
        successToast(
          this,
          this.$t("components.dialog.projects.info.save-project")
        )
      },
      handleLabel(e) {
        clearTimeout(this.debounce)
        this.debounce = setTimeout(async () => {
          this.label = e.target.value
          this.handleInput("label", e.target.value)
          const { id } = this.tab
          const projects = projectsModule.getProjects.filter(
            (el) => el.id !== id
          )
          const projectExits = projects.find(
            (el) => el.label.toLowerCase() === e.target.value.toLowerCase()
          )
          if (projectExits) {
            this.error = `Theme with label "${e.target.value}" already exists.`
          } else {
            this.error = ""
          }
        })
      },
    },
  }
</script>
<style scoped lang="scss">
  .project-container {
    padding: 1rem;
    .p-dropdown {
      max-width: 100%;
      width: 100%;
      display: flex;
      border-bottom: 1px solid var(--surface-border);
      flex-flow: wrap;
    }
    button {
      margin-left: 5px;
    }
  }
</style>
