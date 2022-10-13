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
  </div>
</template>
<script>
  import InputSwitch from "primevue/inputswitch"
  import { getModule } from "vuex-module-decorators"
  import Settings from "@/store/Modules/Settings"
  const settingsModule = getModule(Settings)
  export default {
    name: "General",
    components: { InputSwitch },
    computed: {
      experimentalFeatures() {
        return settingsModule.data.experimentalFeatures
      },
    },
    methods: {
      handleFeatureToggle(enabled, id) {
        settingsModule.toggleExperimentalFeatures({ id, enabled })
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
