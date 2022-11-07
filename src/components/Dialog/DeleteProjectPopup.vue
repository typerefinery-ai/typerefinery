<template>
  <div>
    <Dialog
      v-model:visible="displayDeletePopup"
      :header="$t(`components.dialog.projects.info.delete-project`)"
      :modal="true"
      :closable="false"
      :style="{ width: '350px' }"
    >
      <div class="confirmation-content">
        <i class="pi pi-info-circle mr-3 deleteIcon" />
        <span>{{ popupmessage }}</span>
      </div>

      <template #footer>
        <Button
          :label="$t(`components.dialog.projects.info.cancel`)"
          icon="pi pi-times"
          class="p-button-text"
          @click="closeDeleteDialog"
        />
        <Button
          id="deleteTreeNode"
          :label="$t(`components.dialog.projects.info.delete`)"
          :icon="`pi ${loading ? 'pi-spin pi-spinner' : 'pi-check'}`"
          :style="{ 'pointer-events': loading ? 'none' : 'auto' }"
          class="p-button-text"
          @click="deleteProjectTreenode"
        />
      </template>
    </Dialog>
  </div>
</template>

<script>
  import { getModule } from "vuex-module-decorators"
  import Dialog from "primevue/dialog"
  import Button from "primevue/button"
  import Projects from "@/store/Modules/Projects"
  import AppData from "@/store/Modules/AppData"
  import Queries from "@/store/Modules/Queries"
  import Connections from "@/store/Modules/Connections"
  import Themes from "@/store/Modules/Theme"
  import { errorToast, successToast } from "@/utils/toastService"
  const projectsModule = getModule(Projects)
  const appDataModule = getModule(AppData)
  const queryModule = getModule(Queries)
  const connectionModule = getModule(Connections)
  const themeModule = getModule(Themes)

  export default {
    name: "DeleteTreeNodePopup",
    components: {
      Dialog,
      Button,
    },
    props: {
      node: { type: Object, required: true },
      deletedialog: { type: Boolean, default: false },
    },
    emits: ["close"],
    data() {
      return {
        displayDeletePopup: true,
        loading: false,
        popupmessage: "",
      }
    },
    mounted() {
      if (this.node.label == "Sample Project") {
        this.popupmessage = this.$t(
          "components.dialog.projects.info.delete-sample-project-popup"
        )
      } else
        this.popupmessage = this.$t(
          "components.dialog.projects.info.delete-project-popup"
        )
    },
    methods: {
      closeDeleteDialog() {
        this.$emit("close")
      },
      async deleteProjectTreenode() {
        const nodeData = this.node

        const eKeys = [nodeData.key]
        const sKeys = [nodeData.key]
        const ids = [nodeData.id]
        const connectionid = []
        const queryid = []
        const themeid = []

        if (nodeData.type == "project") {
          const payload = {
            key: nodeData.key,
            id: nodeData.id,
            ...this.tab,
            connectionid,
            queryid,
            themeid,
          }

          nodeData.children.forEach((el) => {
            eKeys.push(el.key)
            el.children.forEach((el) => {
              if (el.type == "connection") {
                connectionid.push(el.id)
              }
              if (el.type == "query") {
                queryid.push(el.id)
              }
              if (el.type == "theme") {
                themeid.push(el.id)
              }
              sKeys.push(el.key)
              ids.push(el.id)
            })
          })
          this.loading = true
          try {
            appDataModule.removeSelectedTreeNodes(ids)
            appDataModule.toggleTreeNode()
            projectsModule.removeExpandedNodesByKeys(eKeys)
            projectsModule.removeSelectedNodesByKeys(sKeys)
            await projectsModule.deleteProjectData(payload)
            successToast(this, "Successfully Deleted")
          } catch (err) {
            console.log(err)
            errorToast(this)
          }
          this.$emit("close")
        }

        if (nodeData.type == "connection") {
          const payload = {
            key: nodeData.key,
            id: nodeData.id,
            ...this.tab,
          }
          this.loading = true
          try {
            appDataModule.removeSelectedTreeNodes(ids)
            appDataModule.toggleTreeNode()
            projectsModule.removeExpandedNodesByKeys(eKeys)
            projectsModule.removeSelectedNodesByKeys(sKeys)
            await connectionModule.deleteGlobalConnection(payload)
            successToast(this, "Successfully Deleted")
          } catch (err) {
            console.log(err)
            errorToast(this)
          }
          this.$emit("close")
        }

        if (nodeData.type == "theme") {
          const payload = {
            key: nodeData.key,
            id: nodeData.id,
            ...this.tab,
          }
          this.loading = true
          try {
            appDataModule.removeSelectedTreeNodes(ids)
            appDataModule.toggleTreeNode()
            projectsModule.removeExpandedNodesByKeys(eKeys)
            projectsModule.removeSelectedNodesByKeys(sKeys)
            await themeModule.deleteGlobalTheme(payload)

            successToast(this, "Successfully Deleted")
          } catch (err) {
            console.log(err)
            errorToast(this)
          }
          this.$emit("close")
        }

        if (nodeData.type == "query") {
          const payload = {
            key: nodeData.key,
            id: nodeData.id,
            ...this.tab,
          }
          this.loading = true
          try {
            appDataModule.removeSelectedTreeNodes(ids)
            appDataModule.toggleTreeNode()
            projectsModule.removeExpandedNodesByKeys(eKeys)
            projectsModule.removeSelectedNodesByKeys(sKeys)
            await queryModule.deleteGlobalQuery(payload)
            successToast(this, "Successfully Deleted")
          } catch (err) {
            console.log(err)
            errorToast(this)
          }
          this.$emit("close")
        }
      },
    },
  }
</script>
<style scoped lang="scss">
  p {
    margin: 0;
  }

  .confirmation-content {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .p-dialog .p-button {
    min-width: 6rem;
  }
  .deleteIcon {
    font-size: 2rem;
  }

  #deleteTreeNode {
    color: white;
    background-color: #ef4444;
  }
</style>
