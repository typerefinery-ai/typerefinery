import express from "express"
import { type ServiceManagerEvents, ServiceManager } from "./ServiceManager"
import { Service, ServiceStatus } from "./Service"
import { Logger } from "./Logger"
import { dataPath, resourceBinary } from "./Resources"
import path from "path"

const logsDir = dataPath("logs")

const servicePort = 3001

const logger = new Logger(logsDir, "services")

logger.log("service manager log", path.join(logsDir, "servicemanager.log"))

const servicesPath = path.join(__dirname, "../../../services")
logger.log("services path", servicesPath)
const serviceManager = new ServiceManager(
  dataPath("logs"),
  logger,
  servicesPath,
  {
    sendServiceStatus,
    sendServiceLog,
  },
  {
    sendServiceList,
  }
)

function getServicePage(service: Service) {
  const execservice = service.options.execconfig?.execservice?.id
    ? " (" + service.options.execconfig?.execservice.id + ")"
    : ""
  const serviceStatusName =
    Object.keys(ServiceStatus)[
      Object.values(ServiceStatus).findIndex((x) => x === service.status)
    ]
  return `
  <html>
  <head>
      <title>Service: ${service.id}</title>
  </head>
  <body>
      <h1><a href="/services">Service</a>: ${service.id}</h1>

      <p>Status: ${serviceStatusName}</p>
      <p>Port: ${service.port}</p>
      <p>Exec Service: ${execservice}</p>
      <p>Executable: ${service.options.execconfig?.execservice?.id}</p>

      <p>
      <button onclick="triggerServiceAPI('start')">Start</button>
      <button onclick="triggerServiceAPI('stop')">Stop</button>
      </p>

      <script>
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
      </script>
  </body>
</html>`
}

function getServicesPage(services: Service[]) {
  let servicesList = services
    .map((service) => {
      const execservice = service.options.execconfig?.execservice?.id
        ? " (" + service.options.execconfig?.execservice.id + ")"
        : ""
      const serviceStatusName =
        Object.keys(ServiceStatus)[
          Object.values(ServiceStatus).findIndex((x) => x === service.status)
        ]
      return `<li><a href="/service/${service.id}">${service.id}${execservice} ${serviceStatusName}</a></li>`
    })
    .join("\n")

  if (servicesList.length === 0) {
    servicesList = "No services found."
  }

  return `
  <html>
  <head>
      <title>Services</title>
  </head>

      <h1>Services</h1>

      <p>Service Path: ${servicesPath}</p>
      <p>Service List:</p>
      <ul>
      ${servicesList}
      </ul>

      <p>
      <button onclick="triggerServiceAPI('/exit')">Exit</button>
      <button onclick="triggerServiceAPI('/services/reload')">Reload</button>
      </p>

      <script>
          function triggerServiceAPI(path) {
            fetch(path, {
              method: "POST",
              headers: {"Content-Type": "application/json"},
            }).then(res => {
              console.log("Request complete! response:", res);
            });
          }
      </script>
  </body>
</html>`
}

function sendServiceList(serviceConfigList: object) {
  logger.log("sendServiceList")
  logger.log(serviceConfigList)
  console.log(serviceConfigList)
}

function sendServiceStatus(id: string, output: string) {
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
  process.exit()
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
      console.log(["status", service.id, status])
    })
  }
  if (service.listenerCount("log") === 0) {
    service.on("log", (status) => {
      console.log(["log", service.id, status])
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

app.listen(servicePort, () => {
  logger.log(`Server running on port ${servicePort}`)
})