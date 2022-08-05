<template>
  <div class="workflow_content">
    <div class="flow_wrapper">
      <iframe src="http://localhost:8111/"></iframe>
    </div>
  </div>
</template>

<script>
  export default {
    name: "WiringContent",
  }
</script>

<style lang="scss" scoped>
  .workflow_content {
    height: 100%;
  }

  .flow_wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;

    iframe {
      width: 100%;
      height: 100%;
    }
  }
</style>
