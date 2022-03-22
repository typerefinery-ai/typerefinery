<template>
  <div class="sidebar-container">
    <div class="sidebar-fixed">
      <div class="sidebar-fixed-items">P</div>
      <div class="sidebar-fixed-items">S</div>
      <div class="sidebar-fixed-items">L</div>
    </div>
    <div id="sidebar-draggable" class="sidebar-draggable">
      <div class="filter-wrapper">
        <input type="text" />
      </div>
      <div class="content-title">
        {{ $t("components.project.connections") }}
      </div>
      <ul>
        <li>Connection 1</li>
        <li>Connection 2</li>
      </ul>

      <div class="content-title">{{ $t("components.project.queries") }}</div>
      <ul>
        <li>Query 1</li>
        <li>Query 2</li>
        <li>Query 3</li>
      </ul>
    </div>
  </div>
</template>

<script>
  export default {
    name: "Sidebar",
  }
</script>

<style lang="scss" scoped>
  @import "./Sidebar.scss";
</style>
