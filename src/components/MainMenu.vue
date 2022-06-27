<template>
  <div class="main-menu-wrapper" @mouseleave="closeMainMenu">
    <TabMenu :model="items" @mouseover="openMainMenu"> </TabMenu>

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
          <i :class="item.icon"></i>
          {{ $t(`components.project.${item.id}`) }}
        </div>
        <Projects v-if="projectdialog" @close="closemodal" />
        <NewConnections v-if="connectionDialog" @close="connectionclosemodal" />
        <NewQuery v-if="queryDialog" @close="queryclosemodal" />
        <NewTransformer
          v-if="transformerDialog"
          @close="transformerclosemodal"
        />
      </div>
      <!-- icon -->
      <div
        v-if="mainMenuVisible"
        v-tooltip="$t(`tooltips.hide-menu-bar`)"
        class="icon-wrapper hover:text-primary"
        @click="toggleView"
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
  import NewTransformer from "@/components/Dialog/NewTransformer.vue"
  import AppSettings from "@/store/Modules/AppSettings"
  import { getModule } from "vuex-module-decorators"
  const appSettings = getModule(AppSettings)
  import Project from "@/store/Modules/Projects"
  const appProjects = getModule(Project)
  export default {
    name: "MainMenu",
    components: { TabMenu, Projects, NewConnections, NewQuery, NewTransformer },
    props: {
      mainMenuVisible: { type: Boolean, required: true },
    },
    emits: ["toggle"],
    data() {
      return {
        showSubMenuOverlay: false,
        projectdialog: false,
      }
    },
    computed: {
      items() {
        return [
          {
            label: this.$t("components.mainmenu.project"),
            icon: "pi pi-briefcase",
            to: "/home/project",
            type: "regular",
            subMenu: [
              { id: "new-project", icon: "pi pi-book", to: "#" },
              { id: "new-query", icon: "pi pi-file", to: "#" },
              { id: "new-connection", icon: "pi pi-server", to: "#" },
              { id: "new-transformer", icon: "pi pi-cog", to: "#" },
            ],
          },
          {
            label: this.$t("components.mainmenu.charts"),
            icon: "pi pi-chart-pie",
            to: "/home/charts",
            type: "regular",
            subMenu: [
              { id: "load-data", to: "#" },
              { id: "load-links", to: "#" },
            ],
          },
          {
            label: this.$t("components.mainmenu.maps"),
            icon: "pi pi-sitemap",
            to: "/home/maps",
            type: "regular",

            subMenu: [{ id: "load-data", to: "#" }],
          },
          {
            label: this.$t("components.mainmenu.chats"),
            icon: "pi pi-comment",
            to: "/home/chats",
            type: "experimental",
            enabled: appSettings.featureStatus("chat"),
          },
          {
            label: this.$t("components.mainmenu.editor"),
            icon: "pi pi-code",
            to: "/home/editor",
            type: "experimental",
            enabled: appSettings.featureStatus("editor"),
          },
        ].filter((el) => {
          if (el.type === "regular") return el
          else return el.enabled
        })
      },
      subItems() {
        return this.items.filter((el) => el.to == this.$route.path)[0].subMenu
      },
      connectionDialog() {
        return appProjects.connectionDialog
      },
      transformerDialog() {
        return appProjects.transformerDialog
      },
      queryDialog() {
        return appProjects.queryDialog
      },
    },

    methods: {
      closemodal() {
        this.projectdialog = false
      },
      connectionclosemodal() {
        appProjects.toggleConnectionDialog()
      },
      queryclosemodal() {
        appProjects.toggleQueryDialog()
      },
      transformerclosemodal() {
        appProjects.toggleTransformerDialog()
      },
      handleProject(id) {
        if (id === "new-project") {
          this.projectdialog = !this.projectdialog
        }
        if (id === "new-connection") {
          appProjects.toggleConnectionDialog()
        }
        if (id === "new-query") {
          this.querydialog = !this.querydialog
          appProjects.toggleQueryDialog()
        }
        if (id === "new-transformer") {
          appProjects.toggleTransformerDialog()
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

      toggleView() {
        this.$emit("toggle")
        appSettings.resizeView()
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
