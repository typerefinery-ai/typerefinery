<template>
  <!-- if prop variant is set to buttons then load template from Buttons.vue -->
  <span v-if="variant == 'buttons'" class="service-buttons-list">
    <!-- show serviceCountByStatus list -->
    <span
      v-for="item in serviceCountByStatus"
      :id="item.name"
      :key="item.name"
      class="menu-item service-button"
      :status="item.value"
      @click="OpenServices"
    >
      <i class="pi pi-cog"></i>&nbsp;
      <span class="service-button-text">{{ item.count }}</span>
    </span>
    <!-- show list of services -->
    <!-- <span
      v-for="service in serviceList()"
      :id="service.id"
      :key="service.id"
      class="menu-item service-button"
      :status="service.status"
      @click="openSettings(service.id)"
    >
      <i :class="service.icon"></i>
    </span> -->
  </span>
  <!-- if prop variant is set to table then load template from Table.vue -->
  <span v-else-if="variant == 'table'">
    <Accordion :active-index="activeIndex">
      <AccordionTab v-for="service in serviceList" :key="service.id">
        <template #header>
          <div class="service-header">
            <i :class="service.icon"></i>
            <span class="service-title">{{ service.name }}</span>
            <span class="service-status" :status="service.status"></span>
          </div>
        </template>

        <div class="field">
          <label for="name">{{
            $t("components.setting.services.info.name")
          }}</label>
          <InputText id="name" v-model="service.name" type="text" />
        </div>
        <div class="field">
          <label for="enabled">{{
            $t("components.setting.services.info.enabled")
          }}</label>
          <Checkbox id="enabled" v-model="service.enabled" :binary="true" />
        </div>
        <div class="field">
          <label for="status">{{
            $t("components.setting.services.info.status")
          }}</label>
          <Dropdown
            id="status"
            v-model="service.status"
            :options="serviceStatusList"
            option-label="name"
            option-value="value"
          >
          </Dropdown>
        </div>
        <div class="field">
          <label for="serviceport">{{
            $t("components.setting.services.info.serviceport")
          }}</label>
          <InputText
            id="serviceport"
            v-model="service.serviceport"
            type="text"
          />
        </div>
        <div class="field">
          <label for="servicepid">{{
            $t("components.setting.services.info.servicepid")
          }}</label>
          <InputText id="servicepid" v-model="service.servicepid" type="text" />
        </div>
        <div class="field">
          <label for="type">{{
            $t("components.setting.services.info.type")
          }}</label>
          <Dropdown
            id="type"
            v-model="service.servicetype"
            :options="serviceTypeList"
            option-label="name"
            option-value="value"
          >
          </Dropdown>
        </div>
        <div class="field">
          <label for="description">{{
            $t("components.setting.services.info.description")
          }}</label>
          <Textarea
            id="description"
            v-model="service.description"
            rows="5"
            cols="30"
          />
        </div>
      </AccordionTab>
    </Accordion>
  </span>
</template>

<script>
  import { getModule } from "vuex-module-decorators"
  import Accordion from "primevue/accordion"
  import AccordionTab from "primevue/accordiontab"
  import Dropdown from "primevue/dropdown"
  import Checkbox from "primevue/checkbox"
  import InputText from "primevue/inputtext"
  import Textarea from "primevue/textarea"
  import Settings from "@/store/Modules/Settings"
  import Services from "@/store/Modules/Services"
  const settingsModule = getModule(Settings)
  const servicesModule = getModule(Services)

  export default {
    name: "ServicesSettings",
    components: {
      Accordion,
      AccordionTab,
      Dropdown,
      Checkbox,
      InputText,
      Textarea,
    },
    props: {
      variant: { type: String, default: "buttons" },
      field: { type: String, default: "" },
    },
    data() {
      return {
        activeIndex: -1,
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
    created() {
      servicesModule.getServices()
    },
    mounted() {
      if (this.field) {
        const serviceIndex = servicesModule.serviceList.findIndex(
          (s) => s.id === this.field
        )
        this.activeIndex = serviceIndex
      } else {
        this.activeIndex = -1
      }
    },
    methods: {
      OpenServices() {
        settingsModule.openSettingsDialog("services")
      },
    },
  }
</script>

<style lang="scss" scoped>
  span.service-buttons-list {
    display: inline-flex;
    margin-right: 2px;
    min-width: 50px;
    .menu-item {
      width: min-content;
    }
  }
  #service-panel {
    box-shadow: none;

    .p-panel-header {
      border: 1px solid var(--surface-border);
    }
    .p-panel-content {
      padding: 1rem;
      border: 1px solid var(--surface-border);
      border-top-width: 0;
    }
  }

  .service-header {
    vertical-align: top;
    width: 100%;
    display: flex;
    align-items: flex-start;
    flex-direction: row;
  }

  .service-title {
    padding-left: 1rem;
  }

  .service-status {
    margin-left: auto;
    margin-right: 1rem;
    height: 1rem;
    width: 1rem;
    padding-left: 1rem;
    background-color: gray;
    border-radius: 50%;
    display: inline-block;

    &[status="-1"] {
      background-color: v-bind("serviceStatusColorList['error']");
    }
    &[status="0"] {
      background-color: v-bind("serviceStatusColorList['disabled']");
    }
    &[status="10"] {
      background-color: v-bind("serviceStatusColorList['available']");
    }
    &[status="15"] {
      background-color: v-bind("serviceStatusColorList['installing']");
    }
    &[status="20"] {
      background-color: v-bind("serviceStatusColorList['installed']");
    }
    &[status="30"] {
      background-color: v-bind("serviceStatusColorList['stopping']");
    }
    &[status="60"] {
      background-color: v-bind("serviceStatusColorList['stopped']");
    }
    &[status="90"] {
      background-color: v-bind("serviceStatusColorList['starting']");
    }
    &[status="120"] {
      background-color: v-bind("serviceStatusColorList['started']");
    }
  }

  .service-button {
    color: gray;
    &[status="-10"] {
      color: v-bind("serviceStatusColorList['error']");
    }
    &[status="-1"] {
      color: v-bind("serviceStatusColorList['error']");
    }
    &[status="0"] {
      color: v-bind("serviceStatusColorList['disabled']");
    }
    &[status="10"] {
      color: v-bind("serviceStatusColorList['available']");
    }
    &[status="15"] {
      color: v-bind("serviceStatusColorList['installing']");
    }
    &[status="20"] {
      color: v-bind("serviceStatusColorList['installed']");
    }
    &[status="30"] {
      color: v-bind("serviceStatusColorList['stopping']");
    }
    &[status="60"] {
      color: v-bind("serviceStatusColorList['stopped']");
    }
    &[status="90"] {
      color: v-bind("serviceStatusColorList['starting']");
    }
    &[status="120"] {
      color: v-bind("serviceStatusColorList['started']");
    }
  }
</style>
