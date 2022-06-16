import * as config from "../../../package.json"

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
