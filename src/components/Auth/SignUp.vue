<template>
  <div class="menu-bar">
    <window-controls v-if="isElectron" />
  </div>
  <div class="sign-up">
    <img class="logo" alt="app logo" src="/assets/logo.png" />
    <h2>Sign Up to Proceed...</h2>
    <br />

    <div class="register">
      <div class="input-field">
        <div class="email-input">
          <span class="p-float-label">
            <InputText
              id="email1"
              v-model="name"
              type="text"
              class="w-full mb-3"
            />
            <label for="inputtext">Enter Name</label>
          </span>
        </div>
        <div class="email-input">
          <span class="p-float-label">
            <InputText
              id="email1"
              v-model="email"
              type="text"
              class="w-full mb-3"
            />
            <label for="inputtext">Enter Email</label>
          </span>
        </div>
        <span class="p-float-label">
          <InputText
            id="email1"
            v-model="password"
            type="text"
            class="w-full mb-3"
          />
          <label for="inputtext">Enter Password</label>
        </span>
      </div>
      <br />
      <Button label="Submit" @click="login">
        <span class="submit-button">SignUp</span>
      </Button>
      <p>
        <router-link to="/">Login</router-link>
      </p>
    </div>
  </div>
</template>

<script>
  import InputText from "primevue/inputtext"
  import Password from "primevue/password"
  import Button from "primevue/button"
  import WindowControls from "@/components/Menu/WindowControls.vue"
  // import axios from "axios"
  export default {
    name: "SignUp",
    components: {
      InputText,
      Password,
      Button,
      WindowControls,
    },
    components: {},
    data() {
      return {
        name: "",
        email: "",
        password: "",
      }
    },
    methods: {
      async signUp() {
        /* commented part use for db connection.. */

        //     let result = await restapi.post("http://localhost:4000/user",{
        //     email:this.email,
        //    password:this.password,
        //    name:this.name
        //     })
        // console.warn(result);
        // if(result.status==201)
        // {

        //     localStorage.setItem("user-info",JSON.stringify(result.data))
        //     this.$router.push({name:'home'})
        // }
        this.$router.push({ name: "home" })
      },
    },
    //   mounted() {
    // let user = localStorage.getItem("user-info")
    // if (user) {
    //   this.$router.push({ name: "home" })
    // }
    //   },
  }
</script>

<style lang="scss">
  @import "./Pages.scss";
</style>
