<template>
  <div class="tabview">
    <div class="tab">
      <button
        class="tablinks"
        :class="{ active: type == 'welcome' }"
        @click="openTab($event, 'welcome')"
      >
        Welcome
      </button>
      <button
        class="tablinks"
        :class="{ active: type == 'intro' }"
        @click="openTab($event, 'intro')"
      >
        Introduction
      </button>
      <button
        class="tablinks"
        :class="{ active: type == 'services' }"
        @click="openTab($event, 'services')"
      >
        Services
      </button>
      <button
        class="tablinks"
        :class="{ active: type == 'docs' }"
        @click="openTab($event, 'docs')"
      >
        Documentation
      </button>
    </div>
    <div class="tabcontent">
      <welcome v-if="type === 'welcome'" />
      <introduction v-if="type === 'intro'" />
      <docs v-if="type === 'docs'"></docs>
      <services v-if="type === 'services'"></services>
    </div>
  </div>
</template>
<script>
  import Welcome from "@/components/InitialTabSection/Welcome.vue"
  import Introduction from "@/components/InitialTabSection/Intro.vue"
  import Docs from "@/components/InitialTabSection/Docs.vue"
  import Services from "@/components/InitialTabSection/Services.vue"
  export default {
    name: "InitialScreen",
    components: {
      Welcome,
      Introduction,
      Docs,
      Services,
    },
    data() {
      return {
        tabcontent: "",
        tablinks: "",
        activeTab: false,
        type: "welcome",
        isActive: false,
      }
    },
    methods: {
      openTab(evt, tabName) {
        this.activeTab = true
        const tabs = ["welcome", "intro", "services", "docs"]
        if (tabs.includes(tabName)) {
          this.type = tabName
        }
      },
    },
  }
</script>
<style scoped lang="scss">
  /* Style the tab */
  .tabview .tab {
    font-family: Roboto, Helvetica Neue Light, Helvetica Neue, Helvetica, Arial,
      Lucida Grande, sans-serif;
    display: flex;
    flex-direction: column;
    justify-content: center;
    float: left;
    border: 1px solid #ccc;
    background-color: #3b82f6;
    width: 30%;
    height: 100vh;
  }

  /* Style the buttons that are used to open the tab content */
  .tab button {
    font-family: Roboto, Helvetica Neue Light, Helvetica Neue, Helvetica, Arial,
      Lucida Grande, sans-serif;
    margin-top: 1;
    display: block;
    background-color: inherit;
    color: white;
    padding: 22px 16px;
    width: 100%;
    border: none;
    outline: none;
    text-align: left;
    cursor: pointer;
    transition: 0.3s;
  }

  /* Change background color of buttons on hover */
  .tab button:hover {
    background-color: #ddd;
    color: black;
  }
  .tabLinks {
    height: 2vh;
  }
  /* Create an active/current "tab button" class */
  .tab button.active {
    background-color: #2f68c4;
    color: white;
  }

  /* Style the tab content */
  .tabview .tabcontent {
    display: flex;
    float: left;
    width: 70%;
    padding: 10px;
    height: 100vh;
    color: black;
    background: white;
    font-family: Roboto, Helvetica Neue Light, Helvetica Neue, Helvetica, Arial,
      Lucida Grande, sans-serif;
  }
</style>
