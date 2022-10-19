<template>
  <div class="menu-bar" :class="{ focus: focus }">
    <!-- service icons -->

    <window-controls v-if="isElectron" />
  </div>
  <div class="container">
    <div class="row">
      <div class="col-xl-4 pt-5">
        <div class="placeholder wave">
          <div class="menuitem"></div>
          <div class="menubar"></div>
        </div>
      </div>
      <div class="col-xl-4 pt-5">
        <div class="placeholder wave">
          <div class="project-block">
            <div class="sidebar"></div>
            <div class="workflow"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
  import WindowControls from "@/components/Menu/WindowControls.vue"

  import * as electronHelpers from "@/utils/electron"
  export default {
    name: "Loadingpage",
    components: {
      WindowControls,
    },
    computed: {
      isElectron() {
        return electronHelpers.isElectron()
      },
    },
  }
</script>
<style scoped lang="scss">
  .container {
    .placeholder {
      margin: 15px;
      padding: 10px;
      border-radius: 5px;
      &.pulse div {
        animation: pulse 1s infinite ease-in-out;
        -webkit-animation: pulse 1s infinite ease-in-out;
      }
      &.wave div {
        animation: wave 1s infinite linear forwards;
        -webkit-animation: wave 1s infinite linear forwards;
        background: #f6f7f8;
        background: linear-gradient(
          to right,
          #eeeeee 8%,
          #dddddd 18%,
          #eeeeee 33%
        );
        background-size: 800px 104px;
      }
      div {
        background: #e8e8e8;
      }
      .sidebar {
        float: left;
        width: 27%;
        height: 81vh;
        margin: -10px 1px 20px;
      }
      .workflow {
        float: right;
        width: 72%;
        height: 81vh;
        margin: -10px 1px 20px;
      }
      .menuitem {
        float: left;
        height: 30px;
        margin: 10px 1px 5px;
        width: 100%;
        margin-top: -20px;
      }
      .menubar {
        float: left;
        height: 30px;
        margin: 10px 1px 5px;
        width: 100%;
        margin-top: 5px;
        margin-bottom: 10px;
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
