import express from "express"
import { type ServiceManagerEvents, ServiceManager } from "./ServiceManager"
import { Service, ServiceStatus, type ServiceConfig } from "./Service"
import { Logger } from "./Logger"
import { dataPath, resourceBinary } from "./Resources"
import path from "path"
import config from "../../../package.json"
import fs from "fs"

const pageAutoRefreshEverySeconds = 5

const isProduction = process.env.NODE_ENV === "production"
const APPDATA =
  process.env.APPDATA || (process.platform === "darwin" ? "/Users" : "/home")

const logsDir = isProduction
  ? path.join(APPDATA, config.name, "logs")
  : path.join(__dirname, "../../../logs")

const servicePort = 3001

const logger = new Logger(logsDir, "services")

logger.log("service manager log", path.join(logsDir, "servicemanager.log"))

logger.log("isProduction", isProduction)

const servicesPath = path.join(__dirname, "../../../services")
const servicesUserDataPath = isProduction
  ? path.join(APPDATA, config.name, "services")
  : path.join(__dirname, "../../../services")
logger.log("services path", servicesPath)
logger.log("services data path", servicesUserDataPath)

const serviceManager = new ServiceManager(
  logsDir,
  logger,
  servicesPath,
  servicesUserDataPath,
  {
    sendServiceStatus,
    sendServiceLog,
  },
  {
    sendServiceList,
  }
)
//starting services aotomatically
serviceManager.startAll()

function getServicePage(service: Service) {
  const execservice = service.options.execconfig?.execservice?.id
    ? " (" + service.options.execconfig?.execservice.id + ")"
    : ""
  const serviceStatusName =
    Object.keys(ServiceStatus)[
      Object.values(ServiceStatus).findIndex((x) => x === service.status)
    ]
  const pathSeparator = process.platform === "win32" ? "\\" : "/"

  return `
  <html>
  <head>
    <title>Service: ${service.id}</title>
    <style>
      pre {
        font-family: monospace;
        font-size: 12px;
        min-width: 99%;
        min-height: 100px;
        max-height: 300px;
        border: 1px solid #ccc;
        padding: 5px;
        overflow: scroll;
      }
    </style>
  </head>
  <body>
    <h1><a href="/services">Service</a>: ${service.id}</h1>

    <p>Status: ${serviceStatusName}</p>
    <p>Port: ${service.port}</p>
    <p>Exec Service: ${execservice}</p>
    <p>Executable: ${service.getServiceExecutable()}</p>
    <p>Command Line: ${service.getServiceCommand(true)}</p>
    <p>Command Line Cli: ${service.getServiceCommandCli(true)}</p>
    <p>Is Configured: ${service.isSetup}</p>
    <p>Is Running: ${service.isRunning}</p>
    <p>Env:</p>
    <pre>${JSON.stringify(service.environmentVariables, null, "\t")}</pre>
    <p>Setup: ${JSON.stringify(service.setup)}</p>
    <p>
      <button onclick="triggerServiceAPI('start')">Start</button>
      <button onclick="triggerServiceAPI('stop')">Stop</button>
    </p>

    <p>Status @: ${getTimestamp()}</p>
    <p>Page Refresh In: <span id="refreshInPage">${pageAutoRefreshEverySeconds}</span></p>

    <p>Error Log: <a href="#" onclick="loadLog('${service.errorLogFile.replaceAll(
      pathSeparator,
      "/"
    )}')">${service.errorLogFile}</a></p>
    <p>Console Log: <a href="#" onclick="loadLog('${service.errorLogFile.replaceAll(
      pathSeparator,
      "/"
    )}')">${service.consoleLogFile}</a></p>

    <h3>Log:</h3>
    <p>Log Refresh In: <span id="refreshInLog">-</span></p>
    <pre id="log"></pre>
    <script>
    const logContent = document.querySelector('#log');
    const $refreshInPage = document.querySelector('#refreshInPage');
    const $refreshInLog = document.querySelector('#refreshInLog');
    let refreshInPage = ${pageAutoRefreshEverySeconds};
    let pageRefreshTimer = setInterval(() => {
      refreshInPage--;
      $refreshInPage.innerText = refreshInPage;
      if (refreshInPage <= 0) {
        window.location.reload();
      }
    }, 1000);

    let logRefresh = 0
    let refreshInLog = ${pageAutoRefreshEverySeconds};
    function watchLog(file) {
      window.clearInterval(logRefresh);
      logRefresh = setInterval(() => {
        refreshInLog--;
        if (refreshInLog <= 0) {
          refreshInLog = ${pageAutoRefreshEverySeconds};
          getFile(file)
        }
        $refreshInLog.innerText = refreshInLog;
      }, 1000);

    }
    function cancelRefresh() {
      clearTimeout(pageRefreshTimer);
      $refreshInPage.innerText = '-';
    }
    function triggerServiceAPI(event) {
      fetch("/service/${service.id}/" + event, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(event)
      }).then(res => {
        console.log("Request complete! response:", res);
        location.reload();
      });
    }
    function loadLog(file) {
      getFile(file)
      watchLog(file)
    }
    function getFile(file) {
      cancelRefresh();
      fetch("/service/file", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ "filePath": file })
      }).then(res => {
        return res.text();
      }).then(text => {
        logContent.innerText = text;
        logContent.scrollTop = logContent.scrollHeight
        logContent.scrollIntoView()
      });
    }

    </script>
  </body>
</html>`
}

function getTimestamp(date: Date = new Date()) {
  const timestamp = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .replace(/(.*)T(.*)\..*/, "$1 $2")
  return timestamp
}

function getServicesPage(services: Service[]) {
  let servicesList = services
    .map((service) => {
      const execservice = service.options.execconfig?.execservice?.id
        ? service.options.execconfig?.execservice.id
        : ""
      const serviceStatusName =
        Object.keys(ServiceStatus)[
          Object.values(ServiceStatus).findIndex((x) => x === service.status)
        ]
      const configured = service.isSetup ? "configured" : "not configured"
      return `<tr>
      <td><a href="/service/${service.id}">${service.id}</a></td>
      <td>${execservice}</td>
      <td>${serviceStatusName}</td>
      <td>${configured.toUpperCase()}</td>
      <td><a href="http://localhost:${service.port}" target="_blank">${
        service.port
      }</a></td>
      <td>
        <button onclick="triggerServiceAPI('${
          service.id
        }','start')">Start</button>
        <button onclick="triggerServiceAPI('${
          service.id
        }','stop')">Stop</button>
      </td>
      </tr>`
    })
    .join("\n")

  if (servicesList.length === 0) {
    servicesList = "No services found."
  }

  return `
  <html>
  <head>
    <meta http-equiv="refresh" content="${pageAutoRefreshEverySeconds}">
    <title>Services</title>
    <style>
      table {
        border-collapse: collapse;
      }
      table, th, td {
        border: 1px solid black;
        padding: 5px;
      }
    </style>
  </head>
  <body>
    <h1>Services</h1>

    <p>Logs Path: ${logsDir}</p>
    <p>Service Path: ${servicesPath}</p>
    <p>Service Data Path: ${servicesUserDataPath}</p>
    <p>Service List:</p>
    <table style="border: 1px solid">
      <thead>
        <tr>
          <th>Service</th>
          <th>Exec Service</th>
          <th>Status</th>
          <th>Configured</th>
          <th>Port</th>
          <th>Actions</th>
        </tr>
      </thead>
      ${servicesList}
    </table>

    <p>
      <button onclick="triggerServicesAPI('/exit')">Exit</button>
      <button onclick="triggerServicesAPI('/services/reload')">Reload</button>
    </p>

    <p>Status @: ${getTimestamp()}</p>
    <p>Page Refresh in (sec): <span id="refreshInPage">${pageAutoRefreshEverySeconds}</span></p>

    <script>
      const $refreshInPage = document.querySelector('#refreshInPage');
      let refreshInPage = ${pageAutoRefreshEverySeconds};
      let pageRefreshTimer = setInterval(() => {
        refreshInPage--;
        $refreshInPage.innerText = refreshInPage;
        if (refreshInPage <= 0) {
          window.location.reload();
        }
      }, 1000);
      function triggerServicesAPI(path) {
        fetch(path, {
          method: "POST",
          headers: {"Content-Type": "application/json"},
        }).then(res => {
          console.log("Request complete! response:", res);
        });
      }
      function triggerServiceAPI(serviceid,event) {
        fetch("/service/" + serviceid + "/" + event, {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify(event)
        }).then(res => {
          console.log("Request complete! response:", res);
          location.reload();
        });
      }
    </script>
  </body>
</html>`
}

function sendServiceList(serviceConfigList: Service[]) {
  logger.log(
    `sendServiceList: ${serviceConfigList.map((x) => x.id).toString()}`
  )
}

function sendServiceStatus(id: string, output: string): void {
  logger.log("sendServiceStatus", id, output)
}

function sendServiceLog(id: string, output: string) {
  logger.log("sendServiceLog", id, output)
}

const app = express()

app.get("/", function (req, res) {
  res.redirect("/services")
})

app.post("/exit", function (req, res, next) {
  serviceManager.stopAll().finally(() => {
    process.exit()
  })
})

app.get("/services", function (req, res) {
  const services = serviceManager.getServices()
  res.send(getServicesPage(services))
})

app.post("/service/:serviceId/:serviceAction", (req, res, next) => {
  const serviceId = req.params.serviceId
  const serviceAction = req.params.serviceAction
  const service = serviceManager.getService(serviceId)
  if (service.listenerCount("status") === 0) {
    service.on("status", (status) => {
      // console.log(["status", service.id, status])
    })
  }
  if (service.listenerCount("log") === 0) {
    service.on("log", (status) => {
      // console.log(["log", service.id, status])
    })
  }
  if (serviceAction === "start") {
    if (!service.isRunning) {
      service.start()
    }
  }
  if (serviceAction === "stop") {
    if (service.isRunning) {
      service.stop()
    }
  }
  res.json({
    service: serviceId,
    action: serviceAction,
    status: service.status,
    executable: service.getServiceExecutable(),
  })
})

app.post("/services/reload", (req, res, next) => {
  logger.log("Reloading config.")
  serviceManager.reload()
  res.json({
    status: "ok",
  })
})

app.get("/service/:serviceId", (req, res, next) => {
  const serviceId = req.params.serviceId
  const service = serviceManager.getService(serviceId)
  res.send(getServicePage(service))
})

app.post("/service/file", express.json({ type: "*/*" }), (req, res, next) => {
  const filePath = req.body.filePath
  const file = fs.readFileSync(filePath, "utf8")
  res.end(file)
})

app.listen(servicePort, () => {
  logger.log(`Server running on port ${servicePort}`)
})

app.get("/services/status", (req, res, next) => {
  logger.log("Service status")
  // some services status will not be STARTED. The status will be AVAILABLE.
  const availableServiceList = [
    "typedb-sample",
    "typedb-init",
    "archive",
    "java",
    "node",
    "python",
  ]

  // return ready if all enabled services are started.
  const services = serviceManager.getServices()
  let result = true
  let serviceId = ""
  for (const i in services) {
    const service = services[i]
    if (
      service?.options?.enabled &&
      !service.isStarted &&
      !availableServiceList.includes(service.id)
    ) {
      console.log(service.id, " - service not started.")
      serviceId = service.id
      result = false
      break
    }
  }

  res.status(result ? 200 : 503).json({
    status: result ? "ready" : "not ready",
    message: result ? "Services are started" : `${serviceId} is not started.`,
  })
})
