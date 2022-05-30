<template>
  <PageMenubar />
  <div class="login">
    <img class="logo" alt="app logo" src="/assets/logo.png" />
    <h2>Login to Proceed...</h2>
    <br />
    <div class="input-field">
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

    <Button class="p-button" label="Submit" v-on:click="login"
      ><span class="submit-button">Login</span></Button
    >
    <p>
      <router-link to="/sign-up">Sign Up</router-link>
    </p>
  </div>
</template>

<script>
import InputText from "primevue/inputtext"
import Password from "primevue/password"
import Button from "primevue/button"
import "primevue/resources/themes/md-light-indigo/theme.css" //these two imported css file is added here because primevue was not working properly without it,
import "primevue/resources/primevue.min.css"
import PageMenubar from "./PageMenubar.vue"
// import axios from "axios"
export default {
  name: "Login",
  components: {
    InputText,
    Password,
    Button,
    PageMenubar,
  },
  data() {
    return {
      email: "",
      password: "",
    }
  },
  methods: {
    async login() {
      /* commented part use for db connection.. */

      // let result = await axios.get(
      //     `http://localhost:4000/user?email=${this.email}&password=${this.password}`
      // )
      //  if(result.status==200 && result.data.length>0)
      //     {

      //         localStorage.setItem("user-info",JSON.stringify(result.data[0]))
      //         this.$router.push("/home/project")

      //     }

      // console.warn(result);
      this.$router.push("/home/project")
    },
  },
  // mounted()
  //   {
  //       let user =localStorage.getItem('user-info')
  //       if(user)
  //       {
  //           this.$router.push("/home/project")
  //       }
  //   }
}
</script>

<style lang="scss">
@import "./Pages.scss";
</style>