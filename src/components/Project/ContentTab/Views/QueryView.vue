<template>
  <div class="query-view-wrapper">
    <div class="card">
      <div class="card-container">
        <div class="block p-4 pb-2">
          <span class="p-float-label">
            <InputText
              id="name"
              :model-value="name"
              class="w-full"
              type="text"
              @input="handleInput($event, 'name')"
            />
            <label for="name">{{ $t(`components.project.name`) }}</label>
          </span>
        </div>

        <div class="block p-4 pt-3 pb-0">
          <span class="p-float-label">
            <Textarea
              id="query"
              :model-value="query"
              :auto-resize="true"
              rows="17"
              cols="30"
              class="w-full"
              @input="handleInput($event, 'query')"
            />
            <label for="query">{{ $t(`components.tab.query`) }}</label>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import InputText from "primevue/inputtext"
  import Textarea from "primevue/textarea"
  import Projects from "@/store/Modules/Projects"
  import { getModule } from "vuex-module-decorators"
  const projects = getModule(Projects)
  export default {
    name: "QueryView",
    components: { InputText, Textarea },
    props: {
      tab: { type: Object, required: true },
    },
    computed: {
      name() {
        const { projectIdx, queryIdx } = this.tab
        return projects.list[projectIdx].queries.list[queryIdx].name
      },
      query() {
        const { projectIdx, queryIdx } = this.tab
        return projects.list[projectIdx].queries.list[queryIdx].query
      },
    },
    methods: {
      handleInput({ target: { value } }, key) {
        const payload = { key, value, ...this.tab }
        projects.updateQuery(payload)
      },
    },
  }
</script>
