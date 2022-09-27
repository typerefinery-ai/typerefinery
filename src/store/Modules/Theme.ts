/* eslint-disable @typescript-eslint/no-explicit-any */
import { Module, VuexModule, Mutation, Action } from "vuex-module-decorators"
import store from "../index"
import axios from "axios"

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
  addGlobalTheme(themeData: { data: any }) {
    this.data.list.push(themeData)
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
  //     await axios.post(`http://localhost:8000/datastore/theme/`, payload)
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
    const { themeIdx, field, value } = themeData
    const themes = JSON.parse(JSON.stringify(this.data))
    themes.list[themeIdx][field] = value
    this.data = themes
  }
  @Action
  async getInitialThemes() {
    try {
      const res = await axios.get("http://localhost:8000/datastore/theme")
      const data = res.data
        .filter((el) => el.scope === "global")
        .map((el) => ({ ...el, id: el.themeid }))
      // console.log("initialstoredata", data)
      this.context.commit("addGlobalThemes", data)
    } catch (err) {
      console.log(err)
    }
  }
  @Action
  async setGlobalTheme(data: {
    themeIdx: string | number
    field: any
    value: any
    id: any
  }) {
    const themes = this.context.getters["getGlobalThemes"]
    const theme = themes[data.themeIdx]
    const payload = {
      id: theme.id,
      label: theme.label,
      projectid: null,
      scope: "global",
      type: "theme",
      data: "string",
      icon: theme.icon,
      themeid: theme.id,
      description: theme.description,
      theme: theme.themecode,
      [data.field]: data.value,
    }
    try {
      await axios.put(
        `http://localhost:8000/datastore/theme/${data.id}`,
        payload
      )
      this.context.commit("updateGlobalTheme", data)
    } catch (err) {
      console.log(err)
    }
  }
}
