<template>
  <Dialog
    v-model:visible="display"
    modal
    :header="$t(`profile.header`)"
    :breakpoints="{ '960px': '75vw', '640px': '90vw' }"
  >
    <div class="dialog-div">
      <div class="profile">
        <Avatar label="R" shape="circle" size="xlarge" />
      </div>
      <div>
        <div class="content">
          <label for="username">{{ $t("profile.name") }}: </label><br />
          <div>
            <span class="p-float-label">
              <InputText
                id="username"
                type="text"
                placeholder="username"
                :value="user"
                @input="setUsername"
              />
            </span>
          </div>
        </div>
        <div class="content">
          <label for="alias">{{ $t("profile.alias") }}: </label><br />
          <div>
            <span class="p-float-label">
              <InputText
                id="alias"
                type="text"
                placeholder="Alias Name"
                :value="alias"
                @input="setAliasname"
              />
            </span>
          </div>
        </div>
        <div class="content">
          <label for="email">{{ $t("profile.email") }}: </label><br />
          <div>
            <span class="p-float-label">
              <InputText
                id="email"
                type="text"
                placeholder="Email"
                :value="email"
                @input="setEmail"
              />
            </span>
          </div>
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
      setUsername(e) {
        return appAuth.setUsername(e.target.value)
      },
      setAliasname(e) {
        return appAuth.setAliasname(e.target.value)
      },
      setEmail(e) {
        return appAuth.setEmail(e.target.value)
      },
    },
    computed: {
      user() {
        return appAuth.username
      },
      email() {
        return appAuth.email
      },
      alias() {
        return appAuth.alias
      },
    },
  }
</script>
<style lang="scss" scoped>
  .dialog-div {
    display: flex;
    padding: 5px;
  }

  .content {
    margin-left: 30px;
    font-size: 20px;
    //   display: flex;
    padding: 10px;
  }
</style>
