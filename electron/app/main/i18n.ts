import path from "path"
import i18next from "i18next"
import Backend from "i18next-node-fs-backend"

export const i18nextOptions = {
  lng: "en",
  fallbackLng: "en",
  preload: ["en", "hi"],
  ns: ["translation"],
  defaultNS: "translation",
  backend: {
    loadPath: path.join(__dirname, "locales/{{lng}}/{{ns}}.json"),
  },
}

i18next.use(Backend).init(i18nextOptions, (err, t) => {
  if (err) return console.log("something went wrong loading", err)
})

export default i18next
