<template>
  <div class="general-settings">
    <div class="topButtons">
      <Button class="p-button-raised mr-2" :label="$t(`components.setting.general.buttons.addlabel`)"
        @click="addDialogToggle()" ></Button>
      <Button class="p-button-raised mr-2" :label="$t(`components.setting.general.buttons.editlabel`)"
        :disabled="saveDiable" @click="saveOrderList()" ></Button>

    </div>
    <OrderList v-model="listOfExperiences" listStyle="height:auto" stripedRows="true" dataKey="id"
      @reorder="menuList($event.value, $event.originalEvent)">
      <template #header>
        {{
          $t(`components.setting.general.experience`)
        }}

      </template>

      <template #item="slotProps">
        <div class="product-item">
          <div class="image-container">
            <label for="username">
              {{ slotProps.item.label }}
            </label>
          </div>
          <div class="product-list-detail">
            <InputSwitch :model-value="slotProps.item.enabled" @input="handleFeatureToggle($event, slotProps.item.id)" />
            <div v-tooltip="$t(`tooltips.edit-experience`)" class="icon-wrapper hover:text-primary"
              @click="editDialogToggle(slotProps.item)">
              <i class="pi pi-pencil"></i>
            </div>
          </div>
        </div>
      </template>
    </OrderList>
    <ExperiencePopup v-if="editModalIsOpen" :payload="editModalPayload" :type="type"
      :fetching-latest-experience="fetchingLatestExperience" @close="editCloseModal" />
  </div>
</template>
<script>
import InputSwitch from "primevue/inputswitch"
import { getModule } from "vuex-module-decorators"
import Settings from "@/store/Modules/Settings"
import Button from "primevue/button"
import Dialog from "primevue/dialog"
import { nanoid } from "nanoid"
import OrderList from 'primevue/orderlist';

import { errorToast, successToast } from "@/utils/toastService"
import ExperiencePopup from "@/components/Dialog/ExperiencePopup.vue"
const settingsModule = getModule(Settings)
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
      saveDiable: true
    }
  },

  computed: {
    editDialog() {
      return settingsModule.data.editDialog
    },
  },
  mounted() {
    this.fetchingLatestExperience()
  },
  methods: {
    menuList(orderList, event) {
      this.saveDiable = false
      this.updatedExperienceList = orderList
    },
    saveOrderList() {
      settingsModule.updateList(this.updatedExperienceList)
      this.saveDiable = true
      this.listOfExperiences = JSON.parse(JSON.stringify(settingsModule.data.listOfMenu))

    },
    handleFeatureToggle(enabled, id) {
      settingsModule.toggleExperimentalFeatures(id)
      this.fetchingLatestExperience()
    },
    //fetching latest list of experience from vue store
    fetchingLatestExperience() {
      this.listOfExperiences = JSON.parse(JSON.stringify(settingsModule.data.listOfMenu))
    },

    editDialogToggle(item) {
      this.editModalPayload = item
      this.type = "UPDATE"
      this.editModalIsOpen = true
    },
    editCloseModal() {
      this.editModalIsOpen = false
    },
    addDialogToggle() {
      this.type = "ADD"
      this.editModalIsOpen = true
    }

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
