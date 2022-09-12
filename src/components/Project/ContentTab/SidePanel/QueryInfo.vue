<template>
  <div class="query-info-wrapperr">
    <div class="field">
      <label for="description">{{
        $t(`components.project.description`)
      }}</label>
      <Textarea
        id="description"
        :model-value="description"
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

    <!-- <div class="field">
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
    </div> -->
    <div class="field">
      <label>{{ $t(`components.tabquery.connection`) }}</label>
      <Dropdown
        :model-value="connection"
        :options="connections"
        option-label="label"
        option-group-label="label"
        option-group-children="items"
        :placeholder="$t(`components.tabquery.select`)"
        @change="handleConnection"
      />
    </div>
    <!-- <div class="field">
      <label for="database">{{ $t(`components.tabquery.db`) }}</label>
      <InputText
        id="database"
        :model-value="database"
        @input="handleInput($event, 'database')"
      />
    </div> -->
  </div>
</template>

<script>
  import { getModule } from "vuex-module-decorators"
  import InputText from "primevue/inputtext"
  import Dropdown from "primevue/dropdown"
  import Textarea from "primevue/textarea"
  import Projects from "@/store/Modules/Projects"
  import Connections from "@/store/Modules/Connections"
  // import Transformers from "@/store/Modules/Transformers"
  const projectsModule = getModule(Projects)
  const connectionsModule = getModule(Connections)
  // const transformersModule = getModule(Transformers)
  export default {
    name: "QueryInfo",
    components: { InputText, Dropdown, Textarea },
    props: {
      tab: { type: Object, required: true },
    },
    computed: {
      description() {
        const { projectIdx, queryIdx } = this.tab
        return projectsModule.getQuery(projectIdx, queryIdx).description
      },

      icon() {
        const { projectIdx, queryIdx } = this.tab
        return projectsModule.getQuery(projectIdx, queryIdx).icon
      },

      connections() {
        const { projectIdx } = this.tab
        return [
          {
            label: "Local",
            code: "local",
            items: projectsModule.getLocalConnections(projectIdx).map((el) => {
              return { label: el.label, key: el.id, scope: el.scope }
            }),
          },
          {
            label: "Global",
            code: "global",
            items: connectionsModule.getGlobalConnections.map((el) => {
              return { label: el.label, key: el.id, scope: el.scope }
            }),
          },
        ]
      },

      connection() {
        const { projectIdx, queryIdx } = this.tab
        const connection = projectsModule.getQuery(
          projectIdx,
          queryIdx
        ).connection
        return {
          key: connection.id,
          label: connection.label,
          scope: connection.scope,
        }
      },

      // tranformer() {
      //   const { projectIdx: pI, queryIdx: qI } = this.tab
      //   const transformer = projectsModule.getQuery(pI, qI).transformer
      //   return {
      //     key: transformer.id,
      //     label: transformer.label,
      //     scope: transformer.scope,
      //   }
      // },

      // transformers() {
      //   const { projectIdx } = this.tab
      //   return [
      //     {
      //       label: "Local",
      //       code: "local",
      //       items: projectsModule.getLocalTransformers(projectIdx).map((el) => {
      //         return { label: el.label, key: el.id, scope: el.scope }
      //       }),
      //     },
      //     {
      //       label: "Global",
      //       code: "global",
      //       items: transformersModule.getGlobalTransformers.map((el) => {
      //         return { label: el.label, key: el.id, scope: el.scope }
      //       }),
      //     },
      //   ]
      // },

      // database() {
      //   const { projectIdx, queryIdx } = this.tab
      //   return projectsModule.getQuery(projectIdx, queryIdx).database
      // },
    },
    methods: {
      handleInput({ target: { value } }, field) {
        const payload = { field, value, ...this.tab }
        projectsModule.updateQuery(payload)
      },

      // handleTransformer({ value }) {
      //   let transformer
      //   if (value.scope == "local") {
      //     transformer = projectsModule
      //       .getLocalTransformers(this.tab.projectIdx)
      //       .find((el) => el.id == value.key)
      //   } else {
      //     transformer = transformersModule.getGlobalTransformers.find(
      //       (el) => el.id == value.key
      //     )
      //   }
      //   const payload = { key: "transformer", value: transformer, ...this.tab }
      //   projectsModule.updateQuery(payload)
      // },

      handleConnection({ value }) {
        let connection
        if (value.scope == "local") {
          connection = projectsModule
            .getLocalConnections(this.tab.projectIdx)
            .find((el) => el.id == value.key)
        } else {
          connection = connectionsModule.getGlobalConnections.find(
            (el) => el.id == value.key
          )
        }
        const payload = { field: "connection", value: connection, ...this.tab }
        projectsModule.updateQuery(payload)
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
