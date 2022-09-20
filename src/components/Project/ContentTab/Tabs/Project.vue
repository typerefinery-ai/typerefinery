<template>
  <div class="project-container">
    <Fieldset :legend="$t(`components.tab.project.header`)" class="mb-3">
      <div class="grid formgrid project-form">
        <div class="col-12 p-fluid">
          <div class="field">
            <label for="name"
              >{{ $t(`components.tab.project.name`)
              }}<span class="asterisk">*</span></label
            >
            <InputText
              id="name"
              :model-value="project.label"
              class="w-full"
              type="text"
              @input="handleInput($event, 'label')"
            />
          </div>
        </div>
        <div class="col-12 p-fluid">
          <div class="field">
            <label for="des"
              >{{ $t(`components.tab.project.description`)
              }}<span class="asterisk">*</span></label
            >
            <InputText
              id="des"
              :model-value="project.description"
              class="w-full"
              type="text"
              @input="handleInput($event, 'description')"
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
              :model-value="project.icon"
              class="w-full"
              type="text"
              @input="handleInput($event, 'icon')"
            />
          </div>
        </div>
      </div>
    </Fieldset>
  </div>
</template>
<script>
  import { getModule } from "vuex-module-decorators"
  import InputText from "primevue/inputtext"
  import Fieldset from "primevue/fieldset"
  import Projects from "@/store/Modules/Projects"
  const projectsModule = getModule(Projects)
  export default {
    name: "ProjectContent",
    components: {
      InputText,
      Fieldset,
    },
    props: {
      tab: { type: Object, required: true },
    },
    data() {
      return {
        name: "",
        icon: "",
        description: "",
        debounce: null,
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
    },
    methods: {
      async handleInput({ target: { value } }, field) {
        clearTimeout(this.debounce)
        this.debounce = setTimeout(async () => {
          const payload = { field, value, ...this.tab }
          await projectsModule.setProjectData(payload)
        }, 600)
      },
    },
  }
</script>
<style lang="scss">
  .project-container {
    padding: 1rem;
    .p-dropdown {
      max-width: 100%;
      width: 100%;
      display: flex;
      border-bottom: 1px solid var(--surface-border);
      flex-flow: wrap;
    }
  }
</style>
