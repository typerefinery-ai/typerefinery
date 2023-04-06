<template>
  <div class="service">
    <div>
      <h1>Services</h1>
      <div class="data-view-wrapper">
        <DataTable
          :value="servicesList"
          striped-rows
          responsive-layout="scroll"
          :scrollable="true"
          scroll-height="415px"
        >
          <Column field="name" header="Name"></Column>
          <Column field="servicetype" header="Servicetype"></Column>
          <Column field="status" header="Status"></Column>
        </DataTable>
      </div>
      <div>
        <Button label="Move to Home" @click="moveToHomePage"></Button>
      </div>
    </div>
  </div>
</template>
<script>
  import DataTable from "primevue/datatable"
  import Column from "primevue/column"
  import Button from "primevue/button"
  import { getModule } from "vuex-module-decorators"
  import Services from "@/store/Modules/Services"
  const servicesModule = getModule(Services)
  export default {
    name: "Services",
    components: {
      DataTable,
      Column,
      Button,
    },
    data() {
      return {
        servicesList: [],
      }
    },
    async mounted() {
      this.servicesList = await servicesModule.getServices()
      if (!servicesModule.data.servicesStarted) {
        alert("Services started")
      }
    },
    methods: {
      moveToHomePage() {
        servicesModule.data.successServiceNextPage = true
      },
    },
  }
</script>
<style scoped>
  .service {
    margin: auto;
  }
</style>
