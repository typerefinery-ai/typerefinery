<template>
  <div class="experienceDialog">
    <Dialog
      v-model:visible="displayEditPopup"
      :header="$t(`components.dialog.popup.heading`)"
      :modal="true"
      :closable="false"
      :style="{ width: '350px' }"
    >
      <template #header>
        <span v-if="addElements" class="p-dialog-title">
          {{ $t(`components.setting.experience.add-experience`) }}
        </span>
        <span v-if="editElements" class="p-dialog-title">
          {{ $t(`components.setting.experience.edit-experience`) }}
        </span>

        <div class="p-dialog-header-icons">
          <button
            class="p-dialog-header-icon p-dialog-header-close p-link"
            aria-label="close"
            type="button"
            @click="closeDialog"
          >
            <span class="p-dialog-header-close-icon pi pi-times"></span>
          </button>
        </div>
      </template>
      <div class="field">
        <label for="name">{{
          $t(`components.setting.experience.label`)
        }}</label>
        <InputText id="name" v-model="label" />
      </div>
      <div class="field">
        <label for="type">{{
          $t("components.setting.experience.service")
        }}</label>
        <Dropdown
          id="type"
          v-model="service"
          :options="services"
          :placeholder="$t(`components.setting.experience.placeholder`)"
          option-label="name"
          option-value="id"
        >
        </Dropdown>
      </div>
      <div class="field">
        <label for="icon">{{ $t(`components.setting.experience.icon`) }}</label>
        <InputText id="icon" v-model="icon" />
      </div>
      <div class="field">
        <label for="url">{{ $t(`components.setting.experience.url`) }}</label>
        <InputText id="url" v-model="url" @input="formatUrl" />
      </div>
      <div class="field">
        <label for="urlformatted">{{
          $t(`components.setting.experience.urlformatted`)
        }}</label>
        <InputText id="urlformatted" v-model="urlformatted" />
      </div>
      <!-- iframe settings -->
      <Accordion>
        <AccordionTab>
          <template #header>
            {{ $t(`components.setting.experience.iframeconfig.title`) }}
          </template>
          <div class="field">
            <label for="name">{{
              $t(`components.setting.experience.iframeconfig.name`)
            }}</label>
            <InputText
              id="name"
              placeholder="disable-x-frame-options"
              v-model="iframeconfig.name"
            />
          </div>
          <div class="field">
            <label for="referrerpolicy">{{
              $t(`components.setting.experience.iframeconfig.referrerpolicy`)
            }}</label>
            <InputText
              id="referrerpolicy"
              placeholder="strict-origin-when-cross-origin"
              v-model="iframeconfig.referrerpolicy"
            />
          </div>
          <div class="field">
            <label for="sandbox">{{
              $t(`components.setting.experience.iframeconfig.sandbox`)
            }}</label>
            <InputText
              id="sandbox"
              placeholder="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation"
              v-model="iframeconfig.sandbox"
            />
          </div>
          <div class="field">
            <label for="allow">{{
              $t(`components.setting.experience.iframeconfig.allow`)
            }}</label>
            <InputText
              id="allow"
              placeholder="encrypted-media; fullscreen; oversized-images; picture-in-picture; sync-xhr; geolocation;"
              v-model="iframeconfig.allow"
            />
          </div>
          <div class="field">
            <label for="allowfullscreen">{{
              $t(`components.setting.experience.iframeconfig.allowfullscreen`)
            }}</label>
            <InputSwitch
              id="allowfullscreen"
              v-model="iframeconfig.allowfullscreen"
            />
          </div>
          <div class="field">
            <label for="allowpaymentrequest">{{
              $t(
                `components.setting.experience.iframeconfig.allowpaymentrequest`
              )
            }}</label>
            <InputSwitch
              id="allowpaymentrequest"
              v-model="iframeconfig.allowpaymentrequest"
            />
          </div>
          <div class="field">
            <label for="allowpopups">{{
              $t(`components.setting.experience.iframeconfig.allowpopups`)
            }}</label>
            <InputSwitch id="allowpopups" v-model="iframeconfig.allowpopups" />
          </div>
        </AccordionTab>
      </Accordion>
      <template #footer>
        <Button
          :label="$t(`components.setting.experience.buttons.cancel`)"
          icon="pi pi-times"
          class="p-button-text"
          @click="closeDialog"
        ></Button>
        <Button
          v-if="editElements"
          :label="$t(`components.setting.experience.buttons.update`)"
          type="button"
          icon="pi pi-check"
          @click="editMenuItem"
        ></Button>
        <Button
          v-if="addElements"
          :label="$t(`components.setting.experience.buttons.add`)"
          type="button"
          icon="pi pi-check"
          @click="addMenuItem"
        ></Button>
      </template>
    </Dialog>
  </div>
</template>

<script>
  import { getModule } from "vuex-module-decorators"
  import Dialog from "primevue/dialog"
  import Accordion from "primevue/accordion"
  import AccordionTab from "primevue/accordiontab"
  import InputSwitch from "primevue/inputswitch"
  import Button from "primevue/button"
  import Projects from "@/store/Modules/Projects"
  import AppData from "@/store/Modules/AppData"
  import Queries from "@/store/Modules/Queries"
  import InputText from "primevue/inputtext"
  import Dropdown from "primevue/dropdown"
  import Connections from "@/store/Modules/Connections"
  import Themes from "@/store/Modules/Theme"
  import { errorToast, successToast } from "@/utils/toastService"
  import Settings from "@/store/Modules/Settings"
  import { nanoid } from "nanoid"
  const settingsModule = getModule(Settings)
  const projectsModule = getModule(Projects)
  const appDataModule = getModule(AppData)
  const queryModule = getModule(Queries)
  const connectionModule = getModule(Connections)
  const themeModule = getModule(Themes)
  import Services from "@/store/Modules/Services"
  const servicesModule = getModule(Services)

  export default {
    name: "EditExprience",
    components: {
      Dialog,
      Button,
      Dropdown,
      InputText,
      Accordion,
      AccordionTab,
      InputSwitch,
    },
    props: {
      editDialog: { type: Boolean, default: false },
      exprienceId: { type: String, default: "" },
      type: { type: String, required: true },
      payload: { type: Object, required: true },
      fetchingLatestExperience: {
        type: Function,
        default() {
          return {}
        },
      },
    },
    emits: ["close"],
    data() {
      return {
        listOfExperiences: {},
        displayEditPopup: true,
        addElements: false,
        editElements: false,
        loading: false,
        name: "",
        icon: "",
        url: "",
        urlformatted: "",
        iframeconfig: {
          name: "",
          referrerpolicy: "",
          sandbox: "",
          allow: "",
          allowfullscreen: "",
          allowpaymentrequest: "",
          allowpopups: "",
        },
        service: "",
        services: [],
      }
    },
    computed: {
      serviceStatusColorList() {
        return servicesModule.serviceStatusColorList
      },
      serviceTypeList() {
        return servicesModule.serviceTypeList
      },
      serviceStatusList() {
        return servicesModule.serviceStatusList
      },
      serviceList() {
        return servicesModule.serviceList
      },
      serviceCountByStatus() {
        return servicesModule.serviceCountByStatus
      },
    },
    async mounted() {
      // get all services
      this.services = await this.getServices()
      // add none to the list
      this.services.push({
        id: "",
        name: "None",
        type: "",
        status: "",
        url: "",
        icon: "",
      })
      // get all experiences
      this.listOfExperiences = JSON.parse(
        JSON.stringify(settingsModule.data.listOfMenu)
      )
      console.log("listOfExperiences", this.listOfExperiences)
      console.log("type", this.type)
      console.log("payload", this.payload)
      // update ui based on type of operation
      if (this.type === "UPDATE") {
        this.label = this.payload.label
        this.icon = this.payload.icon
        this.url = this.payload.url
        this.service = this.payload.service
        this.iframeconfig = this.payload.iframeconfig
        this.editElements = true
      } else if (this.type === "ADD") {
        this.addElements = true
        this.label = ""
        this.icon = ""
        this.url = ""
        this.service = ""
        this.iframeconfig = {
          name: "",
          referrerpolicy: "",
          sandbox: "",
          allow: "",
          allowfullscreen: "",
          allowpaymentrequest: "",
          allowpopups: "",
        }
      }
      // get global env to format url
      const { ipc } = window
      ipc.getGlobalEnv().then((value) => {
        this.globalenv = value
        console.log("getGlobalEnv exp value", this.globalenv)
        this.formatUrl()
      })
    },
    methods: {
      handleFeatureToggle(enabled, id) {
        settingsModule.toggleExperimentalFeatures(id)
        this.fetchingLatestExperience()
      },
      formatUrl() {
        console.log("this.globalenv", this.globalenv)
        if (this.globalenv) {
          console.log("formatUrl", this.url)
          let urlformatted = this.url
          if (this.url.includes("${")) {
            console.log("getGlobalEnv exp value", this.globalenv)
            // update variables in url
            for (const [key, value] of Object.entries(this.globalenv)) {
              urlformatted = urlformatted.replaceAll(`\${${key}}`, value)
            }

            console.log("this.url updated", urlformatted)
          }
          this.urlformatted = urlformatted
          console.log("formatUrl done", this.urlformatted)
        }
      },
      async getServices() {
        return await servicesModule.getServices()
      },
      closeDialog() {
        this.$emit("close")
      },
      editMenuItem() {
        const data = {
          ...this.payload,
          label: this.label,
          icon: this.icon,
          url: this.url,
          service: this.service,
          iframeconfig: {
            name: this.iframeconfig.name,
            referrerpolicy: this.iframeconfig.referrerpolicy,
            sandbox: this.iframeconfig.sandbox,
            allow: this.iframeconfig.allow,
            allowfullscreen: this.iframeconfig.allowfullscreen,
            allowpaymentrequest: this.iframeconfig.allowpaymentrequest,
            allowpopups: this.iframeconfig.allowpopups,
          },
        }
        console.log("editMenuItem data", data)
        settingsModule.updateMenuitem(data)
        this.fetchingLatestExperience()
        this.closeDialog()
      },
      addMenuItem() {
        const id = nanoid(14),
          data = {
            label: this.label,
            id: id,
            icon: this.icon,
            experienceIcon: this.icon,
            to: `/experience/${id}`,
            type: "experimental",
            service: this.service,
            disabled: false,
            url: this.url,
            enabled: false,
            subMenu: [{ id: "load-data", to: "#" }],
            iframeconfig: {
              name: this.iframeconfig.name,
              referrerpolicy: this.iframeconfig.referrerpolicy,
              sandbox: this.iframeconfig.sandbox,
              allow: this.iframeconfig.allow,
              allowfullscreen: this.iframeconfig.allowfullscreen,
              allowpaymentrequest: this.iframeconfig.allowpaymentrequest,
              allowpopups: this.iframeconfig.allowpopups,
            },
          }

        console.log("addMenuItem data", data)
        settingsModule.addExprience(data)
        this.fetchingLatestExperience()
        this.closeDialog()
      },
    },
  }
</script>
<style scoped lang="scss">
  .p-inputtext {
    width: 100% !important;
  }

  p {
    margin: 0;
  }

  .confirmation-content {
    display: flex;
    align-items: center;
  }

  .p-dialog .p-button {
    min-width: 6rem;
  }

  .field {
    display: grid;
  }

  .deleteIcon {
    font-size: 2rem;
  }

  .p-dialog-header {
    padding: 1.25rem 1.8rem;

    .p-dialog-header-icon:last-child {
      margin-left: 10rem;
    }
  }

  #deleteTreeNode {
    color: white;
    background-color: #ef4444;
  }
</style>
