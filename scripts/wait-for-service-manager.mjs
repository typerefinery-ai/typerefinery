import dotenv from "dotenv"
import pkg from "../package.json" with { type: "json" }

dotenv.config()

const serviceManagerPort =
  process.env.SERVICE_MANAGER_PORT ?? pkg.env?.SERVICE_MANAGER_PORT ?? "30000"
const serviceManagerUrl = `http://localhost:${serviceManagerPort}/services/status`
const timeoutMs = 120000
const pollEveryMs = 1000
const startedAt = Date.now()

console.log(`Waiting for service manager at ${serviceManagerUrl}`)

while (Date.now() - startedAt < timeoutMs) {
  try {
    const response = await fetch(serviceManagerUrl)
    if (response.ok) {
      console.log(`Service manager is ready at ${serviceManagerUrl}`)
      process.exit(0)
    }
  } catch (error) {
    // Keep polling until the service dashboard is listening or the timeout expires.
  }

  await new Promise((resolve) => setTimeout(resolve, pollEveryMs))
}

console.error(`Timed out waiting for service manager at ${serviceManagerUrl}`)
process.exit(1)
