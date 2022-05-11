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
        <p v-for="message in messages" :key="message.id" class="message" :class="{ 'message-out': message.author === 'Receiver', 'message-in': message.author !== 'Receiver' }">
      <span class="sender">
        {{message.author}}
      </span>
      <br :class="send">
      {{ message.body }}
        </p>
    
        <div class="iframe-container">
             <form @submit.prevent="sendMessage('in')" id="sender-form" class="message-inputtab">
                <div class="p-inputgroup">
                 <InputText v-model="Message" placeholder= "Type your message here..." id="sender-input" class="chat-inputs" />
                     <Button label="send" class="p-button-primary" type=" submit">
                         <div class="sendbutton">Send</div></Button>
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
  export default {
    name: "Maps",
    components: { MenuBar, MainMenu, InputText, Button },
    data() {
      return {
        showMainOverlayMenu: false,
         mainMenuVisible: true,
         Message: '',
         messages: 
            [
            {
              body: 'Hi',
              author: 'Sender'
            },
            {
               body: 'Welcome',
               author: 'Receiver'
             },
             ]  
      }
    },
    methods: {
      toggleMainMenu() {
        this.mainMenuVisible = !this.mainMenuVisible
      },
      sendMessage(direction) {
      if (!this.Message && !this.Message) {
        return
      }
       if (direction === 'in') {
        this.messages.push({body: this.Message, author: 'Sender'})
        this.SenderMessage = ''
        this.messages.push({body: this.Message, author: 'Receiver',})
        this.Message = ''
      } else {
        alert('something went wrong')
      }
      Vue.nextTick(() => {
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
