import { Module, VuexModule, Mutation } from "vuex-module-decorators"
import store from "../index"
import sampleData from "@/data/default.json"

@Module({
  name: "Settings",
  store: store,
  dynamic: true,
  preserveState: localStorage.getItem("settings") !== null,
})
export default class Settings extends VuexModule {
  data = sampleData.settings

  get getExperience() {
    return (id: string) => {
      const expIdx = this.data.listOfMenu.findIndex((el) => el.id === id)
      return this.data.listOfMenu[expIdx]
    }
  }

  // Mutations
  @Mutation
  setLanguage(text: string) {
    this.data.language = text
  }

  @Mutation
  setTheme(text: string) {
    this.data.theme = text
  }

  @Mutation
  toggleFocus() {
    this.data.focus = !this.data.focus
  }

  @Mutation
  resizeView() {
    this.data.viewResized = !this.data.viewResized
  }

  @Mutation
  toggleSettingsDialog() {
    this.data.settingsDialogVisible = !this.data.settingsDialogVisible
  }
  @Mutation
  toggleEditDialog() {
    this.data.editDialog = !this.data.editDialog
  }

  @Mutation
  setSettingPath(path: null) {
    this.data.settingPath = path
  }

  @Mutation
  openSettingsDialog(path: null) {
    this.data.settingsDialogVisible = true
    this.data.settingPath = path
  }
  //toggle experience
  @Mutation
  toggleExperimentalFeatures(id: string) {
    this.data.listOfMenu = this.data.listOfMenu.map((item) => {
      if (item.id === id) {
        item.enabled = !item.enabled
      }
      return item
    })
  }
  //Update store after edit
  @Mutation
  updateMenuitem(
    updatedValue:
      | {
          label: string
          icon: string
          to: string
          id: string
          type: string
          subMenu: {
            id: string
            icon: string
            to: string
            experimental: boolean
          }[]
          url?: undefined
          enabled?: undefined
        }
      | {
          label: string
          icon: string
          id: string
          url: string
          to: string
          type: string
          enabled: boolean
          subMenu: { id: string; to: string }[]
        }
      | {
          label: string
          id: string
          icon: string
          to: string
          url: string
          type: string
          enabled: boolean
          subMenu?: undefined
        }
  ) {
    const { id } = updatedValue
    const expIdx = this.data.listOfMenu.findIndex((el) => el.id === id)
    this.data.listOfMenu[expIdx] = updatedValue
  }
  //Add experience to the listOfMenu in store
  @Mutation
  addExprience(
    experience:
      | {
          label: string
          icon: string
          to: string
          id: string
          type: string
          subMenu: {
            id: string
            icon: string
            to: string
            experimental: boolean
          }[]
          url?: undefined
          enabled?: undefined
        }
      | {
          label: string
          icon: string
          id: string
          url: string
          to: string
          type: string
          enabled: boolean
          subMenu: { id: string; to: string }[]
        }
      | {
          label: string
          id: string
          icon: string
          to: string
          url: string
          type: string
          enabled: boolean
          subMenu?: undefined
        }
  ) {
    if (experience.type === "experimental") {
      this.data.listOfMenu.push(experience)
    }
    return this.data.listOfMenu
  }
  //update listOfMenu after orderlist save
  @Mutation
  updateList(
    orderedList: (
      | {
          label: string
          icon: string
          to: string
          id: string
          type: string
          subMenu: {
            id: string
            icon: string
            to: string
            experimental: boolean
          }[]
          url?: undefined
          enabled?: undefined
        }
      | {
          label: string
          icon: string
          id: string
          url: string
          to: string
          type: string
          enabled: boolean
          subMenu: { id: string; to: string }[]
        }
      | {
          label: string
          id: string
          icon: string
          to: string
          url: string
          type: string
          enabled: boolean
          subMenu?: undefined
        }
    )[]
  ) {
    this.data.listOfMenu = orderedList
  }
}
