<template>
  <div class="user_info-wrapper">
    <div class="avatar-wrapper">
      <i class="pi pi-user"></i>
    </div>
    <div class="user_info">
      <div class="user_info-name">{{ username }}</div>
      <div class="user_info-email">{{ email }}</div>
    </div>
  </div>

  <div ref="username" class="field">
    <label for="username"> {{ $t("components.profile.username") }}</label>
    <InputText id="username" :value="username" @input="setUsername" />
  </div>
  <div ref="alias" class="field">
    <label for="alias">{{ $t("components.profile.alias") }}</label>
    <InputText id="alias" :value="alias" @input="setAlias" />
  </div>
  <div ref="email" class="field">
    <label for="email">{{ $t("components.profile.email") }}</label>
    <InputText id="email" :value="email" @input="setEmail" />
  </div>
</template>

<script>
  import InputText from "primevue/inputtext"
  import { getModule } from "vuex-module-decorators"
  import Auth from "@/store/Modules/Auth"
  const appAuth = getModule(Auth)

  export default {
    name: "Profile",
    components: { InputText },
    props: { field: { type: String, default: "" } },

    computed: {
      username() {
        return appAuth.username
      },
      alias() {
        return appAuth.alias
      },
      email() {
        return appAuth.email
      },
    },
    mounted() {
      if (this.field) {
        console.log(this.$refs)
        const el = this.$refs[this.field]
        console.log(el)
        el.scrollIntoView()
      }
    },
    methods: {
      setUsername(e) {
        return appAuth.setUsername(e.target.value)
      },
      setAlias(e) {
        return appAuth.setAliasname(e.target.value)
      },
      setEmail(e) {
        return appAuth.setEmail(e.target.value)
      },
    },
  }
</script>

<style>
  .p-float-label {
    margin-bottom: 10px;
  }

  input {
    width: 80%;
  }
</style>
