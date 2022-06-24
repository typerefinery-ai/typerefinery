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
        option-label="name"
        option-value="key"
        :placeholder="$t(`components.transformer.select`)"
        @change="handleDropdown"
      />
    </div>
  </div>
</template>

<script>
  import InputText from "primevue/inputtext"
  import Dropdown from "primevue/dropdown"
  import Textarea from "primevue/textarea"
  import Projects from "@/store/Modules/Projects"
  import { getModule } from "vuex-module-decorators"
  const projects = getModule(Projects)
  export default {
    name: "QueryInfo",
    components: { InputText, Dropdown, Textarea },
    props: {
      tab: { type: Object, required: true },
    },
    computed: {
      description() {
        const { projectIdx, queryIdx } = this.tab
        return projects.list[projectIdx].queries.list[queryIdx].description
      },
      icon() {
        const { projectIdx, queryIdx } = this.tab
        return projects.list[projectIdx].queries.list[queryIdx].icon
      },
      tranformer() {
        const { projectIdx, queryIdx } = this.tab
        return projects.list[projectIdx].queries.list[queryIdx].transformerName
      },
      transformers() {
        const { projectIdx } = this.tab
        return projects.transformersList(projectIdx)
      },
    },
    methods: {
      handleInput({ target: { value } }, key) {
        const payload = { key, value, ...this.tab }
        projects.updateQuery(payload)
      },
      handleDropdown({ value }) {
        const payload = { key: "transformerName", value, ...this.tab }
        projects.updateQuery(payload)
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
