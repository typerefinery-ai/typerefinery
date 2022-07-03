// import { get } from "node:http"
import * as winston from "winston"
const { combine, timestamp, label, json } = winston.format

export class Logger {
  readonly #service: string
  readonly #logger: winston.Logger
  readonly #logsDir: string
  readonly #isDev: boolean

  constructor(logsDir: string, service: string) {
    this.#service = service
    this.#logsDir = logsDir
    this.#isDev = process.env.NODE_ENV !== "production"

    this.#logger = winston.createLogger({
      level: "info",
      format: combine(timestamp(), label({ label: this.#service }), json()),
      defaultMeta: { service: service },
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({
          dirname: this.#logsDir,
          filename: "combined.log",
        }),
      ],
    })
  }

  forService(service: string) {
    return new Logger(this.#logsDir, service)
  }

  log(...args: any[]) {
    this.#logger.log("info", JSON.stringify(args))
    // if (this.#isDev) {
    //   console.log(...args)
    // }
  }

  error(...args: any[]) {
    this.#logger.log("error", JSON.stringify(args))
    // if (this.#isDev) {
    //   console.log(...args)
    // }
  }

  warn(...args: any[]) {
    this.#logger.log("warn", JSON.stringify(args))
    // if (this.#isDev) {
    //   console.log(...args)
    // }
  }
}
