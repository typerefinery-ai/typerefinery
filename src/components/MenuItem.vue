<template>
  <div
    :id="`${tooltip}-button`"
    v-tooltip.bottom="$t(`tooltips.${tooltip}`)"
    class="menu-item hover:text-primary hover:border-primary"
    @click="onClick"
  >
    <slot></slot>
  </div>
</template>

<script>
  export default {
    name: "MenuItem",
    props: {
      tooltip: { type: String, required: true },
      onClick: { type: Function, required: true },
    },
  }
</script>

<style lang="scss">
  .menu-item {
    cursor: pointer;
    width: auto;
    height: 25px;
    border: 1px solid var(--surface-border);
    padding: 0 4.5px;
    display: flex;
    align-items: center;
    justify-content: center;

    &:not(:last-of-type) {
      margin-right: 2px;
    }
    .material-design-icon {
      display: flex;
    }
  }
</style>
