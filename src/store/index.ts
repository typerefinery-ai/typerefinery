/* eslint-disable @typescript-eslint/no-explicit-any */
import { createStore } from "vuex"
import VuexPersistence from "vuex-persist"

const Algorithms = new VuexPersistence({
  key: "algorithms",
  storage: window.localStorage,
  reducer: (state: any) => ({ Algorithms: state.Algorithms }),
})

const AppData = new VuexPersistence({
  key: "appData",
  storage: window.localStorage,
  reducer: (state: any) => ({ AppData: state.AppData }),
})

const Auth = new VuexPersistence({
  key: "auth",
  storage: window.localStorage,
  reducer: (state: any) => ({ Auth: state.Auth }),
})

const Connections = new VuexPersistence({
  key: "connections",
  storage: window.localStorage,
  reducer: (state: any) => ({ Connections: state.Connections }),
})

const Projects = new VuexPersistence({
  key: "projects",
  storage: window.localStorage,
  reducer: (state: any) => ({ Projects: state.Projects }),
})

const Services = new VuexPersistence({
  key: "services",
  storage: window.localStorage,
  reducer: (state: any) => ({ Services: state.Services }),
})

const Settings = new VuexPersistence({
  key: "settings",
  storage: window.localStorage,
  reducer: (state: any) => ({ Settings: state.Settings }),
})

const Transformers = new VuexPersistence({
  key: "transformers",
  storage: window.localStorage,
  reducer: (state: any) => ({ Transformers: state.Transformers }),
})

export default createStore({
  plugins: [
    Algorithms.plugin,
    AppData.plugin,
    Auth.plugin,
    Connections.plugin,
    Projects.plugin,
    Services.plugin,
    Settings.plugin,
    Transformers.plugin,
  ],
})
