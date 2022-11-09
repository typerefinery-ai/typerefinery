import {
  app,
  BrowserWindow,
  ipcMain,
  Tray,
  dialog,
  // Menu,
  // MenuItem,
  // nativeImage,
  crashReporter,
} from "electron"
import * as path from "path"
import i18n from "./i18n"
import dotenv, { config } from "dotenv"
import { ServiceManager } from "./ServiceManager"
import { Logger } from "./Logger"
import {
  dataPath,
  // resourceBinary
} from "./Resources"
import log from "electron-log"
import { CaptureConsole } from "@sentry/integrations"
// import { type Integration } from "@sentry/types"
import * as Sentry from "@sentry/electron"
// import contextMenu from "electron-context-menu"
import { release } from "os"
import internal from "stream"
import { getConfig, getEnvConfigWithDefault, tryParseInt } from "./Utils"
import ElectronWindowState from "electron-window-state"
import { t } from "i18next"
import { type AppIPC, sharedAppIpc } from "../preload/ipc"
import { Service } from "./Service"

// setup crash reporter first
if (getEnvConfigWithDefault("CRASH_REPORTER_SUBMIT_URL")) {
  // Start crash reporter before setting up logging
  crashReporter.start({
    companyName: config["companyName"],
    productName: config["productName"],
    ignoreSystemCrashHandler: true,
    submitURL: getEnvConfigWithDefault("CRASH_REPORTER_SUBMIT_URL"),
  })
}

const logsDir = dataPath("logs")
// Setup logging to file after crash reporter.
Object.assign(console, log.functions)
log.transports.file.resolvePath = () => path.join(logsDir, "main.log")
const logger = new Logger(logsDir, "electron")

// Setup error logging
if (getEnvConfigWithDefault("CRASH_REPORTER_SUBMIT_URL")) {
  if (app.isPackaged) {
    Sentry.init({
      dsn: getEnvConfigWithDefault("ERROR_REPORT_SENTURY_DSN"),
      sampleRate: 1.0,
      integrations: [
        new CaptureConsole({
          levels: getEnvConfigWithDefault("ERROR_REPORT_LEVEL"),
        }) as any,
      ],
    })
  }
}

//support .env file
dotenv.config()

logger.log(`app.isPackaged: ${app.isPackaged}`)
//variables
let isDev = !app.isPackaged
const envMode = getEnvConfigWithDefault("NODE_ENV", "")
if (envMode != "") {
  isDev = envMode === "dev"
}

logger.log(`isDev: ${isDev}`)
logger.log(
  `getEnvConfigWithDefault("NODE_ENV", "production"): ${getEnvConfigWithDefault(
    "NODE_ENV",
    "production"
  )}`
)

let mainWindow: BrowserWindow
let mainWindowState: ElectronWindowState.State
let tray: Tray
const VITE_DEV_SERVER_HOST = getEnvConfigWithDefault(
  "VITE_DEV_SERVER_HOST",
  "localhost"
)
const VITE_DEV_SERVER_PORT: number = tryParseInt(
  getEnvConfigWithDefault("VITE_DEV_SERVER_PORT", "3000"),
  3000
)

const VITE_DEV_SERVER_SCHEMA = getEnvConfigWithDefault(
  "VITE_DEV_SERVER_SCHEMA",
  "http"
)
const LOCAL_SERVICES_PATH: string = getEnvConfigWithDefault(
  "LOCAL_SERVICES_PATH",
  ""
)
const LOCAL_SERVICES_USERDATA_PATH: string = dataPath(
  getEnvConfigWithDefault("LOCAL_SERVICES_USERDATA_PATH", "")
)
const SCRIPT_PRELOAD = path.join(__dirname, "../preload/index.cjs")
logger.log(`SCRIPT_PRELOAD: ${SCRIPT_PRELOAD}`)

// Disable GPU Acceleration for Windows 7
if (release().startsWith("6.1")) {
  app.disableHardwareAcceleration()
}

// Set application name for Windows 10+ notifications
if (process.platform === "win32") {
  app.setAppUserModelId(getConfig("productName"))
}

//only allow one instance of the app and focus main window if already running
const appMainInstanceLock = app.requestSingleInstanceLock()
if (!appMainInstanceLock) {
  app.quit()
  process.exit(0)
} else {
  app.on("second-instance", (event, commandLine, workingDirectory) => {
    // Someone tried to run a second instance, we should focus our window.
    if (mainWindow) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore()
      }
      mainWindow.focus()
    }
  })
}

logger.log(`isDev: ${isDev}`)

// service manager
const serviceManager = new ServiceManager(
  dataPath("logs"),
  logger,
  LOCAL_SERVICES_PATH,
  LOCAL_SERVICES_USERDATA_PATH,
  {
    sendServiceStatus,
    sendServiceLog,
  },
  {
    sendServiceList,
  }
)

function sendServiceList(serviceConfigList: Service[]) {
  logger.log(
    `sendServiceList: ${serviceConfigList.map((x) => x.id).toString()}`
  )
}

function sendServiceStatus(id: string, output: string) {
  if (mainWindow && mainWindow.webContents) {
    mainWindow.webContents.send("sendServiceStatus", { id, output })
    logger.log("sendServiceStatus", id, output)
  }
}

function sendServiceLog(id: string, output: string) {
  logger.log("sendServiceLog", id, output)
}

// electron config
async function createWindow() {
  logger.log(`createWindow`)

  // set default window state
  mainWindowState = ElectronWindowState({
    defaultHeight: +getConfig("appHeight"),
    defaultWidth: getConfig("appWidth"),
  })

  // Create the browser window.
  mainWindow = new BrowserWindow({
    ...mainWindowState,
    minWidth: 680,
    minHeight: 400,
    show: false,
    frame: false,
    icon: path.join(__dirname, "assets/icon.ico"),
    webPreferences: {
      preload: SCRIPT_PRELOAD,
      nodeIntegration: true,
      contextIsolation: true,
      spellcheck: true,
    },
  })
  // mainWindowState.manage(mainWindow)

  addIpcEvents(mainWindow)

  logger.log(`app.isPackaged: ${app.isPackaged}`)

  // logger.log(`isDev: ${isDev}`)
  // // Open the DevTools.
  // if (isDev) {
  //   mainWindow.webContents.openDevTools()
  // }
  // mainWindow.webContents.openDevTools()

  loadResource(mainWindow, "../index.html", "")

  //splash screen
  const splash = new BrowserWindow({
    width: 500,
    height: 550,
    transparent: false,
    frame: false,
    alwaysOnTop: true,
  })

  splash.loadURL(path.join(__dirname, "loader/splash.html"))
  splash.center()
  setTimeout(function () {
    splash.close()
    mainWindowState.manage(mainWindow)
    mainWindow.center()
    mainWindow.show()
  }, 2000)

  //tray
  tray = new Tray(path.join(__dirname, "assets/tray_icon.png"))

  tray.setToolTip(getConfig("productName"))

  tray.on("click", () => {
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show()
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  logger.log("app.whenReady")
  createWindow()
  app.on("activate", function () {
    logger.log("app on activate")
    const allWindows = BrowserWindow.getAllWindows()
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (allWindows.length) {
      allWindows[0].focus()
    } else {
      createWindow()
    }
  })

  ipcMain.on("menu-click", (e, action) => {
    logger.log("ipc menu-click", action)
    if (action === "min") {
      mainWindow.minimize()
    } else if (action === "max") {
      mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize()
    } else if (action === "close") {
      mainWindow.close()
    }
  })

  ipcMain.on("lang-change", (e, lang) => {
    logger.log("ipc lang-change", lang)
    i18n.changeLanguage(lang)
    mainWindow.setTitle(i18n.t("app.title"))
  })

  mainWindow.on("close", function (e) {
    logger.log("mainWindow.on close")
    const choice = dialog.showMessageBoxSync(mainWindow, {
      type: "question",
      buttons: [i18n.t("prompt.quit"), i18n.t("prompt.minimize")],
      title: i18n.t("prompt.confirm"),
      message: i18n.t("prompt.msg"),
    })
    if (choice === 1) {
      e.preventDefault()
      mainWindow.hide()
    } else {
      mainWindow.webContents.send("sendServiceStopped")
      serviceManager.stopAll()
    }
  })

  // wait for window to be ready before loading services.
  mainWindow.webContents.on("did-finish-load", function () {
    logger.log("mainWindow.webContents.on did-finish-load")
    serviceManager.startAll()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  logger.log("app window-all-closed")
  serviceManager.stopAll()
  if (process.platform !== "darwin") {
    app.quit()
  }
})

// new window example arg: new windows url
ipcMain.handle("open-win", (event, arg) => {
  logger.log("ipc open-win")
  const childWindow = new BrowserWindow({
    webPreferences: {
      preload: SCRIPT_PRELOAD,
    },
  })

  loadResource(childWindow, "../index.html", arg)
})

function loadResource(window: BrowserWindow, uri: string, arg: any) {
  logger.log(`loadResource: ${uri}, ${arg}`)
  if (isDev) {
    const urlArgs = arg ? `#${arg}` : ""
    const url = `${VITE_DEV_SERVER_SCHEMA}://${VITE_DEV_SERVER_HOST}:${VITE_DEV_SERVER_PORT}/${urlArgs}`
    logger.log(`loadurl: ${url}`)
    window.loadURL(url)
  } else {
    logger.log(`loadfile: ${path.join(__dirname, `${uri}`)}, ${arg}`)
    window.loadFile(path.join(__dirname, `${uri}`), {
      hash: `${arg}`,
    })
  }
  // window.webContents.openDevTools()
}

function addIpcEvents(window: BrowserWindow) {
  const ipcImplementation: AppIPC = {
    isAuthenticated() {
      logger.log("ipc isAuthenticated")
      return true
    },
    minimize() {
      logger.log("ipc minimize")
      window?.minimize()
    },
    maximize() {
      logger.log("ipc maximize")
      window?.maximize()
    },
    unmaximize() {
      logger.log("ipc unmaximize")
      window?.unmaximize()
    },
    close() {
      logger.log("ipc close")
      window?.close()
    },
    isMaximized() {
      logger.log("ipc isMaximized")
      return window?.isMaximized() ?? false
    },
    isMinimized() {
      logger.log("ipc isMinimized")
      return window?.isMinimized() ?? false
    },
    isNormal() {
      logger.log("ipc isNormal")
      return window?.isNormal() ?? false
    },
    setBadgeCount(n: number) {
      logger.log(`ipc setBadgeCount ${n}`)
      return app.setBadgeCount(n)
    },
    getServices() {
      logger.log(`ipc getServices`)
      return serviceManager.getServicesSimple()
    },
    restartService(serviceid: string): any {
      logger.log(`ipc restartService {serviceid}`)
      const aservice = serviceManager.getService(serviceid)
      if (aservice) {
        aservice.stop()
        aservice.start()
      } else {
        logger.log(`service {serviceid} not found`)
        return false
      }
      return true
    },
    startService(serviceid: string): any {
      logger.log(`ipc startService {serviceid}`)
      const aservice = serviceManager.getService(serviceid)
      if (aservice) {
        aservice.start()
      } else {
        logger.log(`service {serviceid} not found`)
        return false
      }
      return true
    },
    stopService(serviceid: string): any {
      logger.log(`ipc stopService {serviceid}`)
      const aservice = serviceManager.getService(serviceid)
      if (aservice) {
        aservice.stop()
      } else {
        logger.log(`service {serviceid} not found`)
        return false
      }
      return true
    },
    startAll(): any {
      logger.log(`ipc startAll`)
      serviceManager.startAll()
    },
  }

  Object.values(sharedAppIpc).forEach((method) => method.clean())
  Object.entries(ipcImplementation).forEach(([channel, implementation]) => {
    sharedAppIpc[channel as keyof AppIPC].implement(
      implementation.bind(ipcImplementation) as any
    )
  })
}
