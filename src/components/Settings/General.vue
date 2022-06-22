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
  import AppSettings from "@/store/Modules/AppSettings"
  const appSettings = getModule(AppSettings)

  export default {
    name: "General",
    components: { InputSwitch },
    computed: {
      experimentalFeatures() {
        return appSettings.experimentalFeatures
      },
    },
    methods: {
      handleFeatureToggle(enabled, id) {
        appSettings.toggleExperimentalFeatures({ id, enabled })
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
