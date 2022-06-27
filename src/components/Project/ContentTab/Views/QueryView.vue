<template>
  <div class="query-view-wrapper">
    <div class="card">
      <div class="card-container text-left">
        <div class="field p-4 pb-2">
          <label for="name">{{ $t(`components.project.name`) }}</label>
          <InputText
            id="name"
            :model-value="name"
            class="w-full"
            type="text"
            @input="handleInput($event, 'name')"
          />
        </div>

        <div class="field m-4 my-2">
          <label for="query">{{ $t(`components.tab.query`) }}</label>
          <div class="shadow-3">
            <codemirror
              :model-value="query"
              placeholder="Code goes here..."
              :style="{ height: '320px' }"
              :autofocus="true"
              :indent-with-tab="true"
              :tab-zize="2"
              :extensions="extensions"
              @change="handleQuery"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { Codemirror } from "vue-codemirror"
  import { javascript } from "@codemirror/lang-javascript"
  import { oneDark } from "@codemirror/theme-one-dark"
  import InputText from "primevue/inputtext"
  //   import Textarea from "primevue/textarea"
  import Projects from "@/store/Modules/Projects"
  import Settings from "@/store/Modules/AppSettings"
  import { getModule } from "vuex-module-decorators"
  const projects = getModule(Projects)
  const appSettings = getModule(Settings)
  export default {
    name: "QueryView",
    components: { InputText, Codemirror },
    props: {
      tab: { type: Object, required: true },
    },
    computed: {
      extensions() {
        return appSettings.theme === "dark"
          ? [javascript(), oneDark]
          : [javascript()]
      },
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
      handleQuery(code) {
        const payload = { key: "query", value: code, ...this.tab }
        projects.updateQuery(payload)
      },
    },
  }
</script>
