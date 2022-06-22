import * as config from "../../../package.json"
import portfinder from "portfinder"
import { spawn, type SpawnOptions } from "node:child_process"
import fs from "fs"

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
    return await new Promise<string>((resolve) => {
      // set options
      if (options) {
        if (!options.shell) {
          options.shell = true
        }
        if (!options.stdio) {
          options.stdio = ["ignore", "pipe", "pipe"]
        }
      }
      const child = spawn(command, args, options)
      if (child.stdout) {
        child.stdout.on("data", (data) => {
          resolve(data.toString())
        })
      }
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
