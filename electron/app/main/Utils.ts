import * as config from "../../../package.json"
import portfinder from "portfinder"

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
