const path = require("path")
const i18next = require("i18next")
const Backend = require("i18next-fs-backend")

const i18nextOptions = {
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

module.exports = i18next
