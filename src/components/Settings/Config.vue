<template>
  <div class="config-settings">
    <div>
      <h3>App Path</h3>
      <div>
        <InputText
          id="appPath"
          v-model="appInstalledPath"
          :value="appInstalledPath"
        />
        <span
          :class="iconAppPath"
          aria-hidden="true"
          @click="copyToclipBoardAppPath('appPath')"
        ></span>
      </div>
    </div>
    <div>
      <h3>Logs Path</h3>
      <div>
        <InputText id="logPath" v-model="logs" :value="logs" />
        <span
          :class="iconLogPath"
          aria-hidden="true"
          @click="copyToclipBoardLogPath('logPath')"
        ></span>
      </div>
    </div>
  </div>
</template>
<script>
  import InputText from "primevue/inputtext"
  export default {
    name: "Config",
    components: {
      InputText,
    },
    data() {
      return {
        iconAppPath: "pi pi-copy",
        iconLogPath: "pi pi-copy",
        logs: "",
        appInstalledPath: "",
      }
    },
    mounted() {
      //getting the
      const { ipc } = window
      ipc.getAppPath().then((value) => {
        this.appInstalledPath = value
      })
      ipc.getAppLogs().then((value) => {
        this.logs = value
      })
    },
    methods: {
      copyToclipBoardAppPath(id) {
        document.getElementById(`${id}`).select()
        //Copies the selected text to clipboard
        document.execCommand("copy")
        this.iconAppPath = "pi pi-check"
        setTimeout(() => {
          this.iconAppPath = "pi pi-copy"
        }, 3000)
      },
      copyToclipBoardLogPath(id) {
        document.getElementById(`${id}`).select()
        //Copies the selected text to clipboard
        document.execCommand("copy")
        this.iconLogPath = "pi pi-check"
        setTimeout(() => {
          this.iconLogPath = "pi pi-copy"
        }, 3000)
      },
    },
  }
</script>
<style lang="scss">
  .config-settings {
    span {
      margin-left: 7px;
    }
  }
</style>
