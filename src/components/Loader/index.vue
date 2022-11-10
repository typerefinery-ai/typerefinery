<template>
  <div class="top-bar">
    <p v-if="showRetry">
      Taking too long? <span class="btn-link" @click="handleClick">Retry</span>
    </p>
    <div v-else>Services starting...</div>
    <loader-menu />
  </div>
  <div class="container">
    <div class="row">
      <div class="col-xl-4">
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
  import loaderMenu from "./loaderMenu.vue"
  import { getModule } from "vuex-module-decorators"
  import Services from "@/store/Modules/Services"
  import * as electronHelpers from "@/utils/electron"
  const serviceModule = getModule(Services)
  export default {
    name: "Loadingpage",
    components: {
      loaderMenu,
    },
    data() {
      return {
        showRetry: false,
        timer: null,
      }
    },
    computed: {
      isElectron() {
        return electronHelpers.isElectron()
      },
    },
    mounted() {
      this.timer = setTimeout(() => {
        this.showRetry = true
      }, 60000)
    },
    beforeUnmount() {
      clearTimeout(this.timer)
    },
    methods: {
      async handleClick() {
        await serviceModule.stopAllServices()
        await serviceModule.startAllServices()
        localStorage.clear()
        window.location.reload()
      },
    },
  }
</script>
<style scoped lang="scss">
  .top-bar {
    display: flex;
    justify-content: space-between;
    margin: 5px 25px 0;
    align-items: center;

    .btn-link {
      color: #1d4ed8;
      cursor: pointer;
    }
  }
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
