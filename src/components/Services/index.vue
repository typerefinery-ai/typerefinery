<template>
  <!-- if prop variant is set to buttons then load template from Buttons.vue -->
  <span v-if="variant == 'buttons'" class="service-buttons-list">
    <span
      v-for="service in services"
      :id="service.id"
      :key="service.id"
      class="menu-item"
      :status="service.status"
      :class="{
        'text-yellow-500': service.status == 90,
        'text-green-500': service.status == 120,
      }"
      @click="openSettings(service.id)"
    >
      <i :class="service.icon"></i>
    </span>
  </span>
  <!-- if prop variant is set to table then load template from Table.vue -->
  <span v-else-if="variant == 'table'">
    <Accordion :active-index="active">
      <AccordionTab v-for="service in services" :key="service.id">
        <template #header>
          <span
            :class="{
              'text-yellow-500': service.status == 90,
              'text-green-500': service.status == 120,
            }"
          >
            <i :class="service.icon"></i>
            <span>{{ service.name }}</span>
          </span>
        </template>

        <p class="mb-2 text-lg">
          <span class="font-bold">Name:</span> {{ service.name }}
        </p>
        <p class="mb-2 text-lg">
          <span class="font-bold">Enabled:</span> {{ service.enabled }}
        </p>
        <p class="mb-3 text-lg">
          <span class="font-bold">Description:</span>
          {{ service.description }}
        </p>
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
  const appServices = getModule(Services)
  import AppSettings from "@/store/Modules/AppSettings"
  const appSettings = getModule(AppSettings)
  import Button from "primevue/button"
  import Accordion from "primevue/accordion"
  import AccordionTab from "primevue/accordiontab"

  export default {
    name: "Services",
    components: {
      Panel,
      Accordion,
      AccordionTab,
      Button,
    },
    props: {
      variant: { type: String, default: "buttons" },
      field: { type: String, default: "" },
    },
    data() {
      return {
        active: 1,
      }
    },
    computed: {
      services() {
        return appServices.services
      },
    },
    mounted() {
      if (this.field) {
        this.active = this.field - 1
      } else {
        this.active = -1
      }
    },
    created() {
      appServices.setServiceStatus([1, 0])
      appServices.enableService([1, 0])
      appServices.setServiceStatus([2, 0])
      appServices.enableService([2, 0])

      window.api?.response("api:status", (s) => {
        if (s == "starting") {
          appServices.setServiceStatus([1, 90])
        } else if (s == "started") {
          appServices.setServiceStatus([1, 120])
          appServices.enableService([1, 120])
        }
      })
      window.api?.response("db:status", (s) => {
        if (s == "starting") {
          appServices.setServiceStatus([2, 90])
        } else if (s == "started") {
          appServices.setServiceStatus([2, 120])
          appServices.enableService([2, 120])
        }
      })
    },
    methods: {
      openDialog(serviceData) {
        this.display = true
        this.serviceData = serviceData
      },
      openSettings(serviceId) {
        appSettings.openSettingsDialog("services/" + serviceId)
      },
    },
  }
</script>

<style lang="scss">
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
</style>
