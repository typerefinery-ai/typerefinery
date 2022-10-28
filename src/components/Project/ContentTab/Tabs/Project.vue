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
            />
          </div>
        </div>
      </div>
    </Fieldset>
    <Button
      :label="$t(`components.dialog.projects.info.save`)"
      :disabled="Boolean(error) || !label.length"
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
    },

    data() {
      return {
        debounce: null,
        disabled: true,
        label: "",
        icon: "",
        description: "",

        error: "",

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
      setInitialData() {
        const { id } = this.tab
        const projectIdx = projectsModule.getProjects.findIndex(
          (el) => el.id == id
        )
        const projectData = projectsModule.getProjects[projectIdx]

        const { label, icon, description } = projectData
        console.log(this, "this")
        this.label = label
        this.icon = icon
        this.description = description

        console.log(label, icon, description, "hello")
        // projectName(value, isFormValid) {
        //   this.name = value
        //   this.v$.name.$model = value
        //   this.name = this.v$.name.$model
        //   const projectexists = projectsModule.getProjects.find(
        //     (el) => el.label == this.v$.name.$model
        //   )
        //   if (projectexists) {
        //     this.validname = true
        //   } else {
        //     this.validname = false
        //   }
        //   if (!isFormValid) {
        //     return
        //   }
        // },
      },
      async saveProject() {
        if (this.error) return
        // console.log(this.label, "he")
        // console.log(this.project.icon, "he")

        const { id } = this.tab
        const projects = projectsModule.getProjects
        console.log(projects, "projects")
        const projectIdx = projects.findIndex((el) => el.id == id)
        console.log(projectIdx, "projectIdx")
        const projectData = projectsModule.getProjects[projectIdx]
        console.log(projectData, "projectData")
        const data = {
          ...projectData,
          label: this.label,
          icon: this.icon,
          description: this.description,
        }
        this.project.label = this.label
        await projectsModule.setProjectData(data)
        //   clearTimeout(this.debounce)
        //   this.debounce = setTimeout(async () => {
        //     // const payload = { field, value, ...this.tab }
        //     // this.submitted = true
        //     // if (!isFormValid) {
        //     //   return
        //     // }
        //     const { id } = this.tab
        //     const projectIdx = projectsModule.getProjects.findIndex(
        //       (el) => el.id == id
        //     )
        //     const projectdata = projectsModule.getProjects[projectIdx]

        //     const payload = {
        //       ...projectdata,
        //       label: this.name,
        //       description: this.description,
        //       icon: this.icon,
        //     }
        //     // this.project.label = this.name

        //     projectsModule.setProjectData(payload)

        //     // console.log(projectdata, "pppp")
        //   }, 600)
        // },
      },
      handleLabel(e) {
        clearTimeout(this.debounce)
        this.debounce = setTimeout(async () => {
          this.label = e.target.value
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
