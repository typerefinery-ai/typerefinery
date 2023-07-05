<template>
  <div class="workflow_content">
    <div class="flow_wrapper">
      <iframe :src="path"></iframe>
      <div v-show="resizing" class="flow-overlay"></div>
    </div>
  </div>
</template>

<script>
  // import axios from "axios"
  import Button from "primevue/button"
  // import TableView from "../Table/TableView.vue"
  import Projects from "@/store/Modules/Projects"
  import { getModule } from "vuex-module-decorators"
  const projectsModule = getModule(Projects)
  // import GraphView from "../../../Workflow/FlowGraph.vue"

  export default {
    name: "Output",
    components: {
      Button,
      // TableView,
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
        if (project && project.flowoutputlist.length) {
          const file_name = project.flowoutputlist[0].path
          let path = `https://api.typerefinery.localhost:8101${file_name}`
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
      //   const { data } = await restapi.get(origin + this.path)
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
  .workflow_content {
    height: 100%;
  }

  .flow_wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    position: relative;

    .flow-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: transparent;
      z-index: 2;
    }

    iframe {
      width: 100%;
      height: 100%;
    }
  }
</style>
