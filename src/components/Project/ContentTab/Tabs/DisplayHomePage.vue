<template>
  <div class="homepage">
    <p class="homepage-content">
      <span><strong> Open a project</strong></span> or
      <span><strong>create</strong></span>
      a new one to get started.
    </p>
  </div>
</template>

<script>
  export default {
    name: "HomePage",
  }
</script>

<style lang="scss" scoped>
  .homepage {
    width: 100%;
    height: 100%;
    display: table;
    .homepage-content {
      display: table-cell;
      vertical-align: middle;
      text-align: center;
      font-style: italic;
    }
  }
</style>
