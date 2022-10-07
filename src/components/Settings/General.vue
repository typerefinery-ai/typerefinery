<template>
  <div class="general-settings">
    <h4>{{ $t(`components.setting.general.experimental`) }}</h4>
    <div
      v-for="feature in experimentalFeatures"
      :key="feature.id"
      class="field"
    >
      <InputSwitch
        :model-value="feature.enabled"
        @input="handleFeatureToggle($event, feature.id)"
      />
      <label for="username">{{
        $t(`components.setting.general.${feature.id}`)
      }}</label>
    </div>
    <h4>{{ $t("components.dialog.sample-data.header") }}</h4>
    <Button
      :label="$t(`components.dialog.new-query.footer.download`)"
      icon="pi pi-download"
      @click="handleSampleData"
    />
  </div>
</template>
<script>
  import InputSwitch from "primevue/inputswitch"
  import { getModule } from "vuex-module-decorators"
  import Projects from "@/store/Modules/Projects"
  import Settings from "@/store/Modules/Settings"
  const settingsModule = getModule(Settings)
  const projectsModule = getModule(Projects)
  import Button from "primevue/button"
  export default {
    name: "General",
    components: { InputSwitch, Button },
    computed: {
      experimentalFeatures() {
        return settingsModule.data.experimentalFeatures
      },
    },
    methods: {
      handleFeatureToggle(enabled, id) {
        settingsModule.toggleExperimentalFeatures({ id, enabled })
      },
      handleSampleData() {
        projectsModule.openSampleDataPopup()
      },
    },
  }
</script>
<style lang="scss">
  .general-settings {
    h4 {
      margin-bottom: 1.2rem;
    }
    .field {
      display: flex;
      align-items: center;
      margin-bottom: 1.2rem;
      label {
        margin-bottom: 0;
      }
      .p-inputswitch {
        margin-right: 1rem;
      }
    }
  }
</style>
