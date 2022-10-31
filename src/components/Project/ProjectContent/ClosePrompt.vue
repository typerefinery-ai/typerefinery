<template>
  <Dialog
    :visible="showDialog"
    header="Are you sure?"
    :modal="true"
    :closable="false"
    :style="{ width: '350px' }"
  >
    <div class="confirmation-content">
      <i class="pi pi-info-circle mr-3 deleteIcon" />
      <span>Changes are not saved yet.</span>
    </div>

    <template #footer>
      <Button
        :label="$t(`components.dialog.projects.info.cancel`)"
        icon="pi pi-times"
        class="p-button-text"
        @click="$emit('close')"
      />
      <Button label="Confirm" class="p-button-text" @click="$emit('confirm')" />
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
