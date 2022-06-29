<template>
  <div class="query-info-wrapperr">
    <div class="field">
      <label for="description">{{
        $t(`components.project.description`)
      }}</label>
      <Textarea
        id="description"
        :model-value="description"
        :auto-resize="true"
        rows="5"
        cols="30"
        @input="handleInput($event, 'description')"
      />
    </div>

    <div class="field">
      <label for="icon">{{ $t(`components.project.icon`) }}</label>
      <InputText
        id="icon"
        :model-value="icon"
        @input="handleInput($event, 'icon')"
      />
    </div>

    <div class="field">
      <label>{{ $t(`components.transformer.transformer`) }}</label>
      <Dropdown
        :model-value="tranformer"
        :options="transformers"
        option-label="label"
        option-group-label="label"
        option-group-children="items"
        :placeholder="$t(`components.transformer.select`)"
        @change="handleDropdown($event)"
      />
    </div>
  </div>
</template>

<script>
  import InputText from "primevue/inputtext"
  import Dropdown from "primevue/dropdown"
  import Textarea from "primevue/textarea"
  import AppData from "@/store/Modules/Projects"
  import { getModule } from "vuex-module-decorators"
  const appData = getModule(AppData)
  export default {
    name: "QueryInfo",
    components: { InputText, Dropdown, Textarea },
    props: {
      tab: { type: Object, required: true },
    },
    computed: {
      description() {
        const { projectIdx, queryIdx } = this.tab
        return appData.list[0].list[projectIdx].queries.list[queryIdx]
          .description
      },
      icon() {
        const { projectIdx, queryIdx } = this.tab
        return appData.list[0].list[projectIdx].queries.list[queryIdx].icon
      },
      tranformer() {
        const { projectIdx, queryIdx } = this.tab
        const transformer =
          appData.list[0].list[projectIdx].queries.list[queryIdx].transformer
        return {
          key: transformer.id,
          label: transformer.label,
          scope: transformer.scope,
        }
      },
      transformers() {
        const { projectIdx } = this.tab
        return appData.transformersList(projectIdx)
      },
    },
    methods: {
      handleInput({ target: { value } }, key) {
        const payload = { key, value, ...this.tab }
        appData.updateQuery(payload)
      },
      handleDropdown({ value }) {
        let transformer
        if (value.scope == "local") {
          transformer = appData.list[0].list[
            this.tab.projectIdx
          ].transformers.list.find((el) => el.id == value.key)
        } else {
          transformer = appData.list[2].list.find((el) => el.id == value.key)
        }
        const payload = { key: "transformer", value: transformer, ...this.tab }
        appData.updateQuery(payload)
      },
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
