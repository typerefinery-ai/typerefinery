import axios from "axios"

export const restapi = axios.create({
  baseURL: "http://localhost:8000",
})
