<template>
  <div class="config-settings">
    <div>
      <h3>App Path</h3>
      <div>
        <InputText
          id="appPath"
          ref="myinput"
          v-model="appInstalledPath"
          :value="appInstalledPath"
          @focus="$event.target.select()"
        />
        <span
          :class="iconAppPath"
          style="margin-left: 7px"
          aria-hidden="true"
          @click="copyToclipBoardAppPath('appPath')"
        ></span>
      </div>
    </div>
    <div>
      <h3>Logs Path</h3>
      <div>
        <InputText
          id="logPath"
          ref="myinput"
          v-model="logs"
          :value="logs"
          @focus="$event.target.select()"
        />
        <span
          :class="iconLogPath"
          style="margin-left: 7px"
          aria-hidden="true"
          @click="copyToclipBoardLogPath('logPath')"
        ></span>
      </div>
    </div>
  </div>
</template>
<script>
  import InputSwitch from "primevue/inputswitch"
  import { getModule } from "vuex-module-decorators"
  import Settings from "@/store/Modules/Settings"
  import InputText from "primevue/inputtext"
  import Button from "primevue/button"
  import Dialog from "primevue/dialog"
  import { nanoid } from "nanoid"
  import OrderList from "primevue/orderlist"
  // import LogPath from "electron/app/main/Services.ts"

  import { errorToast, successToast } from "@/utils/toastService"
  import ExperiencePopup from "@/components/Dialog/ExperiencePopup.vue"
  const settingsModule = getModule(Settings)
  import Services from "@/store/Modules/Services"
  import path from "path"
  import config from "../../../package.json"
  const servicesModule = getModule(Services)
  export default {
    name: "Config",
    components: {
      InputText,
    },
    data() {
      return {
        name: "typerefinery",
        iconAppPath: "pi pi-copy",
        iconLogPath: "pi pi-copy",

        logs: "",
        appInstalledPath: "",
      }
    },
    mounted() {
      console.log("config", config.beforePack)
      const isProduction = process.env.NODE_ENV === "production"
      const APPDATA =
        process.env.APPDATA ||
        (process.platform === "win32" ? "/Users" : "/home")
      let logsDir = isProduction
        ? path.join(APPDATA, this.name, "logs")
        : path.join(__dirname, "../../../logs")
      // create a new logs sub directory with date timestamp everytime the app starts
      const date = new Date()
      const dateStr = date
        .toISOString()
        .replace(/:/g, "-")
        .replace(/.Z/g, "")
        .replace(/T/g, "_")
      logsDir = path.join(logsDir, dateStr)
      console.log("logs", logsDir)
    },
    methods: {
      copyToclipBoardAppPath(id) {
        document.getElementById(`${id}`).select()
        //Copies the selected text to clipboard
        document.execCommand("copy")
        console.log("Content copied to clipboard")
        console.log("logs", this.logs)
        this.iconAppPath = "pi pi-check"
        setTimeout(() => {
          this.iconAppPath = "pi pi-copy"
        }, 3000)

        console.log("hello")
      },
      copyToclipBoardLogPath(id) {
        document.getElementById(`${id}`).select()
        //Copies the selected text to clipboard
        document.execCommand("copy")
        console.log("Content copied to clipboard")
        console.log("logs", this.appInstalledPath)
        this.iconLogPath = "pi pi-check"
        setTimeout(() => {
          this.iconLogPath = "pi pi-copy"
        }, 3000)

        console.log("hello2")
      },
    },
    // props: { field: { type: String, default: "" } },
    // components: { InputSwitch, OrderList, Button, ExperiencePopup },
    // data() {
    //   return {

    //   }
    // },
  }
</script>
<!-- <style lang="scss">
  .general-settings {
    .topButtons {
      margin-left: 4rem;
      display: flex;
      justify-content: space-between;
    }

    .p-button {
      margin-bottom: 1rem;
    }

    .icon-wrapper {
      margin-left: 5px;
    }
  }
</style> -->
