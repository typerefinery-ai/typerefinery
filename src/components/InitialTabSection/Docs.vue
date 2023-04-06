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
  import Button from "primevue/button"
  export default {
    name: "Docs",
  }
</script>
<style scoped>
  /* @import "../../styles/main"; */
  .iframeContent {
    height: 80vh;
    width: 68vw;
    border: none;
  }
  .iframeContent iframe {
    border: none;
    overflow: scroll;
  }
</style>
