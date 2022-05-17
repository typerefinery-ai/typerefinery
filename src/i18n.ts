import { createI18n } from "vue-i18n/index"
import en from "./locales/en.json"
import hi from "./locales/hi.json"
import AppSettings from "@/store/Modules/AppSettings"
import { getModule } from "vuex-module-decorators"
const appSettings = getModule(AppSettings)

const messages = {
  en,
  hi,
}

// available locales
export const locales = ["en", "hi"]

const i18n = createI18n({
  locale: appSettings.language || "en",
  fallbackLocale: process.env.VUE_APP_I18N_FALLBACK_LOCALE || "en",
  messages,
})

export default i18n
