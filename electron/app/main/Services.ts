import express from "express"
import { type ServiceManagerEvents, ServiceManager } from "./ServiceManager"
import { Service, ServiceStatus, type ServiceConfig } from "./Service"
import { Logger } from "./Logger"
import { dataPath, resourceBinary } from "./Resources"
import path from "path"
import config from "../../../package.json"
import fs from "fs"

const pageAutoRefreshEverySeconds = 10

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
const isAutoStart = process.env.SERVICES_AUTOSTART === "true"
if (isAutoStart) {
  serviceManager.startAll()
}

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
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-GLhlTQ8iRABdZLl6O3oVMWSktQOp6b7In1Zl3/Jr59b6EGGoI1aFkw7cmDA6j6gD" crossorigin="anonymous">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.3/jquery.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js" integrity="sha384-w76AqPfDkMBDXo30jS1Sgez6pr3x5MlQ1ZAGC+nuZB+EYdgRZgiwxhTBTkF7CXvN" crossorigin="anonymous"></script>
  </head>
  <body class="bg-dark">
    <main class="container">
      <div class="d-flex align-items-center p-3 my-3 text-white bg-primary rounded shadow-sm">
        <div class="container align-middle">
          <div class="row align-items-center">
            <div class="col">
              <div class="lh-1">
                <h1 class="h5 mb-0 text-white lh-1">Service: ${service.id}</h1>
              </div>
            </div>
            <div class="col">
              <button type="button" class="btn btn-success" onclick="triggerServiceAPI('start')">Start</button>
              <button type="button" class="btn btn-danger" onclick="triggerServiceAPI('stop')">Stop</button>
            </div>
            <div class="col text-end">
              <small>Status @: ${getTimestamp()}, Refresh in (sec) <span id="refreshInPage">${pageAutoRefreshEverySeconds}</span></small>
            </div>
          </div>
        </div>
      </div>

      <div class="my-3 p-3 bg-body rounded shadow-sm">
        <h6 class="border-bottom pb-2 mb-3">Config</h6>
        <div class="input-group input-group-sm mb-1">
          <span class="input-group-text" id="inputGroup-sizing-sm">Enabled</span>
          <input type="text" value="${service.isEnabled}" readonly class="form-control" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-sm">
        </div>
        <div class="input-group input-group-sm mb-1">
          <span class="input-group-text" id="inputGroup-sizing-sm">Status</span>
          <input type="text" value="${serviceStatusName}" readonly class="form-control" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-sm">
        </div>
        <div class="input-group input-group-sm mb-1">
          <span class="input-group-text" id="inputGroup-sizing-sm">Port</span>
          <input type="text" value="${service.port}" readonly class="form-control" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-sm">
        </div>
        <div class="input-group input-group-sm mb-1">
          <span class="input-group-text" id="inputGroup-sizing-sm">Exec Service</span>
          <input type="text" value="${execservice}" readonly class="form-control" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-sm">
        </div>
        <div class="input-group input-group-sm mb-1">
          <span class="input-group-text" id="inputGroup-sizing-sm">Executable</span>
          <input type="text" value="${service.getServiceExecutable()}" readonly class="form-control" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-sm">
        </div>
        <div class="input-group input-group-sm mb-1">
          <span class="input-group-text" id="inputGroup-sizing-sm">Command Line</span>
          <input type="text" value="${service.getServiceCommand(true)}" readonly class="form-control" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-sm">
        </div>
        <div class="input-group input-group-sm mb-1">
          <span class="input-group-text" id="inputGroup-sizing-sm">Command Line Cli</span>
          <input type="text" value="${service.getServiceCommandCli(true)}" readonly class="form-control" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-sm">
        </div>
        <div class="input-group input-group-sm mb-1">
          <span class="input-group-text" id="inputGroup-sizing-sm">Is Configured</span>
          <input type="text" value="${service.isSetup}" readonly class="form-control" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-sm">
        </div>
        <div class="input-group input-group-sm mb-1">
          <span class="input-group-text" id="inputGroup-sizing-sm">Is Running</span>
          <input type="text" value="${service.isRunning}" readonly class="form-control" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-sm">
        </div>
      </div>

      <div class="my-3 p-3 bg-body rounded shadow-sm">
        <h6 class="border-bottom pb-2 mb-3">Setup Command line</h6>
        <div class="border border-1 bg-secondary-subtle p-3 fs-6">
        <pre><code id="env" style="font-size: 8pt">${JSON.stringify(service.setup)}</code></pre>
        </div>
      </div>

      <div class="my-3 p-3 bg-body rounded shadow-sm">
        <h6 class="border-bottom pb-2 mb-3">Environment Variables</h6>
        <div class="border border-1 bg-secondary-subtle p-3 fs-6">
        <pre><code id="env" style="font-size: 8pt">${JSON.stringify(service.environmentVariables, null, "\t")}</code></pre>
        </div>
      </div>

      <div class="my-3 p-3 bg-body rounded shadow-sm">
        <h6 class="border-bottom pb-2 mb-3">Logs</h6>
        <p>Error Log: <a href="#" onclick="loadLog('${service.errorLogFile.replaceAll(
          pathSeparator,
          "/"
        )}')">${service.errorLogFile}</a></p>
        <p>Console Log: <a href="#" onclick="loadLog('${service.errorLogFile.replaceAll(
          pathSeparator,
          "/"
        )}')">${service.consoleLogFile}</a></p>
        <p>Log Refresh In: <span id="refreshInLog">-</span></p>
        <input class="form-control p-3" id="logSearch" type="text" placeholder="Search..">
        <div class="border border-1 bg-secondary-subtle p-3 fs-6">
          <pre><code id="log" style="font-size: 8pt"></code></pre>
        </div>
      </div>
    </main>
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
        $(logContent).html("<div>"+text.replace(/\\r\\n|\\r|\\n/g,"</div><div>")+"</div>");
        // logContent.innerHtml = text;
        logContent.scrollTop = logContent.scrollHeight
        logContent.scrollIntoView()
      });
    }
    $(document).ready(function(){
      $("#logSearch").on("keyup", function() {
        var value = $(this).val().toLowerCase();
        $("#log *").filter(function() {
          $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
        });
      });
    });
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
      let serviceLink = `<a href="http://localhost:${service.port}" target="_blank">${service.port}</a>`
      if (service.port && service.port <= 0) {
        serviceLink = ""
      }

      return `<tr class="align-middle">
      <td scope="row"><a href="/service/${service.id}">${service.id}</a></td>
      <td>${execservice}</td>
      <td>${serviceStatusName}</td>
      <td>${configured.toUpperCase()}</td>
      <td>${serviceLink}</td>
      <td>
        <button type="button" class="btn btn-success" onclick="triggerServiceAPI('${
          service.id
        }','start')">Start</button>
        <button type="button" class="btn btn-danger" onclick="triggerServiceAPI('${
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
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-GLhlTQ8iRABdZLl6O3oVMWSktQOp6b7In1Zl3/Jr59b6EGGoI1aFkw7cmDA6j6gD" crossorigin="anonymous">
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js" integrity="sha384-w76AqPfDkMBDXo30jS1Sgez6pr3x5MlQ1ZAGC+nuZB+EYdgRZgiwxhTBTkF7CXvN" crossorigin="anonymous"></script>
    <title>Services</title>
  </head>
  <body class="bg-dark">
    <main class="container">
      <div class="d-flex align-items-center p-3 my-3 text-white bg-primary rounded shadow-sm">
        <div class="container">
          <div class="row align-items-center">
            <div class="col">
              <div class="lh-1">
                <h1 class="h5 mb-0 text-white lh-1">Service Manager</h1>
              </div>
            </div>
            <div class="col">
              <button type="button" class="btn btn-danger" onclick="triggerServicesAPI('/exit')">Exit</button>
              <button type="button" class="btn btn-warning" onclick="triggerServicesAPI('/services/reload')">Reload</button>
            </div>
            <div class="col text-end">
              <small>Status @: ${getTimestamp()}, Refresh in (sec) <span id="refreshInPage">${pageAutoRefreshEverySeconds}</span></small>
            </div>
          </div>
        </div>
      </div>

      <div class="my-3 p-3 bg-body rounded shadow-sm">
        <table class="table table-hover">
          <thead class="table-light">
            <tr>
              <th scope="col">Service</th>
              <th scope="col">Exec Service</th>
              <th scope="col">Status</th>
              <th scope="col">Configured</th>
              <th scope="col">Port</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody class="table-group-divider">
          ${servicesList}
          </tbody>
        </table>
      </div>


      <div class="my-3 p-3 bg-body rounded shadow-sm">
        <h6 class="border-bottom pb-2 mb-3">Config</h6>
        <div class="input-group input-group-sm mb-1">
          <span class="input-group-text" id="inputGroup-sizing-sm">Logs Path</span>
          <input type="text" value="${logsDir}" readonly class="form-control" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-sm">
        </div>
        <div class="input-group input-group-sm mb-1">
          <span class="input-group-text" id="inputGroup-sizing-sm">Service Path</span>
          <input type="text" value="${servicesPath}" readonly class="form-control" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-sm">
        </div>
        <div class="input-group input-group-sm mb-1">
          <span class="input-group-text" id="inputGroup-sizing-sm">Service Data Path</span>
          <input type="text" value="${servicesUserDataPath}" readonly class="form-control" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-sm">
        </div>
      </div>

    </main>
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
