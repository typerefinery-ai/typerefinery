/* eslint-disable @typescript-eslint/no-explicit-any */
import { Module, VuexModule, Mutation, Action } from "vuex-module-decorators"
import store from "../index"
import axios from "@/utils/restapi"

@Module({
  name: "Themes",
  store: store,
  dynamic: true,
  preserveState: localStorage.getItem("themes") !== null,
})
export default class Connections extends VuexModule {
  data: any = { list: [] }

  get getGlobalThemes() {
    return this.data.list
  }
  @Mutation
  addGlobalThemes(themes) {
    this.data.list = themes
  }
  @Mutation
  addGlobalTheme(theme) {
    if (theme.type === "theme") this.data.list.push(theme)
  }
  // @Action
  // async addNewThemeGlobal(themeData) {
  //   // const themeDataParsed = JSON.parse(themeData)
  //   console.log("updatethem", themeData)
  //   const { projectIdx, data } = themeData
  //   // const themesGetters = this.context.getters["getTheme"]
  //   // const themes = themesGetters(parentIdx)
  //   const payload = {
  //     id: data.id,
  //     projectid: null,
  //     scope: projectIdx == -1 ? "global" : "local",
  //     label: data.label,
  //     type: data.type,
  //     data: data.data,
  //     icon: data.icon,
  //     themeid: data.themeid,
  //     description: data.description,
  //     theme: data.theme,
  //     // [themeDataParsed.field]: themeDataParsed.value,
  //   }
  //   try {
  //     await restapi.post(`/datastore/theme/`, payload)
  //     // const output = {
  //     //   ...themeData,
  //     //   projectIdx: themeData.parentIdx,
  //     // }
  //     this.context.commit("addGlobalTheme", themeData)
  //   } catch (err) {
  //     console.log(err)
  //   }
  // }
  // @Mutation
  // editGlobalConnection(connectionData) {
  //   const { connectionIdx, data } = connectionData
  //   const connections = JSON.parse(JSON.stringify(this.data.list))
  //   connections[connectionIdx] = data
  //   this.data.list = connections
  // }
  @Mutation
  updateGlobalTheme(themeData) {
    const { themeIdx, data } = themeData
    const themes = JSON.parse(JSON.stringify(this.data))
    themes.list[themeIdx] = data
    this.data = themes
  }

  @Mutation
  deleteThemeGlobally(data) {
    const themes = JSON.parse(JSON.stringify(this.data.list))
    const themeIdx = themes.findIndex((el) => el.id == data.id)
    themes.splice(themeIdx, 1)
    this.data.list = themes
  }

  @Action({ rawError: true })
  async createInitialTheme() {
    try {
      const theme = {
        themeid: "defaulttheme",
        id: "defaulttheme",
        label: "Global Theme",
        projectid: null,
        scope: "global",
        type: "theme",
        data: "",
        icon: "",
        description: "",
        theme: `{\n  "attribute": {\n    "colorlist": "Oranges",\n    "cindex": 7,\n    "tcolorlist": "Greys",\n    "tindex": 0\n  },\n  "entity": {\n    "colorlist": "Blue-Green",\n    "cindex": 7,\n    "tcolorlist": "Greys",\n    "tindex": 0\n  },\n  "relation": {\n    "colorlist": "Blue-Green",\n    "cindex": 6,\n    "tcolorlist": "Greys",\n    "tindex": 7\n  },\n  "shadow": {\n    "colorlist": "Yellows",\n    "cindex": 2,\n    "tcolorlist": "Greys",\n    "tindex": 7\n  }\n}`,
      }
      await restapi.post(`/datastore/theme`, theme)
      this.context.commit("addGlobalTheme", theme)
    } catch (error) {
      console.log(error)
    }
  }

  @Action({ rawError: true })
  async getInitialThemes() {
    try {
      const res = await restapi.get("/datastore/theme")
      const data = res.data
        .filter((el) => el.scope === "global")
        .map((el) => ({ ...el, id: el.themeid }))
      // console.log("initialstoredata", data)
      this.context.commit("addGlobalThemes", data)
    } catch (err) {
      console.log(err)
    }
  }
  @Action({ rawError: true })
  async setGlobalTheme({ data, themeIdx }) {
    const themes = this.context.getters["getGlobalThemes"]
    const theme = themes[themeIdx]
    const payload = { ...theme, ...data }
    try {
      await restapi.put(`/datastore/theme/${data.id}`, payload)
      this.context.commit("updateGlobalTheme", { data, themeIdx })
    } catch (err) {
      console.log(err)
    }
  }
  @Action({ rawError: true })
  async deleteGlobalTheme(data) {
    const themes = this.context.getters["getGlobalThemes"]
    const theme = themes.find((el) => el.id === data.id)
    const payload = { ...theme, ...data }
    try {
      await restapi.delete(`/datastore/theme/${data.id}`, payload)
      this.context.commit("deleteThemeGlobally", data)
    } catch (err) {
      console.log(err)
    }
  }
}
