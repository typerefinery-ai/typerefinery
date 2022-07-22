import { Module, VuexModule } from "vuex-module-decorators"
import store from "../index"

@Module({
  name: "FlowMessage",
  store: store,
  dynamic: true,
  preserveState: localStorage.getItem("flowMessage") !== null,
})
export default class FlowMessage extends VuexModule {
  data = {}
}
