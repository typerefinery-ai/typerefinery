import { app } from "electron"
import { existsSync, writeFile, mkdirSync } from "fs"
import path from "path"

// add ability to check if it is first install by checking if file exists in app folder
export function isFirstInstall() {
  const firstInstallFileFilePath = path.join(process.cwd(), "installed.txt")
  // if file exists, then it is not first install
  if (existsSync(firstInstallFileFilePath)) {
    return false
  }
  return true
}

// create file in app folder to indicate that it is not first install
export function createFirstInstallFile() {
  const firstInstallFileFilePath = path.join(process.cwd(), "installed.txt")
  writeFile(firstInstallFileFilePath, "", function (err) {
    if (err) {
      console.log(err)
    }
  })
}

export function resourcePath(...segments: string[]) {
  const filepath = app.isPackaged
    ? path.join(process.resourcesPath, "app", "assets", ...segments)
    : path.join(process.cwd(), "assets", ...segments)
  return makesure(filepath)
}

export function dataPath(...segments: string[]) {
  let filepath
  if (app) {
    filepath = path.join(app.getPath("userData"), ...segments)
  } else {
    filepath = path.join(process.cwd(), ...segments)
  }
  return makesure(filepath)
}

export function resourceBinary(...segments: string[]) {
  const filepath =
    process.platform === "win32"
      ? resourcePath("bin", ...segments) + ".exe"
      : resourcePath("bin", ...segments)
  return makesure(filepath)
}

function makesure(filepath: string): string {
  try {
    if (path.extname(filepath) === "") {
      mkdirSync(filepath, { recursive: true })
    } else {
      mkdirSync(path.dirname(filepath), { recursive: true })
    }
  } catch {
    // ignore
  } finally {
    // eslint-disable-next-line no-unsafe-finally
    return filepath
  }
}
