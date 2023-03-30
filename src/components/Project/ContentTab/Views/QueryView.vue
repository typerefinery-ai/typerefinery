<template>
  <div ref="querywrapper" class="query-view-wrapper h-full">
    <div class="card">
      <div class="card-container text-left">
        <div class="field p-4 pb-2">
          <label for="label"> {{ $t(`components.project.name`) + "*" }} </label>
          <InputText
            id="label"
            :model-value="label"
            class="w-full"
            type="text"
            @input="handleInput($event, 'label')"
          />
          <small
            v-if="!error.label.valid && !error.label.isOnDialog"
            class="p-error"
          >
            {{ error.label.message }}
          </small>
        </div>

        <div class="field m-4 my-2">
          <label for="query">{{ $t(`components.tab.query`) }}</label>
          <div id="query_view_cm" class="shadow-3">
            <codemirror
              v-model="query"
              :placeholder="$t(`components.dialog.new-query.add-query`)"
              :style="{ height: '320px' }"
              :autofocus="true"
              :indent-with-tab="true"
              :tab-size="2"
              :extensions="extensions"
              @change="handleQuery($event, 'query')"
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
  import { getModule } from "vuex-module-decorators"
  import InputText from "primevue/inputtext"
  import Projects from "@/store/Modules/Projects"
  import Settings from "@/store/Modules/Settings"
  import Queries from "@/store/Modules/Queries"
  const projectsModule = getModule(Projects)
  const settingsModule = getModule(Settings)
  const queriesModule = getModule(Queries)
  export default {
    name: "QueryView",
    components: { InputText, Codemirror },
    props: {
      tab: { type: Object, required: true },
      view: { type: String, required: true },
      error: { type: Object, required: true },
    },
    emits: ["on-input"],
    data() {
      return {
        query: "",
        debounce: null,
        label: "",
        queryData: {},
        // icon: "",
        // description: "",
      }
    },
    computed: {
      extensions() {
        return settingsModule.data.theme === "dark"
          ? [javascript(), oneDark]
          : [javascript()]
      },
      // label() {
      //   const { parent, id } = this.tab
      //   const projects = projectsModule.getProjects
      //   const projectIdx = projects.findIndex((el) => el.id === parent)
      //   const queries = projectsModule.getQueries(projectIdx)
      //   const queryIdx = queries.findIndex((el) => el.id === id)
      //   return projectsModule.getQuery(projectIdx, queryIdx).label
      // },
      // query() {
      //   const { parent, id } = this.tab
      //   const projects = projectsModule.getProjects
      //   const projectIdx = projects.findIndex((el) => el.id === parent)
      //   const queries = projectsModule.getQueries(projectIdx)
      //   const queryIdx = queries.findIndex((el) => el.id === id)
      //   return projectsModule.getQuery(projectIdx, queryIdx).query
      // },
      viewResized() {
        return settingsModule.data.viewResized
      },
    },
    watch: {
      viewResized() {
        setTimeout(() => this.setEditorHeight(), 0)
      },
    },
    mounted() {
      setTimeout(() => this.setEditorHeight(), 0)
      this.setInitialData()
    },
    methods: {
      setInitialData() {
        const { parent, id } = this.tab
        const projects = projectsModule.getProjects
        const projectIdx = projects.findIndex((el) => el.id === parent)
        let queryData
        if (projectIdx != -1) {
          // local
          const queries = projectsModule.getQueries(projectIdx)
          const queryIdx = queries.findIndex((el) => el.id === id)
          queryData = queries[queryIdx]
          // const project = projectsModule.getProjects[projectIdx]
          // connection = project.connections.list[connectionIdx]
        } else {
          // global
          const queries = queriesModule.getGlobalQueries
          const queryIdx = queries.findIndex((el) => el.queryid === id)
          queryData = queriesModule.data.list[queryIdx]
        }
        // const { theme } = themeData
        // this.code = theme
        const { query, label } = queryData
        this.queryData = queryData
        this.query = query
        this.label = label
      },
      async handleInput({ target: { value } }, field) {
        this.$emit("on-input", field, value)
        // this.debounce = setTimeout(async () => {
        //   const { parent, id } = this.tab
        //   const projects = projectsModule.getProjects
        //   const projectIdx = projects.findIndex((el) => el.id === parent)
        //   if (projectIdx != -1) {
        //     const queries = projectsModule.getQueries(projectIdx)
        //     const queryIdx = queries.findIndex((el) => el.id === id)
        //     const payload = { field, value, queryIdx, ...this.tab }
        //     await projectsModule.setQueryData(payload)
        //   } else {
        //     // global
        //     const queries = queriesModule.getGlobalQueries
        //     const queryIdx = queries.findIndex((el) => el.id === id)
        //     const payload = { field, value, queryIdx, ...this.tab }
        //     await queriesModule.setGlobalQuery(payload)
        //   }
        // }, 500)
      },
      handleQuery(value, field) {
        this.$emit("on-input", field, value)
        // this.debounce = setTimeout(async () => {
        //   const { parent, id } = this.tab
        //   const projects = projectsModule.getProjects
        //   const projectIdx = projects.findIndex((el) => el.id === parent)
        //   if (projectIdx != -1) {
        //     const queries = projectsModule.getQueries(projectIdx)
        //     const queryIdx = queries.findIndex((el) => el.id === id)
        //     const payload = { field, value, queryIdx, ...this.tab }
        //     await projectsModule.setQueryData(payload)
        //   } else {
        //     // global
        //     const queries = queriesModule.getGlobalQueries
        //     const queryIdx = queries.findIndex((el) => el.id === id)
        //     const payload = { field, value, queryIdx, ...this.tab }
        //     await queriesModule.setGlobalQuery(payload)
        //   }
        // }, 500)
      },
      setEditorHeight() {
        if (this.view !== "Q") return
        const wrapper = this.$refs.querywrapper
        const editor = document.querySelector("#query_view_cm .cm-editor")
        if (wrapper) {
          editor.style.setProperty("display", "none", "important")
          editor.style.height = wrapper.clientHeight - 143 + "px"
          editor.style.setProperty("display", "flex", "important")
        }
      },
    },
  }
</script>
