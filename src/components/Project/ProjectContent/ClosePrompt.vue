<template>
  <Dialog
    :visible="showDialog"
    :header="$t(`components.dialog.projects.info.prompt-header`)"
    :modal="true"
    :closable="false"
    :style="{ width: '350px' }"
  >
    <div class="confirmation-content">
      <i class="pi pi-info-circle mr-3 deleteIcon" />
      <span>{{ $t(`components.dialog.projects.info.prompt-info`) }}</span>
    </div>

    <template #footer>
      <Button
        :label="$t(`components.dialog.projects.info.cancel`)"
        class="p-button-text"
        @click="$emit('close')"
      />
      <Button
        :label="$t(`components.dialog.projects.info.confirm`)"
        @click="$emit('confirm')"
      />
    </template>
  </Dialog>
</template>

<script>
  import Dialog from "primevue/dialog"
  import Button from "primevue/button"
  export default {
    name: "ClosePrompt",
    components: {
      Dialog,
      Button,
    },
    props: {
      showDialog: { type: Boolean, required: true },
    },
    emits: ["close", "confirm"],
  }
</script>

<style></style>
