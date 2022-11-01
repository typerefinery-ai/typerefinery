import { createApp } from "vue"
import PrimeVue from "primevue/config"
import InputText from "primevue/inputtext"
import Tooltip from "primevue/tooltip"
import i18n from "./i18n"
import App from "./App.vue"
import router from "./router"
import store from "./store"
import { loadFonts } from "./plugins/webfontloader"
import Vuelidate from "vuelidate"
import ConfirmationService from "primevue/confirmationservice"
import ToastService from "primevue/toastservice"

loadFonts()

const app = createApp(App)
app.directive("vuelidate", Vuelidate)
app.use(i18n)
app.use(router)
app.use(store)
app.use(PrimeVue)
app.directive("tooltip", Tooltip)
app.use(ConfirmationService)
app.use(ToastService)
app.mount("#app")
app.component("InputText", InputText)
