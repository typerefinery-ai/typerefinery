import { createI18n } from "vue-i18n"
import { getModule } from "vuex-module-decorators"
import en from "./locales/en.json"
import hi from "./locales/hi.json"
import Settings from "@/store/Modules/Settings"
const settingsModule = getModule(Settings)

const messages = {
  en,
  hi,
}

// available locales
export const locales = ["en", "hi"]

const i18n = createI18n({
  locale: settingsModule.data.language || "en",
  fallbackLocale: process.env.VUE_APP_I18N_FALLBACK_LOCALE || "en",
  messages,
})

export default i18n
