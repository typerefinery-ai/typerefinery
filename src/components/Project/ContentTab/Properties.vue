<template>
  <p v-if="!data.label" class="text-base">
    {{ $t("components.graph.no-node") }}
  </p>
  <div v-else>
    <div class="node-data">
      <p class="text-large node-heading">
        {{ $t("components.graph.index") }}
      </p>
      <p class="text-base node-text">{{ data.index }}</p>
    </div>
    <div class="node-data">
      <p class="text-large node-heading">
        {{ $t("components.graph.label") }}
      </p>
      <p class="text-base node-text">{{ data.label }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: "Properties",
  props: { data: { type: Object, required: true } },
}
</script>

<style lang="scss">
.node-data {
  border: 1px solid var(--surface-border);
  background: var(--surface-a);
  color: var(--text-color-primary);
  border-top-right-radius: 4px;
  border-top-left-radius: 4px;
  display: flex;
  align-items: center;

  &:not(:last-of-type) {
    border-bottom: none;
  }

  .node-heading {
    border-right: 1px solid var(--surface-border);
    padding: 0.5rem 1rem;
    font-weight: bold;
    flex: 1;
  }

  .node-text {
    padding: 0.5rem 1rem;
    flex: 2;
  }
}
</style>
