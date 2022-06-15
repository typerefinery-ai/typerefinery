<template>
  <div class="query-info-wrapperr">
    <div class="field">
      <label for="description">{{
        $t(`components.project.description`)
      }}</label>
      <Textarea
        id="description"
        v-model="description"
        :auto-resize="true"
        rows="5"
        cols="30"
      />
    </div>

    <div class="field">
      <label for="icon">{{ $t(`components.project.icon`) }}</label>
      <InputText id="icon" v-model="icon" />
    </div>

    <div class="field">
      <label>{{ $t(`components.transformer.transformer`) }}</label>
      <Dropdown
        option-label="name"
        option-value="key"
        :placeholder="$t(`components.transformer.select`)"
      />
    </div>
  </div>
</template>

<script>
  import InputText from "primevue/inputtext"
  import Dropdown from "primevue/dropdown"
  import Textarea from "primevue/textarea"
  export default {
    name: "QueryInfo",
    components: { InputText, Dropdown, Textarea },
    data() {
      return {
        description: "",
        icon: "",
      }
    },
  }
</script>

<style lang="scss">
  .query-info-wrapperr {
    margin: 1rem;

    input,
    textarea,
    .p-inputwrapper {
      width: 100%;
    }
  }
</style>
