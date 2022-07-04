<template>
  <div class="data-view-wrapper">
    <div class="refresh-data">
      <!-- <Button icon="pi pi-refresh" /> -->
      <Button label="Refresh" icon="pi pi-refresh" />
    </div>
    <DataTable
      :value="data"
      striped-rows
      responsive-layout="scroll"
      :scrollable="true"
      scroll-height="415px"
    >
      <Column field="year" header="Year"></Column>
      <Column field="brand" header="Brand"></Column>
      <Column field="color" header="Color"></Column>
    </DataTable>
  </div>
</template>

<script>
  import DataTable from "primevue/datatable"
  import Column from "primevue/column"
  import Button from "primevue/button"
  export default {
    name: "DataView",
    components: { DataTable, Column, Button },
    data() {
      return {
        data: [
          {
            brand: "Volkswagen",
            year: 2012,
            color: "Orange",
            vin: "dsad231ff",
          },
          { brand: "Audi", year: 2011, color: "Black", vin: "gwregre345" },
          { brand: "Renault", year: 2005, color: "Gray", vin: "h354htr" },
          { brand: "BMW", year: 2003, color: "Blue", vin: "j6w54qgh" },
          { brand: "Mercedes", year: 1995, color: "Orange", vin: "hrtwy34" },
          { brand: "Volvo", year: 2005, color: "Black", vin: "jejtyj" },
          { brand: "Honda", year: 2012, color: "Yellow", vin: "g43gr" },
          { brand: "Jaguar", year: 2013, color: "Orange", vin: "greg34" },
          { brand: "Ford", year: 2000, color: "Black", vin: "h54hw5" },
        ],
      }
    },
  }
</script>

<style scoped lang="scss">
  .refresh-data {
    text-align: right;
  }
</style>
