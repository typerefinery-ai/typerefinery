<template>
  <div class="query-view-wrapper">
    <div class="card">
      <div class="card-container">
        <div class="block p-4 pb-2">
          <span class="p-float-label">
            <InputText id="name" v-model="name" class="w-full" type="text" />
            <label for="name">{{ $t(`components.project.name`) }}</label>
          </span>
        </div>

        <div class="block p-4 pt-3 pb-0">
          <span class="p-float-label">
            <Textarea
              id="query"
              v-model="query"
              :auto-resize="true"
              rows="17"
              cols="30"
              class="w-full"
            />
            <label for="query">{{ $t(`components.tab.query`) }}</label>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import InputText from "primevue/inputtext"
import Textarea from "primevue/textarea"
export default {
  name: "QueryView",
  components: { InputText, Textarea },
  data: () => ({
    query: "",
    name: "",
  }),
}
</script>
