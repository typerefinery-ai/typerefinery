<template>
  <!-- if prop variant is set to buttons then load template from Buttons.vue -->
  <span v-if="variant == 'buttons'" class="service-buttons-list">
    <span
      v-for="service in serviceList()"
      :id="service.id"
      :key="service.id"
      class="menu-item service-button"
      :status="service.status"
      @click="openSettings(service.id)"
    >
      <i :class="service.icon"></i>
    </span>
  </span>
  <!-- if prop variant is set to table then load template from Table.vue -->
  <span v-else-if="variant == 'table'">
    <Accordion :active-index="activeIndex">
      <AccordionTab v-for="service in serviceList()" :key="service.id">
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
            :options="serviceStatusList()"
            option-label="name"
            option-value="value"
          >
          </Dropdown>
        </div>
        <div class="field">
          <label for="type">{{
            $t("components.setting.services.info.type")
          }}</label>
          <Dropdown
            id="type"
            v-model="service.servicetype"
            :options="serviceTypeList()"
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
        <Panel
          id="service-panel"
          header="Log Output"
          :toggleable="true"
          :collapsed="true"
        >
          <p>{{ service.logoutput }}</p>
        </Panel>
      </AccordionTab>
    </Accordion>
  </span>
</template>

<script>
  import Panel from "primevue/panel"
  import Services from "@/store/Modules/Services"
  import { getModule } from "vuex-module-decorators"
  import AppSettings from "@/store/Modules/AppSettings"
  const appSettings = getModule(AppSettings)
  import Accordion from "primevue/accordion"
  import AccordionTab from "primevue/accordiontab"
  import Dropdown from "primevue/dropdown"
  import Checkbox from "primevue/checkbox"
  import InputText from "primevue/inputtext"
  import Textarea from "primevue/textarea"
  import { mapGetters } from "vuex"

  export default {
    name: "Services",
    components: {
      Panel,
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
    mounted() {
      if (this.field) {
        const serviceIndex = this.serviceList().findIndex(
          (s) => s.id === this.field
        )
        this.activeIndex = serviceIndex
      } else {
        this.activeIndex = -1
      }
    },
    methods: {
      ...mapGetters({
        serviceTypeList: "Services/serviceTypeList",
        serviceStatusList: "Services/serviceStatusList",
        serviceStatusColorList: "Services/serviceStatusColorList",
        serviceList: "Services/serviceList",
      }),
      openSettings(serviceId) {
        appSettings.openSettingsDialog("services/" + serviceId)
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
      background-color: v-bind("serviceStatusColorList()['error']");
    }
    &[status="0"] {
      background-color: v-bind("serviceStatusColorList()['disabled']");
    }
    &[status="30"] {
      background-color: v-bind("serviceStatusColorList()['stopping']");
    }
    &[status="60"] {
      background-color: v-bind("serviceStatusColorList()['stopped']");
    }
    &[status="90"] {
      background-color: v-bind("serviceStatusColorList()['starting']");
    }
    &[status="120"] {
      background-color: v-bind("serviceStatusColorList()['started']");
    }
  }

  .service-button {
    color: gray;
    &[status="-1"] {
      color: v-bind("serviceStatusColorList()['error']");
    }
    &[status="0"] {
      color: v-bind("serviceStatusColorList()['disabled']");
    }
    &[status="30"] {
      color: v-bind("serviceStatusColorList()['stopping']");
    }
    &[status="60"] {
      color: v-bind("serviceStatusColorList()['stopped']");
    }
    &[status="90"] {
      color: v-bind("serviceStatusColorList()['starting']");
    }
    &[status="120"] {
      color: v-bind("serviceStatusColorList()['started']");
    }
  }
</style>
