<template>
  <div class="main">
    <div class="welcome">
      <img src="/assets/logo.png" alt="logo" width="300" height="300" />
      <h2 class="text-blue-900 text-3xl mb-3 mt-2">
        {{ $t(`components.serviceinstallation.tabs.welcome.heading`) }}
      </h2>
      <p class="text-black text-xl">
        {{ $t(`components.serviceinstallation.tabs.welcome.intro`) }}
      </p>
      <p class="text-black text-lg mt-2">
        {{ $t(`components.serviceinstallation.tabs.welcome.note`) }}
        <!-- <i class="pi pi-spin pi-spinner" style="font-size: 1rem"></i> -->
      </p>
      <p class="mt-5 text-base text-500" v-if="isInitialTime == 'true'">
        {{ getTimerText }}
      </p>
    </div>
  </div>
</template>
<script>
  export default {
    name: "Welcome",
    data() {
      return {
        timer: null,
        time: 10,
      }
    },
    props: {
      isInitialTime: {
        type: String,
        default: "true",
      },
    },
    computed: {
      getTimerText() {
        if (this.isInitialTime == "true") {
          return `Will be redirected to the service tab in ${this.time} seconds`
        } else {
          return ``
        }
      },
    },
    emits: ["tabClicked"],
    mounted() {
      console.log("isInitialTime: " + this.isInitialTime)
      if (this.isInitialTime == "true") {
        console.log("startTimer")
        this.startTimer()
      }
    },
    methods: {
      onTabClicked(tab) {
        this.$emit("tab-clicked", tab)
      },
      startTimer() {
        setTimeout(() => {
          if (this.isInitialTime == "true") {
            clearInterval(this.timer)
            this.onTabClicked("SERVICES")
          }
        }, 10000)

        this.timer = setInterval(() => {
          if (this.time > 0) {
            this.time--
          }
        }, 1000)
      },
    },
  }
</script>
<style scoped>
  .main {
    margin: auto;
  }

  .welcome {
    margin: auto;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
</style>
