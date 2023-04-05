<template>
  <div class="docs">
    <div class="iframeContent">
      <iframe
        src="https://typerefinery.ai/"
        width="100%"
        height="100%"
      ></iframe>
    </div>
  </div>
</template>
<script>
  export default {
    name: "Docs",
  }
</script>
<style scoped>
  .iframeContent {
    height: 95vh;
    width: 68vw;
    border: none;
  }
  .iframeContent iframe {
    border: none;
    overflow: scroll;
  }
</style>
