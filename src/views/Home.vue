<template>
  <maps v-if="$route.params.id === 'maps'" />
  <charts v-else-if="$route.params.id === 'charts'" />
  <project v-else />
</template>

<script>
  import Project from "@/components/Project"
  import Charts from "@/components/Charts"
  import Maps from "@/components/Maps"
  export default {
    name: "Home",
    components: { Project, Charts, Maps },

    data() {
      return {}
    },
  }
</script>
