<template>
  <div class="topbar">
    <div class="topbar-top">
      <div class="tabs-container">
        <div class="tab">Visualization</div>
      </div>
      <div class="logout-button">
        <v-btn variant="text">Logout</v-btn>
      </div>
    </div>
    <div class="topbar-bottom">
      <div class="ribbon-group">
        <ul>
          <li>
            <v-icon large color="yellow darken-2"> mdi-folder </v-icon>New
          </li>
          <li>
            <v-icon large color="yellow darken-2"> mdi-folder </v-icon>Save
          </li>
          <li>
            <v-icon large color="yellow darken-2"> mdi-folder </v-icon>Open
          </li>
        </ul>
        <div class="group-heading">Project</div>
      </div>
      <v-divider vertical></v-divider>
      <div class="ribbon-group">
        <ul>
          <li>
            <v-icon large color="yellow darken-2"> mdi-folder </v-icon>Connect
          </li>
          <li>
            <v-icon large color="yellow darken-2"> mdi-folder </v-icon>Query
            Access
          </li>
          <li>
            <v-icon large color="yellow darken-2"> mdi-folder </v-icon>Theme
          </li>
        </ul>
        <div class="group-heading">Access</div>
      </div>
      <v-divider vertical></v-divider>
      <div class="ribbon-group">
        <ul>
          <li>
            <v-icon large color="yellow darken-2"> mdi-folder </v-icon>Group
          </li>
          <li>
            <v-icon large color="yellow darken-2"> mdi-folder </v-icon>Collapse
          </li>
          <li>
            <v-icon large color="yellow darken-2"> mdi-folder </v-icon>Filter
          </li>
        </ul>
        <div class="group-heading">Transform</div>
      </div>
      <v-divider vertical></v-divider>
      <div class="ribbon-group">
        <ul>
          <li>
            <v-icon large color="yellow darken-2"> mdi-folder </v-icon>webCola
          </li>
          <li>
            <v-icon large color="yellow darken-2"> mdi-folder </v-icon>Maps
          </li>
          <li>
            <v-icon large color="yellow darken-2"> mdi-folder </v-icon>Charts
          </li>
          <li>
            <v-icon large color="yellow darken-2"> mdi-folder </v-icon>Export
          </li>
        </ul>
        <div class="group-heading">Visualization</div>
      </div>
    </div>
  </div>

  <v-main>
    <div class="main">
      <div class="sidebar">Sidebar</div>
      <div
        id="dragMe"
        class="resizer"
        data-direction="horizontal"
        @mousedown="handleMouseDown($event, 'dragMe')"
      ></div>
      <div class="content" style="flex: 1 1 0%">
        <div class="windows-top">
          <div class="details items">Details Window</div>
          <div
            id="dragMe1"
            class="resizer"
            data-direction="horizontal"
            @mousedown="handleMouseDown($event, 'dragMe1')"
          ></div>
          <div class="visualization items" style="flex: 1 1 0%">
            Visualization Window
          </div>
        </div>
        <div
          id="dragMe2"
          class="resizer"
          data-direction="vertical"
          @mousedown="handleMouseDown($event, 'dragMe2')"
        ></div>
        <div class="windows-bottom">
          <div class="console">Console Window</div>
        </div>
      </div>
    </div>
  </v-main>
</template>

<script>
  export default {
    name: "POC1",
    data: () => ({
      mouseX: 0,
      mouseY: 0,
      prevSiblingHeight: 0,
      prevSiblingWidth: 0,
      id: "dragMe",
    }),

    watch: {
      group() {
        this.drawer = false
      },
    },

    methods: {
      handleMouseDown(e, id) {
        this.id = id
        const resizer = document.getElementById(this.id)
        const prevSibling = resizer.previousElementSibling

        this.mouseX = e.clientX
        this.mouseY = e.clientY

        const rect = prevSibling.getBoundingClientRect()
        this.prevSiblingHeight = rect.height
        this.prevSiblingWidth = rect.width

        // Attach the listeners to `document`
        document.addEventListener("mousemove", this.mouseMoveHandler)
        document.addEventListener("mouseup", this.mouseUpHandler)
      },
      mouseMoveHandler(e) {
        const resizer = document.getElementById(this.id)
        const direction = resizer.getAttribute("data-direction") || "horizontal"
        const prevSibling = resizer.previousElementSibling
        const nextSibling = resizer.nextElementSibling

        // How far the mouse has been moved
        const dx = e.clientX - this.mouseX
        const dy = e.clientY - this.mouseY

        if (direction === "vertical") {
          const h =
            ((this.prevSiblingHeight + dy) * 100) /
            resizer.parentNode.getBoundingClientRect().height
          prevSibling.style.height = `${h}%`
        } else if (direction === "horizontal") {
          const w =
            ((this.prevSiblingWidth + dx) * 100) /
            resizer.parentNode.getBoundingClientRect().width
          prevSibling.style.width = `${w}%`
        }

        const cursor = direction === "horizontal" ? "col-resize" : "row-resize"
        resizer.style.cursor = cursor
        document.body.style.cursor = cursor

        prevSibling.style.userSelect = "none"
        prevSibling.style.pointerEvents = "none"

        nextSibling.style.userSelect = "none"
        nextSibling.style.pointerEvents = "none"
      },
      mouseUpHandler() {
        const resizer = document.getElementById(this.id)
        const prevSibling = resizer.previousElementSibling
        const nextSibling = resizer.nextElementSibling

        resizer.style.removeProperty("cursor")
        document.body.style.removeProperty("cursor")

        prevSibling.style.removeProperty("user-select")
        prevSibling.style.removeProperty("pointer-events")

        nextSibling.style.removeProperty("user-select")
        nextSibling.style.removeProperty("pointer-events")

        // Remove the handlers of `mousemove` and `mouseup`
        document.removeEventListener("mousemove", this.mouseMoveHandler)
        document.removeEventListener("mouseup", this.mouseUpHandler)
      },
    },
  }
</script>

<style lang="scss">
  .resizer[data-direction="horizontal"] {
    background-color: #cbd5e0;
    cursor: ew-resize;
    height: 100%;
    width: 2px;
  }
  .resizer[data-direction="vertical"] {
    background-color: #cbd5e0;
    cursor: ns-resize;
    height: 2px;
    width: 100%;
  }
  .topbar {
    width: 100%;
    background: #986324;
    padding: 5px 0;
  }
  .topbar-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 0 10px;
  }
  .tabs-container {
    width: 100%;
    .tab {
      background: white;
      padding: 7px;
      width: 25%;
      text-align: center;
    }
  }

  .topbar-bottom {
    background: white;
    display: flex;
    justify-content: space-evenly;
    margin: 0 10px 0 10px;
    padding: 10px 0;
  }
  .ribbon-group {
    ul {
      list-style: none;
      display: flex;
      li {
        padding: 5px 7px;
        display: flex;
        flex-direction: column;
        align-items: center;
      }
    }
    .group-heading {
      text-align: center;
    }
  }
  .main {
    display: flex;
    width: 100%;
    height: calc(100vh - 150px);

    .sidebar {
      width: 20%;
      min-width: 90px;
      border: 1px solid #986324;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .content {
      border: 1px solid #986324;
      width: 80%;
      display: flex;
      flex-direction: column;
    }

    .windows-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 70%;

      div.items {
        min-width: 100px;
        width: 50%;
        border: 1px solid #986324;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }

    .windows-bottom {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 30%;
      border: 1px solid #986324;
      flex: 1;
    }
  }
</style>
