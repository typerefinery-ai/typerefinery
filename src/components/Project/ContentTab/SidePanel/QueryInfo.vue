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
        rows="3"
        cols="20"
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
        @change="handleTransformer($event)"
      />
    </div>
    <div class="field">
      <label>{{ $t(`components.tabquery.connection`) }}</label>
      <Dropdown
        v-model="connection"
        :options="connections"
        option-label="label"
        option-group-label="label"
        option-group-children="items"
        :placeholder="$t(`components.tabquery.select`)"
        @change="handleConnection"
      />
    </div>
    <div class="field">
      <label for="database">{{ $t(`components.tabquery.db`) }}</label>
      <InputText
        id="database"
        :model-value="database"
        @input="handleInput($event, 'database')"
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
        return appData.query(projectIdx, queryIdx).description
      },
      icon() {
        const { projectIdx, queryIdx } = this.tab
        return appData.query(projectIdx, queryIdx).icon
      },
      connections() {
        const { projectIdx } = this.tab
        return appData.connectionsList(projectIdx)
      },
      connection() {
        const { projectIdx, queryIdx } = this.tab
        const connection = appData.query(projectIdx, queryIdx).connection
        return {
          key: connection.id,
          label: connection.label,
          scope: connection.scope,
        }
      },
      tranformer() {
        const { projectIdx, queryIdx } = this.tab
        const transformer = appData.query(projectIdx, queryIdx).transformer
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
      database() {
        const { projectIdx, queryIdx } = this.tab
        return appData.query(projectIdx, queryIdx).database
      },
    },
    methods: {
      handleInput({ target: { value } }, key) {
        const payload = { key, value, ...this.tab }
        appData.updateQuery(payload)
      },
      handleTransformer({ value }) {
        let transformer
        if (value.scope == "local") {
          transformer = appData
            .localTransformers(this.tab.projectIdx)
            .find((el) => el.id == value.key)
        } else {
          transformer = appData.globalTransformers.find(
            (el) => el.id == value.key
          )
        }
        const payload = { key: "transformer", value: transformer, ...this.tab }
        appData.updateQuery(payload)
      },
      handleConnection({ value }) {
        let connection
        if (value.scope == "local") {
          connection = appData
            .localConnections(this.tab.projectIdx)
            .find((el) => el.id == value.key)
        } else {
          connection = appData.globalConnections.find(
            (el) => el.id == value.key
          )
        }
        const payload = { key: "connection", value: connection, ...this.tab }
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
