const fs = require('fs')
const spawn = require('child_process').spawn
const exec = require('child_process').exec
const execSync = require('child_process').execSync
const controller = new AbortController();
const { signal } = controller;

const path = require("path")
const { app, BrowserWindow, ipcMain, Tray, dialog } = require("electron")
const i18n = require("./i18next.config")
const config = require("../package.json")
require("dotenv").config()

const isDev = process.env.NODE_ENV == "dev"
let mainWindow
let tray

const pathServices = "services"
const pathFastAPI = "fastapi"
const pathFastAPIModule = "main" // without .py suffix
const pathTypeDB = "typedb"
const pathJava = "java/jre17/bin"
const pathPython = "python"


let procFastAPI = null
let portFastAPI = null
let procTypeDB = null
let portTypeDB = null

function os_func() {
    this.execCommand = function(cmd, options, callback) {
        exec(cmd, options, (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                return;
            }

            callback(stdout);
        });
    }
}
var os = new os_func();


function selectFastAPIPort() {
  port = 8000
  return port
}

function selectTypeDBPort() {
  port = 1729
  return port
}

function exitTypeDBProc() {
  if (procTypeDB != null) {
    procTypeDB.kill()
    procTypeDB = null
    portTypeDB = null
  }
}

function exitFastAPIProc() {
  if (procFastAPI != null) {
    procFastAPI.kill()
    procFastAPI = null
    portFastAPI = null
  }
}

function isPathExist(path) {
  try {
    return fs.existsSync(path)
  } catch(err) {
    console.error(err)
  }
  return false
}

function setupPython() {

  let services = path.join(process.resourcesPath, "..", pathServices)

  if (isPathExist(services)) {
    let appDir = path.join(process.resourcesPath, "..", pathServices, pathFastAPI)
    let pythonHome = path.join(process.resourcesPath, "..", pathServices, pathPython)
    let python = path.join(process.resourcesPath, "..", pathServices, pathPython, "python.exe")
    let requirements = path.join(process.resourcesPath, "..", pathServices, pathFastAPI, "requirements.txt")
    let port = '' + selectFastAPIPort()
    let pythonPyGet = "python get-pip.py --no-warn-script-location"
    let pythonPiInstall = "python -m pip install -r " + requirements

    console.log("starting:"+ pythonPyGet)

    os.execCommand(pythonPyGet, {cwd: pythonHome, signal: signal}, function (returnvalue) {
        console.log(`Output: ${returnvalue}`);
        console.log("starting:"+ pythonPiInstall)
        os.execCommand(pythonPiInstall, {cwd: pythonHome, signal: signal}, function (returnvalue) {
            console.log(`Output: ${returnvalue}`);
            createFastAPIProc()
        });
    });

  }

}

function createFastAPIProc() {
  let services = path.join(process.resourcesPath, "..", pathServices)

  if (isPathExist(services)) {
    let appDir = path.join(process.resourcesPath, "..", pathServices, pathFastAPI)
    let pythonHome = path.join(process.resourcesPath, "..", pathServices, pathPython)
    let python = path.join(process.resourcesPath, "..", pathServices, pathPython, "python.exe")
    let port = '' + selectFastAPIPort()

    console.log("starting:"+ python)

    procFastAPI = spawn(python, ["-m","uvicorn","main:app","--host","localhost","--app-dir",appDir], {cwd: services, signal: signal});

    procFastAPI.stdout.on('data', function (data) {
      console.log('fastapi-stdout: ' + data);
    });

    procFastAPI.stderr.on('data', function (data) {
      console.log('fastapi-stderr: ' + data);
    });

    procFastAPI.on('exit', function (code) {
      console.log('fastapi-child process exited with code ' + code);
    });

    procFastAPI.on('close', function (code) {
      console.log('fastapi-child process closed with code ' + code);
    });

    if (procFastAPI != null) {
      //console.log(procFastAPI)
      console.log('fastapi-child process running on port ' + port)
    }
  }
}

function createTypeDBProc() {

  let services = path.join(process.resourcesPath, "..", pathServices)

  if (isPathExist(services)) {

    let appDir = path.join(process.resourcesPath, "..", pathServices, pathTypeDB)
    let java = path.join(process.resourcesPath, "..", pathServices, pathJava, "java.exe")
    let port = '' + selectTypeDBPort()
    let SERVER_JAVAOPTS = ""
    let G_CP = "\"" + appDir + "\\server\\conf\\;" + appDir + "\\server\\lib\\common\\*;" + appDir + "\\server\\lib\\prod\\*\""

    console.log("starting:"+ java)
    console.log("starting:"+ [SERVER_JAVAOPTS, "-cp", G_CP, "-Dtypedb.dir=\""+appDir+"\"", "com.vaticle.typedb.core.server.TypeDBServer"])

  // java %SERVER_JAVAOPTS% -cp "%G_CP%" -Dtypedb.dir="%TYPEDB_HOME%" com.vaticle.typedb.core.server.TypeDBServer
  //  procTypeDB = exec(script + " server", {cwd: services, signal: signal, shell: true});
    procTypeDB = spawn(java, [SERVER_JAVAOPTS, "-cp", G_CP, "-Dtypedb.dir=\""+appDir+"\"", "com.vaticle.typedb.core.server.TypeDBServer"], {cwd: appDir, signal: signal, windowsVerbatimArguments: true});

    procTypeDB.stdout.on('data', function (data) {
      console.log('typedb-stdout: ' + data);
    });

    procTypeDB.stderr.on('data', function (data) {
      console.log('typedb-stderr: ' + data);
    });

    procTypeDB.on('exit', function (code) {
      console.log('typedb-child process exited with code ' + code);
    });

    procTypeDB.on('close', function (code) {
      console.log('typedb-child process closed with code ' + code);
    });


    if (procTypeDB != null) {
      //console.log(procTypeDB)
      console.log('typedb-child process running on port ' + port)
    }
  }
}

function stopServices() {
  if (process.platform == "win32") {
    console.log('fastapi-closing')
    exitFastAPIProc()
    console.log('typedb-closing')
    exitTypeDBProc()
    console.log('services-aborting')
    controller.abort();
  } else {
    console.log("embedded services are not yet available on your os.")
  }
}
function startServices() {
  if (process.platform == "win32") {
    setupPython()
    //createFastAPIProc()
    createTypeDBProc()
  } else {
    console.log("embedded services are not yet available on your os.")
  }
}


function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: +config.appWidth,
    height: +config.appHeight,
    frame: false,
    icon: path.join(__dirname, "./assets/icon.png"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true,
    },
  })

  // and load the index.html of the app.
  // win.loadFile("index.html");
  mainWindow.loadURL(
    isDev
      ? "http://localhost:3000"
      : `file://${path.join(__dirname, "../dist/index.html")}`
  )

  tray = new Tray(path.join(__dirname, "./assets/icon.png"))

  tray.setToolTip("Innovolve app")

  tray.on("click", () => {
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show()
  })

  // Open the DevTools.
  if (isDev) {
    mainWindow.webContents.openDevTools()
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()
  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

  ipcMain.on("menu-click", (e, action) => {
    if (action === "min") {
      mainWindow.minimize()
    } else if (action === "max") {
      mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize()
    } else if (action === "close") {
      mainWindow.close()
    }
  })

  ipcMain.on("lang-change", (e, lang) => {
    i18n.changeLanguage(lang)
    mainWindow.setTitle(i18n.t("app.title"))
  })

  mainWindow.on("close", function (e) {
    const choice = dialog.showMessageBoxSync(this, {
      type: "question",
      buttons: [i18n.t("prompt.quit"), i18n.t("prompt.minimize")],
      title: i18n.t("prompt.confirm"),
      message: i18n.t("prompt.msg"),
    })
    if (choice === 1) {
      e.preventDefault()
      mainWindow.hide()
    } else {
      console.log('exiting:close')
      stopServices()
    }
  })
  startServices()
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  console.log('exiting:window-all-closed')
  stopServices()
  if (process.platform !== "darwin") {
    app.quit()
  }
})
