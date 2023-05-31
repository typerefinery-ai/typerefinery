import * as config from "../../../package.json"
import portfinder from "portfinder"
import child_process, { type SpawnOptions } from "node:child_process"
import fs from "fs"
import http, { type RequestOptions } from "node:http"

export function tryParseInt(text: string, defaultValue: number): number {
  try {
    return parseInt(text)
  } catch (e) {
    return defaultValue
  }
}

export function getConfig(key: string): any {
  return config[key]
}

export function getEnvConfigWithDefault(
  key: string,
  defaultValue: any = undefined
): any {
  return process.env[key] || config.env[key] || defaultValue
}

export async function getPortFree(port: number, host: string) {
  // return new Promise((res) => {
  //   const srv = net.createServer()
  //   srv.listen(0, () => {
  //     const port: AddressInfo = srv.address() as AddressInfo
  //     srv.close((err) => res(port.port))
  //   })
  // })
  return portfinder
    .getPortPromise({ host: host, port: port })
    .then((port) => {
      return port
    })
    .catch((err) => {
      //
      // Could not get a free port, `err` contains the reason.
      //
    })
}

export const os = {
  isWindows: process.platform === "win32",
  isMac: process.platform === "darwin",
  isLinux: process.platform === "linux",
  //check if path exists using fs.existsSync
  isPathExist: (path: string) => {
    try {
      return fs.existsSync(path)
    } catch (err) {
      console.error(err)
    }
    return false
  },

  //run a process on os and return when finished
  async runProcess(
    command: string,
    args: string[],
    options: SpawnOptions = {}
  ) {
    return await new Promise<string>((resolve, reject) => {
      // set options
      if (options) {
        if (!options.shell) {
          options.shell = true
        }
        if (!options.stdio) {
          options.stdio = ["ignore", "pipe", "pipe"]
        }
      }
      const child = child_process.spawn(command, args, options)
      if (child.stdout) {
        child.stdout.on("data", (data) => {
          resolve(data.toString())
        })
      }
      if (child.stderr) {
        child.stderr.on("data", (data) => {
          reject(data.toString())
        })
      }
      child.on("error", (err) => {
        reject(err)
      })
      child.on("exit", (code) => {
        if (code !== 0) {
          reject(`Process exited with code ${code}`)
        } else {
          resolve(`Process exited with code ${code}`)
        }
      })
    })
  },

  //run command with call back
  async runCommandWithCallBack(
    command: string,
    args: string[],
    options: SpawnOptions = {},
    callback: (data: string) => void
  ) {
    const result = await os.runProcess(command, args, options)
    if (callback) {
      callback(result)
      return
    }
    return result
  },
}

export async function getData(options: RequestOptions) {
  return new Promise((resolve, reject) => getHttp(options, resolve, reject))
}

export function getHttp(options: RequestOptions, resolve, reject) {
  http.get(options, (res) => {
    // on redirect do recursive call
    if (
      res.statusCode === 301 ||
      res.statusCode === 302 ||
      res.statusCode === 307
    ) {
      const optionsRedirect = Object.assign({}, options)
      optionsRedirect.path = res.headers.location
      return getHttp(optionsRedirect, resolve, reject)
    }

    let rawData = ""

    res.on("data", (chunk: any) => {
      rawData += chunk
    })

    res.on("end", () => {
      try {
        resolve(rawData)
      } catch (err) {
        reject(err)
      }
    })
  })
}
