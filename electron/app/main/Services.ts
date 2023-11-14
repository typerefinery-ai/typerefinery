import express from "express"
import { type ServiceManagerEvents, ServiceManager } from "./ServiceManager"
import { Service, ServiceStatus, type ServiceConfig } from "./Service"
import { Logger } from "./Logger"
import { dataPath, resourceBinary } from "./Resources"
import path from "path"
import config from "../../../package.json"
import fs from "fs"
import process from "node:process"

const pageAutoRefreshEverySeconds = 10

const isProduction = process.env.NODE_ENV === "production"
const APPDATA =
  process.env.APPDATA || (process.platform === "darwin" ? "/Users" : "/home")

let logsDir = isProduction
  ? path.join(APPDATA, config.name, "logs")
  : path.join(__dirname, "../../../logs")

// create a new logs sub directory with date timestamp everytime the app starts
const date = new Date()
const dateStr = date
  .toISOString()
  .replace(/:/g, "-")
  .replace(/.Z/g, "")
  .replace(/T/g, "_")
logsDir = path.join(logsDir, dateStr)
fs.mkdirSync(logsDir, { recursive: true })

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
    sendGlobalEnv,
  }
)

/**
 * Stop all services on exit
 * @param {NodeJS.SignalsListener} signal
 */
async function signalExitHandler(signal) {
  console.log(`terminating - service manager stopAll, signal ${signal}.`)
  logger.log(`terminating - service manager stopAll, signal ${signal}.`)
  await serviceManager.stopAll()
  process.exit()
}

// listen for TERM signal .e.g. ctr+c
process.on("beforeExit", signalExitHandler)
process.on("exit", signalExitHandler)
process.on("SIGBREAK", signalExitHandler)
process.on("SIGINT", signalExitHandler)
process.on("SIGQUIT", signalExitHandler)
process.on("SIGTERM", signalExitHandler)

logger.log("service manager console hooks loaded.")

//starting services automatically
const isAutoStart = process.env.SERVICES_AUTOSTART === "true"
logger.log("service manager isAutoStart: {}", isAutoStart)
if (isAutoStart) {
  logger.log("service manager startAll.")
  serviceManager.startAll()
}

function escapeHTML(unsafe) {
  return unsafe.replace(
    "/[\u0000-\u002F\u003A-\u0040\u005B-\u0060\u007B-\u00FF]/g",
    (c) => "&#" + ("000" + c.charCodeAt(0)).slice(-4) + ";"
  )
}

function getServicePage(service: Service) {
  const serviceDependencies = getServiceDependencies([service.id])

  const execservice = service.options.execconfig?.execservice?.id
    ? " (" + service.options.execconfig?.execservice.id + ")"
    : ""
  const serviceStatusName =
    Object.keys(ServiceStatus)[
      Object.values(ServiceStatus).findIndex((x) => x === service.status)
    ]
  const pathSeparator = process.platform === "win32" ? "\\" : "/"
  let statusBackground = "bg-warning"

  if (service.status === ServiceStatus.STARTED) {
    statusBackground = "bg-success"
  }
  if (service.status === ServiceStatus.COMPLETED) {
    statusBackground = "bg-success-subtle"
  }

  if (
    service.status === ServiceStatus.STOPPED ||
    service.status === ServiceStatus.COMPLETEDERROR
  ) {
    statusBackground = "bg-danger"
  }
  if (service.status === ServiceStatus.DISABLED) {
    statusBackground = "bg-secondary"
  }

  let actionSetupLabel = "Install"
  if (service.isSetup) {
    actionSetupLabel = "Re-Install"
  }

  let serviceLink = ""
  if (service.port) {
    serviceLink = `<a href="http://localhost:${service.port}" target="_blank">${service.port}</a>`
  }
  if (service.port && service.port <= 0) {
    serviceLink = ""
  }

  return `
  <html>
  <head>
    <title>Service: ${service.id}</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-GLhlTQ8iRABdZLl6O3oVMWSktQOp6b7In1Zl3/Jr59b6EGGoI1aFkw7cmDA6j6gD" crossorigin="anonymous">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.3/jquery.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js" integrity="sha384-w76AqPfDkMBDXo30jS1Sgez6pr3x5MlQ1ZAGC+nuZB+EYdgRZgiwxhTBTkF7CXvN" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/d3@7"></script>
    ${getdisplayDependencyTreeStyle()}
  </head>
  <body class="bg-dark">
    <main class="container">
      <div class="d-flex align-items-center p-3 my-3 text-white bg-primary rounded shadow-sm">
        <div class="container align-middle">
          <div class="row align-items-center">
            <div class="col">
              <div class="lh-1">
                <h1 class="h5 mb-0 text-white lh-1">Service: ${
                  service.name
                } <a type="button" href="/services" class="btn btn-secondary"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-house" viewBox="0 0 16 16" data-darkreader-inline-fill="" style="--darkreader-inline-fill:currentColor;"><path d="M8.707 1.5a1 1 0 0 0-1.414 0L.646 8.146a.5.5 0 0 0 .708.708L2 8.207V13.5A1.5 1.5 0 0 0 3.5 15h9a1.5 1.5 0 0 0 1.5-1.5V8.207l.646.647a.5.5 0 0 0 .708-.708L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293L8.707 1.5ZM13 7.207V13.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V7.207l5-5 5 5Z"></path></svg></a></h1>
              </div>
            </div>
            <div class="col">
              <button type="button" class="btn btn-success" onclick="triggerServiceAPI('start')">Start</button>
              <button type="button" class="btn btn-danger" onclick="triggerServiceAPI('stop')">Stop</button>
              <button type="button" class="btn btn-danger" onclick="triggerServiceAPI('setup')">${actionSetupLabel}</button>
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
          <span class="input-group-text" id="inputGroup-sizing-sm">Id</span>
          <input type="text" value="${
            service.id
          }" readonly class="form-control" aria-describedby="inputGroup-sizing-sm">
        </div>
        <div class="input-group input-group-sm mb-1">
          <span class="input-group-text" id="inputGroup-sizing-sm">Description</span>
          <input type="text" value="${
            service.description
          }" readonly class="form-control" aria-describedby="inputGroup-sizing-sm">
        </div>
        <div class="input-group input-group-sm mb-1">
          <span class="input-group-text" id="inputGroup-sizing-sm">Enabled</span>
          <input type="text" value="${
            service.isEnabled
          }" readonly class="form-control" aria-describedby="inputGroup-sizing-sm">
        </div>
        <div class="input-group input-group-sm mb-1">
          <span class="input-group-text" id="inputGroup-sizing-sm">Debug Log</span>
          <input type="text" value="${
            service.isDebug
          }" readonly class="form-control" aria-describedby="inputGroup-sizing-sm">
        </div>
        <div class="input-group input-group-sm mb-1">
          <span class="input-group-text" id="inputGroup-sizing-sm">Status</span>
          <input type="text" value="${serviceStatusName}" readonly class="form-control ${statusBackground}" aria-describedby="inputGroup-sizing-sm">
        </div>
        <div class="input-group input-group-sm mb-1">
          <span class="input-group-text" id="inputGroup-sizing-sm">URL</span>
          <span class="form-control">${serviceLink}</span>
        </div>
        <div class="input-group input-group-sm mb-1">
          <span class="input-group-text" id="inputGroup-sizing-sm">Port</span>
          <span class="form-control">${service.port}</span>
        </div>
        <div class="input-group input-group-sm mb-1">
          <span class="input-group-text" id="inputGroup-sizing-sm">Port Secondary</span>
          <span class="form-control">${service.portsecondary}</span>
        </div>
        <div class="input-group input-group-sm mb-1">
          <span class="input-group-text" id="inputGroup-sizing-sm">Port Console</span>
          <span class="form-control">${service.portconsole}</span>
        </div>
        <div class="input-group input-group-sm mb-1">
          <span class="input-group-text" id="inputGroup-sizing-sm">PID</span>
          <span class="form-control">${service.processid}</span>
        </div>
        <div class="input-group input-group-sm mb-1">
          <span class="input-group-text" id="inputGroup-sizing-sm">Mem</span>
          <span class="form-control">${(service.memorybytes / 1048576).toFixed(
            0
          )}MB</span>
        </div>
        <div class="input-group input-group-sm mb-1">
          <span class="input-group-text" id="inputGroup-sizing-sm">Mem Total</span>
          <span class="form-control">${(
            service.memorybytestotal / 1048576
          ).toFixed(0)}MB</span>
        </div>
        <div class="input-group input-group-sm mb-1">
          <span class="input-group-text" id="inputGroup-sizing-sm">Process Tree</span>
          <span class="form-control">${service.processtree.join(", ")}</span>
        </div>
        <div class="input-group input-group-sm mb-1">
          <span class="input-group-text" id="inputGroup-sizing-sm">Exec Service</span>
          <input type="text" value="${execservice}" readonly class="form-control" aria-describedby="inputGroup-sizing-sm">
        </div>
        <div class="input-group input-group-sm mb-1">
          <span class="input-group-text" id="inputGroup-sizing-sm">Executable</span>
          <input type="text" value="${service.getServiceExecutable()}" readonly class="form-control" aria-describedby="inputGroup-sizing-sm">
        </div>
        <div class="input-group input-group-sm mb-1">
          <span class="input-group-text" id="inputGroup-sizing-sm">Executable Path</span>
          <input type="text" value="${service.getServiceExecutable(
            true
          )}" readonly class="form-control" aria-describedby="inputGroup-sizing-sm">
        </div>
        <div class="input-group input-group-sm mb-1">
          <span class="input-group-text" id="inputGroup-sizing-sm">Exec Shell?</span>
          <input type="text" value="${
            service.execshell
          }" readonly class="form-control" aria-describedby="inputGroup-sizing-sm">
        </div>
        <div class="input-group input-group-sm mb-1">
          <span class="input-group-text" id="inputGroup-sizing-sm">Exec in Directory</span>
          <input type="text" value="${
            service.execcwd
          }" readonly class="form-control" aria-describedby="inputGroup-sizing-sm">
        </div>
        <div class="input-group input-group-sm mb-1">
          <span class="input-group-text" id="inputGroup-sizing-sm">Command Line</span>
          <textarea type="text" readonly class="form-control overflow-auto" aria-describedby="inputGroup-sizing-sm" rows="10">
            ${service.getServiceCommand(true).trim()}
          </textarea>
        </div>
        <div class="input-group input-group-sm mb-1">
          <span class="input-group-text" id="inputGroup-sizing-sm">Command Line Cli</span>
          <textarea type="text" readonly class="form-control overflow-auto" aria-describedby="inputGroup-sizing-sm" rows="10">
           ${service.getServiceCommandCli(true).trim()}
          </textarea>
        </div>
        <div class="input-group input-group-sm mb-1">
          <span class="input-group-text" id="inputGroup-sizing-sm">Setup Command Line</span>
          <textarea type="text" readonly class="form-control overflow-auto" aria-describedby="inputGroup-sizing-sm" rows="10">
            ${service.getSetupForPlatfrom.join("\n").trim()}
          </textarea>
        </div>
        <div class="input-group input-group-sm mb-1">
          <span class="input-group-text" id="inputGroup-sizing-sm">Setup Command Line Parsed</span>
          <textarea type="text" readonly class="form-control overflow-auto" aria-describedby="inputGroup-sizing-sm" rows="10">
            ${service.getSetupForPlatfromParsed.join("\n").trim()}
          </textarea>
        </div>
        <div class="input-group input-group-sm mb-1">
          <span class="input-group-text" id="inputGroup-sizing-sm">Is Setup</span>
          <input type="text" value="${
            service.isSetup
          }" readonly class="form-control" aria-describedby="inputGroup-sizing-sm">
        </div>
        <div class="input-group input-group-sm mb-1">
          <span class="input-group-text" id="inputGroup-sizing-sm">Setup Status File</span>
          <input type="text" value="${
            service.setupstatefile
          }" readonly class="form-control" aria-describedby="inputGroup-sizing-sm">
        </div>
        <div class="input-group input-group-sm mb-1">
          <span class="input-group-text" id="inputGroup-sizing-sm">Archive File</span>
          <input type="text" value="${
            service.getArchiveForPlatform?.name
          }" readonly class="form-control" aria-describedby="inputGroup-sizing-sm">
        </div>
        <div class="input-group input-group-sm mb-1">
          <span class="input-group-text" id="inputGroup-sizing-sm">Archive Output</span>
          <input type="text" value="${
            service.setuparchiveOutputPath
          }" readonly class="form-control" aria-describedby="inputGroup-sizing-sm">
        </div>
        <div class="input-group input-group-sm mb-1">
          <span class="input-group-text" id="inputGroup-sizing-sm">Is Running</span>
          <input type="text" value="${
            service.isRunning
          }" readonly class="form-control" aria-describedby="inputGroup-sizing-sm">
        </div>
      </div>

      <div class="my-3 p-3 bg-body rounded shadow-sm">
        <h6 class="border-bottom pb-2 mb-3">Service Dependencies</h6>
        <div class="border border-1 bg-secondary-subtle p-3 fs-6">
        <div id="dependencytree"></div>
        </div>
      </div>

      <div class="my-3 p-3 bg-body rounded shadow-sm">
        <h6 class="border-bottom pb-2 mb-3">Setup Command line</h6>
        <div class="border border-1 bg-secondary-subtle p-3 fs-6">
        <pre><code id="env" style="font-size: 8pt">${JSON.stringify(
          service.setup
        )}</code></pre>
        </div>
      </div>

      <div class="my-3 p-3 bg-body rounded shadow-sm">
        <h6 class="border-bottom pb-2 mb-3">Environment Variables</h6>
        <div class="border border-1 bg-secondary-subtle p-3 fs-6">
        <pre><code id="env" style="font-size: 8pt">${JSON.stringify(
          service.compileEnvironmentVariables(),
          null,
          "\t"
        )}</code></pre>
        </div>
      </div>

      <div class="my-3 p-3 bg-body rounded shadow-sm">
        <h6 class="border-bottom pb-2 mb-3">Logs</h6>
        <p>Error Log: <a href="#" onclick="loadLog('${service.errorLogFile.replaceAll(
          pathSeparator,
          "/"
        )}')">${service.errorLogFile}</a></p>
        <p>Console Log: <a href="#" onclick="loadLog('${service.consoleLogFile.replaceAll(
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

      ${getdisplayDependencyTreeFunction(300)}

      displayDependencyTree(d3,${JSON.stringify(serviceDependencies)});

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

function getServiceDependencies(filterServices: string[] = []) {
  const serviceDependencies = {}

  let nodes: any[] = []
  let links: any[] = []

  //list of all service id that should be in output data
  const filteredServices: any[] = []

  serviceManager.getServices().forEach((service) => {
    // are we returning filtered data?
    const isFiltered: boolean =
      filterServices.length > 0 && filterServices.includes(service.id)

    if (isFiltered) {
      filteredServices.push(service.id)
    }
    const sericeNode = {
      name: service.name,
      n: 1,
      grp: 1,
      id: service.id,
    }
    nodes.push(sericeNode)
    // if service has depends_on services

    service.options.execconfig.depend_on?.forEach((dep) => {
      const depNode = {
        source: dep,
        target: service.id,
        value: 1,
      }
      links.push(depNode)

      if (isFiltered) {
        filteredServices.push(dep)
      }
    })
    if (!service.options.execconfig.depend_on) {
      const depNode = {
        source: "root",
        target: service.id,
        value: 1,
      }
      links.push(depNode)
    }

    if (filteredServices.length > 0) {
      // remove nodes that are not part of filtered services list
      nodes = nodes.filter((node) => filteredServices.includes(node.id))
      //remove links that are not part of filtered services list
      links = links.filter(
        (link) =>
          (filteredServices.includes(link.source) &&
            filteredServices.includes(link.target)) ||
          (link.source == "root" && filteredServices.includes(link.target)) ||
          (link.target == "root" && filteredServices.includes(link.source))
      )
    }
  })

  //add default nodes
  nodes.push({ name: "root", n: 1, grp: 1, id: "root" })
  // nodes.push({ name: "Enabled", n: 1, grp: 1, id: "enabled" })
  // nodes.push({ name: "Disabled", n: 1, grp: 1, id: "disabled" })

  // links.push({ source: "services", target: "enabled", value: 1 })
  // links.push({ source: "services", target: "disabled", value: 1 })

  serviceDependencies["nodes"] = nodes
  serviceDependencies["links"] = links

  serviceDependencies["attributes"] = {}
  return serviceDependencies
}

function getServicesPage(services: Service[]) {
  const serviceDependencies = getServiceDependencies()

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
      let serviceLink = ""
      if (service.port) {
        serviceLink = `<a href="http://localhost:${service.port}" target="_blank">${service.port}</a>`
      }
      if (service.port && service.port <= 0) {
        serviceLink = ""
      }
      let statusBackground = "bg-warning"

      if (service.status === ServiceStatus.STARTED) {
        statusBackground = "bg-success"
      }
      if (service.status === ServiceStatus.COMPLETED) {
        statusBackground = "bg-success-subtle"
      }
      if (
        service.status === ServiceStatus.STOPPED ||
        service.status === ServiceStatus.COMPLETEDERROR
      ) {
        statusBackground = "bg-danger"
      }
      if (service.status === ServiceStatus.DISABLED) {
        statusBackground = "bg-secondary"
      }
      const actionSetupEnabled = service.isInstallable ? "" : "disabled"
      let actionSetupLabel = "Install"
      if (service.isSetup) {
        actionSetupLabel = "Re-Install"
      } else {
        if (!service.isInstallable) {
          actionSetupLabel = "N/A"
        }
      }

      return `<tr class="align-middle">
      <td scope="row"><a href="/service/${service.id}">${service.id}</a></td>
      <td>${execservice}</td>
      <td class="${statusBackground}">${serviceStatusName}</td>
      <td>${configured.toUpperCase()}</td>
      <td>${serviceLink}</td>
      <td>
        <button type="button" class="btn btn-success ${
          !service.isRunnable ? "disabled" : ""
        }" onclick="triggerServiceAPI('${service.id}','start')">Start</button>
        <button type="button" class="btn btn-danger ${
          !service.isRunnable ? "disabled" : ""
        }" onclick="triggerServiceAPI('${service.id}','stop')">Stop</button>
        <button type="button" class="btn btn-danger" ${actionSetupEnabled} onclick="triggerServiceAPI('${
        service.id
      }','setup')">${actionSetupLabel}</button>
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
    <script src="https://cdn.jsdelivr.net/npm/d3@7"></script>
    <title>Services</title>
    ${getdisplayDependencyTreeStyle()}
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
              <button type="button" class="btn btn-success" onclick="triggerServicesAPI('/services/startall')">Start All</button>
              <button type="button" class="btn btn-warning" onclick="triggerServicesAPI('/services/reload')">Reload</button>
              <button type="button" class="btn btn-danger" onclick="triggerServicesAPI('/services/stopall')">Stop All</button>
              <button type="button" class="btn btn-danger" onclick="triggerServicesAPI('/exit')">Exit</button>
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
        <h6 class="border-bottom pb-2 mb-3">Service Dependencies</h6>
        <div class="border border-1 bg-secondary-subtle p-3 fs-6">
        <div id="dependencytree"></div>
        </div>
      </div>

      <div class="my-3 p-3 bg-body rounded shadow-sm">
        <h6 class="border-bottom pb-2 mb-3">Environment Variables</h6>
        <div class="border border-1 bg-secondary-subtle p-3 fs-6">
        <pre><code id="env" style="font-size: 8pt">${JSON.stringify(
          serviceManager.getGlobalEnv(),
          null,
          "\t"
        )}</code></pre>
        </div>
      </div>

      <div class="my-3 p-3 bg-body rounded shadow-sm">
        <h6 class="border-bottom pb-2 mb-3">Config</h6>
        <div class="input-group input-group-sm mb-1">
          <span class="input-group-text" id="inputGroup-sizing-sm">Logs Path</span>
          <input type="text" value="${logsDir}" readonly class="form-control" aria-describedby="inputGroup-sizing-sm">
        </div>
        <div class="input-group input-group-sm mb-1">
          <span class="input-group-text" id="inputGroup-sizing-sm">Service Path</span>
          <input type="text" value="${servicesPath}" readonly class="form-control" aria-describedby="inputGroup-sizing-sm">
        </div>
        <div class="input-group input-group-sm mb-1">
          <span class="input-group-text" id="inputGroup-sizing-sm">Service Data Path</span>
          <input type="text" value="${servicesUserDataPath}" readonly class="form-control" aria-describedby="inputGroup-sizing-sm">
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

      ${getdisplayDependencyTreeFunction()}

      displayDependencyTree(d3,${JSON.stringify(serviceDependencies)});
    </script>
  </body>
</html>`
}

function getdisplayDependencyTreeStyle() {
  return `
<style>
  circle {
    fill: cadetblue;
  }
  line {
    stroke: #ccc;
  }
  text {
    text-anchor: middle;
    font-family: "Helvetica Neue", Helvetica, sans-serif;
    fill: #666;
    font-size: 16px;
  }
</style>
  `
}

function getdisplayDependencyTreeFunction(height = 400) {
  return `

function displayDependencyTree(d3, data) {
  // console.log("displayDependencyTree");

  const container = document.getElementById("dependencytree");
  // console.log(container?.getBoundingClientRect().width);
  // set the dimensions and margins of the graph
  const margin = {top: 10, right: 30, bottom: 30, left: 30},
      width = container?.getBoundingClientRect().width - margin.left - margin.right,
      height = ${height} - margin.top - margin.bottom;

  // append the svg object to the body of the page
  const svg = d3.select("#dependencytree")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("class","links")
        .attr("transform","translate(" + margin.left + "," + margin.top + ")")
      .append("g")
        .attr("class","nodes")
        .attr("transform","translate(" + margin.left + "," + margin.top + ")");

  // run the layout
  var simulation = d3.forceSimulation(data.nodes)
  .force("x",d3.forceX(width/2).strength(0.4))
  .force("y",d3.forceY(height/2).strength(0.4))
  .force("charge",d3.forceManyBody().strength(-1000))
    // .force('center', d3.forceCenter(width / 2, height / 2))
    .force("link", d3.forceLink().links(data.links).id(d => d.id).distance(100))
    .force("collide",d3.forceCollide().radius(d => d.r*10))
    .on('tick', ticked);

  var drag = d3.drag()
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended);

  function updateLinks() {
    var u = d3.select('.links')
      .selectAll('line')
      .data(data.links)
      .join('line')
      .attr('x1', function(d) {
        return d.source.x
      })
      .attr('y1', function(d) {
        return d.source.y
      })
      .attr('x2', function(d) {
        return d.target.x
      })
      .attr('y2', function(d) {
        return d.target.y
      });
  }

  function updateNodes() {
    u = d3.select('.nodes')
      .selectAll('text')
      .data(data.nodes)
      .join('text')
      .text(function(d) {
        return d.name
      })
      .attr('x', function(d) {
        return d.x
      })
      .attr('y', function(d) {
        return d.y
      })
      .attr('dy', function(d) {
        return 5
      })
      .call(drag);
  }

  function ticked() {
    updateLinks()
    updateNodes()
  }

  function dragstarted(event) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    event.subject.fx = event.subject.x;
    event.subject.fy = event.subject.y;
  }

  function dragged(event) {
    event.subject.fx = event.x;
    event.subject.fy = event.y;
  }

  function dragended(event) {
    if (!event.active) simulation.alphaTarget(0);
    event.subject.fx = null;
    event.subject.fy = null;
  }

}
  `
}

function sendGlobalEnv(globalenv: { [key: string]: string }) {
  logger.log(`globalEnv: ${JSON.stringify(globalenv)}`)
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
  if (serviceAction === "setup") {
    // console.log(["setup start", service.id])
    if (service.isRunning) {
      service.stop()
    }
    service.install()
    // console.log(["setup end", service.id])
  }
  res.json({
    service: serviceId,
    action: serviceAction,
    status: service.status,
    executable: service.getServiceExecutable(),
  })
})

app.post("/services/stopall", function (req, res, next) {
  serviceManager.stopAll().finally(() => {
    res.json({
      status: "ok",
    })
  })
})

app.post("/services/startall", function (req, res, next) {
  serviceManager.startAll().finally(() => {
    res.json({
      status: "ok",
    })
  })
})

app.post("/services/reload", (req, res, next) => {
  logger.log("Reloading config.")
  serviceManager.reload().finally(() => {
    res.json({
      status: "ok",
    })
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
