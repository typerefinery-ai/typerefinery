<template>
  <div class="main-menu-wrapper" @mouseleave="closeMainMenu">
    <TabMenu :model="items" @mouseover="openMainMenu" />

    <div
      class="main-submenu"
      :class="{ overlay: !mainMenuVisible, 'hide-it': !showSubMenuOverlay }"
    >
      <div class="submenu-item-wrapper">
        <div
          v-for="item in subItems"
          :key="item.id"
          class="main-submenu--item hover:text-primary cursor-pointer"
            @click="handleProject(item.id)"
        >
         <Projects v-if="projectdialog" @close="closemodal"/>
         <NewConnections v-if="connectiondialog" @close="connectionclosemodal"/>
<<<<<<< Updated upstream
          <NewQuery v-if="querydialog" @close="queryclosemodal"/>
=======
          <NewTransformer v-if="transformerdialog" @close="transformernclosemodal"/>
>>>>>>> Stashed changes
          {{ $t(`components.project.${item.id}`) }}
        </div>
      </div>
      <!-- icon -->
      <div
        v-if="mainMenuVisible"
        v-tooltip="$t(`tooltips.hide-menu-bar`)"
        class="icon-wrapper hover:text-primary"
        @click="$emit('toggle')"
      >
        <i class="pi pi-angle-double-up"></i>
      </div>
    </div>
  </div>
</template>

<script>
import TabMenu from "primevue/tabmenu"
import Projects from "@/components/Dialog/Projects.vue"
import NewConnections from "@/components/Dialog/Newconnections.vue"
import NewQuery from "@/components/Dialog/NewQueries.vue"
export default {
  name: "MainMenu",
  components: { TabMenu,Projects,NewConnections,NewQuery },
  props: {
    mainMenuVisible: { type: Boolean, required: true },
  },
  emits: ["toggle"],
  data() {
    return {
      showSubMenuOverlay: false,
      projectdialog:false,
      connectiondialog:false,
      querydialog: false,
    }
  },
  computed: {
    items() {
      return [
        {
          label: this.$t("components.mainmenu.project"),
          icon: "pi pi-briefcase",
          to: "/home/project",
          subMenu: [
            { id: "new-project", to: "#" },
            { id: "new-query", to: "#" },
            { id: "new-connection", to: "#" },
             { id: "new-transformer", to: "#" },
            
          ],
        },
        {
          label: this.$t("components.mainmenu.charts"),
          icon: "pi pi-chart-pie",
          to: "/home/charts",
          subMenu: [
            { id: "load-data", to: "#" },
            { id: "load-links", to: "#" },
          ],
        },
        {
          label: this.$t("components.mainmenu.maps"),
          icon: "pi pi-sitemap",
          to: "/home/maps",
          subMenu: [{ id: "load-data", to: "#" }],
        },
        {
          label: this.$t("components.mainmenu.chats"),
          icon: "pi pi-comment",
          to: "/home/chats",
          subMenu: [{ id: "load-data", to: "#" }],
        },
        {
          label: this.$t("components.mainmenu.editor"),
          icon: "pi pi-code",
          to: "/home/editor",
        },
      ]
    },

    subItems() {
      return this.items.filter((el) => el.to == this.$route.path)[0].subMenu
    },
  },

  methods: {
    closemodal(){
        this.projectdialog=false
      },
      connectionclosemodal(){
        this.connectiondialog=false
      },
      queryclosemodal() {
        this.querydialog = false
      },
     handleProject(id){     
       if(id==='new-project')
       {
         this.projectdialog=!this.projectdialog
       }
        if(id==='new-connection'){       
         this.connectiondialog=!this.connectiondialog
       }
        if (id === "new-query") {
          //  { console.log(appProjects.getConnections)
          this.querydialog = !this.querydialog
        }
      },
    handleRoutes(route) {
      const url = `/home/${route}`
      this.$router.push(url)
    },
    openMainMenu() {
      if (!this.mainMenuVisible) {
        this.showSubMenuOverlay = true
      }
    },

    closeMainMenu() {
      if (this.showSubMenuOverlay) {
        this.showSubMenuOverlay = false
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.main-submenu {
  display: flex;
  padding: 12px 10px;
  align-items: center;

  &.overlay {
    position: absolute;
    left: 0;
    right: 0;
    width: 100%;
    background: var(--surface-a);
    z-index: 2;
    box-shadow: 1px 3px 4px rgb(0 0 0 / 10%);

    &.hide-it {
      display: none;
    }
  }

  .submenu-item-wrapper {
    display: flex;
    align-items: center;
  }

  &--item {
    line-height: 1;
    font-size: 15px;
    padding: 0 15px;

    &:not(:last-of-type) {
      border-right: 1px solid var(--surface-border);
    }
  }

  .icon-wrapper {
    cursor: pointer;
    margin-left: auto;
    display: flex;
  }
}
</style>
