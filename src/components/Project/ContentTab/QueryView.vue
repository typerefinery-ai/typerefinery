<template>
  <div class="query-view-wrapper">
    <v-form ref="form">
      <v-text-field
        v-model="name"
        :label="$t('components.project.name')"
      ></v-text-field>
      <v-textarea
        v-model="query"
        :label="$t('components.project.query')"
      ></v-textarea>
    </v-form>
  </div>
</template>

<script>
  export default {
    name: "QueryView",
    data: () => ({
      query: "",
      name: "",
    }),
  }
</script>

<style lang="scss">
  .query-view-wrapper {
    padding: 20px;

    .v-field__field {
      border: 1px solid;
    }
  }
</style>
