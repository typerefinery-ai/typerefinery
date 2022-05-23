const fs = require("fs")
const path = require("path")
const spawn = require("child_process").spawn
const exec = require("child_process").exec
const execSync = require("child_process").execSync
const controller = new AbortController()
const { signal } = controller

const pathServices = "services"
const pathFastAPI = "fastapi"
const pathFastAPIModule = "main" // without .py suffix
const pathTypeDB = "typedb"
const pathJava = "java/jre17/bin"
const pathPython = "_python"
const pythonExecutable = getPythonPath()
const serviceEventSatus = "service:status"
const serviceEventLog = "service:log"
const serviceEventList = "service:list"
const pythonPyGet = "python get-pip.py --no-warn-script-location"

//path where local pythion is located
const pythonHome = path.join(
  process.resourcesPath,
  "..",
  pathServices,
  pathPython
)

// get python path based on type of os
function getPythonPath() {
  if (process.platform === "win32") {
    return path.join(pythonHome, "python.exe")
  } else {
    return path.join(pythonHome, "python")
  }
}

const python = path.join(
  process.resourcesPath,
  "..",
  pathServices,
  pathPython,
  pythonExecutable
)

let mainWindow
let serviceList = findServices()

let procFastAPI = null
let portFastAPI = null
let procTypeDB = null
let portTypeDB = null

// load services
function loadServices() {
  serviceList = findServices()
  sendServiceList()
}

// find all service.json in services folder
function findServices() {
  let services = []
  let files = fs.readdirSync(pathServices)
  for (let file of files) {
    if (file.endsWith("service.json")) {
      // only service.json
      let service = JSON.parse(
        fs.readFileSync(path.join(pathServices, file), "utf8")
      )
      service.file = file
      services.push(service)
    }
  }
  return services
}

// check if path exists
function isPathExist(path) {
  try {
    return fs.existsSync(path)
  } catch (err) {
    console.error(err)
  }
  return false
}

// run a process on os
function os_func() {
  this.execCommand = function (cmd, options, callback) {
    exec(cmd, options, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`)
        return
      }

      callback(stdout)
    })
  }
}
// init os
var os = new os_func()

// choose a port for fastapi
function selectFastAPIPort() {
  let port = 8000
  return port
}

// chose a port for typedb
function selectTypeDBPort() {
  let port = 1729
  return port
}

// stop typedb process
function exitTypeDBProc() {
  if (procTypeDB != null) {
    sendServiceStatus("typedb", "stopping")
    procTypeDB.kill()
    procTypeDB = null
    portTypeDB = null
    sendServiceStatus("typedb", "stopping")
  }
}

//stop fastapi process
function exitFastAPIProc() {
  if (procFastAPI != null) {
    sendServiceStatus("fastapi", "stopping")
    procFastAPI.kill()
    procFastAPI = null
    portFastAPI = null
    sendServiceStatus("fastapi", "stopped")
  }
}

// compile a status message to be sent to app
function compileServiceStatusMessage(servicename, status) {
  return {
    name: servicename,
    status: status,
  }
}

// compile a service log message to be sent to app
function compileServiceLogMessage(servicename, log) {
  return {
    name: servicename,
    log: log,
  }
}

// send service list to app
function sendServiceList() {
  if (mainWindow && mainWindow.webContents) {
    mainWindow.webContents.send(serviceEventList, serviceList)
  }
}

// send service status to app
function sendServiceStatus(servicename, status) {
  sendServiceEventToApp(
    serviceEventSatus,
    compileServiceStatusMessage(servicename, status)
  )
}

// send service log to app
function sendServiceLog(servicename, log) {
  sendServiceEventToApp(
    serviceEventLog,
    compileServiceLogMessage(servicename, log)
  )
}

// send service event to app
function sendServiceEventToApp(event, content) {
  if (mainWindow && mainWindow.webContents) {
    mainWindow.webContents.on("did-finish-load", () => {
      mainWindow.webContents.send(event, content)
    })
  }
}

function setupPythonPip(servicename, callback) {
  if (isPathExist(pathPython)) {
    sendServiceLog(servicename, "python found")

    os.execCommand(
      pythonPyGet,
      { cwd: pythonHome, signal: signal },
      function (returnvalue) {
        sendServiceLog(serviceName, `Output: ${returnvalue}`)
        sendServiceLog(serviceName, "starting:" + pythonPiInstall)

        if (callback) {
          callback()
        }
      }
    )
  } else {
    sendServiceLog(
      servicename,
      "python not found. Please install python 3.7.5 or higher"
    )
  }
}

function configurePython(serviceName, callback) {
  let services = path.join(process.resourcesPath, "..", pathServices)

  sendServiceLog(serviceName, "checking: " + services)

  if (isPathExist(services)) {
    sendServiceLog(serviceName, "starting: " + services)

    let appDir = path.join(
      process.resourcesPath,
      "..",
      pathServices,
      pathFastAPI
    )
    let pythonHome = path.join(
      process.resourcesPath,
      "..",
      pathServices,
      pathPython
    )
    let python = path.join(
      process.resourcesPath,
      "..",
      pathServices,
      pathPython,
      "python.exe"
    )
    let requirements = path.join(
      process.resourcesPath,
      "..",
      pathServices,
      pathFastAPI,
      "requirements.txt"
    )
    let port = "" + selectFastAPIPort()
    let pythonPyGet = "python get-pip.py --no-warn-script-location"
    let pythonPiInstall =
      "python -m pip install --no-warn-script-location --target=" +
      appDir +
      " -r " +
      requirements

    sendServiceLog(serviceName, "starting:" + pythonPyGet)

    os.execCommand(
      pythonPyGet,
      { cwd: pythonHome, signal: signal },
      function (returnvalue) {
        sendServiceLog(serviceName, `Output: ${returnvalue}`)
        sendServiceLog(serviceName, "starting:" + pythonPiInstall)

        os.execCommand(
          pythonPiInstall,
          { cwd: pythonHome, signal: signal },
          function (returnvalue) {
            sendServiceLog(serviceName, `Output: ${returnvalue}`)
            if (callback) {
              callback()
            }
          }
        )
      }
    )
  } else {
    sendServiceStatus(serviceName, "stopped")
    sendServiceLog(serviceName, "service not found in " + services)
  }
}

function createFastAPIProc() {
  let services = path.join(process.resourcesPath, "..", pathServices)
  let serviceName = "fastapi"
  sendServiceStatus(serviceName, "starting")

  if (isPathExist(services)) {
    let appDir = path.join(
      process.resourcesPath,
      "..",
      pathServices,
      pathFastAPI
    )
    let pythonHome = path.join(
      process.resourcesPath,
      "..",
      pathServices,
      pathPython
    )
    let python = path.join(
      process.resourcesPath,
      "..",
      pathServices,
      pathPython,
      "python.exe"
    )
    let port = "" + selectFastAPIPort()

    sendServiceLog(serviceName, "starting:" + python)

    procFastAPI = spawn(
      python,
      ["-m", "uvicorn", "main:app", "--host", "localhost", "--app-dir", appDir],
      { cwd: services, signal: signal, env: { PYTHONPATH: appDir } }
    )

    procFastAPI.stdout.on("data", function (data) {
      sendServiceLog(serviceName, "stdout:" + data)
    })

    procFastAPI.stderr.on("data", function (data) {
      sendServiceLog(serviceName, "stderr:" + data)
    })

    procFastAPI.on("exit", function (code) {
      sendServiceStatus(serviceName, "stopped")
      sendServiceLog(serviceName, "process exited with code " + code)
    })

    procFastAPI.on("close", function (code) {
      sendServiceStatus(serviceName, "stopped")
      sendServiceLog(serviceName, "process closed with code " + code)
    })

    if (procFastAPI != null) {
      sendServiceStatus(serviceName, "started")
      sendServiceLog(serviceName, "process running on port " + port)
    }
  }
}

function createTypeDBProc() {
  let services = path.join(process.resourcesPath, "..", pathServices)
  let serviceName = "typedb"
  sendServiceStatus(serviceName, "starting")

  if (isPathExist(services)) {
    let appDir = path.join(
      process.resourcesPath,
      "..",
      pathServices,
      pathTypeDB
    )
    let java = path.join(
      process.resourcesPath,
      "..",
      pathServices,
      pathJava,
      "java.exe"
    )
    let port = "" + selectTypeDBPort()
    let SERVER_JAVAOPTS = ""
    let G_CP =
      '"' +
      appDir +
      "\\server\\conf\\;" +
      appDir +
      "\\server\\lib\\common\\*;" +
      appDir +
      '\\server\\lib\\prod\\*"'

    sendServiceLog(serviceName, "starting:" + java)
    sendServiceLog(
      serviceName,
      "starting:" +
        [
          SERVER_JAVAOPTS,
          "-cp",
          G_CP,
          '-Dtypedb.dir="' + appDir + '"',
          "com.vaticle.typedb.core.server.TypeDBServer",
        ]
    )

    // java %SERVER_JAVAOPTS% -cp "%G_CP%" -Dtypedb.dir="%TYPEDB_HOME%" com.vaticle.typedb.core.server.TypeDBServer
    //  procTypeDB = exec(script + " server", {cwd: services, signal: signal, shell: true});
    procTypeDB = spawn(
      java,
      [
        SERVER_JAVAOPTS,
        "-cp",
        G_CP,
        '-Dtypedb.dir="' + appDir + '"',
        "com.vaticle.typedb.core.server.TypeDBServer",
      ],
      { cwd: appDir, signal: signal, windowsVerbatimArguments: true }
    )

    procTypeDB.stdout.on("data", function (data) {
      sendServiceLog(serviceName, "stdout: " + data)
    })

    procTypeDB.stderr.on("data", function (data) {
      sendServiceLog(serviceName, "stderr: " + data)
    })

    procTypeDB.on("exit", function (code) {
      sendServiceStatus(serviceName, "stopped")
      sendServiceLog(serviceName, "process exited with code " + code)
    })

    procTypeDB.on("close", function (code) {
      sendServiceStatus(serviceName, "stopped")
      sendServiceLog(serviceName, "process closed with code " + code)
    })

    if (procTypeDB != null) {
      sendServiceStatus(serviceName, "started")
      sendServiceLog(serviceName, "process running on port " + port)
    }
  } else {
    sendServiceStatus(serviceName, "stopped")
    sendServiceLog(serviceName, "service not found in " + services)
  }
}

function stopServices() {
  if (process.platform == "win32") {
    sendServiceLog("all", "stopping services")
    exitFastAPIProc()
    exitTypeDBProc()
    sendServiceLog("all", "ready or not aborting")
    controller.abort()
  } else {
    sendServiceLog("all", "embedded services are not yet available on your os.")
  }
}
function startServices() {
  if (process.platform == "win32") {
    sendServiceLog("all", "starting services")
    configurePython("fastapi", createFastAPIProc)
    //createFastAPIProc()
    createTypeDBProc()
    sendServiceLog("all", "started services")
  } else {
    sendServiceLog("all", "embedded services are not yet available on your os.")
  }
}

function init(window) {
  sendServiceLog("all", "initializing services")
  mainWindow = window
  startServices()
  sendServiceLog("all", "initialized services")
}

module.exports = {
  init,
  startServices,
  stopServices,
}
