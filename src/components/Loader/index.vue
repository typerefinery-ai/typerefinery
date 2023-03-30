<template>
  <div class="top-bar">
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
            <div class="workflow">
              <section v-if="showRetry" class="loader">
                <span class="loader-text pi pi-spin pi-spinner"></span>
                <span class="loader-text">
                  Sorry, it is taking longer than expected.
                </span>
                <span class="loader-text">
                  You can
                  <span class="btn-link" @click="handleClick">refresh</span>
                  or quit the application and open them again.
                </span>
              </section>
              <section v-else class="loader">
                <span class="loader-text pi pi-spin pi-spinner"></span>
                <span class="loader-text">
                  Services are getting installed on your machine.
                </span>
                <span class="loader-text">
                  Please be patient. This might take a few minutes.
                </span>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- <div class="container">
    <div v-if="showRetry" class="loader">
      <div class="loader-text pi pi-spin pi-spinner"></div>
      <div class="loader-text">
        Sorry, it is taking longer than expected.
      </div>
      <div class="loader-text">
        You can 
        <span class="btn-link" @click="handleClick">refresh</span>  
        or quit the application and open them again.
      </div>
    </div>
    <div v-else class="loader">
      <div class="loader-text pi pi-spin pi-spinner"></div>
      <div class="loader-text">
        Services are getting installed on your machine.
      </div>
      <div class="loader-text">
        Please be patient. This might take a few minutes.
      </div>
    </div>
  </div> -->
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
      }, 120000)
    },
    beforeUnmount() {
      clearTimeout(this.timer)
    },
    methods: {
      async handleClick() {
        // await serviceModule.stopAllServices()
        // await serviceModule.startAllServices()
        
        // Clearing the local storage and refreshing the app.
        localStorage.clear()
        window.location.reload()
      },
    },
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
    font-family: 'Roboto';
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
        display: flex;
        align-items: center;
        justify-content: center;
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
