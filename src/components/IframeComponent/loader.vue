<template>
  <div class="container">
    <div class="row">
      <div class="col-xl-4 pt-5">
        <div class="placeholder wave">
          <div class="project-block">
            <!-- <div class="sidebar"></div> -->
            <div class="workflow">
              <section class="loader">
                <span class="loader-text"> Experience are getting ready. </span>
                <span class="loader-text pi pi-spin pi-spinner"></span>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
  export default {
    name: "Loadingpage",
  }
</script>
<style scoped lang="scss">
  .loader-text {
    text-align: center;
  }
  .loader {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .top-bar {
    display: flex;
    justify-content: flex-end;
    margin: 5px 25px 0;
    align-items: center;
  }
  .btn-link {
    color: #1d4ed8;
    cursor: pointer;
  }
  .container {
    // display: flex;
    // align-items: center;
    // justify-content: center;
    // height: 100vh;
    font-family: "Roboto";
    .placeholder {
      // margin: 15px;
      // padding: 5px;
      border-radius: 5px;
      div {
        background: #e8e8e8;
      }
      .workflow {
        float: right;
        width: 100%;
        height: 95vh;
        // margin: -10px 1px 20px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
  }
  @keyframes pulse {
    0% {
      background-color: rgba(165, 165, 165, 0.1);
    }
    50% {
      background-color: rgba(165, 165, 165, 0.3);
    }
    100% {
      background-color: rgba(165, 165, 165, 0.1);
    }
  }
  @-webkit-keyframes pulse {
    0% {
      background-color: rgba(165, 165, 165, 0.1);
    }
    50% {
      background-color: rgba(165, 165, 165, 0.3);
    }
    100% {
      background-color: rgba(165, 165, 165, 0.1);
    }
  }
  @keyframes wave {
    0% {
      background-position: -468px 0;
    }
    100% {
      background-position: 468px 0;
    }
  }
  @-webkit-keyframes wave {
    0% {
      background-position: -468px 0;
    }
    100% {
      background-position: 468px 0;
    }
  }
</style>
