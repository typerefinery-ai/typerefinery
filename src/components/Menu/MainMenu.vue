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
        <NewTheme v-if="themeDialog" @close="themeclosemodal" />
        <NewTransformer
          v-if="transformerDialog"
          @close="transformerclosemodal"
        />
        <NewAlgorithm v-if="algorithmDialog" @close="algorithmclosemodal" />
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
  import { getModule } from "vuex-module-decorators"
  import TabMenu from "primevue/tabmenu"
  import Projects from "@/components/Dialog/NewProject.vue"
  import NewConnections from "@/components/Dialog/NewConnection.vue"
  import NewQuery from "@/components/Dialog/NewQuery.vue"
  import NewTransformer from "@/components/Dialog/NewTransformer.vue"
  import NewAlgorithm from "@/components/Dialog/NewAlgorithm.vue"
  import NewTheme from "@/components/Dialog/NewTheme.vue"
  import Settings from "@/store/Modules/Settings"
  import AppData from "@/store/Modules/AppData"
  import Themes from "@/store/Modules/Theme"
  const themesModule = getModule(Themes)
  const settingsModule = getModule(Settings)
  const appDataModule = getModule(AppData)
  export default {
    name: "MainMenu",
    components: {
      TabMenu,
      Projects,
      NewConnections,
      NewQuery,
      NewTransformer,
      NewAlgorithm,
      NewTheme,
    },
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
      value() {
        return themesModule.getGlobalThemes
      },
      items() {
        return [
          {
            label: this.$t("components.mainmenu.project"),
            icon: "pi pi-briefcase",
            to: "/home/project",
            type: "regular",
            subMenu: [
              {
                id: "new-project",
                icon: "pi pi-book",
                to: "#",
                experimental: false,
              },
              {
                id: "new-query",
                icon: "pi pi-file",
                to: "#",
                experimental: false,
              },
              {
                id: "new-connection",
                icon: "pi pi-server",
                to: "#",
                experimental: false,
              },
              {
                id: "new-theme",
                icon: "pi pi-server",
                to: "#",
                experimental: false,
              },
              {
                id: "new-transformer",
                icon: "pi pi-cog",
                to: "#",
                experimental: true,
              },
              {
                id: "new-algorithm",
                icon: "pi pi-cog",
                to: "#",
                experimental: true,
              },
            ],
          },
          // {
          //   label: this.$t("components.mainmenu.workflow"),
          //   icon: "pi pi-briefcase",
          //   to: "/workflow",
          //   type: "regular",
          //   subMenu: [],
          // },
          {
            label: this.$t("components.mainmenu.charts"),
            icon: "pi pi-chart-pie",
            to: "/home/charts",
            type: "experimental",
            enabled: settingsModule.getFeatureStatus("charts"),
            subMenu: [
              { id: "load-data", to: "#" },
              { id: "load-links", to: "#" },
            ],
          },
          {
            label: this.$t("components.mainmenu.maps"),
            icon: "pi pi-sitemap",
            to: "/home/maps",
            type: "experimental",
            enabled: settingsModule.getFeatureStatus("maps"),
            subMenu: [{ id: "load-data", to: "#" }],
          },
          {
            label: this.$t("components.mainmenu.chats"),
            icon: "pi pi-comment",
            to: "/home/chats",
            type: "experimental",
            enabled: settingsModule.getFeatureStatus("chat"),
          },
          {
            label: this.$t("components.mainmenu.editor"),
            icon: "pi pi-code",
            to: "/home/editor",
            type: "experimental",
            enabled: settingsModule.getFeatureStatus("editor"),
          },
        ].filter((el) => {
          if (el.type === "regular") return el
          else return el.enabled
        })
      },
      subItems() {
        return this.items
          .filter((el) => el.to == this.$route.path)[0]
          .subMenu.filter((el) => !el.experimental)
      },
      connectionDialog() {
        return appDataModule.data.connectionDialog
      },
      transformerDialog() {
        return appDataModule.data.transformerDialog
      },
      queryDialog() {
        return appDataModule.data.queryDialog
      },
      themeDialog() {
        return appDataModule.data.themeDialog
      },
      algorithmDialog() {
        return appDataModule.data.algorithmDialog
      },
    },

    methods: {
      closemodal() {
        this.projectdialog = false
      },
      connectionclosemodal() {
        appDataModule.toggleConnectionDialog()
      },
      queryclosemodal() {
        appDataModule.toggleQueryDialog()
      },
      themeclosemodal() {
        appDataModule.toggleThemeDialog()
        console.log("computed", this.value)
        console.log("store data theme", themesModule)
      },
      transformerclosemodal() {
        appDataModule.toggleTransformerDialog()
      },
      algorithmclosemodal() {
        appDataModule.toggleAlgorithmDialog()
      },
      handleProject(id) {
        if (id === "new-project") {
          this.projectdialog = !this.projectdialog
        }
        if (id === "new-connection") {
          appDataModule.toggleConnectionDialog()
        }
        if (id === "new-query") {
          this.querydialog = !this.querydialog
          appDataModule.toggleQueryDialog()
        }
        if (id === "new-theme") {
          this.themeDialog = !this.themeDialog
          appDataModule.toggleThemeDialog()
        }
        if (id === "new-transformer") {
          appDataModule.toggleTransformerDialog()
        }
        if (id === "new-algorithm") {
          appDataModule.toggleAlgorithmDialog()
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
        settingsModule.resizeView()
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
