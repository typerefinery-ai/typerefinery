<template>
    <div class="documentation_container">
      <div class="iframe_container">
        <iframe
          src="https://typerefinery.ai/"
          width="100%"
          height="100%"
          frameborder="0"

        >
        </iframe>
      </div>
    </div>
  </template>
  <script>
    import Button from "primevue/button"
    export default {
      name: "Documentation",
    }
  </script>
  <style scoped>
    .documentation_container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100%;
      width: 100%;
      margin: auto;
    }
    .iframe_container {
      height: 98vh;
      width: 100%;
      border: none;
    }
  </style>