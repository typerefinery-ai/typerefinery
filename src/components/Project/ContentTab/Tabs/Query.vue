<template>
  <div class="window-wrapper">
    <!-- <div v-show="toolsVisible" class="content-tools-wrapper">
      <div class="content-tools">
        <Button
          :label="$t(`components.tab.query`)"
          class="p-button-raised"
          :class="{
            'p-button-text p-button-plain': activeView !== 'Q',
          }"
          @click="handleView('Q')"
        /> -->

    <!-- <Button
          :label="$t(`components.tab.algorithm`)"
          class="p-button-raised"
          :class="{
            'p-button-text p-button-plain': activeView !== 'A',
          }"
          @click="handleView('A')"
        />
        <Button
          :label="$t(`components.tab.data`)"
          class="p-button-raised"
          :class="{
            'p-button-text p-button-plain': activeView !== 'D',
          }"
          @click="handleView('D')"
        />
        <Button
          :label="$t(`components.tab.transform`)"
          class="p-button-raised"
          :class="{
            'p-button-text p-button-plain': activeView !== 'T',
          }"
          @click="handleView('T')"
        />
        <Button
          :label="$t(`components.tab.graph`)"
          class="p-button-raised"
          :class="{
            'p-button-text p-button-plain': activeView !== 'G',
          }"
          @click="handleView('G')"
        /> -->
    <!-- </div>
      <div
        v-tooltip="$t(`tooltips.hide-content-tools`)"
        class="icon-wrapper hover:text-primary"
        @click="toggleTabs"
      >
        <i class="pi pi-angle-double-up"></i>
      </div>
    </div> -->

    <splitpanes
      :dbl-click-splitter="false"
      :push-other-panes="false"
      @splitter-click="handleSplitterClick"
    >
      <pane :ref="`w-${tab.id}-${paneId}`">
        <!-- <div class="content-area-window" :class="{ show: activeView === 'D' }">
          <data-view :tab="tab" :view="activeView" />
        </div>
        <div class="content-area-window" :class="{ show: activeView === 'A' }">
          <algorithm-view :tab="tab" :view="activeView" />
        </div> -->
        <div class="content-area-window" :class="{ show: activeView === 'Q' }">
          <query-view
            :tab="tab"
            :view="activeView"
            :error="error"
            @on-input="handleInput"
          />
        </div>
        <!-- <div class="content-area-window" :class="{ show: activeView === 'T' }">
          <transformer-view :tab="tab" :view="activeView" />
        </div> -->
        <!-- <div class="content-area-window" :class="{ show: activeView === 'G' }">
          <Button class="p-button-raised m-3 hidden" @click="showD3Chart"
            >Show D3 Graph</Button
          >
          <Button
            class="p-button-raised p-button-success m-3 hidden"
            @click="showWebcolaChart"
            >Show Webcola Graph</Button
          >
          <Button
            class="p-button-raised p-button-warning m-3 hidden"
            @click="showD3LabelsChart"
            >Show D3 Labels Graph</Button
          >
          <div v-if="activeView === 'G'" class="graph-container">
            <graph
              :graph-id="`graph-${tab.id}-${paneId}`"
              :dependencies="dependencies"
              :tab="tab"
              @set-node-data="setNodeData"
            />
          </div>
          <div class="graph-toolbar shadow-4">
            <div class="graph-toolbar-button">
              <full-icon :size="15" />
            </div>
            <div class="graph-toolbar-button">
              <plus-icon :size="15" />
            </div>
            <div class="graph-toolbar-button">
              <minus-icon :size="15" />
            </div>
            <div class="graph-toolbar-button"><control-icon :size="15" /></div>
          </div>
        </div> -->
      </pane>
      <pane :ref="`p-${tab.id}-${paneId}`" size="25" max-size="50">
        <side-panel
          :tab="tab"
          :node-data="nodeData"
          :active-view="activeView"
          @handle-dependencies="handleDependencies"
          @on-input="handleInput"
        />
      </pane>
    </splitpanes>
    <div class="col">
      <Button
        :label="$t(`components.dialog.projects.info.save`)"
        :disabled="checkTabIfDirty()"
        class="p-button-raised mr-2"
        autofocus
        @click.prevent="saveHandler"
      />
      <Button
        :label="$t(`components.dialog.projects.info.saveas`)"
        class="p-button-raised"
        autofocus
        @click.prevent="displaySaveDialog = true"
      />
    </div>
  </div>
  <Dialog
    v-model:visible="displaySaveDialog"
    class="save-theme-dialog"
    modal
    :header="$t(`components.tabquery.save-query-as`)"
    :style="{ width: '400px' }"
  >
    <div class="dialog-content">
      <div class="field">
        <label for="label">{{ $t("components.tabquery.label") }}</label>
        <InputText
          id="label"
          type="text"
          :placeholder="$t(`components.tabquery.query-name`)"
          :model-value="payload.label"
          @input="handleInput('label', $event.target.value)"
        />
        <span
          v-if="!error.label.valid && error.label.isOnDialog"
          class="p-error"
          >{{ error.label.message }}</span
        >
      </div>
      <Button
        class="p-button-raised mr-2"
        :disabled="!payload.label.length"
        :label="$t(`components.tabquery.save-as-global`)"
        @click="saveNewQuery('global')"
      />
      <Button
        v-if="isLocal"
        class="p-button-raised p-button-success"
        :disabled="!payload.label.length"
        :label="$t(`components.tabquery.save-as-local`)"
        @click="saveNewQuery('local')"
      />
    </div>
  </Dialog>
</template>
<script>
  // import FullIcon from "vue-material-design-icons/Fullscreen.vue"
  // import MinusIcon from "vue-material-design-icons/MagnifyMinus.vue"
  // import PlusIcon from "vue-material-design-icons/MagnifyPlus.vue"
  // import ControlIcon from "vue-material-design-icons/CameraControl.vue"
  //   import InputText from "primevue/inputtext"
  import { getModule } from "vuex-module-decorators"
  import { Splitpanes, Pane } from "splitpanes"
  import Button from "primevue/button"
  // import DataView from "../Views/DataView.vue"
  import QueryView from "../Views/QueryView.vue"
  // import TransformerView from "../Views/TransformerView.vue"
  // import AlgorithmView from "../Views/AlgorithmView.vue"
  import SidePanel from "../SidePanel"
  import Dialog from "primevue/dialog"
  import { nanoid } from "nanoid"
  import restapi from "@/utils/restapi"
  // import Graph from "../../../Graph/Graph.vue"
  import renderD3 from "../../../Transformer/D3/d3"
  import renderWebcola from "../../../Transformer/WebCola/webcola"
  import renderD3LabelsChart from "../../../Transformer/D3Labels/d3labels"
  import Settings from "@/store/Modules/Settings"
  import Projects from "@/store/Modules/Projects"
  import AppData from "@/store/Modules/AppData"
  import Queries from "@/store/Modules/Queries"
  import { errorToast, successToast } from "@/utils/toastService"
  const settingsModule = getModule(Settings)
  const queriesModule = getModule(Queries)
  const projectsModule = getModule(Projects)
  export default {
    name: "QueryContent",
    components: {
      Splitpanes,
      Pane,
      // DataView,
      QueryView,
      Dialog,
      // TransformerView,
      // AlgorithmView,
      Button,
      // FullIcon,
      // MinusIcon,
      // PlusIcon,
      // ControlIcon,
      // Graph,
      SidePanel,
    },
    props: {
      toolsVisible: { type: Boolean, required: true },
      focus: { type: Boolean, required: true },
      tab: { type: Object, required: true },
      paneId: { type: String, required: true },
      dirtyTabs: { type: Object, required: true },
    },
    emits: ["toggle", "input", "check-tab-if-dirty"],
    data() {
      return {
        selectedProject: null,
        projects: [],
        displaySaveDialog: false,
        activeView: "Q",
        nodeData: {},
        dependencies: [],
        payload: {
          label: "",
          query: "",
          description: "",
          icon: "",
        },
        queryData: {},
        loading: false,
        queryTitle: "",
        error: {
          label: {
            valid: true,
            message: "",
            isOnDialog: false,
          },
        },
        dirtyStack: new Set(),
      }
    },
    computed: {
      projectList() {
        return projectsModule.getProjects.map((el) => ({
          label: el.label,
          id: el.id,
        }))
      },
      isLocal() {
        return Boolean(this.tab.parent)
      },
    },
    watch: {
      focus(isTrue) {
        if (isTrue) this.handleSplitterClick()
      },
    },
    mounted() {
      this.setInitialData()
    },
    methods: {
      checkTabIfDirty() {
        return !this.dirtyTabs[this.tab.id]
      },
      handleView(view) {
        this.activeView = view
        setTimeout(() => settingsModule.resizeView(), 0)
      },
      handleInput(key, value) {
        this.payload[key] = value
        this.error = {
          label: {
            valid: true,
            message: "",
            isOnDialog: false,
          },
        }
        this.checkDirtyNode(key, value)
      },
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
        } else {
          // global
          const queries = queriesModule.getGlobalQueries
          const queryIdx = queries.findIndex((el) => el.queryid === id)
          queryData = queriesModule.data.list[queryIdx]
        }
        this.payload = {
          label: queryData.label,
          query: queryData.query,
          description: queryData.description,
          icon: queryData.icon,
        }
        this.queryData = {
          label: queryData.label,
          query: queryData.query,
          description: queryData.description,
          icon: queryData.icon,
        }
      },
      checkDirtyNode(key, value) {
        const oldDirtyStackSize = this.dirtyStack.size
        if (this.queryData[key].trim() !== value.trim()) {
          this.dirtyStack.add(key)
        } else {
          if (this.dirtyStack.has(key) === true) {
            this.dirtyStack.delete(key)
          }
        }
        const newDirtyStackSize = this.dirtyStack.size
        if (newDirtyStackSize === 0) {
          this.setFormDirty(false)
        } else {
          if (oldDirtyStackSize === 0) {
            this.setFormDirty(true)
          }
        }
      },
      setFormDirty(val = true) {
        const payload = { id: this.tab.id, isDirty: val }
        this.$emit("input", payload)
      },
      async saveHandler() {
        if (this.loading === true) {
          return
        }
        if (
          this.validatePayload(this.isLocal ? "local" : "global", false) ===
          false
        ) {
          return
        }
        this.loading = true
        const projectData = JSON.parse(JSON.stringify(this.queryData))
        const currentData = JSON.parse(JSON.stringify(this.payload))
        const { parent, id } = this.tab
        const projects = projectsModule.getProjects
        const projectIdx = projects.findIndex((el) => el.id === parent)
        if (projectIdx != -1) {
          // local
          const queries = projectsModule.getQueries(projectIdx)
          const queryIdx = queries.findIndex((el) => el.id === id)
          if (projectData.query !== currentData.query) {
            const payload = {
              field: "query",
              value: currentData.query,
              queryIdx,
              ...this.tab,
            }
            await projectsModule.setQueryData(payload)
          }
          if (projectData.label !== currentData.label) {
            const payload = {
              field: "label",
              value: currentData.label,
              queryIdx,
              ...this.tab,
            }
            await projectsModule.setQueryData(payload)
          }
          if (projectData.description !== currentData.description) {
            const payload = {
              field: "description",
              value: currentData.description,
              queryIdx,
              ...this.tab,
            }
            await projectsModule.setQueryData(payload)
          }
          if (projectData.icon !== currentData.icon) {
            const payload = {
              field: "icon",
              value: currentData.icon,
              queryIdx,
              ...this.tab,
            }
            await projectsModule.setQueryData(payload)
          }
        } else {
          // global
          const queries = queriesModule.getGlobalQueries
          const queryIdx = queries.findIndex((el) => el.id === id)
          if (projectData.query !== currentData.query) {
            const payload = {
              field: "query",
              value: currentData.query,
              queryIdx,
              ...this.tab,
            }
            await queriesModule.setGlobalQuery(payload)
          }
          if (projectData.label !== currentData.label) {
            const payload = {
              field: "label",
              value: currentData.label,
              queryIdx,
              ...this.tab,
            }
            await queriesModule.setGlobalQuery(payload)
          }
          if (projectData.description !== currentData.description) {
            const payload = {
              field: "description",
              value: currentData.description,
              queryIdx,
              ...this.tab,
            }
            await queriesModule.setGlobalQuery(payload)
          }
          if (projectData.icon !== currentData.icon) {
            const payload = {
              field: "icon",
              value: currentData.icon,
              queryIdx,
              ...this.tab,
            }
            await queriesModule.setGlobalQuery(payload)
          }
        }
        this.queryData = { ...this.payload }
        this.setFormDirty(false)
        this.loading = false
        this.dirtyStack = new Set()
        this.displaySaveDialog = false
        successToast(this, this.$t("components.tabquery.save-query"))
      },
      async saveNewQuery(scope) {
        if (this.loading === true) {
          return
        }
        if (this.validatePayload(scope, true) === false) {
          return
        }
        this.loading = true
        const id = nanoid(14)
        if (scope === "global") {
          const payload = {
            queryid: id,
            id: id,
            projectid: null,
            connectionid: "defaultconnection",
            scope: "global",
            icon: this.payload.icon,
            label: this.payload.label,
            description: this.payload.description,
            type: "query",
            query: this.payload.query,
            data: "",
          }
          await restapi.post(`/datastore/query`, payload)
          queriesModule.addGlobalQuery(payload)
          successToast(this, this.$t("components.tabquery.query-save-globally"))
        } else {
          const projects = projectsModule.getProjects
          const projectIdx = projects.findIndex(
            (el) => el.id === this.tab.parent
          )
          if (projectIdx != -1) {
            const data = {
              projectIdx: projectIdx,
              data: {
                id: id,
                queryid: id,
                label: this.payload.label,
                type: "query",
                projectid: this.tab.parent,
                icon: this.payload.icon,
                query: this.payload.query,
                description: this.payload.description,
                scope: "local",
                data: "",
              },
            }
            try {
              await restapi.post("/datastore/query", data.data)
              projectsModule.addNewQuery(data)
              successToast(
                this,
                this.$t("components.tabquery.query-save-locally")
              )
            } catch (err) {
              console.log(err)
              errorToast(this)
            }
          }
        }
        this.payload = {
          label: this.queryData.label,
          query: this.queryData.query,
          description: this.queryData.description,
          icon: this.queryData.icon,
        }
        this.setFormDirty(false)
        this.loading = false
        this.displaySaveDialog = false
      },
      validatePayload(scope, isOnDialog) {
        if (this.payload.label.trim().length === 0) {
          this.error = {
            label: {
              valid: false,
              message: "Label Can't be empty",
              isOnDialog,
            },
          }
          return false
        } else {
          // Check for the existing name
          if (scope === "global") {
            const queries = JSON.parse(
              JSON.stringify(queriesModule.getGlobalQueries)
            )
            const check = queries.filter(
              (query) => query.label.trim() === this.payload.label.trim()
            )
            this.error = {
              label: {
                valid: !isOnDialog
                  ? check.length === 0
                    ? true
                    : this.tab.id === check[0].id
                  : check.length === 0,
                message: (this.error = this.$t(
                  "components.tabquery.query-error",
                  {
                    error: `${this.payload.label}`,
                  }
                )),
                isOnDialog,
              },
            }
            return !isOnDialog
              ? check.length === 0
                ? true
                : this.tab.id === check[0].id
              : check.length === 0
          }
          // Local
          const projects = projectsModule.getProjects
          const projectIdx = projects.findIndex(
            (el) => el.id === this.tab.parent
          )
          const queries = JSON.parse(
            JSON.stringify(projectsModule.getQueries(projectIdx))
          )
          const check = queries.filter(
            (query) => query.label.trim() === this.payload.label.trim()
          )
          this.error = {
            label: {
              valid: !isOnDialog
                ? check.length === 0
                  ? true
                  : this.tab.id === check[0].id
                : check.length === 0,
              message: this.$t("components.tabquery.query-error", {
                error: `${this.payload.label}`,
              }),
              isOnDialog,
            },
          }
          return !isOnDialog
            ? check.length === 0
              ? true
              : this.tab.id === check[0].id
            : check.length === 0
        }
      },
      handleSplitterClick() {
        const rightPanel = this.$refs[`p-${this.tab.id}-${this.paneId}`]
        if (rightPanel.style.width == "0") {
          rightPanel.style.width = "30%"
        } else {
          this.$refs[`w-${this.tab.id}-${this.paneId}`].style.width = "100%"
          rightPanel.style.width = 0
        }
      },
      showD3Chart() {
        this.nodeData = {}
        const id = `graph-${this.tab.id}-${this.paneId}`
        const wrapper = document.getElementById(id)
        this.removeInnerItems(wrapper)
        renderD3(wrapper, this)
      },
      showWebcolaChart() {
        this.nodeData = {}
        renderWebcola(this.$refs.graphPRef, this)
      },
      showD3LabelsChart() {
        this.nodeData = {}
        renderD3LabelsChart(this.$refs.graphPRef, this)
      },
      handleDependencies(d) {
        this.dependencies = d
      },
      toggleTabs() {
        this.$emit("toggle")
      },
      setNodeData(nodeData) {
        this.nodeData = nodeData
      },
    },
  }
</script>
<style lang="scss" scoped>
  @import "./Query.scss";
</style>
