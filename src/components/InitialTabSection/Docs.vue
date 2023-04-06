<template>
  <div class="docs">
    <div class="iframeContent">
      <iframe
        src="https://typerefinery.ai/"
        width="100%"
        height="100%"
      ></iframe>
    </div>
    <div>
      <Button label="Next" @click="homePage()" />
    </div>
  </div>
</template>
<script>
  import Button from "primevue/button"
  export default {
    name: "Docs",
    components: {
      Button,
    },
    methods: {
      homePage() {
        console.log("hii")
        window.location.href = "http://localhost:3000/#/home/project"
      },
    },
  }
</script>
<style scoped>
  .iframeContent {
    height: 80vh;
    width: 68vw;
    border: none;
  }
  .iframeContent iframe {
    border: none;
    overflow: scroll;
  }
  .p-button {
    padding: 2px;
    float: right;
  }
</style>
