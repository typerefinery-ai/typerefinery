<template>
  <div class="general-settings">
    <div class="topButtons">
      <Button
        class="p-button-raised mr-2"
        :label="$t(`components.setting.general.buttons.addlabel`)"
        @click="addDialogToggle()"
      ></Button>
      <Button
        class="p-button-raised mr-2"
        :label="$t(`components.setting.general.buttons.editlabel`)"
        :disabled="saveButtonDisable"
        @click="saveOrderList()"
      ></Button>
    </div>
    <OrderList
      v-model="listOfExperiences"
      list-style="height:auto"
      striped-rows="true"
      data-key="id"
      disabled
      @reorder="menuList($event.value, $event.originalEvent)"
    >
      <template #header>
        {{ $t(`components.setting.general.experience`) }}
      </template>
      <template #item="slotProps">
        <div class="product-item">
          <div class="image-container">
            <label for="username">
              {{ slotProps.item.label }}
            </label>
            <div
              v-if="
                slotProps.item.id === 'project' || slotProps.item.id === 'none'
              "
            >
              <div>
                <p class="text-black">
                  {{
                    $t(
                      `components.setting.experience.status.servicenotrequired`
                    )
                  }}
                </p>
              </div>
            </div>
            <div v-else>
              <div v-if="!servicesLoaded">
                <p class="text-black">
                  {{ $t(`components.setting.experience.serviceinstalling`) }}
                </p>
              </div>
              <div v-else>
                <p class="text-black text-lg mb-3">
                  {{ $t(`components.setting.experience.serviceinstalled`) }}
                </p>
              </div>
            </div>
          </div>
          <div class="product-list-detail">
            <InputSwitch
              v-if="
                fetchlastestServiceWithExperience(
                  slotProps.item.id,
                  slotProps.item.service
                )
              "
              :model-value="slotProps.item.enabled"
              @input="handleFeatureToggle($event, slotProps.item.id)"
            />
            <div
              v-show="isEditableExperience(slotProps.item)"
              v-tooltip="$t(`tooltips.edit-experience`)"
              class="icon-wrapper hover:text-primary"
              @click="editDialogToggle(slotProps.item)"
            >
              <i class="pi pi-pencil"></i>
            </div>
            <div
              v-show="isEditableExperience(slotProps.item)"
              v-tooltip="$t(`components.setting.experience.delete.tooltip`)"
              class="icon-wrapper hover:text-primary"
              @click="removeConfirm(slotProps.item)"
            >
              <i class="pi pi-trash"></i>
            </div>
          </div>
        </div>
      </template>
    </OrderList>
    <ExperiencePopup
      v-if="editModalIsOpen"
      :payload="editModalPayload"
      :type="type"
      :fetching-latest-experience="fetchingLatestExperience"
      @close="editCloseModal"
    />
  </div>
</template>
<script>
  import InputSwitch from "primevue/inputswitch"
  import { getModule } from "vuex-module-decorators"
  import Settings from "@/store/Modules/Settings"
  import Button from "primevue/button"
  import Dialog from "primevue/dialog"
  import { nanoid } from "nanoid"
  import OrderList from "primevue/orderlist"

  import { errorToast, successToast } from "@/utils/toastService"
  import ExperiencePopup from "@/components/Dialog/ExperiencePopup.vue"
  const settingsModule = getModule(Settings)
  import Services from "@/store/Modules/Services"
  const servicesModule = getModule(Services)
  export default {
    name: "General",
    components: { InputSwitch, OrderList, Button, ExperiencePopup },
    data() {
      return {
        listOfExperiences: [],
        updatedExperienceList: [],
        label: "",
        icon: "",
        url: "",
        editModalPayload: {},
        editModalIsOpen: false,
        type: "",
        saveButtonDisable: true,
        serviceBasedUrl: "",
        serviceStatus: "",
        hideToggle: false,
        listOfServices: [],
      }
    },
    computed: {
      editDialog() {
        return settingsModule.data.editDialog
      },
      servicesLoaded() {
        return servicesModule.data.servicesStarted
      },
    },
    async mounted() {
      this.fetchingLatestExperience()
      this.listOfServices = await servicesModule.getServices()
    },
    methods: {
      isEditableExperience(item) {
        if (item.id === "project") {
          return false
        }

        if (item.system == true) {
          return false
        }

        return true
      },
      //FIXME: this should be named something more approprioate as it used to hide component
      fetchlastestServiceWithExperience(experienceId, serviceId) {
        // dont view toggle switch for following experiences as they are default
        if (experienceId == "project") {
          return false
        }

        // show view toggle switch for any experience that do not have a service
        if (serviceId == "none" || serviceId == "") {
          return true
        }

        const services = this.listOfServices
        const data = services.filter((el) => el.id == serviceId)
        if (data.length > 0 && data[0].status == "120") {
          return true
        }
        return false
      },
      menuList(orderList, event) {
        this.saveButtonDisable = false
        this.updatedExperienceList = orderList
      },
      saveOrderList() {
        settingsModule.updateList(this.updatedExperienceList)
        this.saveButtonDisable = true
        this.listOfExperiences = JSON.parse(
          JSON.stringify(settingsModule.data.listOfMenu)
        )
      },
      handleFeatureToggle(enabled, id) {
        settingsModule.toggleExperimentalFeatures(id)
        this.fetchingLatestExperience()
      },
      //fetching latest list of experience from vue store
      fetchingLatestExperience() {
        this.listOfExperiences = JSON.parse(
          JSON.stringify(settingsModule.data.listOfMenu) //HACK FIXME: need to rename listOfMenu to listOfExperience
        )
        // .filter((el) => el.type === "experimental")
        // this.serviceBasedUrl = JSON.parse(
        //   JSON.stringify(settingsModule.data.listOfMenu)
        // ).filter((el) => el.id === "cms")
      },
      // async serviceStatus() {
      //   const services = await servicesModule.getServices()
      // },

      editDialogToggle(item) {
        this.editModalPayload = item
        this.type = "UPDATE"
        this.editModalIsOpen = true
      },
      removeConfirm(item) {
        //show confirm dialog
        this.$confirm.require({
          message: this.$t("components.setting.experience.delete.message"),
          header: this.$t("components.setting.experience.delete.title"),
          acceptLabel: this.$t("components.setting.experience.delete.yes"),
          rejectLabel: this.$t("components.setting.experience.delete.no"),
          icon: "pi pi-exclamation-triangle",
          accept: () => {
            settingsModule.removeExprience(item.id)
            this.fetchingLatestExperience()
          },
          reject: () => {
            this.$confirm.close()
          },
        })
      },
      editCloseModal() {
        this.editModalIsOpen = false
      },
      addDialogToggle() {
        this.type = "ADD"
        this.editModalIsOpen = true
      },
    },
  }
</script>
<style lang="scss">
  .general-settings {
    .topButtons {
      margin-left: 4rem;
      display: flex;
      justify-content: space-between;
    }

    .p-button {
      margin-bottom: 1rem;
    }

    .icon-wrapper {
      margin-left: 5px;
    }
  }
</style>
