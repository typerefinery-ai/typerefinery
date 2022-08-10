import { TypeDB } from "typedb-client"

export async function getDbList(host: string, port: number) {
  const client = TypeDB.coreClient(`${host}:${port}`)
  const databases = await client.databases.all()
  return databases
}
