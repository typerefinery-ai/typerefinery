<template>
  <div class="app">
    <div class="header" :class="{ 'menu-hidden': !mainMenuVisible }">
      <main-menu
        :main-menu-visible="mainMenuVisible"
        @toggle="toggleMainMenu"
      />
      <menu-bar :menu-bar-visible="mainMenuVisible" @toggle="toggleMainMenu" />
    </div>
    <!-- content -->
    <div class="chatpage">
      <div
        v-for="message in messages"
        :key="message.id"
        class="message"
        :class="{
          'message-out': message.user === 'To',
          'message-in': message.user !== 'To',
        }"
      >
        <span class="sender">
          {{ message.user }}
        </span>
        <br :class="send" />
        {{ message.body }}
        <br />
        <!-- <div class="timespan"> -->
        <div class="time">
          {{ new Date().toString().substring(16, 21) }}
          <check-icon class="checkicon" />
          <!-- </div> -->
        </div>
      </div>
      <div class="iframe-container">
        <form
          id="sender-form"
          class="message-inputtab"
          @submit.prevent="sendMessage('from')"
        >
          <div class="p-inputgroup">
            <InputText
              id="sender-input"
              v-model="Message"
              :placeholder="$t(`components.chat.messageplaceholder`)"
              type="message"
              class="chat-inputs"
            />
            <Button label="send" class="p-button-primary" type=" submit">
              <div class="sendbutton">
                {{ $t("components.chat.send") }}
              </div></Button
            >
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import MenuBar from "@/components/MenuBar.vue"
import MainMenu from "@/components/MainMenu.vue"
import InputText from "primevue/inputtext"
import Button from "primevue/button"
import CheckIcon from "vue-material-design-icons/CheckAll.vue"
export default {
  name: "Chat",
  components: { MenuBar, MainMenu, InputText, Button, CheckIcon },
  data() {
    return {
      showMainOverlayMenu: false,
      mainMenuVisible: true,
      Message: "",
      messages: [],
    }
  },
  methods: {
    timestamp: Date.now(),
    toggleMainMenu() {
      this.mainMenuVisible = !this.mainMenuVisible
    },
    sendMessage(direction) {
      if (!this.Message && !this.Message) {
        return
      }

      if (direction === "from") {
        this.messages.push({ body: this.Message, user: "From" })
        this.SenderMessage = ""
        this.messages.push({ body: this.Message, user: "To" })
        this.Message = ""
      } else {
        alert(this.$t("components.project.error"))
      }

      //TODO: this needs to scroll to last messasge that was received.
      this.$nextTick(() => {
        let messageDisplay = this.$refs.chatArea
        messageDisplay.scrollTop = messageDisplay.scrollHeight
      })
    },
  },
}
</script>

<style lang="scss" scoped>
@import "./style.scss";
</style>
