<template>
  <div
    v-for="service in services"
    :id="service.id"
    :key="service.id"
    class="menu-item"
    :status="service.status"
    :class="{
      'text-yellow-500': service.status == 90,
      'text-green-500': service.status == 120,
    }"
    @click="openDialog(service)"
  >
    <i :class="service.icon"></i>
  </div>
  <Dialog
    v-model:visible="display"
    modal
    header="Service Info"
    :breakpoints="{ '960px': '75vw', '640px': '90vw' }"
    :style="{ width: '50vw' }"
  >
    <p class="mb-2 text-lg">
      <span class="font-bold">Name:</span> {{ serviceData.name }}
    </p>
    <p class="mb-2 text-lg">
      <span class="font-bold">Enabled:</span> {{ serviceData.enabled }}
    </p>
    <p class="mb-3 text-lg">
      <span class="font-bold">Description:</span> {{ serviceData.description }}
    </p>

    <Panel id="service-panel" header="Log Output" :toggleable="true">
      <p>{{ serviceData.logoutput }}</p>
    </Panel>
  </Dialog>
</template>

<script>
  import Dialog from "primevue/dialog"
  import Panel from "primevue/panel"
  import Services from "@/store/Modules/Services"
  import { getModule } from "vuex-module-decorators"
  const appServices = getModule(Services)

  export default {
    name: "Services",
    components: { Dialog, Panel },
    data() {
      return {
        display: false,
        serviceData: {
          name: "Service Name",
          enabled: true,
          description: "Description",
          logoutput: "Logoutput",
        },
      }
    },
    computed: {
      services() {
        return appServices.services
      },
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
    },
  }
</script>

<style lang="scss">
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
