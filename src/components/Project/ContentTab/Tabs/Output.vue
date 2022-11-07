<template>
  <div class="config-container">
    <div class="config-container-head">
      <Button
        :label="$t(`components.output.viz`)"
        class="p-button-raised"
        :class="{
          'p-button-text p-button-plain': activeView !== 'viz',
        }"
        @click="handleView('viz')"
      />
      <Button
        :label="$t(`components.output.table`)"
        class="p-button-raised"
        :class="{
          'p-button-text p-button-plain': activeView !== 'table',
        }"
        @click="handleView('table')"
      />
    </div>
    <div class="config-container-content">
      <!-- <graph-view v-show="activeView === 'viz'" /> -->
      <object v-show="activeView === 'viz' && path" :data="path"></object>
      <table-view v-show="activeView === 'table'" />
    </div>
  </div>
</template>

<script>
  // import axios from "axios"
  import Button from "primevue/button"
  import TableView from "../Table/TableView.vue"
  import Projects from "@/store/Modules/Projects"
  import { getModule } from "vuex-module-decorators"
  const projectsModule = getModule(Projects)
  // import GraphView from "../../../Workflow/FlowGraph.vue"

  export default {
    name: "Output",
    components: {
      Button,
      TableView,
      // GraphView,
    },
    props: {
      tab: { type: Object, required: true },
    },
    data() {
      return {
        activeView: "viz",
        // svgPath: "",
      }
    },
    computed: {
      path() {
        const project = projectsModule.getProjects.find(
          (el) => el.id === this.tab.parent
        )
        if (project.flowoutputlist.length) {
          const file_name = project.flowoutputlist[0].path
          let path = `http://localhost:8000${file_name}`
          return path
        } else {
          return ""
        }
      },
    },
    // watch: {
    //   path(newVal) {
    //     console.log("path changes", newVal)
    //   },
    // },
    // async mounted() {
    //   await this.getData()
    // },
    methods: {
      handleView(view) {
        this.activeView = view
      },
      // async getData() {
      // try {
      //   const origin = `http://localhost:8000`
      //   const { data } = await axios.get(origin + this.path)
      // this.svgPath = data
      //   console.log(data)
      // } catch (err) {
      //   console.log(err)
      // }
      // },
    },
  }
</script>

<style lang="scss" scoped>
  .config-container {
    height: 100%;
    &-head {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 10px;
      border-bottom: 1px solid var(--surface-border);
      flex-flow: wrap;

      button {
        margin-right: 5px;
      }
    }
    &-content {
      display: block;
      margin: 1rem;
      height: 100%;

      object {
        height: 100%;
        width: 100%;
      }

      .field {
        label {
          display: block;
        }
      }
      .table {
        display: flex;
        align-items: center;
        border: 1px solid var(--surface-border);
        border-radius: 4px;
      }
    }
  }
</style>
