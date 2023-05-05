<template>
  <div class="config-settings">
    <div class="app-path-wrapper">
      <div class="text-wrapper">
        <p>{{ $t(`components.setting.config.app-path`) }}</p>
        <span
          v-tooltip="$t(`tooltips.app-path-desc`)"
          class="pi pi-info-circle"
          aria-hidden="true"
        ></span>
      </div>
      <div>
        <InputText
          id="appPath"
          v-model="appInstalledPath"
          :value="appInstalledPath"
          readonly
        />
        <span
          id="icon"
          v-tooltip="$t(`tooltips.copy-path`)"
          :class="iconAppPath"
          aria-hidden="true"
          @click="copyToclipBoardAppPath('appPath')"
        ></span>
        <span
          id="icon"
          v-tooltip="$t(`tooltips.open-location`)"
          class="pi pi-folder-open"
          aria-hidden="true"
          @click="openAppPathExplorer()"
        ></span>
        <!-- <Button @click="openAppPathExplorer()">Go to</Button> -->
        <!-- <div><i class="pi pi-folder-open" ></i></div> -->
      </div>
    </div>
    <div class="wrapper">
      <div class="text-wrapper">
        <p>{{ $t(`components.setting.config.data-path`) }}</p>
        <span
          v-tooltip="$t(`tooltips.app-data-desc`)"
          class="pi pi-info-circle"
          aria-hidden="true"
        ></span>
      </div>
      <div>
        <InputText
          id="logPath"
          v-model="appDataPath"
          :value="appDataPath"
          readonly
        />
        <span
          id="icon"
          v-tooltip="$t(`tooltips.copy-path`)"
          :class="iconDataPath"
          aria-hidden="true"
          @click="copyToclipBoardDataPath('logPath')"
        ></span>
        <span
          id="icon"
          v-tooltip="$t(`tooltips.open-location`)"
          class="pi pi-folder-open"
          aria-hidden="true"
          @click="openAppDataPathExplorer()"
        ></span>

        <!-- <Button @click="openAppDataPathExplorer()">Go to</Button> -->
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
        iconDataPath: "pi pi-copy",
        appDataPath: "",
        appInstalledPath: "",
      }
    },
    mounted() {
      //getting the
      const { ipc } = window
      ipc.getAppPath().then((value) => {
        this.appInstalledPath = value
      })
      ipc.getAppDataPath().then((value) => {
        this.appDataPath = value
      })
    },
    methods: {
      openAppPathExplorer() {
        const { ipc } = window
        ipc.getDirectory(this.appInstalledPath)
      },
      openAppDataPathExplorer() {
        const { ipc } = window
        ipc.getDirectory(this.appDataPath)
      },
      copyToclipBoardAppPath(id) {
        document.getElementById(`${id}`).select()
        //Copies the selected text to clipboard
        document.execCommand("copy")
        this.iconAppPath = "pi pi-check"
        setTimeout(() => {
          this.iconAppPath = "pi pi-copy"
          document.getElementById(`${id}`).blur()
        }, 3000)
      },
      copyToclipBoardDataPath(id) {
        document.getElementById(`${id}`).select()
        //Copies the selected text to clipboard
        document.execCommand("copy")
        this.iconDataPath = "pi pi-check"
        setTimeout(() => {
          this.iconDataPath = "pi pi-copy"
          document.getElementById(`${id}`).blur()
        }, 3000)
      },
    },
  }
</script>
<style lang="scss">
  .config-settings {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 150px;
    p {
      margin-top: -2px;
    }
    .text-wrapper {
      display: flex;
      margin-bottom: 12px;
    }
    span {
      margin-left: 7px;
      font-size: 1.5rem;
      cursor: pointer;
    }
    #icon {
      font-size: 1.5rem;
      color: #3f51b5;
    }
  }
</style>
