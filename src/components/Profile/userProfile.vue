<template>
  <Dialog
    v-model:visible="display"
    modal
    :header="$t(`profile.header`)"
    :breakpoints="{ '960px': '75vw', '640px': '90vw' }"
    :style="{ width: '50vw' }"
  >
    <div class="dialog-div">
      <div class="profile">
        <Avatar label="R" shape="circle" size="xlarge" />
      </div>
      <div class="content">
        <b
          ><label for="username">{{ $t("profile.name") }}: </label></b
        >
        {{ user }}<br />

        <b
          ><label for="email">{{ $t("profile.email") }}: </label></b
        >{{ email }} <br />
        <div class="alias">
          <span class="p-float-label">
            <InputText
              id="username"
              type="text"
              placeholder="Alias Name"
              @input="setHandle"
            />
          </span>
          <!-- <Button label="Set Name" style="margin-left: 20px;"  @click="setHandle" @input="updateMessage" /> -->
        </div>
      </div>
    </div>
  </Dialog>
</template>

<script>
import Dialog from "primevue/dialog"
import Avatar from "primevue/avatar"
import InputText from "primevue/inputtext"
import Button from "primevue/button"
import Auth from "@/store/Modules/Auth"

import { getModule } from "vuex-module-decorators"
// import { computed } from "vue"
const appAuth = getModule(Auth)

export default {
  name: "UserProfile",
  components: {
    Dialog,
    Avatar,
    InputText,
    Button,
  },
  data() {
    return {
      display: true,
    }
  },
  methods: {
    setHandle(e) {
      console.log(e.target.value)
      return appAuth.SET_ALIAS_NAME(e.target.value)
    },
  },
  computed: {
    //Getters
    user() {
      return appAuth.user
    },
    email() {
      return appAuth.email
    },
    //mutation
  },
}
</script>
<style lang="scss" scoped>
.dialog-div {
  display: flex;
  padding: 5px;
}
.alias {
  display: flex;
}
.content {
  margin-left: 30px;
  font-size: 20px;
}
</style>